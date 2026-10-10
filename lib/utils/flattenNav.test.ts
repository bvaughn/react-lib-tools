import { describe, expect, test } from "vitest";
import { flattenNav } from "./flattenNav";

describe("flattenNav", () => {
  test("flattens sections and nested links in reading order", () => {
    expect(
      flattenNav([
        { path: "/", title: "Getting started" },
        {
          links: [
            {
              children: [{ path: "/a/child", title: "Child" }],
              path: "/a",
              title: "A"
            },
            { path: "/b", title: "B" }
          ],
          title: "Section"
        },
        { path: "/support", title: "Support" }
      ])
    ).toEqual([
      {
        parent: undefined,
        path: "/",
        section: undefined,
        title: "Getting started"
      },
      { parent: undefined, path: "/a", section: "Section", title: "A" },
      { parent: "A", path: "/a/child", section: "Section", title: "Child" },
      { parent: undefined, path: "/b", section: "Section", title: "B" },
      {
        parent: undefined,
        path: "/support",
        section: undefined,
        title: "Support"
      }
    ]);
  });

  test("skips duplicate paths", () => {
    expect(
      flattenNav([
        { path: "/a", title: "A" },
        { links: [{ path: "/a", title: "A again" }], title: "Section" }
      ])
    ).toEqual([
      { parent: undefined, path: "/a", section: undefined, title: "A" }
    ]);
  });
});
