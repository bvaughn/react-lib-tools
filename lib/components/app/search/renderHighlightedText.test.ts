import { describe, expect, test } from "vitest";
import { renderHighlightedText } from "./renderHighlightedText";

describe("renderHighlightedText", () => {
  test("empty", () => {
    expect(renderHighlightedText("", "")).toMatchInlineSnapshot(`""`);
    expect(renderHighlightedText("foo", "")).toMatchInlineSnapshot(`"foo"`);
    expect(renderHighlightedText("", "foo")).toMatchInlineSnapshot(`""`);
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

  describe("config", () => {
    test("should not truncate if text shorter than max-length", () => {
      expect(
        renderHighlightedText("1234567890", "5", {
          maxLength: 10,
          leading: 5
        })
      ).toMatchInlineSnapshot(`
        [
          "1234",
          <mark>5</mark>,
          "67890",
        ]
      `);
    });

    test("should truncate (but not offset) if longer than max-length", () => {
      expect(
        renderHighlightedText("1234567890", "5", {
          maxLength: 6,
          leading: 3
        })
      ).toMatchInlineSnapshot(`
        [
          "1234",
          <mark>5</mark>,
          "6…",
        ]
      `);

      // Should orient around the first matching search term
      expect(
        renderHighlightedText("1234567890", "8 5", {
          maxLength: 6,
          leading: 3
        })
      ).toMatchInlineSnapshot(`
        [
          "1234",
          <mark>5</mark>,
          "6…",
        ]
      `);
    });

    test("should show both leading and trailing ellipsis if appropriate", () => {
      expect(
        renderHighlightedText("1234567890", "7", {
          maxLength: 5,
          leading: 2
        })
      ).toMatchInlineSnapshot(`
        [
          "…56",
          <mark>7</mark>,
          "89…",
        ]
      `);

      // Should orient around the first matching search term
      expect(
        renderHighlightedText("1234567890", "0 7", {
          maxLength: 5,
          leading: 2
        })
      ).toMatchInlineSnapshot(`
        [
          "…56",
          <mark>7</mark>,
          "89…",
        ]
      `);
    });

    test("should truncate and offset if longer than max-length and too far from the beginning", () => {
      expect(
        renderHighlightedText("1234567890", "8", {
          maxLength: 6,
          leading: 3
        })
      ).toMatchInlineSnapshot(`
        [
          "…567",
          <mark>8</mark>,
          "90",
        ]
      `);
    });
  });
});
