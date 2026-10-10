import { use, useMemo, useState } from "react";
import { read } from "./SiteSearchCache";
import { getHeadingSnippetText, getPageSnippetText } from "./getSnippetText";
import { SiteSearchList } from "./SiteSearchList";
import type { SiteSearchItem } from "./SiteSearchResult";
import { getSearchTerms, search } from "./search";

// More results can be shown on request
const INITIAL_RESULT_COUNT = 10;

export function SiteSearchResults({
  inputRef,
  isStale,
  listboxId,
  onSelect,
  onSelectWhenReady,
  onVisibilityChange,
  searchTextDeferred,
  selectFirst
}: {
  inputRef: HTMLInputElement | null;
  isStale: boolean;
  listboxId: string;
  onSelect: () => void;
  onSelectWhenReady: () => void;
  onVisibilityChange: (isVisible: boolean) => void;
  searchTextDeferred: string;
  selectFirst: boolean;
}) {
  const siteMap = use(read());

  const [isExpanded, setIsExpanded] = useState(false);

  const { results, terms } = useMemo(
    () => ({
      results: search(siteMap, searchTextDeferred),
      terms: getSearchTerms(siteMap, searchTextDeferred)
    }),
    [searchTextDeferred, siteMap]
  );

  // Snippets are only computed for the results being shown (finding the best one can be relatively costly)
  const items = useMemo(
    () =>
      (isExpanded ? results : results.slice(0, INITIAL_RESULT_COUNT)).map(
        ({ heading, page }): SiteSearchItem =>
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
      ),
    [isExpanded, results, terms]
  );
  const hiddenCount = results.length - items.length;

  return (
    <SiteSearchList
      emptyMessage={`No results for "${searchTextDeferred}"`}
      footer={
        hiddenCount > 0 && (
          <button
            className="mt-2 mx-2 self-start border border-white/20 rounded text-sm px-1 cursor-pointer"
            onClick={() => {
              setIsExpanded(true);
              // The button goes away; keep focus in the search input so arrow keys keep working
              inputRef?.focus();
            }}
            type="button"
          >
            Show {hiddenCount} more result{hiddenCount === 1 ? "" : "s"}
          </button>
        )
      }
      inputRef={inputRef}
      isStale={isStale}
      items={items}
      label="Search results"
      listboxId={listboxId}
      onSelect={onSelect}
      onSelectWhenReady={onSelectWhenReady}
      onVisibilityChange={onVisibilityChange}
      selectFirst={selectFirst}
      status={
        hiddenCount > 0
          ? `Showing ${items.length} of ${results.length} results`
          : `${items.length} result${items.length === 1 ? "" : "s"}`
      }
      terms={terms}
    />
  );
}
