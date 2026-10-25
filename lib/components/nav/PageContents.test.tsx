import {
  act,
  fireEvent,
  screen,
  waitFor,
  within
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { renderWithProviders } from "../../test-utils";
import { PageContents } from "./PageContents";
import { usePageEntries } from "./usePageEntries";

function Contents() {
  return <PageContents entries={usePageEntries()} />;
}

// Mirrors the parts of the AppRoot layout that PageContents reads from the DOM
function renderPage(content: ReactNode, path = "/page") {
  return renderWithProviders(
    <div data-app-scroller>
      <div data-sidebar-scroller>
        <Contents />
      </div>
      <div data-main-scrollable>{content}</div>
    </div>,
    { path }
  );
}

function getContents() {
  return screen.getByRole("navigation", { name: "On this page" });
}

function getEntries() {
  return within(getContents())
    .getAllByRole("listitem")
    .map((item) => item.textContent);
}

/** Positions headings (by id) relative to the top of the viewport */
function mockHeadingPositions(positions: Record<string, number>) {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    function (this: Element) {
      const top = positions[this.id] ?? 0;
      return {
        bottom: top + 20,
        height: this.id in positions ? 20 : 0,
        left: 0,
        right: 0,
        top,
        width: 0,
        x: 0,
        y: top,
        toJSON() {}
      };
    }
  );
}

function nextFrame() {
  return act(
    () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState(null, "", "/");
});

describe("PageContents", () => {
  test("should list headings marked with data-toc", () => {
    renderPage(
      <>
        <h2 data-toc id="first">
          First heading
        </h2>
        <h2 id="untracked">Not in contents</h2>
        <h2 data-toc data-toc-title="Custom title" id="second">
          Second heading
        </h2>
      </>
    );

    expect(getEntries()).toEqual(["First heading", "Custom title"]);
    expect(
      within(getContents()).getByRole("link", { name: "First heading" })
    ).toHaveAttribute("href", "#first");
  });

  test("should render nothing for pages with fewer than two headings", () => {
    renderPage(
      <h2 data-toc id="only">
        Only heading
      </h2>
    );

    expect(
      screen.queryByRole("navigation", { name: "On this page" })
    ).toBeNull();
  });

  test("should show headings with nested entries as labels rather than links", () => {
    renderPage(
      <>
        <h2 data-toc id="required">
          Required props
        </h2>
        <dt data-toc="2" id="value">
          value
        </dt>
        <h2 data-toc id="optional">
          Optional props
        </h2>
        <dt data-toc="2" id="label">
          label
        </dt>
      </>
    );

    expect(getEntries()).toEqual([
      "Required props",
      "value",
      "Optional props",
      "label"
    ]);
    expect(
      within(getContents())
        .getAllByRole("link")
        .map((link) => link.textContent)
    ).toEqual(["value", "label"]);
  });

  test("should update when headings are added (e.g. by lazy loaded content)", async () => {
    renderPage(
      <h2 data-toc id="first">
        First heading
      </h2>
    );

    expect(
      screen.queryByRole("navigation", { name: "On this page" })
    ).toBeNull();

    act(() => {
      const heading = document.createElement("h2");
      heading.id = "second";
      heading.dataset.toc = "1";
      heading.textContent = "Second heading";
      document.querySelector("[data-main-scrollable]")!.append(heading);
    });

    await waitFor(() => {
      expect(getEntries()).toEqual(["First heading", "Second heading"]);
    });
  });

  test("should highlight the heading that has scrolled to the top", async () => {
    mockHeadingPositions({ first: 0, second: 200, third: 400 });

    renderPage(
      <>
        <h2 data-toc id="first">
          First
        </h2>
        <h2 data-toc id="second">
          Second
        </h2>
        <h2 data-toc id="third">
          Third
        </h2>
      </>
    );

    const getCurrent = () =>
      within(getContents())
        .getAllByRole("link")
        .find((link) => link.getAttribute("aria-current") === "location")
        ?.textContent;

    await waitFor(() => {
      expect(getCurrent()).toBe("First");
    });

    mockHeadingPositions({ first: -200, second: 0, third: 200 });
    fireEvent.scroll(document.querySelector("[data-app-scroller]")!);
    await nextFrame();

    expect(getCurrent()).toBe("Second");
  });

  test("should highlight the heading from the URL hash", async () => {
    renderPage(
      <>
        <h2 data-toc id="first">
          First
        </h2>
        <h2 data-toc id="second">
          Second
        </h2>
      </>,
      "/page#second"
    );

    await waitFor(() => {
      expect(
        within(getContents()).getByRole("link", { name: "Second" })
      ).toHaveAttribute("aria-current", "location");
    });
  });

  test("should scroll to a heading and update the hash when an entry is clicked", async () => {
    const scrollIntoView = vi.spyOn(Element.prototype, "scrollIntoView");

    renderPage(
      <>
        <h2 data-toc id="first">
          First
        </h2>
        <h2 data-toc id="second heading">
          Second
        </h2>
      </>
    );

    const link = within(getContents()).getByRole("link", { name: "Second" });
    const notPrevented = fireEvent.click(link);
    await nextFrame();

    expect(notPrevented).toBe(false);
    expect(link).toHaveAttribute("aria-current", "location");
    expect(window.location.hash).toBe("#second%20heading");
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toBe(
      document.getElementById("second heading")
    );
  });
});
