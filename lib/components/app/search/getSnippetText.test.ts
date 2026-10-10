import { describe, expect, test } from "vitest";
import type { SiteMapPage } from "../../../../types";
import { getHeadingSnippetText, getPageSnippetText } from "./getSnippetText";

describe("getHeadingSnippetText", () => {
  test("omits a title that is repeated before the content", () => {
    expect(
      getHeadingSnippetText({
        id: "local-storage-undefined",
        text: "ReferenceError: localStorage is not defined The useDefaultLayout hook…",
        title: "ReferenceError: localStorage is not defined"
      })
    ).toBe("The useDefaultLayout hook…");
  });

  test("keeps signatures that start with the title", () => {
    expect(
      getHeadingSnippetText({
        id: "minSize",
        text: 'minSize?: string | number = "0%" Minimum size',
        title: "minSize"
      })
    ).toBe('minSize?: string | number = "0%" Minimum size');

    expect(
      getHeadingSnippetText({
        id: "collapse",
        text: "collapse(): void Collapses the panel",
        title: "collapse"
      })
    ).toBe("collapse(): void Collapses the panel");
  });

  test("keeps text that does not start with the title", () => {
    expect(
      getHeadingSnippetText({ id: "a", text: "Something else", title: "Title" })
    ).toBe("Something else");
  });

  test("does not treat a longer word as the title", () => {
    expect(
      getHeadingSnippetText({ id: "a", text: "Panels can…", title: "Panel" })
    ).toBe("Panels can…");
  });
});

describe("getPageSnippetText", () => {
  const page: SiteMapPage = {
    headings: [
      {
        id: "minSize",
        text: "minSize?: number Minimum size",
        title: "minSize"
      },
      {
        id: "question",
        text: "Why is it so? Because of layout",
        title: "Why is it so?"
      }
    ],
    path: "/props/panel",
    text: "A Panel wraps resizable content",
    title: "Panel component props"
  };

  test("uses the intro when it matches", () => {
    expect(getPageSnippetText(page, ["panel"])).toBe(
      "A Panel wraps resizable content"
    );
  });

  test("uses a matching section when the intro does not match", () => {
    expect(getPageSnippetText(page, ["min", "size"])).toBe(
      "minSize?: number Minimum size"
    );
    expect(getPageSnippetText(page, ["layout"])).toBe("Because of layout");
  });

  test("prefers the section matching the most terms", () => {
    const page: SiteMapPage = {
      headings: [
        {
          id: "defaultLayout",
          text: "defaultLayout?: Layout Default layout",
          title: "defaultLayout"
        },
        {
          id: "onLayoutChange",
          text: "onLayoutChange?: function Called when the layout changes",
          title: "onLayoutChange"
        }
      ],
      path: "/props/group",
      text: "A Group wraps panels",
      title: "Group component props"
    };

    expect(getPageSnippetText(page, ["on", "layout", "change"])).toBe(
      "onLayoutChange?: function Called when the layout changes"
    );
  });

  test("ignores sections whose shown text doesn't match", () => {
    const page: SiteMapPage = {
      headings: [
        {
          id: "conditional",
          text: "How do I render conditionally? Use a ResizeObserver",
          title: "How do I render conditionally?"
        },
        {
          id: "server",
          text: "Why does it fail? Rendering on the server requires cookies",
          title: "Why does it fail?"
        }
      ],
      path: "/common-questions",
      text: "",
      title: "Common questions"
    };

    expect(getPageSnippetText(page, ["render"])).toBe(
      "Rendering on the server requires cookies"
    );
  });

  test("falls back to the intro when nothing matches", () => {
    expect(getPageSnippetText(page, ["xyz"])).toBe(
      "A Panel wraps resizable content"
    );
  });
});
