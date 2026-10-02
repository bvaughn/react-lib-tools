import type { ComponentPropMetadata } from "../../types";
import { Code } from "../code/Code";
import { DocsSection } from "../DocsSection";

export function ComponentProp({ prop }: { prop: ComponentPropMetadata }) {
  return (
    <div className="py-5 border-t border-white/10 first:border-t-0 first:pt-2">
      <dt data-toc="2" data-toc-title={prop.name} id={prop.name}>
        <Code
          className="bg-transparent border-0 inline-flex flex-col p-0 pl-4 -indent-4"
          copyable={false}
          html={prop.html}
        />
      </dt>
      <dd className="mt-2 [&_code]:text-sky-300">
        <DocsSection sections={prop.description} />
      </dd>
    </div>
  );
}
