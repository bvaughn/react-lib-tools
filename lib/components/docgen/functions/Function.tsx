import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { repository } from "../../../../package.json";
import type { FunctionMetadata } from "../../../types";
import { Box } from "../../Box";
import { DocsSection } from "../../DocsSection";
import { ExternalLink } from "../../ExternalLink";
import { Header } from "../../Header";
import { FunctionParameter } from "./FunctionParameter";

export function Function({
  metadata,
  section
}: {
  metadata: FunctionMetadata;
  section: string;
}) {
  return (
    <Box direction="column" gap={4}>
      <Box align="center" direction="row" gap={2} wrap>
        <Header section={section} title={`${metadata.name} component`} />
        <ExternalLink
          className="text-sm text-emerald-300 hover:text-white"
          href={`${repository.url.replace(".git", "")}/blob/main/${metadata.filePath}`}
        >
          <ArrowTopRightOnSquareIcon className="inline-block size-4 fill-current" />
        </ExternalLink>
      </Box>
      <DocsSection sections={metadata.description} />
      <dl>
        {metadata.parameters.map((parameter) => (
          <FunctionParameter key={parameter.name} parameter={parameter} />
        ))}
      </dl>
      <pre>
        <code>
          {JSON.stringify(
            {
              // TODO
              returnType: metadata.returnType ?? null
            },
            null,
            2
          )}
        </code>
      </pre>
    </Box>
  );
}
