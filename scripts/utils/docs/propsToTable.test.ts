// @vitest-environment node

import type { PropItem } from "react-docgen-typescript";
import { describe, expect, test } from "vitest";
import { propsToTable } from "./propsToTable";

function createProp(name: string, description: string): PropItem {
  return {
    defaultValue: null,
    description,
    name,
    required: false,
    type: { name: "string" }
  };
}

describe("propsToTable", () => {
  test("should return an empty string if there are no props", async () => {
    expect(await propsToTable([])).toBe("");
  });

  test("should render a row for each prop with a markdown description", async () => {
    expect(
      await propsToTable([
        createProp("first", "The **first** prop."),
        createProp("second", "The `second` prop.")
      ])
    ).toBe(`
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>first</td>
      <td><p>The <strong>first</strong> prop.</p>
</td>
    </tr>
    <tr>
      <td>second</td>
      <td><p>The <code>second</code> prop.</p>
</td>
    </tr>
  </tbody>
</table>
`);
  });

  test("should render @deprecated tags as a separate paragraph", async () => {
    expect(
      await propsToTable([
        createProp(
          "onTearOff",
          "Called when a tab is dropped outside of the window.\n\n⚠️ Deprecated: browsers don't reliably report where these drags end.\n@deprecated Open popout windows from a button instead."
        )
      ])
    ).toContain(
      "<p>⚠️ Deprecated: browsers don&#39;t reliably report where these drags end.</p>\n<p>❌ This prop has been deprecated. Open popout windows from a button instead.</p>"
    );
  });

  test("should render @param tags as list items", async () => {
    const html = await propsToTable([
      createProp("onChange", "Called on change.\n@param value The new value.")
    ]);
    expect(html).toContain("<li><code>value</code> The new value.</li>");
    expect(html).not.toContain("@param");
  });

  test("should render @returns tags as a labeled paragraph", async () => {
    const html = await propsToTable([
      createProp("onChange", "Called.\n@returns The value")
    ]);
    expect(html).toContain("<p><strong>Returns:</strong> The value</p>");
    expect(html).not.toContain("@returns");
  });

  test("should not rewrite tags or flags inside code", async () => {
    const html = await propsToTable([
      createProp(
        "code",
        "Use `@deprecated` carefully.\n\n```tsx\nconst a = 1;\n⚠️ x\n```"
      )
    ]);
    expect(html).toContain("<code>@deprecated</code>");
    expect(html).toContain("const a = 1;\n⚠️ x\n");
  });

  test("should not interpret replacement patterns in descriptions", async () => {
    expect(
      await propsToTable([createProp("regex", "Matches `(a+)+$`, $' and $1.")])
    ).toContain(
      "<td><p>Matches <code>(a+)+$</code>, $&#39; and $1.</p>\n</td>"
    );
  });
});
