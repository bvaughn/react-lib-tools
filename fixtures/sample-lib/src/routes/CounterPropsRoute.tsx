import { ComponentProps, type ComponentMetadata } from "react-lib-tools";
import json from "../../public/generated/docs/Counter.json";

export default function CounterPropsRoute() {
  return <ComponentProps json={json as ComponentMetadata} section="Counter" />;
}
