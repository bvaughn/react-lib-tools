import type { ComponentPropMetadata } from "../../types";
import { Box } from "../Box";
import { SectionHeader } from "../SectionHeader";
import { ComponentProp } from "./ComponentProp";

export function ComponentPropsSection({
  header,
  props
}: {
  header: string;
  props: ComponentPropMetadata[];
}) {
  if (props.length === 0) {
    return null;
  }

  return (
    <Box direction="column">
      <SectionHeader className="mt-0">{header}</SectionHeader>
      <dl>
        {props.map((prop) => (
          <ComponentProp key={prop.name} prop={prop} />
        ))}
      </dl>
    </Box>
  );
}
