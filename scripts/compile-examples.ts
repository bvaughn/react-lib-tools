import { readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { trimExcludedText } from "./utils/examples/trimExcludedText.ts";
import { initialize } from "./utils/initialize.ts";
import { syntaxHighlight } from "./utils/syntax-highlight.ts";

/**
 * Compile example snippets into syntax-highlighted HTML that can be rendered by the `Code` component.
 */
export async function compileExamples({
  fileExtensions = [".css", ".html", ".js", ".jsx", ".ts", ".tsx"],
  inputPath = ["src", "routes"],
  outputPath = ["public", "generated", "examples"]
}: {
  /**
   * Which file extension are supported?
   * By default CSS, HTML, TS/TSX, and JS/JSX file extensions are supported.
   */
  fileExtensions?: string[] | undefined;

  /**
   * Where are example files located?
   * By default this script looks for examples within the `src/routes` root directory.
   */
  inputPath?: string[] | undefined;

  /**
   * Where should the output be stored?
   * By default examples are stored within the `public/generated/examples` directory.
   */
  outputPath?: string[] | undefined;
} = {}) {
  const { files, outputDir } = await initialize({
    fileExtensions,
    inputPath,
    outputPath
  });

  for (const file of files) {
    if (!file.includes("/examples/")) {
      continue;
    }

    const buffer = await readFile(file);

    let rawText = buffer.toString();

    {
      // Remove special comments and directives before syntax highlighting
      rawText = trimExcludedText(rawText);

      rawText = rawText
        .split("\n")
        .filter(
          (line) =>
            !line.includes("prettier-ignore") &&
            !line.includes("eslint-disable-next-line") &&
            !line.includes("@ts-expect-error") &&
            !line.includes("// hidden")
        )
        .join("\n");
    }

    let html;
    if (file.endsWith(".css")) {
      html = await syntaxHighlight(rawText, "CSS");
    } else if (file.endsWith(".html")) {
      html = await syntaxHighlight(rawText, "HTML");
    } else if (file.endsWith(".js") || file.endsWith(".jsx")) {
      html = await syntaxHighlight(
        rawText,
        file.endsWith("jsx") ? "JSX" : "JS"
      );
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      html = await syntaxHighlight(
        rawText,
        file.endsWith("tsx") ? "TSX" : "TS"
      );
    } else {
      throw Error(`Unsupported file type: ${file}`);
    }

    const fileName = basename(file);

    const outputFile = join(
      outputDir,
      fileName.replace(/(\.example)?\.[\w]+$/, ".json")
    );

    console.debug("Writing to", outputFile);

    await writeFile(outputFile, JSON.stringify({ html }, null, 2));
  }
}
