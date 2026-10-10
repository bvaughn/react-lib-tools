import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { useCardEdges } from "./useCardEdges";

function createElement(rect: { left: number; right: number }) {
  const element = document.createElement("div");
  element.getBoundingClientRect = () => ({ ...rect }) as DOMRect;
  return element;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCardEdges", () => {
  test("should set CSS variables for the card's edges relative to the scroller", () => {
    const scroller = createElement({ left: 100, right: 1100 });
    const card = createElement({ left: 120, right: 1080 });

    renderHook(() => useCardEdges({ current: scroller }, { current: card }));

    expect(scroller.style.getPropertyValue("--card-left")).toBe("20px");
    expect(scroller.style.getPropertyValue("--card-right")).toBe("980px");
  });

  test("should update when either element resizes, and stop observing on unmount", () => {
    let onResize: () => void = () => {};
    const disconnect = vi.fn();
    const observe = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          onResize = callback;
        }
        disconnect = disconnect;
        observe = observe;
      }
    );

    const scroller = createElement({ left: 0, right: 1000 });
    const card = createElement({ left: 10, right: 990 });

    const { unmount } = renderHook(() =>
      useCardEdges({ current: scroller }, { current: card })
    );

    expect(observe).toHaveBeenCalledWith(scroller);
    expect(observe).toHaveBeenCalledWith(card);

    card.getBoundingClientRect = () => ({ left: 50, right: 500 }) as DOMRect;
    act(() => onResize());

    expect(scroller.style.getPropertyValue("--card-left")).toBe("50px");
    expect(scroller.style.getPropertyValue("--card-right")).toBe("500px");

    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});
