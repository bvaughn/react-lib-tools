import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { TitleTooltip } from "./TitleTooltip";

// jsdom doesn't implement PointerEvent, so its pointerType has to be added
function hover(element: Element, pointerType = "mouse") {
  const event = new MouseEvent("pointerover", { bubbles: true });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  act(() => {
    element.dispatchEvent(event);
  });
}

describe("TitleTooltip", () => {
  test("should show an element's title without the native tooltip while hovered", () => {
    render(
      <>
        <button title="Save changes">Save</button>
        <div data-testid="elsewhere" />
        <TitleTooltip />
      </>
    );

    const button = screen.getByRole("button");
    hover(button);

    expect(screen.getByRole("tooltip")).toHaveTextContent("Save changes");
    expect(button).not.toHaveAttribute("title");

    hover(screen.getByTestId("elsewhere"));

    expect(screen.queryByRole("tooltip")).toBeNull();
    expect(button).toHaveAttribute("title", "Save changes");
  });

  test("should use the title of the nearest ancestor", () => {
    render(
      <>
        <a href="#" title="Source code">
          <span data-testid="icon" />
        </a>
        <TitleTooltip />
      </>
    );

    hover(screen.getByTestId("icon"));

    expect(screen.getByRole("tooltip")).toHaveTextContent("Source code");
  });

  test("should ignore touch", () => {
    render(
      <>
        <button title="Save changes">Save</button>
        <TitleTooltip />
      </>
    );

    hover(screen.getByRole("button"), "touch");

    expect(screen.queryByRole("tooltip")).toBeNull();
    expect(screen.getByRole("button")).toHaveAttribute("title");
  });

  test("should hide on click", () => {
    render(
      <>
        <button title="Save changes">Save</button>
        <TitleTooltip />
      </>
    );

    const button = screen.getByRole("button");
    hover(button);
    fireEvent.pointerDown(button);

    expect(screen.queryByRole("tooltip")).toBeNull();
    expect(button).toHaveAttribute("title", "Save changes");
  });

  test("should follow title changes while hovered", async () => {
    const { rerender } = render(
      <>
        <button title="Show menu">Menu</button>
        <TitleTooltip />
      </>
    );

    const button = screen.getByRole("button");
    hover(button);

    await act(async () => {
      rerender(
        <>
          <button title="Hide menu">Menu</button>
          <TitleTooltip />
        </>
      );
    });

    expect(screen.getByRole("tooltip")).toHaveTextContent("Hide menu");
    expect(button).not.toHaveAttribute("title");
  });
});
