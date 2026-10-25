import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react";
import { lazy, type ComponentProps, type ComponentType } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import type { NavConfig } from "../../types";
import { AppRoot } from "./AppRoot";

function route(Component: ComponentType<unknown>) {
  return lazy(async () => ({ default: Component }));
}

/** A lazy route that doesn't load until the test says so */
function deferredRoute() {
  let resolve: (value: { default: ComponentType<unknown> }) => void;
  const promise = new Promise<{ default: ComponentType<unknown> }>(
    (resolveFn) => {
      resolve = resolveFn;
    }
  );

  return {
    load: (Component: ComponentType<unknown>) =>
      act(async () => {
        resolve({ default: Component });
        await promise;
      }),
    route: lazy(() => promise)
  };
}

const nav: NavConfig = [
  { path: "/", title: "Getting started" },
  {
    title: "Guides",
    links: [
      { path: "/basics", title: "Basics" },
      { path: "/advanced", title: "Advanced" }
    ]
  },
  { path: "/support", title: "Support" }
];

const routes = {
  "/basics": route(() => <h1>Basics page</h1>),
  "/advanced": route(() => <h1>Advanced page</h1>)
};

// Routes are lazy loaded; by default, wait for the current one to finish loading
async function renderApp(
  props: Partial<ComponentProps<typeof AppRoot>> = {},
  path = "/",
  { waitForPage = true }: { waitForPage?: boolean } = {}
) {
  window.history.pushState({}, "", path);

  const result = render(
    <AppRoot
      nav={nav}
      packageDescription="a test library"
      packageName="test-lib"
      repositoryUrl="https://github.com/example/test-lib"
      routes={routes}
      {...props}
    />
  );

  if (waitForPage) {
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).toBeNull();
    });
  }

  return result;
}

function getSidebar() {
  const sidebar = document.querySelector<HTMLElement>(
    "[data-sidebar-scroller]"
  );
  expect(sidebar).not.toBeNull();
  return sidebar!;
}

afterEach(() => {
  window.history.pushState({}, "", "/");
});

describe("AppRoot", () => {
  test("should render the package name (but not the description) in the header", async () => {
    await renderApp();

    const header = document.querySelector<HTMLElement>("[data-app-header]")!;
    expect(within(header).getByText("test-lib")).toBeVisible();
    expect(within(header).queryByText("a test library")).toBeNull();
    expect(
      within(header).getByRole("link", { name: "NPM project page" })
    ).toHaveAttribute("href", "https://www.npmjs.com/package/test-lib");
  });

  test("should render the getting started page (with overview) at the root path", async () => {
    await renderApp({ overview: <p>Overview text</p> });

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Getting started with test-lib"
      })
    ).toBeVisible();
    expect(screen.getByText("Overview text")).toBeVisible();
  });

  test("should render the header and nav while the first page is loading", async () => {
    const { load, route: slowRoute } = deferredRoute();

    await renderApp({ routes: { ...routes, "/slow": slowRoute } }, "/slow", {
      waitForPage: false
    });

    expect(screen.getByText("Loading...")).toBeVisible();
    expect(
      within(
        document.querySelector<HTMLElement>("[data-app-header]")!
      ).getByText("test-lib")
    ).toBeVisible();
    expect(
      within(getSidebar()).getByRole("link", { name: "Basics" })
    ).toBeVisible();

    await load(() => <h1>Slow page</h1>);

    expect(screen.getByText("Slow page")).toBeVisible();
    expect(screen.queryByText("Loading...")).toBeNull();
  });

  test("should keep showing the current page while the next page loads", async () => {
    const { load, route: slowRoute } = deferredRoute();

    await renderApp(
      { routes: { ...routes, "/advanced": slowRoute } },
      "/basics"
    );
    expect(await screen.findByText("Basics page")).toBeVisible();

    fireEvent.click(
      within(getSidebar()).getByRole("link", { name: "Advanced" })
    );

    // Navigation happens in a transition, so the loading fallback isn't shown
    await act(async () => {});
    expect(screen.getByText("Basics page")).toBeVisible();
    expect(screen.queryByText("Loading...")).toBeNull();

    await load(() => <h1>Advanced page</h1>);

    expect(screen.getByText("Advanced page")).toBeVisible();
    expect(screen.queryByText("Basics page")).toBeNull();
  });

  test("should render consumer routes", async () => {
    await renderApp({}, "/basics");

    expect(await screen.findByText("Basics page")).toBeVisible();
  });

  test("should let consumer routes override default routes", async () => {
    await renderApp(
      {
        routes: { ...routes, "/support": route(() => <h1>Custom support</h1>) }
      },
      "/support"
    );

    expect(await screen.findByText("Custom support")).toBeVisible();
  });

  test("should render a not found page for unknown paths", async () => {
    await renderApp({}, "/does-not-exist");

    expect(await screen.findByText("Page not found")).toBeVisible();
  });

  test("should render nav sections and links", async () => {
    await renderApp();

    const sidebar = getSidebar();
    expect(
      within(sidebar).getByRole("button", { name: /Guides/ })
    ).toBeVisible();
    expect(
      within(sidebar)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href"))
    ).toEqual(["/", "/basics", "/advanced", "/support"]);
  });

  test("should expand nav sections by default", async () => {
    await renderApp();

    expect(
      within(getSidebar()).getByRole("link", { name: "Basics" })
    ).toBeVisible();
  });

  test("should collapse nav sections that don't contain the current page when collapseNavSections is enabled", async () => {
    await renderApp({ collapseNavSections: true });

    const sidebar = getSidebar();
    expect(
      within(sidebar).getByRole("button", { name: /Guides/ })
    ).toHaveAttribute("aria-expanded", "false");
    expect(within(sidebar).queryByRole("link", { name: "Basics" })).toBeNull();
  });

  test("should expand the nav section containing the current page when collapseNavSections is enabled", async () => {
    await renderApp({ collapseNavSections: true }, "/advanced");

    const sidebar = getSidebar();
    expect(
      within(sidebar).getByRole("button", { name: /Guides/ })
    ).toHaveAttribute("aria-expanded", "true");
    expect(within(sidebar).getByRole("link", { name: "Basics" })).toBeVisible();
  });

  test("should expand a collapsed nav section when navigating to a page in it", async () => {
    await renderApp({ collapseNavSections: true });

    const pageNavigation = screen.getByRole("navigation", {
      name: "Previous and next pages"
    });
    fireEvent.click(within(pageNavigation).getByRole("link", { name: /Next/ }));

    expect(await screen.findByText("Basics page")).toBeVisible();
    expect(
      within(getSidebar()).getByRole("link", { name: "Basics" })
    ).toBeVisible();
  });

  test("should navigate when a nav link is clicked", async () => {
    await renderApp();

    fireEvent.click(within(getSidebar()).getByRole("link", { name: "Basics" }));

    expect(await screen.findByText("Basics page")).toBeVisible();
    expect(window.location.pathname).toBe("/basics");

    // Previous/next links follow the nav order
    const pageNavigation = screen.getByRole("navigation", {
      name: "Previous and next pages"
    });
    expect(
      within(pageNavigation).getByRole("link", { name: /Previous/ })
    ).toHaveAttribute("href", "/");
    expect(
      within(pageNavigation).getByRole("link", { name: /Next/ })
    ).toHaveAttribute("href", "/advanced");
  });

  test("should show the versions link only when versions are provided", async () => {
    const { unmount } = await renderApp();
    expect(
      screen.queryByRole("link", { name: "Documentation for other versions" })
    ).toBeNull();
    unmount();

    await renderApp({ versions: { "1.0.0": "" } });
    expect(
      screen.getByRole("link", { name: "Documentation for other versions" })
    ).toHaveAttribute("href", "/versions");
  });

  test("should toggle the nav menu on small screens, and close it after navigating", async () => {
    await renderApp();

    const sidebarSection = getSidebar().closest("section")!;
    const main = document.querySelector("main")!;
    expect(sidebarSection).toHaveClass("hidden");
    expect(main).not.toHaveClass("hidden");

    fireEvent.click(
      screen.getByRole("button", { name: "Site navigation menu" })
    );
    expect(sidebarSection).not.toHaveClass("hidden");
    expect(main).toHaveClass("hidden");

    fireEvent.click(within(getSidebar()).getByRole("link", { name: "Basics" }));
    expect(await screen.findByText("Basics page")).toBeVisible();
    expect(sidebarSection).toHaveClass("hidden");
    expect(main).not.toHaveClass("hidden");
  });

  test("should only show site search when it's enabled", async () => {
    const { unmount } = await renderApp();
    expect(screen.queryByRole("button", { name: "Site search" })).toBeNull();
    unmount();

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify([])))
    );
    try {
      await renderApp({ enableSiteSearch: true });

      fireEvent.click(screen.getByRole("button", { name: "Site search" }));
      expect(
        await screen.findByRole("dialog", { name: "Search documentation" })
      ).toBeVisible();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  describe("project menu", () => {
    const projects = [
      {
        name: "other-lib",
        description: "another library",
        url: "https://other-lib.example.com/"
      },
      {
        name: "test-lib",
        description: "a test library",
        url: "https://test-lib.example.com/",
        icon: "/logo.svg"
      },
      // Entries missing required fields are skipped
      { name: "no-url" },
      { name: "invalid-url", url: "not a url" }
    ];

    function getMenuButton() {
      return within(
        document.querySelector<HTMLElement>("[data-app-header]")!
      ).getByRole("button", { name: /test-lib/ });
    }

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    test("should list projects loaded from projectsUrl", async () => {
      const fetch = vi.fn(async () => new Response(JSON.stringify(projects)));
      vi.stubGlobal("fetch", fetch);

      await renderApp({ projectsUrl: "/projects-success.json" });

      // Nothing is downloaded until the menu is used
      expect(fetch).not.toHaveBeenCalled();

      await act(async () => {
        fireEvent.click(getMenuButton());
      });

      const menu = await screen.findByRole("menu");
      const items = await within(menu).findAllByRole("menuitem");
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith("/projects-success.json");
      expect(items.map((item) => item.textContent)).toEqual([
        "other-libanother library",
        "test-liba test library",
        "All projects on GitHub"
      ]);

      expect(items[0]).toHaveAttribute(
        "href",
        "https://other-lib.example.com/"
      );
      expect(items[0]).not.toHaveAttribute("aria-current");
      expect(items[0].querySelector("img")).toHaveAttribute(
        "src",
        "https://other-lib.example.com/favicon.svg"
      );

      // The current project is marked, and icons are resolved relative to the project's URL
      expect(items[1]).toHaveAttribute("aria-current", "page");
      expect(items[1].querySelector("img")).toHaveAttribute(
        "src",
        "https://test-lib.example.com/logo.svg"
      );

      // The search index crawler follows data-link elements; it shouldn't leave the site
      expect(menu.querySelector("[data-link]")).toBeNull();
    });

    test("should show an error if projects can't be loaded, and try again when reopened", async () => {
      // React logs errors caught by error boundaries
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const fetch = vi.fn(
        async () =>
          new Response("", { status: 500, statusText: "Server Error" })
      );
      vi.stubGlobal("fetch", fetch);

      await renderApp({ projectsUrl: "/projects-error.json" });

      await act(async () => {
        fireEvent.click(getMenuButton());
      });
      const menu = await screen.findByRole("menu");
      expect(
        await within(menu).findByText("Projects are unavailable right now.")
      ).toBeVisible();
      expect(
        within(menu).getByRole("menuitem", { name: "All projects on GitHub" })
      ).toBeVisible();

      // Close and reopen
      fetch.mockImplementation(
        async () => new Response(JSON.stringify(projects))
      );
      await act(async () => {
        fireEvent.click(getMenuButton());
      });
      await waitFor(() => {
        expect(screen.queryByRole("menu")).toBeNull();
      });
      await act(async () => {
        fireEvent.click(getMenuButton());
      });

      expect(
        await within(await screen.findByRole("menu")).findByRole("menuitem", {
          name: /other-lib/
        })
      ).toBeVisible();
      expect(fetch).toHaveBeenCalledTimes(2);

      consoleError.mockRestore();
    });

    test("should render the description instead of the menu when projectsUrl is false", async () => {
      await renderApp({ projectsUrl: false });

      const header = document.querySelector<HTMLElement>("[data-app-header]")!;
      expect(within(header).getByText("test-lib")).toBeVisible();
      expect(within(header).getByText("a test library")).toBeVisible();
      expect(
        within(header).queryByRole("button", { name: /test-lib/ })
      ).toBeNull();
    });
  });

  test("should contain errors thrown by a page", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await renderApp(
      {
        routes: {
          ...routes,
          "/basics": route(() => {
            throw Error("Broken page");
          })
        }
      },
      "/basics"
    );

    expect(await screen.findByText("Something went wrong!")).toBeVisible();
    expect(screen.getByText("Broken page")).toBeVisible();

    // The rest of the app still works
    await act(async () => {
      fireEvent.click(
        within(getSidebar()).getByRole("link", { name: "Advanced" })
      );
    });
    expect(await screen.findByText("Advanced page")).toBeVisible();

    consoleError.mockRestore();
  });
});
