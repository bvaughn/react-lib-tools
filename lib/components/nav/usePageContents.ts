import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { getHashId } from "../../utils/getHashId";
import { scrollToAnchor } from "../../utils/scrollToAnchor";
import type { PageEntry } from "./usePageEntries";

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
 * State for the "On this page" contents, built from elements in the main content marked with data-toc (see usePageEntries).
 */
export function usePageContents(entries: PageEntry[]) {
  const { hash, key } = useLocation();
  const [pinnedId, setPinnedId] = usePinnedId(getHashId(hash), key);
  // Top-level entries with nested entries (e.g. props under "Required props") become labels
  // so the contents don't nest two levels deep
  const labelIds = useMemo(
    () =>
      new Set(
        entries
          .filter(
            ({ level }, index) => level === 1 && entries[index + 1]?.level === 2
          )
          .map(({ id }) => id)
      ),
    [entries]
  );
  const linkEntries = useMemo(
    () => entries.filter(({ id }) => !labelIds.has(id)),
    [entries, labelIds]
  );

  const scrolledId = useActiveId(linkEntries);
  const activeId = entries.some(({ id }) => id === pinnedId)
    ? pinnedId
    : scrolledId;

  const select = (id: string) => {
    setPinnedId(id);
    scrollToAnchor(id, { smooth: true });

    // Update the URL (for sharing) without triggering a route change
    history.replaceState(history.state, "", `#${encodeURIComponent(id)}`);
  };

  return { activeId, entries, labelIds, select };
}

export type PageContentsState = ReturnType<typeof usePageContents>;

function getScroller() {
  return document.querySelector<HTMLElement>("[data-app-scroller]");
}

/**
 * After jumping to an entry (via click or URL hash), highlight it until the user scrolls themselves;
 * otherwise an entry near the bottom of the page would lose its highlight to the last entry.
 */
function usePinnedId(initialId: string | undefined, locationKey: string) {
  const [pinnedId, setPinnedId] = useState(initialId);

  // Re-pin on every navigation, including to the current URL
  useEffect(() => {
    setPinnedId(initialId);
  }, [initialId, locationKey]);

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

function useActiveId(entries: PageEntry[]) {
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
