import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";
import { withCompilerOptions } from "react-docgen-typescript";
import type { CompilerOptions } from "typescript";
import { initialize } from "../initialize.ts";
import { compileComponent } from "./compileComponent.ts";
import { insertPropsMarkdown } from "./insertPropsMarkdown.ts";

export async function compileComponents({
  compilerOptions,
  componentNames,
  outputPath
}: {
  compilerOptions: Partial<CompilerOptions>;
  componentNames: string[];
  outputPath: string[];
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
    outputPath
  });

  const markdownPath = join(cwd(), "README.md");

  let markdown = await readFile(markdownPath, { encoding: "utf-8" });

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

  await writeFile(markdownPath, markdown);
}
