import { insertPropsMarkdown } from "./insertPropsMarkdown.ts";
import { normalizeDescription } from "./normalizeDescription.ts";
import { propsToTable } from "./propsToTable.ts";

export const API_START_TOKEN = "<!-- react-lib-tools:api:begin -->";
export const API_STOP_TOKEN = "<!-- react-lib-tools:api:end -->";

export type ReadmeComponent = {
  componentName: string;
  description: string;
  optionalPropsTable: string;
  requiredPropsTable: string;
};

export type ReadmeHook = {
  description: string;
  name: string;
  parameters: { description: string; name: string; optional: boolean }[];
};

export type ReadmeImperativeHandle = {
  description: string;
  methods: { description: string; name: string }[];
  name: string;
};

/**
 * Inserts generated API docs into README markdown.
 *
 * If the README contains a single `<!-- react-lib-tools:api:begin -->` / `<!-- react-lib-tools:api:end -->` pair,
 * everything between them is replaced with "Components", "Hooks" and "Imperative APIs" sections,
 * each documenting its items sorted by name. Empty sections are omitted.
 *
 * Otherwise this falls back to the legacy per-component markers (e.g. `<!-- Name:optional-props:begin -->`).
 */
export async function updateReadmeMarkdown({
  components,
  hooks = [],
  imperativeHandles,
  markdown
}: {
  components: ReadmeComponent[];
  hooks?: ReadmeHook[] | undefined;
  imperativeHandles: ReadmeImperativeHandle[];
  markdown: string;
}) {
  const startTokenIndex = indexOfToken(markdown, API_START_TOKEN);
  const stopIndex = indexOfToken(markdown, API_STOP_TOKEN);

  if (startTokenIndex >= 0 && stopIndex > startTokenIndex) {
    const generated = await renderApiMarkdown({
      components,
      hooks,
      imperativeHandles
    });
    const startIndex = startTokenIndex + API_START_TOKEN.length;

    return (
      markdown.substring(0, startIndex) +
      (generated ? "\n\n" + generated + "\n\n" : "\n") +
      markdown.substring(stopIndex)
    );
  }

  if (startTokenIndex >= 0 || stopIndex >= 0) {
    console.warn(
      `README has ${startTokenIndex >= 0 ? API_START_TOKEN : API_STOP_TOKEN} but not a matching ${startTokenIndex >= 0 ? API_STOP_TOKEN : API_START_TOKEN} (or they are out of order); falling back to per-component markers`
    );
  }

  if (hooks.length > 0) {
    console.warn(
      `Hooks are only documented between ${API_START_TOKEN} and ${API_STOP_TOKEN} markers, which were not found in the README; ${hooks.length} hook(s) were skipped`
    );
  }

  for (const component of components) {
    markdown = insertPropsMarkdown({
      componentMarkdown: component.description,
      componentName: component.componentName,
      markdown,
      section: "description"
    });
    markdown = insertPropsMarkdown({
      componentMarkdown: component.requiredPropsTable,
      componentName: component.componentName,
      markdown,
      section: "required-props"
    });
    markdown = insertPropsMarkdown({
      componentMarkdown: component.optionalPropsTable,
      componentName: component.componentName,
      markdown,
      section: "optional-props"
    });
  }

  return markdown;
}

async function renderApiMarkdown({
  components,
  hooks,
  imperativeHandles
}: {
  components: ReadmeComponent[];
  hooks: ReadmeHook[];
  imperativeHandles: ReadmeImperativeHandle[];
}) {
  const groups = [
    await renderGroup(
      "Components",
      components.map((component) => ({
        name: component.componentName,
        render: async () =>
          joinBlocks([
            `### ${component.componentName}`,
            normalizeDescription(component.description, {
              kind: "component"
            }).trim(),
            "#### Required props",
            component.requiredPropsTable.trim() || "None",
            "#### Optional props",
            component.optionalPropsTable.trim() || "None"
          ])
      }))
    ),
    await renderGroup(
      "Hooks",
      hooks.map((hook) => ({
        name: hook.name,
        render: async () => {
          const parametersTable = (
            await propsToTable(
              hook.parameters.map((parameter) => ({
                description: parameter.description,
                name: parameter.optional ? `${parameter.name}?` : parameter.name
              })),
              { kind: "parameter" }
            )
          ).trim();

          return joinBlocks([
            `### ${hook.name}`,
            normalizeDescription(hook.description, { kind: "hook" }).trim(),
            parametersTable && "#### Parameters",
            parametersTable
          ]);
        }
      }))
    ),
    await renderGroup(
      "Imperative APIs",
      imperativeHandles.map((handle) => ({
        name: handle.name,
        render: async () =>
          joinBlocks([
            `### ${handle.name}`,
            normalizeDescription(handle.description, {
              kind: "imperative API"
            }).trim(),
            "#### Methods",
            (await propsToTable(handle.methods, { kind: "method" })).trim() ||
              "None"
          ])
      }))
    )
  ];

  return joinBlocks(groups);
}

async function renderGroup(
  title: string,
  items: { name: string; render: () => Promise<string> }[]
) {
  if (items.length === 0) {
    return "";
  }

  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
  const rendered = await Promise.all(sorted.map((item) => item.render()));

  return joinBlocks([`## ${title}`, ...rendered]);
}

function joinBlocks(blocks: string[]) {
  return blocks.filter(Boolean).join("\n\n");
}

// Like indexOf, but ignores tokens inside fenced code blocks (e.g. README text that documents the markers)
function indexOfToken(markdown: string, token: string) {
  const fences = Array.from(markdown.matchAll(/```[\s\S]*?```/g)).map(
    (match) => [match.index, match.index + match[0].length] as const
  );

  let index = markdown.indexOf(token);
  while (index >= 0) {
    const position = index;
    if (!fences.some(([start, end]) => position >= start && position < end)) {
      return index;
    }
    index = markdown.indexOf(token, index + token.length);
  }

  return -1;
}
