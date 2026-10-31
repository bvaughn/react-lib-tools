import { type PropsWithChildren } from "react";
import { PageContents } from "./PageContents";
import { usePageContents } from "./usePageContents";
import { MIN_PAGE_ENTRIES, usePageEntries } from "./usePageEntries";

/**
 * Lays out the main content alongside its "On this page" contents (for pages with enough headings),
 * in a column to the right; the contents are only shown on large screens.
 */
export function OnThisPage({ children }: PropsWithChildren) {
  const contents = usePageContents(usePageEntries());
  const hasContents = contents.entries.length >= MIN_PAGE_ENTRIES;

  // The children are always rendered in the same position, so showing or hiding the contents doesn't remount the page
  return (
    <div className="flex flex-row">
      <div className="grow min-w-0">{children}</div>
      {hasContents && (
        <aside className="hidden xl:block w-60 shrink-0">
          {/* Sticks below the header (h-15) while the page scrolls */}
          <div className="sticky top-0 max-h-[calc(100dvh-3.75rem)] flex flex-col pt-9 pb-4 pr-6">
            <div className="shrink-0 pb-2 text-xs font-bold uppercase tracking-wide text-ink/50">
              On this page
            </div>
            <PageContents className="min-h-0" contents={contents} />
          </div>
        </aside>
      )}
    </div>
  );
}
