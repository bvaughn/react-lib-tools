import { use, useMemo } from "react";
import { read } from "./SiteSearchCache";
import { getHeadingSnippetText, getPageSnippetText } from "./getSnippetText";
import { SiteSearchList } from "./SiteSearchList";
import type { SiteSearchItem } from "./SiteSearchResult";
import { getSearchTerms, search } from "./search";

const MAX_RESULTS = 10;

export function SiteSearchResults({
  inputRef,
  isStale,
  listboxId,
  onSelect,
  onSelectWhenReady,
  searchTextDeferred,
  selectFirst
}: {
  inputRef: HTMLInputElement | null;
  isStale: boolean;
  listboxId: string;
  onSelect: () => void;
  onSelectWhenReady: () => void;
  searchTextDeferred: string;
  selectFirst: boolean;
}) {
  const siteMap = use(read());

  const { items, terms } = useMemo(() => {
    const terms = getSearchTerms(siteMap, searchTextDeferred);
    const items: SiteSearchItem[] = search(siteMap, searchTextDeferred)
      .slice(0, MAX_RESULTS)
      .map(({ heading, page }) =>
        // Sections within a page are shown as "Page title > Heading title"
        heading
          ? {
              context: page.title,
              path: `${page.path}#${heading.id}`,
              text: getHeadingSnippetText(heading),
              title: heading.title
            }
          : {
              context: page.section,
              path: page.path,
              text: getPageSnippetText(page, terms),
              title: page.title
            }
      );

    return { items, terms };
  }, [searchTextDeferred, siteMap]);

  return (
    <SiteSearchList
      emptyMessage={`No results for "${searchTextDeferred}"`}
      inputRef={inputRef}
      isStale={isStale}
      items={items}
      listboxId={listboxId}
      onSelect={onSelect}
      onSelectWhenReady={onSelectWhenReady}
      selectFirst={selectFirst}
      status={`${items.length} result${items.length === 1 ? "" : "s"}`}
      terms={terms}
    />
  );
}
