import type { SiteMapHeading, SiteMapPage } from "../../../../types";
import { getStem } from "./stem";

// Relative importance of a term matching each part of a page
const FIELD_WEIGHTS = {
  title: 8,
  path: 4,
  section: 2,
  text: 1
};

// A term that is a prefix of a word (e.g. "persist" -> "persistent") is worth less than an exact match
const PREFIX_MATCH_QUALITY = 0.6;

// A term with the same root as a word (e.g. "collapse" -> "collapsible") is worth less than an exact match,
// but more than a prefix match
const STEM_MATCH_QUALITY = 0.8;

// A typo-corrected term (e.g. "pannel" -> "panel") is worth less than one the user actually typed
const CORRECTED_MATCH_QUALITY = 0.8;

// Typo correction is only attempted for terms at least this long
const MIN_CORRECTABLE_TERM_LENGTH = 5;

// Shorter terms (e.g. "c" from "c++") only match whole words
export const MIN_PREFIX_TERM_LENGTH = 2;

// Words typed without camelCase (e.g. "onlayoutchange") are only split into parts at least this long;
// a shorter final part (e.g. the "r" in "usepanelr", partially typed) is ignored
const MIN_COMPOUND_PART_LENGTH = 2;

// Longer tokens aren't split; real identifiers are shorter, and splitting cost grows with length (e.g. pasted text)
const MAX_COMPOUND_WORD_LENGTH = 40;

// Common words that are ignored unless the query contains nothing else (e.g. "how do i persist layout")
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "can",
  "do",
  "does",
  "for",
  "how",
  "i",
  "if",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "or",
  "the",
  "to",
  "what",
  "when",
  "why",
  "with"
]);

// Limit how many sections of a single page can appear in results so one long page doesn't crowd out the others
const MAX_HEADING_RESULTS_PER_PAGE = 2;

// BM25 (Best Matching 25) tuning parameters for body text
const BM25_K1 = 1.2;
const BM25_B = 0.75;

export interface SearchResult {
  /** Set when the result is a section within the page */
  heading?: SiteMapHeading | undefined;
  page: SiteMapPage;
}

// Words are stored as ids (positions in the index's vocabulary) so matching them against a term is an array lookup
type WordIds = number[];

interface IndexedEntry {
  averageTextLength: number;
  path: WordIds;
  result: SearchResult;
  section: WordIds;
  text: WordIds;
  title: WordIds;
}

interface Index {
  entries: IndexedEntry[];
  /** Every distinct word on the site; a word's id is its position */
  vocabulary: string[];
  vocabularyIds: Map<string, number>;
  /** Stem of each word on the site (by id), if it has one */
  vocabularyStemsById: (string | undefined)[];
  vocabularyStems: Set<string>;
  /** The most recently parsed query, reused when terms are requested again (e.g. for highlighting) */
  lastQuery?: { queryText: string; terms: Term[] } | undefined;
}

// How a word on the site matches a term
const EXACT_MATCH = 1;
const STEM_MATCH = 2;
const PREFIX_MATCH = 3;

interface Term {
  /** How each word on the site (by id) matches this term, if at all; computed once per search so matching is a lookup */
  matches: Uint8Array;
  quality: number;
  variants: string[];
}

const indexCache = new WeakMap<SiteMapPage[], Index>();

export function search(
  siteMap: SiteMapPage[],
  queryText: string
): SearchResult[] {
  if (!queryText.trim()) {
    return siteMap.map((page) => ({ page }));
  }

  const index = getIndex(siteMap);
  const terms = parseQuery(queryText, index);
  if (terms.length === 0) {
    return [];
  }

  // Terms that appear on fewer pages are more distinctive and worth more
  const inverseDocumentFrequencies = terms.map((term) => {
    const documentFrequency = index.entries.filter(
      (entry) =>
        matchQuality(term, entry.title) > 0 ||
        matchQuality(term, entry.path) > 0 ||
        matchQuality(term, entry.section) > 0 ||
        matchQuality(term, entry.text) > 0
    ).length;

    return Math.log(
      1 +
        (index.entries.length - documentFrequency + 0.5) /
          (documentFrequency + 0.5)
    );
  });

  const totalInverseDocumentFrequency = inverseDocumentFrequencies.reduce(
    (sum, value) => sum + value,
    0
  );

  const matches: { result: SearchResult; score: number }[] = [];

  index.entries.forEach((entry) => {
    let score = 0;
    let matchedInverseDocumentFrequency = 0;

    terms.forEach((term, termIndex) => {
      const termScore =
        FIELD_WEIGHTS.title * matchQuality(term, entry.title) +
        FIELD_WEIGHTS.path * matchQuality(term, entry.path) +
        FIELD_WEIGHTS.section * matchQuality(term, entry.section) +
        FIELD_WEIGHTS.text * textScore(term, entry);

      if (termScore > 0) {
        matchedInverseDocumentFrequency +=
          inverseDocumentFrequencies[termIndex];
        score += termScore * inverseDocumentFrequencies[termIndex];
      }
    });

    if (score === 0) {
      return;
    }

    // Strongly prefer pages that match all of the terms;
    // missing a common term (e.g. "how") matters less than missing a distinctive one
    if (totalInverseDocumentFrequency > 0) {
      score *= Math.pow(
        matchedInverseDocumentFrequency / totalInverseDocumentFrequency,
        2
      );
    }

    // Prefer pages where the terms appear together, in order
    if (equals(entry.title, terms)) {
      score += totalInverseDocumentFrequency * 10;
    } else if (
      countPhrases(entry.title, terms) > 0 ||
      isWithinQuery(entry.title, terms)
    ) {
      score += totalInverseDocumentFrequency * 5;
    }
    if (endsWith(entry.path, terms)) {
      score += totalInverseDocumentFrequency * 10;
    }
    if (terms.length > 1) {
      const phraseCount = countPhrases(entry.text, terms);
      score +=
        (totalInverseDocumentFrequency * 2 * phraseCount) / (phraseCount + 1);
    }

    matches.push({
      result: entry.result,
      score
    });
  });

  const headingResultCounts = new Map<SiteMapPage, number>();

  return matches
    .sort((a, b) => b.score - a.score)
    .map((match) => match.result)
    .filter(({ heading, page }) => {
      if (heading === undefined) {
        return true;
      }

      const count = headingResultCounts.get(page) ?? 0;
      headingResultCounts.set(page, count + 1);
      return count < MAX_HEADING_RESULTS_PER_PAGE;
    });
}

/**
 * The words a query actually searches for, after splitting, ignoring common words, and correcting typos
 * (e.g. "how do i persist pannel" -> ["persist", "panel"]); used to highlight matches the same way they were found
 */
export function getSearchTerms(
  siteMap: SiteMapPage[],
  queryText: string
): string[] {
  return parseQuery(queryText, getIndex(siteMap)).flatMap(
    (term) => term.variants
  );
}

function parseQuery(queryText: string, index: Index): Term[] {
  if (index.lastQuery?.queryText === queryText) {
    return index.lastQuery.terms;
  }

  const terms = parseQueryTerms(queryText, index);
  index.lastQuery = { queryText, terms };
  return terms;
}

function parseQueryTerms(queryText: string, index: Index): Term[] {
  let queryTokens = tokenize(queryText);

  const meaningfulTokens = queryTokens.filter(
    (token) => !STOP_WORDS.has(token)
  );
  if (meaningfulTokens.length > 0) {
    queryTokens = meaningfulTokens;
  }

  return queryTokens
    .flatMap((token) => splitCompoundWord(token, index))
    .map((token) => correctTerm(token, index));
}

/** Splits text into lowercase words, breaking on punctuation and camelCase (e.g. "usePanelRef" -> ["use", "panel", "ref"]) */
export function tokenize(text: string): string[] {
  return text
    .replace(/(\p{Ll}|\p{N})(\p{Lu})/gu, "$1 $2")
    .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, "$1 $2")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

function getIndex(siteMap: SiteMapPage[]): Index {
  let index = indexCache.get(siteMap);
  if (index === undefined) {
    const vocabulary: string[] = [];
    const vocabularyIds = new Map<string, number>();

    const toWordIds = (text: string): WordIds =>
      tokenize(text).map((word) => {
        let id = vocabularyIds.get(word);
        if (id === undefined) {
          id = vocabulary.length;
          vocabulary.push(word);
          vocabularyIds.set(word, id);
        }
        return id;
      });

    const pageEntries: IndexedEntry[] = [];
    const headingEntries: IndexedEntry[] = [];

    siteMap.forEach((page) => {
      const headings = page.headings ?? [];

      const headingTexts = headings.map((heading) => toWordIds(heading.text));

      // Pages are searched in full (including the text of their headings)
      pageEntries.push({
        averageTextLength: 0,
        path: toWordIds(page.path),
        result: { page },
        section: toWordIds(page.section ?? ""),
        text: [toWordIds(page.text), ...headingTexts].flat(),
        title: toWordIds(page.title)
      });

      // Headings are matched by their own title, with the page title as context;
      // the page's path is omitted so that every heading on e.g. "/props/panel" doesn't match "panel"
      headings.forEach((heading, headingIndex) => {
        headingEntries.push({
          averageTextLength: 0,
          path: [],
          result: { heading, page },
          section: toWordIds(page.title),
          text: headingTexts[headingIndex],
          title: toWordIds(heading.title)
        });
      });
    });

    // Heading text is much shorter than page text, so each is normalized against its own kind
    for (const entries of [pageEntries, headingEntries]) {
      const totalTextLength = entries.reduce(
        (sum, entry) => sum + entry.text.length,
        0
      );
      const averageTextLength =
        entries.length > 0 ? totalTextLength / entries.length : 0;
      entries.forEach((entry) => {
        entry.averageTextLength = averageTextLength;
      });
    }

    const vocabularyStemsById = vocabulary.map(getStem);
    const vocabularyStems = new Set<string>();
    vocabularyStemsById.forEach((stem) => {
      if (stem !== undefined) {
        vocabularyStems.add(stem);
      }
    });

    index = {
      entries: [...pageEntries, ...headingEntries],
      vocabulary,
      vocabularyIds,
      vocabularyStems,
      vocabularyStemsById
    };

    indexCache.set(siteMap, index);
  }

  return index;
}

/** Whether any word on the site is (or starts with, or shares a root with) the token */
function matchesVocabulary(token: string, index: Index) {
  const stem = getStem(token);
  return (
    index.vocabularyIds.has(token) ||
    (stem !== undefined && index.vocabularyStems.has(stem)) ||
    index.vocabulary.some((word) => word.startsWith(token))
  );
}

function createTerm(variants: string[], quality: number, index: Index): Term {
  const stems = new Set<string>();
  variants.forEach((variant) => {
    const stem = getStem(variant);
    if (stem !== undefined) {
      stems.add(stem);
    }
  });

  const matches = new Uint8Array(index.vocabulary.length);
  index.vocabulary.forEach((word, id) => {
    if (variants.includes(word)) {
      matches[id] = EXACT_MATCH;
    } else {
      const stem = index.vocabularyStemsById[id];
      if (stem !== undefined && stems.has(stem)) {
        matches[id] = STEM_MATCH;
      } else if (variants.some((variant) => isPrefixMatch(variant, word))) {
        matches[id] = PREFIX_MATCH;
      }
    }
  });

  return { matches, quality, variants };
}

/**
 * Splits a token that matches nothing on the site into the fewest words that do,
 * so identifiers typed without camelCase still match (e.g. "onlayoutchange" -> ["on", "layout", "change"]).
 * The final part may be partially typed (e.g. "onlayoutch" -> ["on", "layout", "ch"]).
 */
function splitCompoundWord(token: string, index: Index): string[] {
  if (
    token.length > MAX_COMPOUND_WORD_LENGTH ||
    matchesVocabulary(token, index)
  ) {
    return [token];
  }

  // Fewest whole words that spell the first N characters of the token
  const fewestWords: (string[] | undefined)[] = [[]];
  let best: string[] | undefined;

  for (let start = 0; start < token.length; start++) {
    const words = fewestWords[start];
    if (words === undefined) {
      continue;
    }

    const rest = token.substring(start);
    if (
      start > 0 &&
      matchesVocabulary(rest, index) &&
      (best === undefined || words.length + 1 < best.length)
    ) {
      best = [...words, rest];
    }

    for (
      let end = start + MIN_COMPOUND_PART_LENGTH;
      end < token.length;
      end++
    ) {
      const part = token.substring(start, end);
      const current = fewestWords[end];
      if (
        index.vocabularyIds.has(part) &&
        (current === undefined || words.length + 1 < current.length)
      ) {
        fewestWords[end] = [...words, part];
      }
    }
  }

  if (best === undefined) {
    return [token];
  }

  // A single trailing character (e.g. the "r" in "usepanelr") is too short to match meaningfully
  const last = best[best.length - 1];
  return last.length < MIN_COMPOUND_PART_LENGTH ? best.slice(0, -1) : best;
}

/** Replaces a term that matches nothing on the site with similarly spelled words (e.g. "colapsible" -> "collapsible") */
function correctTerm(token: string, index: Index): Term {
  if (
    token.length < MIN_CORRECTABLE_TERM_LENGTH ||
    matchesVocabulary(token, index)
  ) {
    return createTerm([token], 1, index);
  }

  // Also compare against word prefixes so that partially typed words can be corrected (e.g. "colaps" -> "collapsible")
  const corrections = index.vocabulary.filter(
    (word) =>
      isWithinOneEdit(token, word) ||
      (word.length > token.length + 1 &&
        (isWithinOneEdit(token, word.substring(0, token.length - 1)) ||
          isWithinOneEdit(token, word.substring(0, token.length)) ||
          isWithinOneEdit(token, word.substring(0, token.length + 1))))
  );
  if (corrections.length === 0) {
    return createTerm([token], 1, index);
  }

  return createTerm(corrections, CORRECTED_MATCH_QUALITY, index);
}

function wordMatchQuality(term: Term, wordId: number) {
  switch (term.matches[wordId]) {
    case EXACT_MATCH:
      return term.quality;
    case STEM_MATCH:
      return term.quality * STEM_MATCH_QUALITY;
    case PREFIX_MATCH:
      return term.quality * PREFIX_MATCH_QUALITY;
    default:
      return 0;
  }
}

/** Whether a word matches a term exactly or by root; a prefix match (e.g. while typing) can also be allowed */
function isWordMatch(term: Term, wordId: number, allowPrefix: boolean) {
  const kind = term.matches[wordId];
  return (
    kind === EXACT_MATCH ||
    kind === STEM_MATCH ||
    (allowPrefix && kind === PREFIX_MATCH)
  );
}

function isPrefixMatch(variant: string, word: string) {
  return variant.length >= MIN_PREFIX_TERM_LENGTH && word.startsWith(variant);
}

/** Best match quality of a term against any word in a short field (e.g. title) */
function matchQuality(term: Term, words: WordIds) {
  let quality = 0;
  for (const word of words) {
    quality = Math.max(quality, wordMatchQuality(term, word));
  }
  return quality;
}

/** BM25 score of a term within body text; repeated matches have diminishing returns and long pages are normalized */
function textScore(
  term: Term,
  { averageTextLength, text: words }: IndexedEntry
) {
  let frequency = 0;
  for (const word of words) {
    frequency += wordMatchQuality(term, word);
  }
  if (frequency === 0) {
    return 0;
  }

  const lengthRatio =
    averageTextLength > 0 ? words.length / averageTextLength : 1;

  return (
    (frequency * (BM25_K1 + 1)) /
    (frequency + BM25_K1 * (1 - BM25_B + BM25_B * lengthRatio))
  );
}

/** Counts occurrences of consecutive terms within words; the final term may be a prefix (e.g. "use panel r") */
function countPhrases(words: WordIds, terms: Term[]) {
  let count = 0;
  for (let start = 0; start <= words.length - terms.length; start++) {
    if (matchesAt(words, terms, start)) {
      count++;
    }
  }
  return count;
}

/** Whether all of the words appear consecutively within the terms (e.g. title "min size" within query "panel min size") */
function isWithinQuery(words: WordIds, terms: Term[]) {
  if (words.length === 0) {
    return false;
  }

  for (let start = 0; start <= terms.length - words.length; start++) {
    if (
      words.every((word, offset) =>
        isWordMatch(terms[start + offset], word, false)
      )
    ) {
      return true;
    }
  }
  return false;
}

function endsWith(words: WordIds, terms: Term[]) {
  const start = words.length - terms.length;
  return start >= 0 && matchesAt(words, terms, start);
}

function equals(words: WordIds, terms: Term[]) {
  return words.length === terms.length && matchesAt(words, terms, 0);
}

function matchesAt(words: WordIds, terms: Term[], start: number) {
  const last = terms.length - 1;
  for (let offset = 0; offset <= last; offset++) {
    if (!isWordMatch(terms[offset], words[start + offset], offset === last)) {
      return false;
    }
  }
  return true;
}

/** Whether a can be turned into b with at most one insertion, deletion, substitution, or adjacent transposition */
function isWithinOneEdit(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) {
    return false;
  }

  let index = 0;
  while (index < a.length && index < b.length && a[index] === b[index]) {
    index++;
  }

  const restA = a.substring(index);
  const restB = b.substring(index);

  return (
    restA === restB ||
    restA.substring(1) === restB.substring(1) ||
    restA.substring(1) === restB ||
    restA === restB.substring(1) ||
    (restA.length >= 2 &&
      restA[0] === restB[1] &&
      restA[1] === restB[0] &&
      restA.substring(2) === restB.substring(2))
  );
}
