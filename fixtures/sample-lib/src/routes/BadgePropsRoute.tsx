import { ComponentProps, type ComponentMetadata } from "react-lib-tools";
import json from "../../public/generated/docs/Badge.json";

export default function BadgePropsRoute() {
  return <ComponentProps json={json as ComponentMetadata} section="Badge" />;
}
