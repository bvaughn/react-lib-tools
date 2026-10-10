import { describe, expect, test } from "vitest";
import { escapeRegExp } from "./escapeRegExp";

describe("escapeRegExp", () => {
  test("leaves plain text unchanged", () => {
    expect(escapeRegExp("usePanelRef")).toBe("usePanelRef");
  });

  test("escapes special characters", () => {
    expect(escapeRegExp("c++")).toBe("c\\+\\+");
    expect(escapeRegExp("onResize(")).toBe("onResize\\(");
    expect(escapeRegExp(".*+?^${}()|[]\\")).toBe(
      "\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\"
    );
  });

  test("escaped text matches itself literally", () => {
    const text = "a.b*c+d?e^f$g{h}i(j)k|l[m]n\\o";
    expect(new RegExp(escapeRegExp(text)).test(text)).toBe(true);
    expect(new RegExp(escapeRegExp(".")).test("x")).toBe(false);
  });
});
