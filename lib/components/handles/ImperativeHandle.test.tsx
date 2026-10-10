import { screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import handleJSON from "../../../fixtures/sample-lib/public/generated/docs/CounterImperativeHandle.json";
import { renderWithProviders } from "../../test-utils";
import type { ImperativeHandleMetadata } from "../../types";
import { ImperativeHandle } from "./ImperativeHandle";

// Rendered from the sample library's generated docs (see CONTRIBUTING.md)
const json = handleJSON as ImperativeHandleMetadata;

describe("ImperativeHandle", () => {
  test("should render the handle name and description", () => {
    renderWithProviders(<ImperativeHandle json={json} section="Counter" />);

    expect(
      screen.getByRole("heading", { name: "CounterImperativeHandle" })
    ).toBeVisible();
    expect(screen.getByText(/Imperative API for the/)).toBeVisible();
  });

  test("should render each method with its signature and description", () => {
    renderWithProviders(<ImperativeHandle json={json} section="Counter" />);

    const names = Array.from(document.querySelectorAll("dt")).map(
      (dt) => dt.textContent
    );
    expect(names).toEqual(["getValue", "reset", "setValue"]);

    const setValue = document.getElementById("setValue")!;
    expect(setValue).toHaveAttribute("data-toc", "1");

    const details = setValue.nextElementSibling as HTMLElement;
    expect(details).toHaveTextContent("Sets the current value.");
    expect(details).toHaveTextContent("setValue(value: number): void;");
  });

  test("should render method parameters as a list", () => {
    renderWithProviders(<ImperativeHandle json={json} section="Counter" />);

    const details = document.getElementById("setValue")!
      .nextElementSibling as HTMLElement;
    const item = details.querySelector("li");
    expect(item).toHaveTextContent(
      "value New value; clamped to the min and max props"
    );
  });
});
