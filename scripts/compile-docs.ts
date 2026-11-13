import type { AnalyserOptions } from "@ts-ast-parser/core";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { cwd } from "node:process";
import { compileComponents } from "./utils/docs/compileComponents.ts";
import { compileHooks } from "./utils/docs/compileHooks.ts";
import { compileImperativeHandles } from "./utils/docs/compileImperativeHandles.ts";
import { updateReadmeMarkdown } from "./utils/docs/updateReadmeMarkdown.ts";
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
  hookNames = [],
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
   * Which hooks should be documented in the README?
   * Each name is matched against functions (or `const` hooks) exported from files within the `lib` directory;
   * default exports aren't supported. If a name is declared more than once, the one exported from `lib/index.ts` wins.
   * Hooks are only written to the README, and only between `react-lib-tools:api` markers.
   */
  hookNames?: string[] | undefined;

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
   * README file to update with generated API docs, or `false` to skip updating a README.
   * Docs for every component, hook and imperative handle (grouped by kind, sorted by name) are inserted between
   * `<!-- react-lib-tools:api:begin -->` and `<!-- react-lib-tools:api:end -->` markers.
   * If those aren't found, component docs are inserted between legacy per-component markers
   * (`<!-- Name:section:begin -->` and `<!-- Name:section:end -->`) instead.
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

  const components = await compileComponents({
    compilerOptions,
    componentNames,
    componentsPath,
    outputPath,
    rootDir
  });

  const imperativeHandles = await compileImperativeHandles({
    analyserOptions,
    names: imperativeHandleNames,
    outputPath,
    rootDir
  });

  if (readmePath) {
    const hooks = await compileHooks({
      compilerOptions,
      names: hookNames,
      rootDir
    });

    const markdownPath = resolve(rootDir, ...readmePath);
    const markdown = await readFile(markdownPath, { encoding: "utf-8" });

    await writeFile(
      markdownPath,
      await updateReadmeMarkdown({
        components,
        hooks,
        imperativeHandles,
        markdown
      })
    );
  }
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
