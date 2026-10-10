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

  test("special characters are ignored", () => {
    const pages: SiteMapPage[] = [
      { path: "", title: "C++ interop", text: "onResize(size)" },
      { path: "", title: "Other", text: "plain text" }
    ];

    expect(search(pages, "c++")).toEqual([pages[0]]);
    expect(search(pages, "onResize(")).toEqual([pages[0]]);
    expect(search(pages, "(")).toEqual([]);
    expect(search(pages, "[x")).toEqual([]);
    expect(search(pages, ".")).toEqual([]);
  });

  test("single character terms only match whole words", () => {
    const pages: SiteMapPage[] = [
      { path: "", title: "C++ interop", text: "" },
      { path: "", title: "Components", text: "" }
    ];

    expect(search(pages, "c")).toEqual([pages[0]]);
    expect(search(pages, "co")).toEqual([pages[1]]);
  });

  describe("word boundaries", () => {
    const pages: SiteMapPage[] = [
      { path: "/hooks/use-panel-ref", title: "usePanelRef", text: "" },
      { path: "/props/panel", title: "Panel component props", text: "" }
    ];

    test("camelCase, kebab-case, and separate words are equivalent", () => {
      expect(search(pages, "usePanelRef")[0]).toBe(pages[0]);
      expect(search(pages, "use-panel-ref")[0]).toBe(pages[0]);
      expect(search(pages, "use panel ref")[0]).toBe(pages[0]);
    });

    test("terms match the start of words", () => {
      expect(search(pages, "pan")).toEqual([pages[1], pages[0]]);
      expect(search(pages, "anel")).toEqual([]);
    });

    test("path is searched", () => {
      expect(search(pages, "hooks")).toEqual([pages[0]]);
    });
  });

  describe("ranking", () => {
    test("pages matching all terms rank above pages matching some terms", () => {
      const pages: SiteMapPage[] = [
        { path: "", title: "Server", text: "server server server server" },
        { path: "", title: "Rendering", text: "server rendering" }
      ];

      expect(search(pages, "server rendering")[0]).toBe(pages[1]);
    });

    test("terms appearing together rank above scattered terms", () => {
      const pages: SiteMapPage[] = [
        { path: "", title: "One", text: "min foo bar size" },
        { path: "", title: "Two", text: "foo min size bar" }
      ];

      expect(search(pages, "min size")[0]).toBe(pages[1]);
    });

    test("long pages do not outrank short pages by repetition alone", () => {
      const pages: SiteMapPage[] = [
        {
          path: "",
          title: "Long",
          text: "grid " + "filler ".repeat(500) + "grid grid grid"
        },
        { path: "", title: "Short", text: "grid" }
      ];

      expect(search(pages, "grid")[0]).toBe(pages[1]);
    });

    test("common words are ignored", () => {
      const pages: SiteMapPage[] = [
        { path: "", title: "Storage", text: "persist" },
        { path: "", title: "Other", text: "how do i how do i" },
        { path: "", title: "Another", text: "how do i how do i" }
      ];

      expect(search(pages, "how do i persist")).toEqual([pages[0]]);
    });

    test("queries containing only common words still match", () => {
      const pages: SiteMapPage[] = [
        { path: "", title: "Other", text: "how it works" },
        { path: "", title: "Another", text: "something else" }
      ];

      expect(search(pages, "how")).toEqual([pages[0]]);
    });

    test("distinctive terms matter more than common ones", () => {
      const pages: SiteMapPage[] = [
        { path: "", title: "One", text: "layout layout layout" },
        { path: "", title: "Two", text: "layout layout layout" },
        { path: "", title: "Three", text: "layout layout persist" }
      ];

      expect(search(pages, "layout persist")[0]).toBe(pages[2]);
    });
  });

  describe("typo tolerance", () => {
    const pages: SiteMapPage[] = [
      { path: "", title: "Collapsible panels", text: "" },
      { path: "", title: "Separator", text: "" }
    ];

    test("corrects a single typo", () => {
      expect(search(pages, "colapsible")).toEqual([pages[0]]);
      expect(search(pages, "seperator")).toEqual([pages[1]]);
      expect(search(pages, "spearator")).toEqual([pages[1]]);
    });

    test("corrects a partially typed word", () => {
      expect(search(pages, "colaps")).toEqual([pages[0]]);
    });

    test("does not correct short terms", () => {
      expect(search(pages, "panle")).toEqual([]);
    });

    test("does not correct terms with more than one typo", () => {
      expect(search(pages, "colapsibel")).toEqual([]);
    });

    test("corrected terms rank like correctly spelled terms", () => {
      const pages: SiteMapPage[] = [
        { path: "/examples/panels", title: "Panel examples", text: "panel" },
        { path: "/props/panel", title: "Panel props", text: "" }
      ];

      expect(search(pages, "pannel")).toEqual(search(pages, "panel"));
    });
  });
});
