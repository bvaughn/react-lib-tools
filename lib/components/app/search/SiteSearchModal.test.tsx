import {
  act,
  fireEvent,
  screen,
  waitFor,
  within
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { SiteMapPage } from "../../../../types";
import type { FlatNavItem } from "../../../utils/flattenNav";

const flatNav: FlatNavItem[] = [
  {
    parent: undefined,
    path: "/",
    section: undefined,
    title: "Getting started"
  },
  {
    parent: undefined,
    path: "/list",
    section: "Lists",
    title: "Rendering a list"
  },
  {
    parent: undefined,
    path: "/grid",
    section: "Grids",
    title: "Rendering a grid"
  }
];

const siteMap: SiteMapPage[] = [
  {
    path: "/",
    text: "Install the library from NPM.",
    title: "Getting started"
  },
  {
    path: "/list",
    section: "Lists",
    text: "Lists render one row at a time.",
    title: "Rendering a list"
  },
  {
    headings: [
      {
        id: "scroll-to-cell",
        text: "Grids can scroll a cell into view.",
        title: "Scroll to cell"
      }
    ],
    path: "/grid",
    section: "Grids",
    text: "Grids render rows and columns of cells.",
    title: "Rendering a grid"
  }
];

function mockFetch(...responses: Array<SiteMapPage[] | Error>) {
  const fetch = vi.fn(async () => {
    const response = responses.length > 1 ? responses.shift()! : responses[0];
    if (response instanceof Error) {
      throw response;
    }
    return new Response(JSON.stringify(response));
  });
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

// The search index is cached at module level; each test gets fresh modules (and so an empty cache)
async function renderModal() {
  const { renderWithProviders } = await import("../../../test-utils");
  const { SiteSearchModal } = await import("./SiteSearchModal");

  return renderWithProviders(
    <>
      <button>Outside</button>
      <SiteSearchModal flatNav={flatNav} />
    </>
  );
}

function openWithShortcut() {
  fireEvent.keyDown(document, { key: "k", metaKey: true });
}

function getInput() {
  return screen.getByRole("combobox", { name: "Search documentation" });
}

function queryDialog() {
  return screen.queryByRole("dialog", { name: "Search documentation" });
}

async function getOptions(listName: string) {
  const listbox = await screen.findByRole("listbox", { name: listName });
  return within(listbox).getAllByRole("option");
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SiteSearchModal", () => {
  test("should open and close with Cmd+K or Ctrl+K", async () => {
    mockFetch(siteMap);
    await renderModal();

    expect(queryDialog()).toBeNull();

    openWithShortcut();
    expect(queryDialog()).toBeVisible();
    expect(getInput()).toHaveFocus();

    fireEvent.keyDown(document, { ctrlKey: true, key: "K" });
    expect(queryDialog()).toBeNull();
  });

  test("should close with Escape and restore focus", async () => {
    mockFetch(siteMap);
    await renderModal();

    const outside = screen.getByRole("button", { name: "Outside" });
    outside.focus();

    openWithShortcut();
    expect(getInput()).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(queryDialog()).toBeNull();
    expect(outside).toHaveFocus();
  });

  test("should close when the close button or the backdrop is clicked", async () => {
    mockFetch(siteMap);
    await renderModal();

    openWithShortcut();
    fireEvent.click(screen.getByRole("button", { name: "Close search" }));
    expect(queryDialog()).toBeNull();

    openWithShortcut();
    fireEvent.click(queryDialog()!.parentElement!);
    expect(queryDialog()).toBeNull();
  });

  test("should list all pages before anything is typed", async () => {
    mockFetch(siteMap);
    await renderModal();
    openWithShortcut();

    const options = await getOptions("Pages");
    expect(options.map((option) => option.textContent)).toEqual([
      "Getting started",
      "Lists Rendering a list",
      "Grids Rendering a grid"
    ]);
  });

  test("should show results for the search text", async () => {
    mockFetch(siteMap);
    await renderModal();
    openWithShortcut();

    fireEvent.change(getInput(), { target: { value: "cell" } });

    const options = await getOptions("Search results");
    const links = options.map((option) =>
      within(option).getByRole("link").getAttribute("href")
    );
    expect(links).toContain("/grid");
    expect(links).toContain("/grid#scroll-to-cell");
    expect(links).not.toContain("/list");
    expect(screen.getByRole("status")).toHaveTextContent(
      `${options.length} results`
    );
  });

  test("should show a message when nothing matches", async () => {
    mockFetch(siteMap);
    await renderModal();
    openWithShortcut();

    fireEvent.change(getInput(), { target: { value: "xylophone" } });

    expect(await screen.findByText('No results for "xylophone"')).toBeVisible();
  });

  test("should navigate to the result selected with the arrow keys", async () => {
    mockFetch(siteMap);
    await renderModal();
    openWithShortcut();

    fireEvent.change(getInput(), { target: { value: "cell" } });
    const options = await getOptions("Search results");
    expect(options.length).toBeGreaterThan(1);

    fireEvent.keyDown(getInput(), { key: "ArrowDown" });
    expect(getInput()).toHaveAttribute("aria-activedescendant", options[1].id);
    expect(options[1]).toHaveAttribute("aria-selected", "true");

    const expectedPath = within(options[1])
      .getByRole("link")
      .getAttribute("href");

    fireEvent.keyDown(getInput(), { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent(expectedPath!);
    });
    expect(queryDialog()).toBeNull();
  });

  test("should open the first result if Enter is pressed before results are ready", async () => {
    mockFetch(siteMap);
    await renderModal();
    openWithShortcut();

    // Results are debounced; press Enter right away
    fireEvent.change(getInput(), { target: { value: "list" } });
    fireEvent.keyDown(getInput(), { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent("/list");
    });
    expect(queryDialog()).toBeNull();
  });

  test("should offer to show more than the first 10 results", async () => {
    mockFetch(
      Array.from({ length: 12 }, (_, index) => ({
        path: `/page-${index}`,
        text: "Shared text",
        title: `Page ${index}`
      }))
    );
    await renderModal();
    openWithShortcut();

    fireEvent.change(getInput(), { target: { value: "shared" } });

    expect(await getOptions("Search results")).toHaveLength(10);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Showing 10 of 12 results"
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Show 2 more results" })
    );

    expect(await getOptions("Search results")).toHaveLength(12);
    expect(getInput()).toHaveFocus();
  });

  test("should show an error if the search index can't be loaded, and allow retrying", async () => {
    // React logs errors caught by error boundaries
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Opening the modal preloads the index; if that fails, the first search quietly tries again
    const fetch = mockFetch(
      Error("Network error"),
      Error("Network error"),
      siteMap
    );
    await renderModal();
    openWithShortcut();

    fireEvent.change(getInput(), { target: { value: "list" } });

    expect(
      await screen.findByText("Search is unavailable right now.")
    ).toBeVisible();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    });

    expect(await getOptions("Search results")).not.toHaveLength(0);
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
