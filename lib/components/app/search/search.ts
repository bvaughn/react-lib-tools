import type { SiteMapPage } from "../../../../types";

interface Match {
  page: SiteMapPage;
  score: number;
}

export function search(
  siteMap: SiteMapPage[],
  queryText: string
): SiteMapPage[] {
  const expressions = queryText
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => new RegExp(word, "ig"));

  if (expressions.length === 0) {
    return siteMap;
  }

  const matches: Match[] = [];

  siteMap.forEach((page) => {
    let score = 0;

    expressions.forEach((expression) => {
      const titleMatches = page.title.match(expression);
      if (titleMatches) {
        score += titleMatches.length * 5;
      }

      const textMatches = page.text.match(expression);
      if (textMatches) {
        score += textMatches.length;
      }

      const sectionMatches = page.section?.match(expression);
      if (sectionMatches) {
        score += sectionMatches.length;
      }
    });

    if (score > 0) {
      matches.push({
        page,
        score
      });
    }
  });

  return matches.sort((a, b) => b.score - a.score).map((match) => match.page);
}
