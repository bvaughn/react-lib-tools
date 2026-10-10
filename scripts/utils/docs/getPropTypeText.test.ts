// @vitest-environment node

import type { PropItem } from "react-docgen-typescript";
import { describe, expect, test } from "vitest";
import { getPropTypeText } from "./getPropTypeText";

function createProp(type: PropItem["type"]): PropItem {
  return {
    defaultValue: null,
    description: "",
    name: "prop",
    required: false,
    type
  };
}

describe("getPropTypeText", () => {
  test("should prefer the raw type", () => {
    expect(
      getPropTypeText(createProp({ name: "enum", raw: '"a" | "b"' }))
    ).toBe('"a" | "b"');
  });

  test("should fall back to the type name", () => {
    expect(getPropTypeText(createProp({ name: "number" }))).toBe("number");
  });

  test("should use function type names that weren't registered as raw", () => {
    expect(
      getPropTypeText(createProp({ name: "(value: number) => void" }))
    ).toBe("(value: number) => void");
  });

  test("should simplify ReactElement return types to ReactNode", () => {
    expect(
      getPropTypeText(
        createProp({
          name: "(props: RowProps) => ReactElement<unknown, string | JSXElementConstructor<...>>"
        })
      )
    ).toBe("(props: RowProps) => ReactNode");
  });

  test("should unwrap ExcludeForbiddenKeys", () => {
    expect(
      getPropTypeText(createProp({ name: "ExcludeForbiddenKeys<RowProps>" }))
    ).toBe("RowProps");
  });
});
