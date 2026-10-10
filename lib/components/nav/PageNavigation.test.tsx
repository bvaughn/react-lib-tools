import { screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { renderWithProviders } from "../../test-utils";
import { flattenNav } from "../../utils/flattenNav";
import { PageNavigation } from "./PageNavigation";

const items = flattenNav([
  { path: "/", title: "Getting started" },
  {
    title: "Lists",
    links: [
      { path: "/list", title: "Basics" },
      {
        path: "/list/props",
        title: "List props",
        children: [{ path: "/list/props/advanced", title: "Advanced" }]
      }
    ]
  },
  { path: "/support", title: "Support" }
]);

function renderAt(path: string) {
  return renderWithProviders(<PageNavigation items={items} />, { path });
}

function getLink(name: RegExp) {
  return within(
    screen.getByRole("navigation", { name: "Previous and next pages" })
  ).getByRole("link", { name });
}

describe("PageNavigation", () => {
  test("should only link to the next page from the first page", () => {
    renderAt("/");

    expect(screen.queryByRole("link", { name: /Previous/ })).toBeNull();
    expect(getLink(/Next/)).toHaveAttribute("href", "/list");
  });

  test("should only link to the previous page from the last page", () => {
    renderAt("/support");

    expect(getLink(/Previous/)).toHaveAttribute("href", "/list/props/advanced");
    expect(screen.queryByRole("link", { name: /Next/ })).toBeNull();
  });

  test("should link to both neighbors from a middle page", () => {
    renderAt("/list");

    expect(getLink(/Previous/)).toHaveAttribute("href", "/");
    expect(getLink(/Next/)).toHaveAttribute("href", "/list/props");
  });

  test("should show the section when moving into a different section", () => {
    renderAt("/");

    expect(getLink(/Next/)).toHaveTextContent("ListsBasics");
  });

  test("should not show the section when staying in the same section", () => {
    renderAt("/list");

    expect(getLink(/Next/)).toHaveTextContent(/^List props/);
  });

  test("should show the parent page of nested pages", () => {
    renderAt("/list/props");

    expect(getLink(/Next/)).toHaveTextContent("List propsAdvanced");
  });

  test("should ignore trailing slashes", () => {
    renderAt("/list/");

    expect(getLink(/Next/)).toHaveAttribute("href", "/list/props");
  });

  test("should render nothing for pages that aren't in the nav", () => {
    renderAt("/unknown");

    expect(
      screen.queryByRole("navigation", { name: "Previous and next pages" })
    ).toBeNull();
  });
});
