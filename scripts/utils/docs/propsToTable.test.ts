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

  test("should not interpret replacement patterns in descriptions", async () => {
    expect(
      await propsToTable([createProp("regex", "Matches `(a+)+$`, $' and $1.")])
    ).toContain(
      "<td><p>Matches <code>(a+)+$</code>, $&#39; and $1.</p>\n</td>"
    );
  });
});
