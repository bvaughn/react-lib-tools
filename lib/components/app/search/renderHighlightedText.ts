import { createElement, type ReactNode } from "react";
import { MIN_PREFIX_TERM_LENGTH } from "./search";

/**
 * Highlights search terms (see getSearchTerms) within text, the same way search matched them:
 * at the start of words, including camelCase words (e.g. "layout" within "onLayoutChange").
 *
 * When maxLength is specified, long text is trimmed to show the first match,
 * with up to "leading" characters of context before it.
 */
export function renderHighlightedText(
  text: string,
  terms: string[],
  config?: {
    leading?: number | undefined;
    maxLength?: number | undefined;
  }
): ReactNode[] {
  if (!text) {
    return [];
  }

  const { leading = 0, maxLength = 0 } = config ?? {};

  const matches = findMatches(text, terms);

  let start = 0;
  let stop = text.length;
  if (maxLength && text.length > maxLength) {
    const firstMatch = matches[0];
    if (firstMatch === undefined || firstMatch.stop <= maxLength) {
      stop = maxLength;
    } else {
      start = Math.max(0, firstMatch.start - leading);

      // Avoid starting in the middle of a word when possible
      if (start > 0 && text.charAt(start - 1) !== " ") {
        const space = text.indexOf(" ", start);
        if (space !== -1 && space < firstMatch.start) {
          start = space + 1;
        }
      }

      stop = Math.min(text.length, start + maxLength);
    }

    // Avoid ending in the middle of a word when possible
    if (stop < text.length && text.charAt(stop) !== " ") {
      const space = text.lastIndexOf(" ", stop);
      if (space > start && space >= (matches[0]?.stop ?? 0)) {
        stop = space;
      }
    }
  }

  const rendered: ReactNode[] = [];

  let current = start > 0 ? "…" : "";
  let index = start;
  for (const match of matches) {
    if (match.start < start || match.stop > stop) {
      continue;
    }

    current += text.substring(index, match.start);
    if (current) {
      rendered.push(current);
    }
    rendered.push(createMark(text.substring(match.start, match.stop)));

    current = "";
    index = match.stop;
  }

  current += text.substring(index, stop);
  if (stop < text.length) {
    current += "…";
  }
  if (current) {
    rendered.push(current);
  }

  return rendered;
}

/** Whether any of the search terms appear in the text (matched the same way they're highlighted) */
export function hasMatch(text: string, terms: string[]) {
  return findMatches(text, terms).length > 0;
}

/** Non-overlapping matches, in order; adjacent matches (e.g. "on" + "Layout" in "onLayout") are merged */
function findMatches(text: string, terms: string[]) {
  const sortedTerms = Array.from(new Set(terms)).sort(
    (a, b) => b.length - a.length
  );

  const matches: { start: number; stop: number }[] = [];
  if (sortedTerms.length === 0) {
    return matches;
  }

  const lowerCaseText = text.toLowerCase();

  let index = 0;
  while (index < text.length) {
    if (isWordStart(text, index)) {
      const term = sortedTerms.find(
        (term) =>
          lowerCaseText.startsWith(term, index) &&
          (term.length >= MIN_PREFIX_TERM_LENGTH ||
            isWordEnd(text, index + term.length))
      );
      if (term) {
        const previous = matches[matches.length - 1];
        if (previous && previous.stop === index) {
          previous.stop = index + term.length;
        } else {
          matches.push({ start: index, stop: index + term.length });
        }

        index += term.length;
        continue;
      }
    }

    index++;
  }

  return matches;
}

// Mirrors how search splits text into words (see tokenize)
function isWordStart(text: string, index: number) {
  const char = text.charAt(index);
  if (!isWordCharacter(char)) {
    return false;
  }

  const previous = text.charAt(index - 1);
  if (index === 0 || !isWordCharacter(previous)) {
    return true;
  }

  if (isUpperCase(char)) {
    // "onLayout" -> "on" "Layout"
    if (isLowerCase(previous) || /\p{N}/u.test(previous)) {
      return true;
    }

    // "HTMLElement" -> "HTML" "Element"
    if (isUpperCase(previous) && isLowerCase(text.charAt(index + 1))) {
      return true;
    }
  }

  return false;
}

function isWordEnd(text: string, index: number) {
  return (
    index >= text.length ||
    isWordStart(text, index) ||
    !isWordCharacter(text.charAt(index))
  );
}

function isWordCharacter(char: string) {
  return /[\p{L}\p{N}]/u.test(char);
}

function isLowerCase(char: string) {
  return /\p{Ll}/u.test(char);
}

function isUpperCase(char: string) {
  return /\p{Lu}/u.test(char);
}

let key = 0;

function createMark(text: string) {
  return createElement("mark", {
    children: text,
    className: "bg-transparent text-search-match",
    key: ++key
  });
}
