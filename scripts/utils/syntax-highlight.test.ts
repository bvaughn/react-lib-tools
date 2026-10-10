// @vitest-environment node

import { describe, expect, test } from "vitest";
import { syntaxHighlight, type Language } from "./syntax-highlight";

// Reverses the HTML conversion so output can be compared to the original code
function toPlainText(html: string) {
  return html
    .split("\n")
    .map((line) =>
      line === "<div>&nbsp;</div>"
        ? ""
        : line
            .replace(/<[^>]+>/g, "")
            .replace(/&#(\d+);/g, (_, code) =>
              String.fromCharCode(parseInt(code))
            )
    )
    .join("\n");
}

const SAMPLES: Record<Language, string> = {
  CSS: `.badge {\n  color: red;\n}`,
  HTML: `<div class="example">\n  <span>Text & more</span>\n</div>`,
  JS: `const value = 1;\n\nfunction add(a, b) {\n  return a + b;\n}`,
  JSON: `{\n  "key": "value",\n  "list": [1, true, null]\n}`,
  JSX: `const element = <div className="foo">{value}</div>;`,
  TS: `type Props = { value: number };\n\nconst add = (a: number, b: number): number => a + b;`,
  TSX: `function Example({ value }: { value: string }) {\n  return <Badge intent="success">{value}</Badge>;\n}`
};

describe("syntaxHighlight", () => {
  test.each(Object.entries(SAMPLES))(
    "should preserve the original %s code",
    async (language, code) => {
      const html = await syntaxHighlight(code, language as Language);

      expect(toPlainText(html)).toBe(code);
    }
  );

  test.each(Object.entries(SAMPLES))(
    "should apply token classes to %s code",
    async (language, code) => {
      const html = await syntaxHighlight(code, language as Language);

      expect(html).toMatch(/class="tok-[a-zA-Z]+"/);
    }
  );

  test("should render one div per line", async () => {
    const html = await syntaxHighlight("const a = 1;\n\nconst b = 2;", "TS");
    const lines = html.split("\n");

    expect(lines).toHaveLength(3);
    expect(lines.every((line) => /^<div>.*<\/div>$/.test(line))).toBe(true);
    expect(lines[1]).toBe("<div>&nbsp;</div>");
  });

  test("should escape HTML characters", async () => {
    const html = await syntaxHighlight("const a = b < c && d > e;", "TS");

    // Outside of the generated markup, only escaped entities should remain
    const text = html.replace(/<\/?(div|span)[^>]*>/g, "");
    expect(text).not.toMatch(/[<>]|&(?!#\d+;)/);
    expect(html).toContain("&#60;");
    expect(html).toContain("&#38;&#38;");
    expect(html).toContain("&#62;");
  });

  test("should normalize Windows line endings", async () => {
    expect(await syntaxHighlight("const a = 1;\r\nconst b = 2;", "TS")).toBe(
      await syntaxHighlight("const a = 1;\nconst b = 2;", "TS")
    );
  });
});
