import {
  Block,
  Box,
  Code,
  ImperativeHandle,
  SectionHeader,
  type ImperativeHandleMetadata
} from "react-lib-tools";
import json from "../../public/generated/docs/CounterImperativeHandle.json";
import { html as counterImperativeHandleHTML } from "../../public/generated/examples/CounterImperativeHandle.json";
import { CounterImperativeHandleExample } from "./examples/CounterImperativeHandle";

export default function CounterImperativeHandleRoute() {
  return (
    <Box direction="column" gap={4}>
      <ImperativeHandle
        json={json as ImperativeHandleMetadata}
        section="Counter"
      />
      <SectionHeader>Example</SectionHeader>
      <Code html={counterImperativeHandleHTML} />
      <Block className="flex items-center gap-4 p-4" data-focus-within="bold">
        <CounterImperativeHandleExample />
      </Block>
    </Box>
  );
}
