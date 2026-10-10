import { Block, Box, Callout, Code, Header, Link } from "react-lib-tools";
import { html as counterBasicHTML } from "../../public/generated/examples/CounterBasic.json";
import { CounterBasicExample } from "./examples/CounterBasic";

export default function CounterRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Counter" title="Basic usage" />
      <div>
        A <code>Counter</code> displays a number along with buttons to change
        it. The <code>min</code> and <code>max</code> props limit the range of
        allowed values:
      </div>
      <Code html={counterBasicHTML} />
      <Block className="p-4" data-focus-within="bold">
        <CounterBasicExample />
      </Block>
      <Callout intent="primary">
        The value can also be changed programmatically using the{" "}
        <Link to="/counter/imperative-handle">imperative handle</Link>.
      </Callout>
    </Box>
  );
}
