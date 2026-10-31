import type { AnalyserOptions } from "@ts-ast-parser/core";
import { resolve } from "node:path";
import { cwd } from "node:process";
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
  componentsPath = ["lib", "components"],
  imperativeHandleNames = [],
  outputPath = ["public", "generated", "docs"],
  readmePath = ["README.md"],
  rootDir = cwd()
}: {
  /**
   * AST Parser config; see `@ts-ast-parser/core` documentation for more information.
   */
  analyserOptions?: Partial<AnalyserOptions>;

  /**
   * Which components should be compiled?
   * Each name is matched against files in the `componentsPath` directory (and its subdirectories), e.g. "Button" or "grid/Grid".
   */
  componentNames?: string[] | undefined;

  /**
   * Directory containing the components named by `componentNames`.
   * By default components are found within the `lib/components` directory.
   */
  componentsPath?: string[] | undefined;

  /**
   * Which imperative handles should be compiled?
   * Each name is matched against interfaces declared within the `lib` directory.
   */
  imperativeHandleNames?: string[] | undefined;

  /**
   * Where should the output be stored?
   * By default examples are stored within the `public/generated/docs` directory.
   */
  outputPath?: string[] | undefined;

  /**
   * README file to update with component props tables, or `false` to skip updating a README.
   * Tables are inserted between `<!-- Name:section:begin -->` and `<!-- Name:section:end -->` markers.
   * By default this is the `README.md` file.
   */
  readmePath?: string[] | false | undefined;

  /**
   * Directory that all other paths are relative to.
   * Defaults to the current working directory.
   */
  rootDir?: string | undefined;
}) {
  const compilerOptions: Partial<CompilerOptions> = {
    ...defaultCompilerOptions,
    ...(analyserOptionsParam?.compilerOptions as CompilerOptions)
  };

  const analyserOptions: Partial<AnalyserOptions> = {
    ...analyserOptionsParam,
    compilerOptions,
    include: [resolve(rootDir, "lib")]
  };

  await compileComponents({
    compilerOptions,
    componentNames,
    componentsPath,
    outputPath,
    readmePath,
    rootDir
  });

  await compileImperativeHandles({
    analyserOptions,
    names: imperativeHandleNames,
    outputPath,
    rootDir
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
