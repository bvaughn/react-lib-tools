import { describe, expect, test } from "vitest";
import { search } from "./search";
import type { SiteMapPage } from "../../../../types";

describe("search", () => {
  const siteMap: SiteMapPage[] = [
    {
      path: "",
      title: "0: Page one",
      section: "Section",
      text: "Foo bar zot"
    },
    {
      path: "",
      title: "1: Page two zot",
      section: "Section",
      text: "Bar baz bar"
    },
    {
      path: "",
      title: "3: Page three",
      text: "Baz qux quxes"
    }
  ];

  test("no pages", async () => {
    expect(await search([], "")).toEqual([]);
  });

  test("no search text", async () => {
    expect(await search(siteMap, "")).toEqual(siteMap);
  });

  test("no matching terms", async () => {
    expect(await search(siteMap, "xyz")).toEqual([]);
  });

  test("one matching document", async () => {
    expect(await search(siteMap, "Foo")).toEqual([siteMap[0]]);

    // Multiple matches within the same document
    expect(await search(siteMap, "qux")).toEqual([siteMap[2]]);
  });

  test("multiple matching documents", async () => {
    expect(await search(siteMap, "baz")).toEqual([siteMap[1], siteMap[2]]);

    // Multiple documents, each matching one of the search terms
    expect(await search(siteMap, "Foo quxes")).toEqual([
      siteMap[0],
      siteMap[2]
    ]);

    expect(await search(siteMap, "section")).toEqual([siteMap[0], siteMap[1]]);
  });

  test("sorting prefers matches with repeated terms", async () => {
    expect(search(siteMap, "bar")).toEqual([siteMap[1], siteMap[0]]);
  });

  test("sorting prefers title matches", async () => {
    expect(search(siteMap, "zot")).toEqual([siteMap[1], siteMap[0]]);
  });

  test("sorting prefers multiple matches", async () => {
    expect(search(siteMap, "ba")).toEqual([siteMap[1], siteMap[0], siteMap[2]]);
  });

  test("extra spaces", async () => {
    expect(await search(siteMap, "  baz")).toEqual([siteMap[1], siteMap[2]]);
    expect(await search(siteMap, "baz  ")).toEqual([siteMap[1], siteMap[2]]);
    expect(await search(siteMap, "foo    quxes")).toEqual([
      siteMap[0],
      siteMap[2]
    ]);
  });
});
