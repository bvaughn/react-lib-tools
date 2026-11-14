// @vitest-environment node

import { describe, expect, test } from "vitest";
import { normalizeDescription } from "./normalizeDescription";

describe("normalizeDescription", () => {
  test("should format plain @param names as code", () => {
    expect(normalizeDescription("@param tab Tab to add")).toBe(
      "- `tab` Tab to add"
    );
  });

  test("should format dotted @param names as code", () => {
    expect(normalizeDescription("@param options.size Size")).toBe(
      "- `options.size` Size"
    );
  });

  test("should format indexed @param names as code", () => {
    expect(normalizeDescription("@param items[].id Item id")).toBe(
      "- `items[].id` Item id"
    );
  });
});
