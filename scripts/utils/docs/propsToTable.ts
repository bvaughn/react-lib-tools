import { marked } from "marked";
import { normalizeDescription } from "./normalizeDescription.ts";

const TABLE_TAG_START = `
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>`;

const PROP_ROW = `
    <tr>
      <td>[[name]]</td>
      <td>[[description]]</td>
    </tr>`;

const TABLE_TAG_STOP = `
  </tbody>
</table>
`;

export async function propsToTable(
  props: { description: string; name: string }[],
  { kind }: { kind?: string | undefined } = {}
) {
  const htmlStrings = [];

  if (props.length > 0) {
    htmlStrings.push(TABLE_TAG_START);

    for (const prop of props) {
      const description = await marked(
        normalizeDescription(prop.description, { kind })
      );

      htmlStrings.push(
        PROP_ROW.replace("[[name]]", () => prop.name).replace(
          "[[description]]",
          () => description
        )
      );
    }

    htmlStrings.push(TABLE_TAG_STOP);
  }

  return htmlStrings.join("");
}
