import { fireEvent, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { useNavScrollPosition } from "./useNavScrollPosition";

let scroller: HTMLDivElement;

beforeEach(() => {
  scroller = document.createElement("div");
  document.body.append(scroller);
});

afterEach(() => {
  scroller.remove();
  window.history.replaceState(null, "", "/");
});

function renderScrollHook() {
  const ref = { current: scroller };

  return renderHook(
    ({ isNavVisible }) => useNavScrollPosition(ref, isNavVisible),
    { initialProps: { isNavVisible: false } }
  );
}

function scrollTo(scrollTop: number) {
  scroller.scrollTop = scrollTop;
  fireEvent.scroll(scroller);
}

describe("useNavScrollPosition", () => {
  test("should scroll to the top when the nav opens", () => {
    const { rerender } = renderScrollHook();

    scrollTo(500);
    rerender({ isNavVisible: true });

    expect(scroller.scrollTop).toBe(0);
  });

  test("should restore the content's scroll position when the nav closes", () => {
    const { rerender } = renderScrollHook();

    scrollTo(500);
    rerender({ isNavVisible: true });

    // Scrolling the nav shouldn't affect the restored position
    scrollTo(100);
    rerender({ isNavVisible: false });

    expect(scroller.scrollTop).toBe(500);
  });

  test("should not restore the scroll position after navigating to another page", () => {
    const { rerender } = renderScrollHook();

    scrollTo(500);
    rerender({ isNavVisible: true });

    window.history.pushState(null, "", "/other-page");
    scrollTo(0);
    rerender({ isNavVisible: false });

    expect(scroller.scrollTop).toBe(0);
  });
});
