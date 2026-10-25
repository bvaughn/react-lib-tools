import { useEffect, useState, type ReactNode } from "react";
import { SiteSearchResult, type SiteSearchItem } from "./SiteSearchResult";

/**
 * Listbox of search results (or pages, when there is no search text),
 * navigated with the arrow keys while focus stays in the search input (combobox pattern).
 */
export function SiteSearchList({
  emptyMessage,
  footer,
  inputRef,
  isStale,
  items,
  label,
  listboxId,
  onSelect,
  onSelectWhenReady,
  onVisibilityChange,
  selectFirst,
  status,
  terms
}: {
  emptyMessage?: ReactNode;
  /** Shown below the list (e.g. to show more results) */
  footer?: ReactNode;
  inputRef: HTMLInputElement | null;
  /** Items don't yet reflect the latest search text (e.g. the search is debounced) */
  isStale: boolean;
  items: SiteSearchItem[];
  /** Accessible name of the list (e.g. "Search results") */
  label: string;
  listboxId: string;
  onSelect: () => void;
  /** Enter was pressed while items were stale; the first up-to-date item should be selected */
  onSelectWhenReady: () => void;
  /** Called when the listbox is mounted and unmounted (e.g. replaced by a loading or error message) */
  onVisibilityChange: (isVisible: boolean) => void;
  selectFirst: boolean;
  status?: string | undefined;
  terms: string[];
}) {
  const [active, setActive] = useState<{
    index: number;
    // Only keyboard navigation scrolls the active item into view;
    // scrolling the item under the mouse would move the list out from under it
    scroll: boolean;
  }>({ index: 0, scroll: false });

  useEffect(() => {
    onVisibilityChange(true);
    return () => onVisibilityChange(false);
  }, [onVisibilityChange]);

  // Select the first item once results catch up with an Enter key press
  useEffect(() => {
    if (selectFirst && items.length > 0) {
      clickOption(listboxId, 0);
    }
  }, [items, listboxId, selectFirst]);

  useEffect(() => {
    if (!inputRef) {
      return;
    }

    if (items.length > 0) {
      inputRef.setAttribute(
        "aria-activedescendant",
        getOptionId(listboxId, active.index)
      );
    }

    const onKeyDown = (event: KeyboardEvent) => {
      // While composing text with an input method editor (e.g. Japanese), keys confirm the composition
      if (event.isComposing) {
        return;
      }

      if (event.key === "Enter" && isStale) {
        event.preventDefault();
        onSelectWhenReady();
        return;
      }

      if (items.length === 0) {
        return;
      }

      switch (event.key) {
        case "ArrowDown": {
          event.preventDefault();
          setActive({
            index: active.index < items.length - 1 ? active.index + 1 : 0,
            scroll: true
          });
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          setActive({
            index: active.index > 0 ? active.index - 1 : items.length - 1,
            scroll: true
          });
          break;
        }
        case "Enter": {
          event.preventDefault();
          clickOption(listboxId, active.index);
          break;
        }
      }
    };

    inputRef.addEventListener("keydown", onKeyDown);
    return () => {
      inputRef.removeEventListener("keydown", onKeyDown);
      inputRef.removeAttribute("aria-activedescendant");
    };
  }, [active, inputRef, isStale, items, listboxId, onSelectWhenReady]);

  return (
    <div className="border-t border-ink/10 pt-3 mt-3 flex flex-col min-h-0">
      {items.length === 0 && emptyMessage ? (
        <div className="px-2 py-1" role="status">
          {emptyMessage}
        </div>
      ) : (
        status && (
          <div className="sr-only" role="status">
            {status}
          </div>
        )
      )}
      <ul
        aria-label={label}
        className="flex flex-col gap-1 overflow-auto overscroll-contain"
        id={listboxId}
        role="listbox"
      >
        {items.map((item, index) => (
          <SiteSearchResult
            id={getOptionId(listboxId, index)}
            isActive={index === active.index}
            item={item}
            key={item.path}
            onHover={() => {
              if (index !== active.index) {
                setActive({ index, scroll: false });
              }
            }}
            onSelect={onSelect}
            scrollIntoView={index === active.index && active.scroll}
            terms={terms}
          />
        ))}
      </ul>
      {footer}
    </div>
  );
}

function getOptionId(listboxId: string, index: number) {
  return `${listboxId}-${index}`;
}

function clickOption(listboxId: string, index: number) {
  const link = document.getElementById(
    getOptionId(listboxId, index)
  )?.firstElementChild;
  if (link instanceof HTMLAnchorElement) {
    link.click();
  }
}
