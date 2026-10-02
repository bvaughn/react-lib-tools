import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useLocation } from "react-router-dom";
import { useLibraryContext } from "../../hooks/useLibraryContext";
import { cn } from "../../utils/cn";
import { scrollToAnchor } from "../../utils/scrollToAnchor";

type Entry = {
  id: string;
  level: 1 | 2;
  title: string;
};

/** Pages with fewer entries than this don't need a contents list */
const MIN_ENTRIES = 2;

const SCROLL_KEYS = new Set([
  " ",
  "ArrowDown",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp"
]);

/** How far below the top of the scroll container a heading can be and still count as "current" */
const ACTIVE_OFFSET = 48;

/**
 * "On this page" contents list, built from elements in the main content marked with data-toc.
 * Rendered in the sidebar beneath the current page's link.
 */
export function PageContents() {
  const { hash, pathname } = useLocation();
  const { setIsNavVisible } = useLibraryContext();
  const entries = useEntries(pathname);
  const [pinnedId, setPinnedId] = usePinnedId(
    hash.length > 1 ? decodeURIComponent(hash.slice(1)) : undefined
  );
  // When a page has nested entries (e.g. props under "Required props"), the top-level entries
  // become labels so the sidebar doesn't nest three levels deep
  const hasNestedEntries = entries.some(({ level }) => level === 2);
  const linkEntries = useMemo(
    () =>
      hasNestedEntries ? entries.filter(({ level }) => level === 2) : entries,
    [entries, hasNestedEntries]
  );

  const scrolledId = useActiveId(linkEntries);
  const activeId = entries.some(({ id }) => id === pinnedId)
    ? pinnedId
    : scrolledId;
  const activeRef = useRef<HTMLAnchorElement>(null);

  const navRef = useRef<HTMLElement>(null);
  const positionedPathnameRef = useRef<string | null>(null);

  // Keep the highlighted entry visible within the (separately scrolling) sidebar
  useEffect(() => {
    const nav = navRef.current;
    const container = nav?.closest<HTMLElement>("[data-sidebar-scroller]");
    if (!nav || !container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();

    // When a page first opens, show its link near the top of the sidebar (followed by its contents),
    // unless the link and its contents are already fully visible
    if (positionedPathnameRef.current !== pathname) {
      positionedPathnameRef.current = pathname;

      const link = nav.previousElementSibling ?? nav;
      const linkRect = link.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      if (
        linkRect.top < containerRect.top ||
        navRect.bottom > containerRect.bottom
      ) {
        container.scrollTop += linkRect.top - containerRect.top - 8;
      }
      return;
    }

    const element = activeRef.current;
    if (!element) {
      return;
    }

    const elementRect = element.getBoundingClientRect();
    if (elementRect.top < containerRect.top) {
      container.scrollTop -= containerRect.top - elementRect.top + 8;
    } else if (elementRect.bottom > containerRect.bottom) {
      container.scrollTop += elementRect.bottom - containerRect.bottom + 8;
    }
  }, [activeId, entries.length, pathname]);

  if (entries.length < MIN_ENTRIES) {
    return null;
  }

  const onClick = (event: MouseEvent, id: string) => {
    event.preventDefault();

    setPinnedId(id);

    // On mobile the sidebar replaces the content; close it first and scroll once content is visible
    setIsNavVisible(false);
    requestAnimationFrame(() => {
      scrollToAnchor(id, { smooth: true });
    });

    // Update the URL (for sharing) without triggering a route change
    history.replaceState(history.state, "", `#${encodeURIComponent(id)}`);
  };

  return (
    <nav
      aria-label="On this page"
      ref={navRef}
      className="ml-4 mb-1 border-l border-white/10"
      data-search-ignore
    >
      <ul>
        {entries.map(({ id, level, title }) =>
          hasNestedEntries && level === 1 ? (
            <li
              className="pl-4 pt-2 pb-0.5 text-xs font-bold uppercase tracking-wide text-white/40"
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
                    ? "border-nav-active text-white"
                    : "border-transparent text-white/60 hover:text-white"
                )}
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

function getMainContent() {
  return document.querySelector<HTMLElement>("[data-main-scrollable]");
}

function getScroller() {
  return document.querySelector<HTMLElement>("[data-app-scroller]");
}

function readEntries(): Entry[] {
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

function useEntries(pathname: string) {
  const [entries, setEntries] = useState<Entry[]>([]);

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

/**
 * After jumping to an entry (via click or URL hash), highlight it until the user scrolls themselves;
 * otherwise an entry near the bottom of the page would lose its highlight to the last entry.
 */
function usePinnedId(initialId: string | undefined) {
  const [pinnedId, setPinnedId] = useState(initialId);

  useEffect(() => {
    setPinnedId(initialId);
  }, [initialId]);

  useEffect(() => {
    if (pinnedId === undefined) {
      return;
    }

    // Only input that scrolls the page releases the pin;
    // e.g. pressing a link (including another contents entry) should not
    const unpin = () => setPinnedId(undefined);
    const onKeyDown = (event: KeyboardEvent) => {
      if (SCROLL_KEYS.has(event.key)) {
        unpin();
      }
    };
    const onMouseDown = (event: globalThis.MouseEvent) => {
      // Pressing on the scroll container itself (rather than its content) means grabbing its scrollbar
      if (event.target === getScroller()) {
        unpin();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("touchmove", unpin, { passive: true });
    window.addEventListener("wheel", unpin, { passive: true });

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("touchmove", unpin);
      window.removeEventListener("wheel", unpin);
    };
  }, [pinnedId]);

  return [pinnedId, setPinnedId] as const;
}

function useActiveId(entries: Entry[]) {
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const scroller = getScroller();
    if (!scroller || entries.length === 0) {
      setActiveId(undefined);
      return;
    }

    const update = () => {
      const scrollerRect = scroller.getBoundingClientRect();

      // Headings near the end of the page may never scroll up to the top, so over the last
      // screenful of scrolling the threshold slides down to the bottom of the viewport;
      // that way the remaining entries activate one at a time rather than all at once
      const maxScrollTop = scroller.scrollHeight - scrollerRect.height;
      const rampDistance = Math.min(scrollerRect.height, maxScrollTop);
      const remaining = maxScrollTop - scroller.scrollTop;
      const progress =
        rampDistance > 0
          ? Math.min(1, Math.max(0, 1 - remaining / rampDistance))
          : 0;

      const threshold =
        scrollerRect.top +
        ACTIVE_OFFSET +
        progress * (scrollerRect.height - ACTIVE_OFFSET - 1);

      let current = entries[0].id;
      for (const { id } of entries) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= threshold) {
          current = id;
        } else if (element) {
          break;
        }
      }
      setActiveId(current);
    };

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();

    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [entries]);

  return activeId;
}
