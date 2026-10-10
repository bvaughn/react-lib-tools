import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { renderWithProviders } from "../test-utils";
import { Link } from "./Link";

describe("Link", () => {
  test("should render an anchor that the search crawler can follow", () => {
    renderWithProviders(<Link to="/about">About</Link>);

    const link = screen.getByRole("link", { name: "About" });
    expect(link).toHaveAttribute("href", "/about");
    expect(link).toHaveAttribute("data-link", "/about");
  });

  test("should navigate within the app when clicked", async () => {
    renderWithProviders(<Link to="/about">About</Link>);

    const event = fireEvent.click(screen.getByRole("link", { name: "About" }));

    // fireEvent returns false if the default (full page) navigation was prevented
    expect(event).toBe(false);
    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent("/about");
    });
  });

  test.each(["altKey", "ctrlKey", "metaKey", "shiftKey"])(
    "should let the browser handle clicks with %s pressed",
    (modifier) => {
      renderWithProviders(<Link to="/about">About</Link>);

      // Record whether the link left the default action alone, then cancel it
      // (jsdom doesn't implement navigation)
      let defaultPrevented: boolean | undefined;
      const onClick = (event: MouseEvent) => {
        defaultPrevented = event.defaultPrevented;
        event.preventDefault();
      };
      window.addEventListener("click", onClick);

      try {
        fireEvent.click(screen.getByRole("link", { name: "About" }), {
          [modifier]: true
        });
      } finally {
        window.removeEventListener("click", onClick);
      }

      expect(defaultPrevented).toBe(false);
      expect(screen.getByTestId("location")).toHaveTextContent(/^\/$/);
    }
  );

  test("should pass active state to render function children", () => {
    renderWithProviders(
      <>
        <Link to="/">
          {({ isActive }) => (isActive ? "Home (active)" : "Home")}
        </Link>
        <Link to="/about">
          {({ isActive }) => (isActive ? "About (active)" : "About")}
        </Link>
      </>
    );

    expect(screen.getByRole("link", { name: "Home (active)" })).toBeVisible();
    expect(screen.getByRole("link", { name: "About" })).toBeVisible();
  });
});
