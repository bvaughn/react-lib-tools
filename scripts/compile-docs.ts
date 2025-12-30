import type { AnalyserOptions } from "@ts-ast-parser/core";
import { compileComponents } from "./utils/docs/compileComponents.ts";
import { compileImperativeHandles } from "./utils/docs/compileImperativeHandles.ts";
import type { CompilerOptions } from "typescript";
import {
  JsxEmit,
  ModuleDetectionKind,
  ModuleKind,
  ModuleResolutionKind,
  ScriptTarget
} from "typescript";

export async function compileDocs({
  analyserOptions: analyserOptionsParam,
  componentNames = [],
  imperativeHandleNames = [],
  outputDirName = "docs"
}: {
  analyserOptions?: Partial<AnalyserOptions>;
  componentNames?: string[] | undefined;
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

  await compileComponents({
    compilerOptions,
    componentNames,
    outputDirName
  });

  await compileImperativeHandles({
    analyserOptions,
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
