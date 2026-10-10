import { use, useMemo } from "react";
import { read } from "./SiteSearchCache";
import { SiteSearchList } from "./SiteSearchList";
import type { SiteSearchItem } from "./SiteSearchResult";
import { getSearchTerms, search } from "./search";

const MAX_RESULTS = 10;

export function SiteSearchResults({
  inputRef,
  listboxId,
  onSelect,
  searchTextDeferred
}: {
  inputRef: HTMLInputElement | null;
  listboxId: string;
  onSelect: () => void;
  searchTextDeferred: string;
}) {
  const siteMap = use(read());

  const { items, terms } = useMemo(() => {
    const items: SiteSearchItem[] = search(siteMap, searchTextDeferred)
      .slice(0, MAX_RESULTS)
      .map(({ heading, page }) =>
        // Sections within a page are shown as "Page title > Heading title"
        heading
          ? {
              context: page.title,
              path: `${page.path}#${heading.id}`,
              text: heading.text,
              title: heading.title
            }
          : {
              context: page.section,
              path: page.path,
              text: page.text,
              title: page.title
            }
      );

    return { items, terms: getSearchTerms(siteMap, searchTextDeferred) };
  }, [searchTextDeferred, siteMap]);

  return (
    <SiteSearchList
      emptyMessage={`No results for "${searchTextDeferred}"`}
      inputRef={inputRef}
      items={items}
      listboxId={listboxId}
      onSelect={onSelect}
      status={`${items.length} result${items.length === 1 ? "" : "s"}`}
      terms={terms}
    />
  );
}
