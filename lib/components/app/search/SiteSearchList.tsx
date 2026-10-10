import { useEffect, useState, type ReactNode } from "react";
import { SiteSearchResult, type SiteSearchItem } from "./SiteSearchResult";

/**
 * Listbox of search results (or pages, when there is no search text),
 * navigated with the arrow keys while focus stays in the search input (combobox pattern).
 */
export function SiteSearchList({
  emptyMessage,
  inputRef,
  items,
  listboxId,
  onSelect,
  status,
  terms
}: {
  emptyMessage?: ReactNode;
  inputRef: HTMLInputElement | null;
  items: SiteSearchItem[];
  listboxId: string;
  onSelect: () => void;
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
          const link = document.getElementById(
            getOptionId(listboxId, active.index)
          )?.firstElementChild;
          if (link instanceof HTMLAnchorElement) {
            link.click();
          }
          break;
        }
      }
    };

    inputRef.addEventListener("keydown", onKeyDown);
    return () => {
      inputRef.removeEventListener("keydown", onKeyDown);
      inputRef.removeAttribute("aria-activedescendant");
    };
  }, [active, inputRef, items, listboxId]);

  return (
    <div className="border-t border-white/10 pt-3 mt-3 flex flex-col min-h-0">
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
        aria-label="Search results"
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
    </div>
  );
}

function getOptionId(listboxId: string, index: number) {
  return `${listboxId}-${index}`;
}
