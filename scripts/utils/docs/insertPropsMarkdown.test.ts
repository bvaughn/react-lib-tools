// @vitest-environment node

import { describe, expect, test, vi } from "vitest";
import { insertPropsMarkdown } from "./insertPropsMarkdown";

const README = `# Title

<!-- Foo:description:begin -->
Old description
<!-- Foo:description:end -->

<!-- Bar:description:begin -->
Untouched
<!-- Bar:description:end -->
`;

describe("insertPropsMarkdown", () => {
  test("should replace the content between markers", () => {
    expect(
      insertPropsMarkdown({
        componentMarkdown: "New description",
        componentName: "Foo",
        markdown: README,
        section: "description"
      })
    ).toBe(`# Title

<!-- Foo:description:begin -->
New description
<!-- Foo:description:end -->

<!-- Bar:description:begin -->
Untouched
<!-- Bar:description:end -->
`);
  });

  test("should insert 'None' for empty content", () => {
    expect(
      insertPropsMarkdown({
        componentMarkdown: "",
        componentName: "Foo",
        markdown: README,
        section: "description"
      })
    ).toContain(
      "<!-- Foo:description:begin -->\nNone\n<!-- Foo:description:end -->"
    );
  });

  test("should be idempotent", () => {
    const options = {
      componentMarkdown: "New description",
      componentName: "Foo",
      section: "description"
    };

    const once = insertPropsMarkdown({ ...options, markdown: README });
    const twice = insertPropsMarkdown({ ...options, markdown: once });

    expect(twice).toBe(once);
  });

  test.each([
    ["both markers are missing", "# Title\n"],
    ["the begin marker is missing", "# Title\n<!-- Foo:description:end -->\n"],
    ["the end marker is missing", "# Title\n<!-- Foo:description:begin -->\n"],
    [
      "the markers are out of order",
      "<!-- Foo:description:end -->\n<!-- Foo:description:begin -->\n"
    ]
  ])("should warn and leave the README unchanged if %s", (_, markdown) => {
    const warn = vi.spyOn(console, "warn").mockImplementationOnce(() => {});

    expect(
      insertPropsMarkdown({
        componentMarkdown: "New description",
        componentName: "Foo",
        markdown,
        section: "description"
      })
    ).toBe(markdown);
    expect(warn).toHaveBeenCalledWith(
      "README tokens not found for component Foo"
    );
  });
});
