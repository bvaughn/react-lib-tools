import { parseFromProject, type AnalyserOptions } from "@ts-ast-parser/core";
import type { CompilerOptions } from "typescript";
import {
  JsxEmit,
  ModuleDetectionKind,
  ModuleKind,
  ModuleResolutionKind,
  ScriptTarget
} from "typescript";
import { compileComponents } from "./utils/docs/compileComponents.ts";
import { compileFunctions } from "./utils/docs/compileFunctions.ts";
import { compileImperativeHandles } from "./utils/docs/compileImperativeHandles.ts";

export async function compileDocs({
  analyserOptions: analyserOptionsParam,
  componentNames = [],
  hookNames = [],
  imperativeHandleNames = [],
  outputDirName = "docs"
}: {
  analyserOptions?: Partial<AnalyserOptions>;
  componentNames?: string[] | undefined;
  hookNames?: string[] | undefined;
  imperativeHandleNames?: string[] | undefined;
  outputDirName?: string | undefined;
}) {
  const compilerOptions: Partial<CompilerOptions> = {
    ...defaultCompilerOptions,
    ...(analyserOptionsParam?.compilerOptions as CompilerOptions)
  };

  const analyserOptions: Partial<AnalyserOptions> = {
    ...analyserOptionsParam,
    compilerOptions,
    include: ["lib"]
  };

  const result = await parseFromProject(analyserOptions);
  const moduleNodes = result.project?.getModules() ?? [];

  if (hookNames.length > 0) {
    compileFunctions({
      names: hookNames,
      moduleNodes,
      outputDirName
    });
    return;
  }

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

const defaultCompilerOptions: CompilerOptions = {
  tsBuildInfoFile: "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
  target: ScriptTarget.ES2022,
  useDefineForClassFields: true,
  lib: ["ES2022", "DOM", "DOM.Iterable"],
  module: ModuleKind.ESNext,
  skipLibCheck: true,
  moduleResolution: ModuleResolutionKind.Bundler,
  allowImportingTsExtensions: true,
  verbatimModuleSyntax: true,
  moduleDetection: ModuleDetectionKind.Force,
  noEmit: true,
  jsx: JsxEmit.ReactJSX,
  strict: true,
  noUnusedLocals: true,
  noUnusedParameters: true,
  erasableSyntaxOnly: true,
  noFallthroughCasesInSwitch: true,
  noUncheckedSideEffectImports: true,
  exactOptionalPropertyTypes: true
};
