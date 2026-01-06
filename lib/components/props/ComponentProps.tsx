import { useMemo } from "react";
import type { ComponentMetadata } from "../../types";
import { processPropsJSON } from "../../utils/processPropsJSON";
import { Box } from "../Box";
import { DocsSection } from "../DocsSection";
import { Header } from "../Header";
import { ComponentPropsSection } from "./ComponentPropsSection";

export function ComponentProps({
  json,
  section
}: {
  json: ComponentMetadata;
  section: string;
}) {
  const { optionalProps, requiredProps } = useMemo(
    () => processPropsJSON(json),
    [json]
  );

  return (
    <Box direction="column" gap={4}>
      <Header
        section={section}
        sourceCodePath={json.filePath}
        title={`${json.name} component`}
      />
      <DocsSection sections={json.description} />
      <ComponentPropsSection header="Required props" props={requiredProps} />
      <ComponentPropsSection header="Optional props" props={optionalProps} />
    </Box>
  );
}
