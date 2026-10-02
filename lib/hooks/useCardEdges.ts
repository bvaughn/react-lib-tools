import { useLayoutEffect, type RefObject } from "react";

/**
 * Publishes the card's left/right edges (relative to the scroll container) as CSS variables,
 * so the scroll container can mask its top corners to match the card's rounded corners.
 */
export function useCardEdges(
  scrollerRef: RefObject<HTMLElement | null>,
  cardRef: RefObject<HTMLElement | null>
) {
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const card = cardRef.current;
    if (!scroller || !card) {
      return;
    }

    const update = () => {
      const scrollerRect = scroller.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      scroller.style.setProperty(
        "--card-left",
        `${cardRect.left - scrollerRect.left}px`
      );
      scroller.style.setProperty(
        "--card-right",
        `${cardRect.right - scrollerRect.left}px`
      );
    };

    update();

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(scroller);
    resizeObserver.observe(card);

    return () => {
      resizeObserver.disconnect();
    };
  }, [cardRef, scrollerRef]);
}
