import { screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import counterJSON from "../../../fixtures/sample-lib/public/generated/docs/Counter.json";
import { renderWithProviders } from "../../test-utils";
import type { ComponentMetadata } from "../../types";
import { ComponentProps } from "./ComponentProps";

// Rendered from the sample library's generated docs (see CONTRIBUTING.md)
const json = counterJSON as ComponentMetadata;

function getPropNames(header: string) {
  const heading = screen.getByRole("heading", { name: header });
  const list = heading.nextElementSibling as HTMLElement;

  return Array.from(list.querySelectorAll("dt")).map((dt) => dt.id);
}

describe("ComponentProps", () => {
  test("should render a header with section, title, and source link", () => {
    renderWithProviders(<ComponentProps json={json} section="Counter" />);

    const header = screen.getByRole("banner");
    expect(within(header).getByText("Counter")).toBeVisible();
    expect(
      within(header).getByRole("heading", { name: "Counter component props" })
    ).toBeVisible();
    expect(within(header).getByRole("link")).toHaveAttribute(
      "href",
      `https://github.com/example/test-lib/blob/main/${json.filePath}`
    );
  });

  test("should render the component description, including callouts", () => {
    renderWithProviders(<ComponentProps json={json} section="Counter" />);

    expect(
      screen.getByText(
        "Displays a numeric value with buttons to increment and decrement it."
      )
    ).toBeVisible();
    expect(
      screen.getByText(/Counter manages its own state/).closest("[class]")
    ).toBeVisible();
  });

  test("should split required and optional props", () => {
    renderWithProviders(<ComponentProps json={json} section="Counter" />);

    expect(getPropNames("Required props")).toEqual(["initialValue"]);
    expect(getPropNames("Optional props")).toEqual([
      "className",
      "counterRef",
      "label",
      "max",
      "min",
      "onChange",
      "size",
      "step",
      "title"
    ]);
  });

  test("should mark props for the 'On this page' contents", () => {
    renderWithProviders(<ComponentProps json={json} section="Counter" />);

    const prop = document.getElementById("initialValue")!;
    expect(prop).toHaveAttribute("data-toc", "2");
    expect(prop).toHaveAttribute("data-toc-title", "initialValue");
    expect(
      screen.getByRole("heading", { name: "Required props" })
    ).toHaveAttribute("data-toc");
  });

  test("should render prop types, defaults, and deprecation notices", () => {
    renderWithProviders(<ComponentProps json={json} section="Counter" />);

    expect(document.getElementById("label")).toHaveTextContent(
      'label?: string = "Count"'
    );
    expect(screen.getByText(/This prop has been deprecated/)).toBeVisible();
  });
});
