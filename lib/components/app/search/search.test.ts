import { describe, expect, test } from "vitest";
import { search } from "./search";
import type { SiteMapPage } from "../../../../types";

function searchPages(siteMap: SiteMapPage[], queryText: string) {
  return search(siteMap, queryText).map(({ page }) => page);
}

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
    expect(await searchPages([], "")).toEqual([]);
  });

  test("no search text", async () => {
    expect(await searchPages(siteMap, "")).toEqual(siteMap);
  });

  test("no matching terms", async () => {
    expect(await searchPages(siteMap, "xyz")).toEqual([]);
  });

  test("one matching document", async () => {
    expect(await searchPages(siteMap, "Foo")).toEqual([siteMap[0]]);

    // Multiple matches within the same document
    expect(await searchPages(siteMap, "qux")).toEqual([siteMap[2]]);
  });

  test("multiple matching documents", async () => {
    expect(await searchPages(siteMap, "baz")).toEqual([siteMap[1], siteMap[2]]);

    // Multiple documents, each matching one of the search terms
    // "qux" and "quxes" share a root, so the page containing both ranks first
    expect(await searchPages(siteMap, "Foo quxes")).toEqual([
      siteMap[2],
      siteMap[0]
    ]);

    expect(await searchPages(siteMap, "section")).toEqual([
      siteMap[0],
      siteMap[1]
    ]);
  });

  test("sorting prefers matches with repeated terms", async () => {
    expect(searchPages(siteMap, "bar")).toEqual([siteMap[1], siteMap[0]]);
  });

  test("sorting prefers title matches", async () => {
    expect(searchPages(siteMap, "zot")).toEqual([siteMap[1], siteMap[0]]);
  });

  test("sorting prefers multiple matches", async () => {
    expect(searchPages(siteMap, "ba")).toEqual([
      siteMap[1],
      siteMap[0],
      siteMap[2]
    ]);
  });

  test("extra spaces", async () => {
    expect(await searchPages(siteMap, "  baz")).toEqual([
      siteMap[1],
      siteMap[2]
    ]);
    expect(await searchPages(siteMap, "baz  ")).toEqual([
      siteMap[1],
      siteMap[2]
    ]);
    // "qux" and "quxes" share a root, so the page containing both ranks first
    expect(await searchPages(siteMap, "foo    quxes")).toEqual([
      siteMap[2],
      siteMap[0]
    ]);
  });

  test("special characters are ignored", () => {
    const pages: SiteMapPage[] = [
      { path: "", title: "C++ interop", text: "onResize(size)" },
      { path: "", title: "Other", text: "plain text" }
    ];

    expect(searchPages(pages, "c++")).toEqual([pages[0]]);
    expect(searchPages(pages, "onResize(")).toEqual([pages[0]]);
    expect(searchPages(pages, "(")).toEqual([]);
    expect(searchPages(pages, "[x")).toEqual([]);
    expect(searchPages(pages, ".")).toEqual([]);
  });

  test("single character terms only match whole words", () => {
    const pages: SiteMapPage[] = [
      { path: "", title: "C++ interop", text: "" },
      { path: "", title: "Components", text: "" }
    ];

    expect(searchPages(pages, "c")).toEqual([pages[0]]);
    expect(searchPages(pages, "co")).toEqual([pages[1]]);
  });

  describe("word boundaries", () => {
    const pages: SiteMapPage[] = [
      { path: "/hooks/use-panel-ref", title: "usePanelRef", text: "" },
      { path: "/props/panel", title: "Panel component props", text: "" }
    ];

    test("camelCase, kebab-case, and separate words are equivalent", () => {
      expect(searchPages(pages, "usePanelRef")[0]).toBe(pages[0]);
      expect(searchPages(pages, "use-panel-ref")[0]).toBe(pages[0]);
      expect(searchPages(pages, "use panel ref")[0]).toBe(pages[0]);
    });

    test("terms match the start of words", () => {
      expect(searchPages(pages, "pan")).toEqual([pages[1], pages[0]]);
      expect(searchPages(pages, "anel")).toEqual([]);
    });

    test("identifiers typed without camelCase still match", () => {
      expect(searchPages(pages, "usepanelref")[0]).toBe(pages[0]);
      expect(searchPages(pages, "USEPANELREF")[0]).toBe(pages[0]);
      expect(searchPages(pages, "usePanelref")[0]).toBe(pages[0]);
      expect(searchPages(pages, "usepanelr")[0]).toBe(pages[0]);
      expect(searchPages(pages, "usepanelxyz")).toEqual([]);
    });

    test("a trailing partial character does not match unrelated single-character words", () => {
      const pages: SiteMapPage[] = [
        { path: "", title: "Versions", text: "4.x 3.x" },
        { path: "", title: "Gridline", text: "" }
      ];

      expect(searchPages(pages, "gridlinex")).toEqual([pages[1]]);
    });

    test("path is searched", () => {
      expect(searchPages(pages, "hooks")).toEqual([pages[0]]);
    });
  });

  describe("ranking", () => {
    test("pages matching all terms rank above pages matching some terms", () => {
      const pages: SiteMapPage[] = [
        { path: "", title: "Server", text: "server server server server" },
        { path: "", title: "Rendering", text: "server rendering" }
      ];

      expect(searchPages(pages, "server rendering")[0]).toBe(pages[1]);
    });

    test("terms appearing together rank above scattered terms", () => {
      const pages: SiteMapPage[] = [
        { path: "", title: "One", text: "min foo bar size" },
        { path: "", title: "Two", text: "foo min size bar" }
      ];

      expect(searchPages(pages, "min size")[0]).toBe(pages[1]);
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

      expect(searchPages(pages, "grid")[0]).toBe(pages[1]);
    });

    test("common words are ignored", () => {
      const pages: SiteMapPage[] = [
        { path: "", title: "Storage", text: "persist" },
        { path: "", title: "Other", text: "how do i how do i" },
        { path: "", title: "Another", text: "how do i how do i" }
      ];

      expect(searchPages(pages, "how do i persist")).toEqual([pages[0]]);
    });

    test("common words inside identifiers are kept", () => {
      const pages: SiteMapPage[] = [
        { path: "", title: "collapse", text: "" },
        { path: "", title: "isCollapsed", text: "" }
      ];

      expect(searchPages(pages, "isCollapsed")[0]).toBe(pages[1]);
      expect(searchPages(pages, "is-collapsed")[0]).toBe(pages[1]);
    });

    test("queries containing only common words still match", () => {
      const pages: SiteMapPage[] = [
        { path: "", title: "Other", text: "how it works" },
        { path: "", title: "Another", text: "something else" }
      ];

      expect(searchPages(pages, "how")).toEqual([pages[0]]);
    });

    test("distinctive terms matter more than common ones", () => {
      const pages: SiteMapPage[] = [
        { path: "", title: "One", text: "layout layout layout" },
        { path: "", title: "Two", text: "layout layout layout" },
        { path: "", title: "Three", text: "layout layout persist" }
      ];

      expect(searchPages(pages, "layout persist")[0]).toBe(pages[2]);
    });
  });

  describe("stemming", () => {
    const pages: SiteMapPage[] = [
      { path: "", title: "Collapsible panels", text: "" },
      { path: "", title: "Resizing", text: "" },
      { path: "", title: "One", text: "" }
    ];

    test("matches words with the same root", () => {
      expect(searchPages(pages, "collapse")).toEqual([pages[0]]);
      expect(searchPages(pages, "collapsed")).toEqual([pages[0]]);
      expect(searchPages(pages, "resize")).toEqual([pages[1]]);
    });

    test("matches singular and plural forms", () => {
      expect(searchPages(pages, "panel")).toEqual([pages[0]]);
      expect(searchPages(pages, "panels")).toEqual([pages[0]]);
    });

    test("exact matches rank above stem matches", () => {
      const pages: SiteMapPage[] = [
        { path: "", title: "onLayoutChanged", text: "" },
        { path: "", title: "onLayoutChange", text: "" }
      ];

      expect(searchPages(pages, "onLayoutChange")[0]).toBe(pages[1]);
    });

    test("very short roots are ignored", () => {
      // "one" stems to "on", but shouldn't match the word "on"
      const pages: SiteMapPage[] = [
        { path: "", title: "Turn it on", text: "" }
      ];

      expect(searchPages(pages, "one")).toEqual([]);
    });

    test("stem matches are not typo-corrected", () => {
      const pages: SiteMapPage[] = [
        { path: "", title: "Collapsing", text: "" },
        { path: "", title: "Collapsed", text: "" }
      ];

      expect(searchPages(pages, "collapsible")).toHaveLength(2);
    });
  });

  describe("typo tolerance", () => {
    const pages: SiteMapPage[] = [
      { path: "", title: "Collapsible panels", text: "" },
      { path: "", title: "Separator", text: "" }
    ];

    test("corrects a single typo", () => {
      expect(searchPages(pages, "colapsible")).toEqual([pages[0]]);
      expect(searchPages(pages, "seperator")).toEqual([pages[1]]);
      expect(searchPages(pages, "spearator")).toEqual([pages[1]]);
    });

    test("corrects a partially typed word", () => {
      expect(searchPages(pages, "colaps")).toEqual([pages[0]]);
    });

    test("does not correct short terms", () => {
      expect(searchPages(pages, "panle")).toEqual([]);
    });

    test("does not correct terms with more than one typo", () => {
      expect(searchPages(pages, "colapsibel")).toEqual([]);
    });

    test("corrected terms rank like correctly spelled terms", () => {
      const pages: SiteMapPage[] = [
        { path: "/examples/panels", title: "Panel examples", text: "panel" },
        { path: "/props/panel", title: "Panel props", text: "" }
      ];

      expect(searchPages(pages, "pannel")).toEqual(searchPages(pages, "panel"));
    });
  });

  describe("headings", () => {
    const pages: SiteMapPage[] = [
      {
        headings: [
          {
            id: "minSize",
            text: "minSize?: number Minimum panel size",
            title: "minSize"
          },
          {
            id: "maxSize",
            text: "maxSize?: number Maximum panel size",
            title: "maxSize"
          },
          {
            id: "collapsible",
            text: "collapsible?: boolean Panel can collapse",
            title: "collapsible"
          }
        ],
        path: "/props/panel",
        text: "Props for the Panel component",
        title: "Panel component props"
      },
      {
        path: "/examples/min-max",
        text: "Panels can have a min size and max size",
        title: "Min/max sizes"
      }
    ];

    const toPaths = (queryText: string) =>
      search(pages, queryText).map(({ heading, page }) =>
        heading ? `${page.path}#${heading.id}` : page.path
      );

    test("matching headings are returned as separate results", () => {
      expect(toPaths("minSize")[0]).toBe("/props/panel#minSize");
      expect(search(pages, "minSize")[0].heading).toBe(pages[0].headings![0]);
    });

    test("pages are searched including the text of their headings", () => {
      expect(toPaths("boolean")).toEqual([
        "/props/panel#collapsible",
        "/props/panel"
      ]);
    });

    test("page title is used as context for headings", () => {
      expect(toPaths("panel minSize")[0]).toBe("/props/panel#minSize");
    });

    test("headings do not match the page path", () => {
      const pages: SiteMapPage[] = [
        {
          headings: [{ id: "minSize", text: "Minimum size", title: "minSize" }],
          path: "/api/panel",
          text: "",
          title: "Panel"
        }
      ];

      expect(search(pages, "api")).toEqual([{ page: pages[0] }]);
    });

    test("results from a single page are limited", () => {
      const paths = toPaths("number");
      expect(paths.filter((path) => path.includes("#"))).toHaveLength(2);
    });

    test("pages without headings are supported", () => {
      expect(toPaths("min size")).toContain("/examples/min-max");
    });
  });
});
