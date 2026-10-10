import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { useEffect, useMemo, useRef } from "react";
import { cn } from "../../../utils/cn";
import { Link } from "../../Link";
import { renderHighlightedText } from "./renderHighlightedText";

export type SiteSearchItem = {
  /** Shown before the title (e.g. the nav section, or the page title for a heading within a page) */
  context?: string | undefined;
  path: string;
  /** Snippet of matching text */
  text?: string | undefined;
  title: string;
};

// Snippets show the first match with some context before it;
// the max length roughly matches how much of a snippet fits on a desktop screen (CSS truncates the rest)
const SNIPPET_LEADING_CHARACTERS = 30;
const SNIPPET_MAX_LENGTH = 100;

export function SiteSearchResult({
  id,
  isActive,
  item,
  onHover,
  onSelect,
  scrollIntoView,
  terms
}: {
  id: string;
  isActive: boolean;
  item: SiteSearchItem;
  onHover: () => void;
  onSelect: () => void;
  scrollIntoView: boolean;
  terms: string[];
}) {
  const ref = useRef<HTMLLIElement>(null);

  const { context, text, title } = useMemo(
    () => ({
      context: item.context
        ? renderHighlightedText(item.context, terms)
        : undefined,
      text: item.text
        ? renderHighlightedText(item.text, terms, {
            leading: SNIPPET_LEADING_CHARACTERS,
            maxLength: SNIPPET_MAX_LENGTH
          })
        : undefined,
      title: renderHighlightedText(item.title, terms)
    }),
    [item, terms]
  );

  useEffect(() => {
    if (scrollIntoView) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }, [scrollIntoView]);

  return (
    <li aria-selected={isActive} id={id} ref={ref} role="option">
      <Link
        className={cn(
          "rounded px-2 py-1 text-white/80 cursor-pointer transition-colors!",
          "flex flex-row items-center gap-2 overflow-auto",
          {
            "bg-search-result-active text-white": isActive
          }
        )}
        onClick={(event) => {
          // Modified clicks (e.g. open in new tab) leave the search open
          if (
            event.button === 0 &&
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.shiftKey
          ) {
            onSelect();
          }
        }}
        onMouseMove={onHover}
        // Options are navigated with the arrow keys from the search input
        tabIndex={-1}
        to={item.path}
      >
        <div className="grow-1 shrink-1 overflow-auto flex flex-col gap-1">
          <div className="grow text-lg truncate text-white">
            {context && (
              <>
                {context}
                <ChevronRightIcon
                  aria-hidden
                  className="size-4 text-slate-400 inline"
                />{" "}
              </>
            )}
            {title}
          </div>
          {text && <div className="text-sm truncate pb-1">{text}</div>}
        </div>
        <ChevronRightIcon aria-hidden className="h-4 w-4 shrink-0" />
      </Link>
    </li>
  );
}
