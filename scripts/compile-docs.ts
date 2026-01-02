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

/**
 * Compile TSDoc comments into a formatted structure that can be rendered by the `ComponentProps` component.
 */
export async function compileDocs({
  analyserOptions: analyserOptionsParam,
  componentNames = [],
  imperativeHandleNames = [],
  outputPath = ["public", "generated", "docs"]
}: {
  /**
   * AST Parser config; see `@ts-ast-parser/core` documentation for more information.
   */
  analyserOptions?: Partial<AnalyserOptions>;

  /**
   * Which components should be compiled?
   */
  componentNames?: string[] | undefined;

  /**
   * Which imperative handles should be compiled?
   */
  imperativeHandleNames?: string[] | undefined;

  /**
   * Where should the output be stored?
   * By default examples are stored within the `public/generated/docs` directory.
   */
  outputPath?: string[] | undefined;
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
    outputPath
  });

  await compileImperativeHandles({
    analyserOptions,
    names: imperativeHandleNames,
    outputPath
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
