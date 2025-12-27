import { compileComponents } from "./utils/docs/compileComponents.ts";
import { compileImperativeHandles } from "./utils/docs/compileImperativeHandles.ts";
import type { CompilerOptions } from "typescript";

export async function compileDocs({
  compilerOptions = {},
  componentNames,
  imperativeHandleNames,
  outputDirName = "docs"
}: {
  compilerOptions: Partial<CompilerOptions>;
  componentNames: string[];
  imperativeHandleNames: string[];
  outputDirName?: string | undefined;
}) {
  await compileComponents({
    compilerOptions,
    componentNames,
    outputDirName
  });

  await compileImperativeHandles({
    compilerOptions,
    names: imperativeHandleNames,
    outputDirName
  });
}
