import { describe, expect, test } from "vitest";
import { renderHighlightedText } from "./renderHighlightedText";

describe("renderHighlightedText", () => {
  test("empty", () => {
    expect(renderHighlightedText("", "")).toMatchInlineSnapshot(`""`);
    expect(renderHighlightedText("foo", "")).toMatchInlineSnapshot(`"foo"`);
    expect(renderHighlightedText("", "foo")).toMatchInlineSnapshot(`[]`);
  });

  test("no matches", () => {
    expect(renderHighlightedText("foo", "bar")).toMatchInlineSnapshot(`
      [
        "foo",
      ]
    `);
  });

  test("matches", () => {
    expect(renderHighlightedText("foo bar baz", "bar")).toMatchInlineSnapshot(`
      [
        "foo ",
        <mark>bar</mark>,
        " baz",
      ]
    `);
  });

  test("multi word matches", () => {
    expect(renderHighlightedText("foo bar baz qux", "baz foo"))
      .toMatchInlineSnapshot(`
      [
        <mark>foo</mark>,
        " bar ",
        <mark>baz</mark>,
        " qux",
      ]
    `);

    expect(renderHighlightedText("foo bar baz qux bar foo baz qux", "baz bar"))
      .toMatchInlineSnapshot(`
        [
          "foo ",
          <mark>bar</mark>,
          " ",
          <mark>baz</mark>,
          " qux ",
          <mark>bar</mark>,
          " foo ",
          <mark>baz</mark>,
          " qux",
        ]
      `);
  });

  test("match at start or end", () => {
    expect(renderHighlightedText("foo bar baz", "foo")).toMatchInlineSnapshot(`
      [
        <mark>foo</mark>,
        " bar baz",
      ]
    `);
    expect(renderHighlightedText("foo bar baz", "baz")).toMatchInlineSnapshot(`
      [
        "foo bar ",
        <mark>baz</mark>,
      ]
    `);
    expect(renderHighlightedText("foo bar baz", "foo baz"))
      .toMatchInlineSnapshot(`
      [
        <mark>foo</mark>,
        " bar ",
        <mark>baz</mark>,
      ]
    `);
  });

  test("overlapping matches", () => {
    expect(renderHighlightedText("foo bar baz qux", "bar a"))
      .toMatchInlineSnapshot(`
      [
        "foo ",
        <mark>bar</mark>,
        " b",
        <mark>a</mark>,
        "z qux",
      ]
    `);
    expect(renderHighlightedText("foo bar baz qux", "bar ba"))
      .toMatchInlineSnapshot(`
      [
        "foo ",
        <mark>bar</mark>,
        " ",
        <mark>ba</mark>,
        "z qux",
      ]
    `);
  });

  test("leading or trailing space", () => {
    expect(renderHighlightedText("foo bar baz", "  bar"))
      .toMatchInlineSnapshot(`
      [
        "foo ",
        <mark>bar</mark>,
        " baz",
      ]
    `);

    expect(renderHighlightedText("foo bar baz", "bar  "))
      .toMatchInlineSnapshot(`
      [
        "foo ",
        <mark>bar</mark>,
        " baz",
      ]
    `);
  });

  test("inner space", () => {
    expect(renderHighlightedText("foo bar baz", "bar   baz"))
      .toMatchInlineSnapshot(`
      [
        "foo ",
        <mark>bar</mark>,
        " ",
        <mark>baz</mark>,
      ]
    `);
  });
});
