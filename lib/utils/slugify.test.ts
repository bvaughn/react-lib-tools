import { describe, expect, test } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  test("lowercases and hyphenates words", () => {
    expect(slugify("Required props")).toBe("required-props");
  });

  test("collapses punctuation and trims separators", () => {
    expect(slugify("  Why is my layout invalid?  ")).toBe(
      "why-is-my-layout-invalid"
    );
  });
});
