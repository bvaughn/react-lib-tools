import { mkdir } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { withCompilerOptions } from "react-docgen-typescript";
import type { CompilerOptions } from "typescript";
import { rmFilesWithExtensions } from "../rmFilesWithExtensions.ts";
import { initialize } from "../initialize.ts";
import { compileComponent } from "./compileComponent.ts";

export async function compileComponents({
  compilerOptions,
  componentNames,
  componentsPath,
  outputPath,
  rootDir
}: {
  compilerOptions: Partial<CompilerOptions>;
  componentNames: string[];
  componentsPath: string[];
  outputPath: string[];
  rootDir: string;
}) {
  // Hooks-only libraries have no components directory to scan,
  // but the output directory is still prepared (e.g. for imperative handle JSON)
  if (componentNames.length === 0) {
    const outputDir = resolve(rootDir, ...outputPath);
    await mkdir(outputDir, { recursive: true });
    await rmFilesWithExtensions(outputDir, [".json"]);
    return [];
  }

  const parser = withCompilerOptions(compilerOptions, {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldExtractValuesFromUnion: true,
    shouldRemoveUndefinedFromOptional: true
  });

  const { files, outputDir } = await initialize({
    fileExtensions: [".ts", ".tsx"],
    fileFilter: (file) => {
      const fileName = basename(file);
      return componentNames.some(
        (componentName) =>
          fileName === `${componentName}.ts` ||
          fileName === `${componentName}.tsx`
      );
    },
    inputPath: componentsPath,
    outputPath,
    rootDir
  });

  return Promise.all(
    files.map((filePath) =>
      compileComponent({
        filePath,
        outputDir,
        parser
      })
    )
  );
}
