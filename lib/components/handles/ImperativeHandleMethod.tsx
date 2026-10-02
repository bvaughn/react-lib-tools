import type { ImperativeHandleMethodMetadata } from "../../types";
import { Code } from "../code/Code";
import { DocsSection } from "../DocsSection";

export function ImperativeHandleMethod({
  method
}: {
  method: ImperativeHandleMethodMetadata;
}) {
  return (
    <div className="py-5 border-t border-white/10 first:border-t-0 first:pt-0">
      <dt
        className="[&_code]:text-sky-300 text-lg font-bold"
        data-toc="1"
        id={method.name}
      >
        {method.name}
      </dt>
      <dd className="mt-2">
        <DocsSection sections={method.description} />
        <Code className="mt-2 p-2 flex flex-col" html={method.html} />
      </dd>
    </div>
  );
}
