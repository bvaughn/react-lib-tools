import type { SiteMapPage } from "../../../../types";

// Relative importance of a term matching each part of a page
const FIELD_WEIGHTS = {
  title: 8,
  path: 4,
  section: 2,
  text: 1
};

// A term that is a prefix of a word (e.g. "persist" -> "persistent") is worth less than an exact match
const PREFIX_MATCH_QUALITY = 0.6;

// A typo-corrected term (e.g. "pannel" -> "panel") is worth less than one the user actually typed
const CORRECTED_MATCH_QUALITY = 0.8;

// Typo correction is only attempted for terms at least this long
const MIN_CORRECTABLE_TERM_LENGTH = 5;

// Shorter terms (e.g. "c" from "c++") only match whole words
const MIN_PREFIX_TERM_LENGTH = 2;

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

// BM25 (Best Matching 25) tuning parameters for body text
const BM25_K1 = 1.2;
const BM25_B = 0.75;

interface IndexedPage {
  page: SiteMapPage;
  path: string[];
  section: string[];
  text: string[];
  title: string[];
}

interface Index {
  averageTextLength: number;
  pages: IndexedPage[];
  vocabulary: string[];
}

interface Term {
  quality: number;
  variants: string[];
}

const indexCache = new WeakMap<SiteMapPage[], Index>();

export function search(
  siteMap: SiteMapPage[],
  queryText: string
): SiteMapPage[] {
  if (!queryText.trim()) {
    return siteMap;
  }

  let queryTokens = tokenize(queryText);
  if (queryTokens.length === 0) {
    return [];
  }

  const meaningfulTokens = queryTokens.filter(
    (token) => !STOP_WORDS.has(token)
  );
  if (meaningfulTokens.length > 0) {
    queryTokens = meaningfulTokens;
  }

  const index = getIndex(siteMap);
  const terms = queryTokens.map((token) => correctTerm(token, index));

  // Terms that appear on fewer pages are more distinctive and worth more
  const inverseDocumentFrequencies = terms.map((term) => {
    const documentFrequency = index.pages.filter(
      (indexedPage) =>
        matchQuality(term, indexedPage.title) > 0 ||
        matchQuality(term, indexedPage.path) > 0 ||
        matchQuality(term, indexedPage.section) > 0 ||
        matchQuality(term, indexedPage.text) > 0
    ).length;

    return Math.log(
      1 +
        (index.pages.length - documentFrequency + 0.5) /
          (documentFrequency + 0.5)
    );
  });

  const totalInverseDocumentFrequency = inverseDocumentFrequencies.reduce(
    (sum, value) => sum + value,
    0
  );

  const matches: { page: SiteMapPage; score: number }[] = [];

  index.pages.forEach((indexedPage) => {
    let score = 0;
    let matchedInverseDocumentFrequency = 0;

    terms.forEach((term, termIndex) => {
      const termScore =
        FIELD_WEIGHTS.title * matchQuality(term, indexedPage.title) +
        FIELD_WEIGHTS.path * matchQuality(term, indexedPage.path) +
        FIELD_WEIGHTS.section * matchQuality(term, indexedPage.section) +
        FIELD_WEIGHTS.text * textScore(term, indexedPage.text, index);

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
    if (equals(indexedPage.title, terms)) {
      score += totalInverseDocumentFrequency * 10;
    } else if (countPhrases(indexedPage.title, terms) > 0) {
      score += totalInverseDocumentFrequency * 5;
    }
    if (endsWith(indexedPage.path, terms)) {
      score += totalInverseDocumentFrequency * 10;
    }
    if (terms.length > 1) {
      const phraseCount = countPhrases(indexedPage.text, terms);
      score +=
        (totalInverseDocumentFrequency * 2 * phraseCount) / (phraseCount + 1);
    }

    matches.push({
      page: indexedPage.page,
      score
    });
  });

  return matches.sort((a, b) => b.score - a.score).map((match) => match.page);
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
    const vocabulary = new Set<string>();

    const pages = siteMap.map((page) => {
      const indexedPage: IndexedPage = {
        page,
        path: tokenize(page.path),
        section: tokenize(page.section ?? ""),
        text: tokenize(page.text),
        title: tokenize(page.title)
      };

      for (const words of [
        indexedPage.path,
        indexedPage.section,
        indexedPage.text,
        indexedPage.title
      ]) {
        words.forEach((word) => vocabulary.add(word));
      }

      return indexedPage;
    });

    const totalTextLength = pages.reduce(
      (sum, indexedPage) => sum + indexedPage.text.length,
      0
    );

    index = {
      averageTextLength: pages.length > 0 ? totalTextLength / pages.length : 0,
      pages,
      vocabulary: Array.from(vocabulary)
    };

    indexCache.set(siteMap, index);
  }

  return index;
}

/** Replaces a term that matches nothing on the site with similarly spelled words (e.g. "colapsible" -> "collapsible") */
function correctTerm(token: string, index: Index): Term {
  if (
    token.length < MIN_CORRECTABLE_TERM_LENGTH ||
    index.vocabulary.some((word) => word.startsWith(token))
  ) {
    return { quality: 1, variants: [token] };
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
    return { quality: 1, variants: [token] };
  }

  return { quality: CORRECTED_MATCH_QUALITY, variants: corrections };
}

function wordMatchQuality(term: Term, word: string) {
  let quality = 0;
  for (const variant of term.variants) {
    if (word === variant) {
      return term.quality;
    } else if (isPrefixMatch(variant, word)) {
      quality = term.quality * PREFIX_MATCH_QUALITY;
    }
  }
  return quality;
}

function isPrefixMatch(variant: string, word: string) {
  return variant.length >= MIN_PREFIX_TERM_LENGTH && word.startsWith(variant);
}

/** Best match quality of a term against any word in a short field (e.g. title) */
function matchQuality(term: Term, words: string[]) {
  let quality = 0;
  for (const word of words) {
    quality = Math.max(quality, wordMatchQuality(term, word));
  }
  return quality;
}

/** BM25 score of a term within body text; repeated matches have diminishing returns and long pages are normalized */
function textScore(term: Term, words: string[], index: Index) {
  let frequency = 0;
  for (const word of words) {
    frequency += wordMatchQuality(term, word);
  }
  if (frequency === 0) {
    return 0;
  }

  const lengthRatio =
    index.averageTextLength > 0 ? words.length / index.averageTextLength : 1;

  return (
    (frequency * (BM25_K1 + 1)) /
    (frequency + BM25_K1 * (1 - BM25_B + BM25_B * lengthRatio))
  );
}

/** Counts occurrences of consecutive terms within words; the final term may be a prefix (e.g. "use panel r") */
function countPhrases(words: string[], terms: Term[]) {
  let count = 0;
  for (let start = 0; start <= words.length - terms.length; start++) {
    if (matchesAt(words, terms, start)) {
      count++;
    }
  }
  return count;
}

function endsWith(words: string[], terms: Term[]) {
  const start = words.length - terms.length;
  return start >= 0 && matchesAt(words, terms, start);
}

function equals(words: string[], terms: Term[]) {
  return words.length === terms.length && matchesAt(words, terms, 0);
}

function matchesAt(words: string[], terms: Term[], start: number) {
  const last = terms.length - 1;
  for (let offset = 0; offset <= last; offset++) {
    const word = words[start + offset];
    const { variants } = terms[offset];
    const matches =
      offset === last
        ? variants.some(
            (variant) => word === variant || isPrefixMatch(variant, word)
          )
        : variants.includes(word);
    if (!matches) {
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
