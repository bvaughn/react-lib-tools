// @vitest-environment node

import { afterEach, describe, expect, test, vi } from "vitest";
import {
  API_START_TOKEN,
  API_STOP_TOKEN,
  updateReadmeMarkdown,
  type ReadmeComponent,
  type ReadmeHook,
  type ReadmeImperativeHandle
} from "./updateReadmeMarkdown";

function createComponent(
  componentName: string,
  overrides: Partial<ReadmeComponent> = {}
): ReadmeComponent {
  return {
    componentName,
    description: `${componentName} description.`,
    optionalPropsTable: "",
    requiredPropsTable: "",
    ...overrides
  };
}

function createHook(
  name: string,
  overrides: Partial<ReadmeHook> = {}
): ReadmeHook {
  return {
    description: `${name} description.`,
    name,
    parameters: [],
    ...overrides
  };
}

function createHandle(
  name: string,
  overrides: Partial<ReadmeImperativeHandle> = {}
): ReadmeImperativeHandle {
  return {
    description: `${name} description.`,
    methods: [{ description: "Resets it.", name: "reset" }],
    name,
    ...overrides
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("updateReadmeMarkdown", () => {
  describe("single API marker", () => {
    const markdown = `# Title\n\n${API_START_TOKEN}\nstale content\n${API_STOP_TOKEN}\n\n## Footer\n`;

    test("should replace the content between the markers", async () => {
      const result = await updateReadmeMarkdown({
        components: [createComponent("Panel")],
        imperativeHandles: [],
        markdown
      });

      expect(result).toBe(`# Title

${API_START_TOKEN}

## Components

### Panel

Panel description.

#### Required props

None

#### Optional props

None

${API_STOP_TOKEN}

## Footer
`);
    });

    test("should group components, hooks and imperative handles, sorted by name", async () => {
      const result = await updateReadmeMarkdown({
        components: [createComponent("Separator"), createComponent("Group")],
        hooks: [createHook("usePanelRef"), createHook("useGroupRef")],
        imperativeHandles: [
          createHandle("PanelImperativeHandle"),
          createHandle("GroupImperativeHandle")
        ],
        markdown
      });

      expect(result.match(/^###? .+$/gm)).toEqual([
        "## Components",
        "### Group",
        "### Separator",
        "## Hooks",
        "### useGroupRef",
        "### usePanelRef",
        "## Imperative APIs",
        "### GroupImperativeHandle",
        "### PanelImperativeHandle",
        "## Footer"
      ]);
    });

    test("should omit empty groups", async () => {
      const result = await updateReadmeMarkdown({
        components: [],
        hooks: [createHook("useGroupRef")],
        imperativeHandles: [],
        markdown
      });

      expect(result.match(/^## .+$/gm)).toEqual(["## Hooks", "## Footer"]);
    });

    test("should emit a single newline when there is nothing to generate", async () => {
      expect(
        await updateReadmeMarkdown({
          components: [],
          imperativeHandles: [],
          markdown
        })
      ).toBe(`# Title\n\n${API_START_TOKEN}\n${API_STOP_TOKEN}\n\n## Footer\n`);
    });

    test("should ignore markers inside fenced code blocks", async () => {
      vi.spyOn(console, "warn").mockImplementation(() => {});
      const fenced = `\`\`\`md\n${API_START_TOKEN}\n${API_STOP_TOKEN}\n\`\`\`\n`;

      expect(
        await updateReadmeMarkdown({
          components: [createComponent("Panel")],
          imperativeHandles: [],
          markdown: fenced
        })
      ).toBe(fenced);
    });

    test("should warn about an unmatched marker", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

      await updateReadmeMarkdown({
        components: [],
        imperativeHandles: [],
        markdown: `${API_START_TOKEN}\n`
      });

      expect(warn).toHaveBeenCalledTimes(1);
    });

    test("should name the kind in deprecation notices", async () => {
      const result = await updateReadmeMarkdown({
        components: [],
        hooks: [
          createHook("useOld", { description: "@deprecated Use useNew." })
        ],
        imperativeHandles: [],
        markdown
      });

      expect(result).toContain("❌ This hook has been deprecated. Use useNew.");
    });

    test("should render hook parameters, marking optional ones", async () => {
      const result = await updateReadmeMarkdown({
        components: [],
        hooks: [
          createHook("useCounter", {
            parameters: [
              {
                description: "Start value.",
                name: "initialValue",
                optional: false
              },
              { description: "", name: "step", optional: true }
            ]
          })
        ],
        imperativeHandles: [],
        markdown
      });

      expect(result).toContain("#### Parameters");
      expect(result).toContain(
        "<td>initialValue</td>\n      <td><p>Start value.</p>"
      );
      expect(result).toContain("<td>step?</td>");
    });

    test("should omit the parameters table for hooks without parameters", async () => {
      const result = await updateReadmeMarkdown({
        components: [],
        hooks: [createHook("useGroupRef")],
        imperativeHandles: [],
        markdown
      });

      expect(result).not.toContain("#### Parameters");
    });

    test("should render imperative handle methods as a table", async () => {
      const result = await updateReadmeMarkdown({
        components: [],
        imperativeHandles: [createHandle("PanelImperativeHandle")],
        markdown
      });

      expect(result).toContain("#### Methods");
      expect(result).toContain("<td>reset</td>");
      expect(result).toContain("<td><p>Resets it.</p>\n</td>");
    });

    test("should normalize JSDoc tags in descriptions", async () => {
      const result = await updateReadmeMarkdown({
        components: [
          createComponent("Panel", {
            description: "A panel.\n@deprecated Use Cell instead."
          })
        ],
        imperativeHandles: [],
        markdown
      });

      expect(result).toContain(
        "A panel.\n\n❌ This component has been deprecated. Use Cell instead."
      );
    });

    test("should be idempotent", async () => {
      const options = {
        components: [createComponent("Panel")],
        imperativeHandles: [createHandle("PanelImperativeHandle")]
      };

      const once = await updateReadmeMarkdown({ ...options, markdown });
      const twice = await updateReadmeMarkdown({ ...options, markdown: once });

      expect(twice).toBe(once);
    });

    test("should not warn about missing per-component markers", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

      await updateReadmeMarkdown({
        components: [createComponent("Panel")],
        imperativeHandles: [],
        markdown
      });

      expect(warn).not.toHaveBeenCalled();
    });
  });

  describe("legacy per-component markers", () => {
    test("should fill each component's sections", async () => {
      const markdown = [
        "<!-- Panel:description:begin -->",
        "<!-- Panel:description:end -->",
        "<!-- Panel:required-props:begin -->",
        "<!-- Panel:required-props:end -->",
        "<!-- Panel:optional-props:begin -->",
        "<!-- Panel:optional-props:end -->"
      ].join("\n");

      expect(
        await updateReadmeMarkdown({
          components: [
            createComponent("Panel", { optionalPropsTable: "<table />" })
          ],
          imperativeHandles: [createHandle("PanelImperativeHandle")],
          markdown
        })
      ).toBe(
        [
          "<!-- Panel:description:begin -->",
          "Panel description.",
          "<!-- Panel:description:end -->",
          "<!-- Panel:required-props:begin -->",
          "None",
          "<!-- Panel:required-props:end -->",
          "<!-- Panel:optional-props:begin -->",
          "<table />",
          "<!-- Panel:optional-props:end -->"
        ].join("\n")
      );
    });

    test("should warn once that hooks need the API markers", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

      await updateReadmeMarkdown({
        components: [],
        hooks: [createHook("useA"), createHook("useB")],
        imperativeHandles: [createHandle("Handle")],
        markdown: "# No markers"
      });

      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain("react-lib-tools:api");
    });

    test("should warn for components without markers", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

      await updateReadmeMarkdown({
        components: [createComponent("Panel")],
        imperativeHandles: [],
        markdown: "# No markers"
      });

      expect(warn).toHaveBeenCalledTimes(3);
    });
  });
});
