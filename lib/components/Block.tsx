import type { HTMLAttributes, PropsWithChildren } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

/**
 * Bordered container for live demos and other content set apart from the page's text.
 * Errors thrown while rendering its children are caught and shown in place.
 *
 * Its content is excluded from the search index (it's marked `data-search-ignore`), since live demos may render
 * after the crawler has read the page (e.g. once their container has been measured), which made the index vary
 * between runs. Pass `data-search-ignore={undefined}` to index a block's content.
 */
export function Block({
  children,
  className,
  ...rest
}: PropsWithChildren<HTMLAttributes<HTMLDivElement> & { className?: string }>) {
  return (
    <ErrorBoundary>
      <div
        className={`border-lg bg-black/30 text-slate-300 rounded-lg p-2 ${className}`}
        data-search-ignore
        {...rest}
      >
        {children}
      </div>
    </ErrorBoundary>
  );
}
