import { compileComponents } from "./utils/docs/compileComponents.ts";

export async function compileDocs({
  componentNames,
  outputDirName = "js-docs"
}: {
  componentNames: string[];
  outputDirName?: string | undefined;
}) {
  await compileComponents({
    componentNames,
    outputDirName
  });
}
