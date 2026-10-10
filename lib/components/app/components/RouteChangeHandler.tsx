import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLibraryContext } from "../../../hooks/useLibraryContext";
import { getHashId } from "../../../utils/getHashId";
import { scrollToAnchor } from "../../../utils/scrollToAnchor";

export function RouteChangeHandler() {
  const { setIsNavVisible, setIsSiteSearchVisible } = useLibraryContext();

  // The location key changes on every navigation, including to the current URL
  // (e.g. selecting the search result for a heading that's already in the hash)
  const { hash, key } = useLocation();

  useLayoutEffect(() => {
    setIsNavVisible(false);
    setIsSiteSearchVisible(false);

    // Wait a frame so the (possibly previously hidden) main content has been laid out
    // before scrolling; scrolling an element while it's display:none is a no-op
    let cancelScrollToAnchor: (() => void) | undefined;
    const frame = requestAnimationFrame(() => {
      const id = getHashId(hash);
      if (id !== undefined) {
        cancelScrollToAnchor = scrollToAnchor(id);
      } else {
        resetScrollPositions();
      }
    });

    return () => {
      cancelAnimationFrame(frame);
      cancelScrollToAnchor?.();
    };
  }, [hash, key, setIsNavVisible, setIsSiteSearchVisible]);

  return null;
}

function resetScrollPositions() {
  // Which element actually scrolls depends on how the browser resolves the nested
  // percentage/dvh heights in the layout; mobile Safari differs from desktop browsers
  // (e.g. <main>, #root, or the document itself may end up being the scroller).
  // Reset the designated scroll container and every ancestor to be safe.
  let current: Element | null = document.body.querySelector(
    "[data-main-scrollable]"
  );
  while (current) {
    if (current.scrollTop !== 0 || current.scrollLeft !== 0) {
      current.scrollTop = 0;
      current.scrollLeft = 0;
    }
    current = current.parentElement;
  }

  if (window.scrollX !== 0 || window.scrollY !== 0) {
    window.scrollTo(0, 0);
  }
}
