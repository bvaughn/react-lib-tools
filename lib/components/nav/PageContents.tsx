import { useEffect, useRef, type MouseEvent } from "react";
import { cn } from "../../utils/cn";
import type { PageContentsState } from "./usePageContents";
import { MIN_PAGE_ENTRIES } from "./usePageEntries";

/**
 * "On this page" contents list.
 * The list scrolls itself (when given a max height), keeping the current entry visible.
 */
export function PageContents({
  className,
  contents: { activeId, entries, labelIds, select }
}: {
  className?: string | undefined;
  contents: PageContentsState;
}) {
  const activeRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Keep the highlighted entry visible within the list
  useEffect(() => {
    const container = navRef.current;
    const element = activeRef.current;
    if (!container || !element) {
      return;
    }

    // Hidden (display:none) at this screen size; nothing can be measured or scrolled
    const containerRect = container.getBoundingClientRect();
    if (containerRect.height === 0) {
      return;
    }

    const elementRect = element.getBoundingClientRect();
    if (elementRect.top < containerRect.top) {
      container.scrollTop -= containerRect.top - elementRect.top + 8;
    } else if (elementRect.bottom > containerRect.bottom) {
      container.scrollTop += elementRect.bottom - containerRect.bottom + 8;
    }
  }, [activeId, entries.length]);

  if (entries.length < MIN_PAGE_ENTRIES) {
    return null;
  }

  const onClick = (event: MouseEvent, id: string) => {
    // Let the browser handle modified clicks (e.g. open in new tab)
    if (
      event.button !== 0 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    select(id);
  };

  return (
    <nav
      aria-label="On this page"
      ref={navRef}
      className={cn("overflow-y-auto overscroll-contain", className)}
      data-search-ignore
    >
      <ul className="border-l border-ink/10">
        {entries.map(({ id, title }) =>
          labelIds.has(id) ? (
            <li
              className="pl-4 pt-2 pb-0.5 text-xs font-bold uppercase tracking-wide text-ink/40"
              key={id}
            >
              {title}
            </li>
          ) : (
            <li key={id}>
              <a
                aria-current={id === activeId ? "location" : undefined}
                className={cn(
                  "block -ml-px border-l-2 py-1 pl-4 pr-2 text-sm leading-snug",
                  id === activeId
                    ? "border-nav-active text-ink"
                    : "border-transparent text-ink/60 hover:text-ink"
                )}
                data-contents-link
                href={`#${encodeURIComponent(id)}`}
                onClick={(event) => onClick(event, id)}
                ref={id === activeId ? activeRef : undefined}
              >
                <span className="line-clamp-2">{title}</span>
              </a>
            </li>
          )
        )}
      </ul>
    </nav>
  );
}
