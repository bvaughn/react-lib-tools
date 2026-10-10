import { describe, expect, test } from "vitest";
import { renderHighlightedText } from "./renderHighlightedText";

describe("renderHighlightedText", () => {
  test("empty", () => {
    expect(renderHighlightedText("", [])).toMatchInlineSnapshot(`[]`);
    expect(renderHighlightedText("foo", [])).toMatchInlineSnapshot(`
      [
        "foo",
      ]
    `);
    expect(renderHighlightedText("", ["foo"])).toMatchInlineSnapshot(`[]`);
  });

  test("no matches", () => {
    expect(renderHighlightedText("foo", ["bar"])).toMatchInlineSnapshot(`
      [
        "foo",
      ]
    `);
  });

  test("matches", () => {
    expect(renderHighlightedText("foo bar baz", ["bar"]))
      .toMatchInlineSnapshot(`
      [
        "foo ",
        <mark>bar</mark>,
        " baz",
      ]
    `);
  });

  test("multiple terms", () => {
    expect(renderHighlightedText("foo bar baz qux bar", ["baz", "bar"]))
      .toMatchInlineSnapshot(`
      [
        "foo ",
        <mark>bar</mark>,
        " ",
        <mark>baz</mark>,
        " qux ",
        <mark>bar</mark>,
      ]
    `);
  });

  test("match at start or end", () => {
    expect(renderHighlightedText("foo bar baz", ["foo", "baz"]))
      .toMatchInlineSnapshot(`
      [
        <mark>foo</mark>,
        " bar ",
        <mark>baz</mark>,
      ]
    `);
  });

  test("case insensitive", () => {
    expect(renderHighlightedText("Foo BAR", ["foo", "bar"]))
      .toMatchInlineSnapshot(`
      [
        <mark>Foo</mark>,
        " ",
        <mark>BAR</mark>,
      ]
    `);
  });

  test("matches the start of words, not the middle", () => {
    expect(renderHighlightedText("Persistent layouts", ["is", "layout"]))
      .toMatchInlineSnapshot(`
      [
        "Persistent ",
        <mark>layout</mark>,
        "s",
      ]
    `);
  });

  test("matches camelCase words", () => {
    expect(renderHighlightedText("Use onLayoutChange", ["layout"]))
      .toMatchInlineSnapshot(`
      [
        "Use on",
        <mark>Layout</mark>,
        "Change",
      ]
    `);

    // Adjacent matches are merged into a single mark
    expect(
      renderHighlightedText("Use onLayoutChange", ["on", "layout", "change"])
    ).toMatchInlineSnapshot(`
      [
        "Use ",
        <mark>onLayoutChange</mark>,
      ]
    `);

    expect(renderHighlightedText("HTMLElement", ["element"]))
      .toMatchInlineSnapshot(`
      [
        "HTML",
        <mark>Element</mark>,
      ]
    `);
  });

  test("prefers the longest matching term", () => {
    expect(renderHighlightedText("panels", ["pan", "panel"]))
      .toMatchInlineSnapshot(`
      [
        <mark>panel</mark>,
        "s",
      ]
    `);
  });

  test("single character terms only match whole words", () => {
    expect(renderHighlightedText("use c++ in code", ["c"]))
      .toMatchInlineSnapshot(`
      [
        "use ",
        <mark>c</mark>,
        "++ in code",
      ]
    `);
  });

  test("special characters in text are not treated as patterns", () => {
    expect(renderHighlightedText("a.b (c) [d]", ["b", "c", "d"]))
      .toMatchInlineSnapshot(`
      [
        "a.",
        <mark>b</mark>,
        " (",
        <mark>c</mark>,
        ") [",
        <mark>d</mark>,
        "]",
      ]
    `);
  });

  describe("config", () => {
    const text = "one two three four five";

    test("should not truncate if text shorter than max-length", () => {
      expect(
        renderHighlightedText(text, ["three"], {
          leading: 5,
          maxLength: 100
        })
      ).toMatchInlineSnapshot(`
        [
          "one two ",
          <mark>three</mark>,
          " four five",
        ]
      `);
    });

    test("should truncate (but not offset) if the first match is within max-length", () => {
      expect(
        renderHighlightedText(text, ["two"], {
          leading: 3,
          maxLength: 10
        })
      ).toMatchInlineSnapshot(`
        [
          "one ",
          <mark>two</mark>,
          "…",
        ]
      `);

      // Should orient around the first match in the text, regardless of term order
      expect(
        renderHighlightedText(text, ["five", "two"], {
          leading: 3,
          maxLength: 10
        })
      ).toMatchInlineSnapshot(`
        [
          "one ",
          <mark>two</mark>,
          "…",
        ]
      `);
    });

    test("should show leading and trailing ellipsis if appropriate", () => {
      expect(
        renderHighlightedText(text, ["four"], {
          leading: 4,
          maxLength: 10
        })
      ).toMatchInlineSnapshot(`
        [
          "…",
          <mark>four</mark>,
          " five",
        ]
      `);

      expect(
        renderHighlightedText(text, ["three"], {
          leading: 6,
          maxLength: 12
        })
      ).toMatchInlineSnapshot(`
        [
          "…two ",
          <mark>three</mark>,
          "…",
        ]
      `);
    });

    test("should not start in the middle of a word", () => {
      expect(
        renderHighlightedText("alpha bravo charlie delta echo", ["delta"], {
          leading: 10,
          maxLength: 20
        })
      ).toMatchInlineSnapshot(`
        [
          "…charlie ",
          <mark>delta</mark>,
          " echo",
        ]
      `);
    });

    test("should truncate without highlighting if nothing matches", () => {
      expect(
        renderHighlightedText(text, ["xyz"], {
          leading: 3,
          maxLength: 7
        })
      ).toMatchInlineSnapshot(`
        [
          "one two…",
        ]
      `);
    });
  });
});
