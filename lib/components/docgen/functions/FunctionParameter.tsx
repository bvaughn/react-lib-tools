import type { Parameter } from "../../../types";
import { Code } from "../../code/Code";
import { DocsSection } from "../../DocsSection";

export function FunctionParameter({ parameter }: { parameter: Parameter }) {
  return (
    <>
      <dt className="mt-6 pl-8 indent-[-1rem]">
        <Code
          className="bg-transparent inline-flex flex-col p-0"
          html={parameter.name}
        />
      </dt>
      <dd className="mt-2 pl-4 [&_code]:text-sky-300">
        <DocsSection sections={parameter.description} />
      </dd>
    </>
  );
}
