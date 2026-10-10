import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useDebouncedValue } from "./useDebouncedValue";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDebouncedValue", () => {
  test("should return the initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("a", 100));

    expect(result.current).toBe("a");
  });

  test("should update after the delay", () => {
    const { rerender, result } = renderHook(
      ({ value }) => useDebouncedValue(value, 100),
      { initialProps: { value: "a" } }
    );

    rerender({ value: "b" });
    expect(result.current).toBe("a");

    act(() => vi.advanceTimersByTime(99));
    expect(result.current).toBe("a");

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("b");
  });

  test("should restart the delay when the value changes again", () => {
    const { rerender, result } = renderHook(
      ({ value }) => useDebouncedValue(value, 100),
      { initialProps: { value: "a" } }
    );

    rerender({ value: "b" });
    act(() => vi.advanceTimersByTime(60));
    rerender({ value: "c" });
    act(() => vi.advanceTimersByTime(60));
    expect(result.current).toBe("a");

    act(() => vi.advanceTimersByTime(40));
    expect(result.current).toBe("c");
  });

  test("should update without waiting when the delay is 0", () => {
    const { rerender, result } = renderHook(
      ({ value }) => useDebouncedValue(value, 0),
      { initialProps: { value: "a" } }
    );

    rerender({ value: "b" });
    expect(result.current).toBe("b");
  });
});
