import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLibraryContext } from "../../../hooks/useLibraryContext";

export function RouteChangeHandler() {
  const { setIsNavVisible, setIsSiteSearchVisible } = useLibraryContext();

  const { pathname } = useLocation();

  useLayoutEffect(() => {
    setIsNavVisible(false);
    setIsSiteSearchVisible(false);

    // Wait a frame so the (possibly previously hidden) main content has been laid out
    // before resetting scroll; scrolling an element while it's display:none is a no-op
    const frame = requestAnimationFrame(resetScrollPositions);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [pathname, setIsNavVisible, setIsSiteSearchVisible]);

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
