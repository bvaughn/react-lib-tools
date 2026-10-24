import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { HookSignature } from "./HookSignature";
import { HookSignatureItem } from "./HookSignatureItem";

describe("HookSignature", () => {
  test("should render items as terms and descriptions within a list", () => {
    const { container } = render(
      <HookSignature>
        <HookSignatureItem name="target" type="HTMLElement | null">
          The element that scrolls.
        </HookSignatureItem>
        <HookSignatureItem name="isScrolling" type="boolean">
          Whether the target is scrolling.
        </HookSignatureItem>
      </HookSignature>
    );

    const list = container.querySelector("dl")!;
    expect(
      Array.from(list.children).map((child) => child.tagName.toLowerCase())
    ).toEqual(["dt", "dd", "dt", "dd"]);
    expect(screen.getByText("The element that scrolls.").tagName).toBe("DD");
  });

  test("should render required params", () => {
    const { container } = render(
      <HookSignature>
        <HookSignatureItem name="target" type="HTMLElement | null">
          Description
        </HookSignatureItem>
      </HookSignature>
    );

    expect(container.querySelector("dt")).toHaveTextContent(
      "target: HTMLElement | null"
    );
  });

  test("should render optional params and default values", () => {
    const { container } = render(
      <HookSignature>
        <HookSignatureItem
          defaultValue="{}"
          name="options"
          optional
          type={<code>{"{ delay?: number }"}</code>}
        >
          Description
        </HookSignatureItem>
      </HookSignature>
    );

    expect(container.querySelector("dt")).toHaveTextContent(
      "options?: { delay?: number } = {}"
    );
    expect(container.querySelector("dt code")).toHaveTextContent(
      "{ delay?: number }"
    );
  });

  test("should merge a custom className", () => {
    const { container } = render(
      <HookSignature className="mt-4">
        <HookSignatureItem name="value" type="number">
          Description
        </HookSignatureItem>
      </HookSignature>
    );

    expect(container.querySelector("dl")).toHaveClass("flex", "gap-2", "mt-4");
  });
});
