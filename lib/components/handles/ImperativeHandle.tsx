import type { ImperativeHandleMetadata } from "../../types";
import { Box } from "../Box";
import { DocsSection } from "../DocsSection";
import { Header } from "../Header";
import { ImperativeHandleMethod } from "./ImperativeHandleMethod";

export function ImperativeHandle({
  json,
  section
}: {
  json: ImperativeHandleMetadata;
  section: string;
}) {
  return (
    <Box direction="column" gap={4}>
      <Header
        section={section}
        sourceCodePath={json.filePath}
        title={`${json.name}`}
      />
      <DocsSection sections={json.description} />
      <Box direction="column">
        <dl className="flex flex-col gap-2">
          {json.methods.map((method, index) => (
            <ImperativeHandleMethod key={index} method={method} />
          ))}
        </dl>
      </Box>
    </Box>
  );
}
