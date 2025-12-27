import { compileComponents } from "./utils/docs/compileComponents.ts";
import { compileImperativeHandles } from "./utils/docs/compileImperativeHandles.ts";

export async function compileDocs({
  componentNames,
  imperativeHandleNames,
  outputDirName = "docs"
}: {
  componentNames: string[];
  imperativeHandleNames: string[];
  outputDirName?: string | undefined;
}) {
  await compileComponents({
    componentNames,
    outputDirName
  });

  await compileImperativeHandles({
    names: imperativeHandleNames,
    outputDirName
  });
}
