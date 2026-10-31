import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { renderWithProviders } from "../../test-utils";
import type { NavConfig } from "../../types";
import { Nav } from "./Nav";

const nav: NavConfig = [
  { path: "/", title: "Getting started" },
  {
    links: [
      { links: [{ path: "/lists", title: "The basics" }], title: "Guides" },
      { links: [{ path: "/lists/list", title: "List" }], title: "Components" }
    ],
    title: "Lists"
  },
  {
    links: [
      { links: [{ path: "/grids", title: "Grid basics" }], title: "Guides" }
    ],
    title: "Grids"
  }
];

describe("Nav", () => {
  test("collapses sections and groups that don't contain the current page", () => {
    renderWithProviders(<Nav nav={nav} />, { path: "/lists" });

    // The current page's section and group are expanded
    expect(
      screen.getByRole("link", { name: "The basics" })
    ).toBeInTheDocument();

    // Other groups in that section, and other sections, are collapsed
    expect(screen.getByRole("button", { name: "Components" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.queryByRole("link", { name: "List" })).toBeNull();
    expect(screen.getByRole("button", { name: "Grids" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.queryByRole("link", { name: "Grid basics" })).toBeNull();
  });

  test("groups can be expanded and collapsed by clicking their headings", async () => {
    renderWithProviders(<Nav nav={nav} />, { path: "/lists" });

    const heading = screen.getByRole("button", { name: "Components" });

    fireEvent.click(heading);
    expect(heading).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "List" })).toHaveAttribute(
      "href",
      "/lists/list"
    );

    fireEvent.click(heading);
    expect(heading).toHaveAttribute("aria-expanded", "false");
    // Links are removed once the collapse animation finishes
    await waitFor(() => {
      expect(screen.queryByRole("link", { name: "List" })).toBeNull();
    });
  });

  test("expands the section and group containing the current page", () => {
    renderWithProviders(<Nav nav={nav} />, { path: "/lists/list" });

    expect(screen.getByRole("link", { name: "List" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "The basics" })).toBeNull();
  });
});
