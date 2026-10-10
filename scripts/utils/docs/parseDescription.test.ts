// @vitest-environment node

import { describe, expect, test } from "vitest";
import { parseDescription } from "./parseDescription";

describe("parseDescription", () => {
  test("should convert text to HTML", async () => {
    expect(await parseDescription("Some `code` and **bold** text.")).toEqual([
      {
        content:
          "<p>Some <code>code</code> and <strong>bold</strong> text.</p>\n"
      }
    ]);
  });

  test("should split paragraphs into separate sections", async () => {
    expect(
      await parseDescription("First paragraph.\n\nSecond paragraph.")
    ).toEqual([
      { content: "<p>First paragraph.</p>\n" },
      { content: "<p>Second paragraph.</p>\n" }
    ]);
  });

  test.each([
    ["ℹ️", "primary"],
    ["⚠️", "warning"],
    ["❌", "danger"],
    ["✅", "success"],
    ["NOTE:", "none"]
  ])(
    "should convert paragraphs starting with %s to %s callouts",
    async (flag, intent) => {
      expect(await parseDescription(`Intro.\n\n${flag} Callout.`)).toEqual([
        { content: "<p>Intro.</p>\n" },
        { content: "<p>Callout.</p>\n", intent }
      ]);
    }
  );

  test("should split callouts that start on the line after other text", async () => {
    expect(await parseDescription("Intro.\n⚠️ Callout.")).toEqual([
      { content: "<p>Intro.</p>\n" },
      { content: "<p>Callout.</p>\n", intent: "warning" }
    ]);
  });

  test("should convert @deprecated tags to danger callouts", async () => {
    expect(await parseDescription("@deprecated Use something else.")).toEqual([
      {
        content: "<p>This prop has been deprecated. Use something else.</p>\n",
        intent: "danger"
      }
    ]);
  });

  test("should convert @param tags to a list", async () => {
    expect(
      await parseDescription(
        "Description.\n\n@param first First param\n@param second Second param"
      )
    ).toEqual([
      { content: "<p>Description.</p>\n" },
      {
        content:
          "<ul>\n<li><code>first</code> First param</li>\n<li><code>second</code> Second param</li>\n</ul>\n"
      }
    ]);
  });

  test("should syntax highlight fenced code blocks", async () => {
    const sections = await parseDescription(
      "Example:\n\n```tsx\n<Foo bar={1} />\n```"
    );

    expect(sections).toHaveLength(2);
    expect(sections[0]).toEqual({ content: "<p>Example:</p>\n" });
    expect(sections[1].code).toBe(true);
    expect(sections[1].content).toContain(
      '<span class="tok-typeName">Foo</span>'
    );
    expect(sections[1].content).not.toContain("```");
  });
});
