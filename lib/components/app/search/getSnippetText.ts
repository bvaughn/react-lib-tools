import type { SiteMapHeading, SiteMapPage } from "../../../../types";
import { hasMatch } from "./renderHighlightedText";

/**
 * Text shown beneath a heading result.
 * Headings whose text repeats the title before the content (e.g. a question followed by its answer) omit the repeat;
 * signatures (e.g. "minSize?: number") are kept since they add information.
 */
export function getHeadingSnippetText(heading: SiteMapHeading) {
  const { text, title } = heading;
  if (title && text.startsWith(title) && /\s/.test(text.charAt(title.length))) {
    return text.substring(title.length).trimStart();
  }
  return text;
}

/**
 * Text shown beneath a page result: its intro, unless the search matched one of its sections instead,
 * in which case the best matching section is shown.
 */
export function getPageSnippetText(page: SiteMapPage, terms: string[]) {
  if (hasMatch(page.text, terms)) {
    return page.text;
  }

  // Prefer the section matching the most distinct terms, especially in its title
  // (e.g. "onLayoutChange" over "defaultLayout" for the search "onLayoutChange")
  let bestHeading: SiteMapHeading | undefined;
  let bestScore = 0;
  for (const heading of page.headings ?? []) {
    const score =
      2 * countMatchingTerms(heading.title, terms) +
      countMatchingTerms(heading.text, terms);
    if (score > bestScore) {
      bestHeading = heading;
      bestScore = score;
    }
  }

  return bestHeading ? getHeadingSnippetText(bestHeading) : page.text;
}

function countMatchingTerms(text: string, terms: string[]) {
  return terms.filter((term) => hasMatch(text, [term])).length;
}
