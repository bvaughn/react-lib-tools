import type { PropsWithChildren, ReactElement } from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect, vi } from "vitest";
import failOnConsole from "vitest-fail-on-console";

// Tests for Node scripts opt out of the DOM with a "@vitest-environment node" comment
const HAS_DOM = typeof HTMLElement !== "undefined";

const PROTOTYPE_PROPS = [
  "clientHeight",
  "clientWidth",
  "offsetHeight",
  "offsetWidth"
];

failOnConsole({
  shouldFailOnError: true
});

expect.addSnapshotSerializer({
  serialize(value: ReactElement<PropsWithChildren>) {
    return `<mark>${value.props.children ?? ""}</mark>`;
  },
  test(value) {
    return (
      value !== null &&
      typeof value === "object" &&
      "type" in value &&
      value.type === "mark"
    );
  }
});

expect.addSnapshotSerializer({
  serialize(value) {
    const rect = value as DOMRect;
    return `${rect.x}, ${rect.y} (${rect.width} x ${rect.height})`;
  },
  test(value) {
    return (
      value !== null &&
      typeof value === "object" &&
      "x" in value &&
      "y" in value &&
      "width" in value &&
      "height" in value
    );
  }
});

expect.extend({
  toLogError: (callback: () => unknown, expectedError: string) => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    callback();

    expect(console.error).toHaveBeenCalledWith(expectedError);

    spy.mockReset();

    return {
      pass: true,
      message: () => ""
    };
  }
});

beforeAll(() => {
  if (HAS_DOM) {
    PROTOTYPE_PROPS.forEach((propertyKey) => {
      Object.defineProperty(HTMLElement.prototype, propertyKey, {
        configurable: true,
        value: 0
      });
    });
  }

  vi.spyOn(console, "warn").mockImplementation(() => {
    throw Error("Unexpected console warning");
  });
});

afterAll(() => {
  if (HAS_DOM) {
    PROTOTYPE_PROPS.forEach((propertyKey) => {
      delete HTMLElement.prototype[
        propertyKey as keyof typeof HTMLElement.prototype
      ];
    });
  }
});

afterEach(() => {
  if (HAS_DOM) {
    cleanup();
  }
});
