// @vitest-environment node

import { describe, expect, test } from "vitest";
import { trimExcludedText } from "./trimExcludedText";

describe("trimExcludedText", () => {
  test("should return text unchanged (but trimmed) if there are no markers", () => {
    expect(trimExcludedText("\nconst a = 1;\n")).toBe("const a = 1;");
  });

  test("should keep only the text between markers", () => {
    expect(
      trimExcludedText(`import { setup } from "./setup";

// <begin>

const a = 1;

// <end>

export { a };`)
    ).toBe("const a = 1;");
  });

  test("should support a begin marker without an end marker", () => {
    expect(trimExcludedText("hidden\n// <begin>\nvisible\n")).toBe("visible");
  });

  test("should support an end marker without a begin marker", () => {
    expect(trimExcludedText("visible\n// <end>\nhidden\n")).toBe("visible");
  });
});
