import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export type PageEntry = {
  id: string;
  level: 1 | 2;
  title: string;
};

/** Pages with fewer entries than this don't need a contents list */
export const MIN_PAGE_ENTRIES = 2;

function getMainContent() {
  return document.querySelector<HTMLElement>("[data-main-scrollable]");
}

function readEntries(): PageEntry[] {
  const main = getMainContent();
  if (!main) {
    return [];
  }

  return Array.from(main.querySelectorAll<HTMLElement>("[data-toc][id]")).map(
    (element) => ({
      id: element.id,
      level: element.dataset.toc === "2" ? 2 : 1,
      title: (element.dataset.tocTitle ?? element.textContent ?? "").trim()
    })
  );
}

/** Entries for the current page's contents list */
export function usePageEntries() {
  const { pathname } = useLocation();
  const [entries, setEntries] = useState<PageEntry[]>([]);

  useEffect(() => {
    const main = getMainContent();
    if (!main) {
      return;
    }

    let key = "";
    const update = () => {
      const next = readEntries();
      const nextKey = JSON.stringify(next);
      if (nextKey !== key) {
        key = nextKey;
        setEntries(next);
      }
    };

    update();

    // Route content is lazy loaded (and may change without a pathname change)
    const observer = new MutationObserver(update);
    observer.observe(main, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return entries;
}
