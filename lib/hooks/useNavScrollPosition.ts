import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

/**
 * On small screens the sidebar replaces the main content within the same page scroller.
 *
 * When the sidebar opens, explicitly reset the scroller to the top; otherwise the browser must clamp
 * a (now out of range) scroll position for the much shorter sidebar content, and iOS Safari doesn't
 * repaint after doing so, leaving the sidebar invisible until the next open.
 *
 * When the sidebar closes without navigating, restore the content's previous scroll position.
 * (Navigating closes the sidebar too; RouteChangeHandler handles scrolling in that case.)
 */
export function useNavScrollPosition(
  scrollerRef: RefObject<HTMLElement | null>,
  isNavVisible: boolean
) {
  // Tracked while content is showing; by the time the sidebar has opened,
  // the browser has already clamped the scroller's position
  const contentPositionRef = useRef({ pathname: "", scrollTop: 0 });

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || isNavVisible) {
      return;
    }

    const onScroll = () => {
      contentPositionRef.current = {
        pathname: window.location.pathname,
        scrollTop: scroller.scrollTop
      };
    };

    onScroll();

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
    };
  }, [isNavVisible, scrollerRef]);

  const wasNavVisibleRef = useRef(isNavVisible);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const wasNavVisible = wasNavVisibleRef.current;
    wasNavVisibleRef.current = isNavVisible;
    if (!scroller || wasNavVisible === isNavVisible) {
      return;
    }

    if (isNavVisible) {
      scroller.scrollTop = 0;
    } else {
      const { pathname, scrollTop } = contentPositionRef.current;
      if (pathname === window.location.pathname) {
        scroller.scrollTop = scrollTop;
      }
    }
  }, [isNavVisible, scrollerRef]);
}
