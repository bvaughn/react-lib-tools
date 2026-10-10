import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { withCompilerOptions } from "react-docgen-typescript";
import type { CompilerOptions } from "typescript";
import { initialize } from "../initialize.ts";
import { compileComponent } from "./compileComponent.ts";
import { insertPropsMarkdown } from "./insertPropsMarkdown.ts";

export async function compileComponents({
  compilerOptions,
  componentNames,
  outputPath,
  readmePath,
  rootDir
}: {
  compilerOptions: Partial<CompilerOptions>;
  componentNames: string[];
  outputPath: string[];
  readmePath: string[] | false;
  rootDir: string;
}) {
  const parser = withCompilerOptions(compilerOptions, {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldExtractValuesFromUnion: true,
    shouldRemoveUndefinedFromOptional: true
  });

  const { files, outputDir } = await initialize({
    fileExtensions: [".ts", ".tsx"],
    fileFilter: (file) =>
      componentNames.some((componentName) =>
        file.includes(`/${componentName}.ts`)
      ),
    inputPath: ["lib", "components"],
    outputPath,
    rootDir
  });

  const markdownPath = readmePath ? resolve(rootDir, ...readmePath) : undefined;

  let markdown = markdownPath
    ? await readFile(markdownPath, { encoding: "utf-8" })
    : "";

  await Promise.all(
    files.map((filePath) =>
      compileComponent({
        filePath,
        outputDir,
        parser
      }).then(
        ({
          componentName,
          description,
          optionalPropsTable,
          requiredPropsTable
        }) => {
          if (!markdownPath) {
            return;
          }

          markdown = insertPropsMarkdown({
            componentMarkdown: description,
            componentName,
            markdown,
            section: "description"
          });

          markdown = insertPropsMarkdown({
            componentMarkdown: requiredPropsTable,
            componentName,
            markdown,
            section: "required-props"
          });

          markdown = insertPropsMarkdown({
            componentMarkdown: optionalPropsTable,
            componentName,
            markdown,
            section: "optional-props"
          });
        }
      )
    )
  );

  if (markdownPath) {
    await writeFile(markdownPath, markdown);
  }
}
