import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { getFilesWithExtensions } from "./getFilesWithExtensions.ts";
import { rmFilesWithExtensions } from "./rmFilesWithExtensions.ts";

export async function initialize({
  fileExtensions,
  fileFilter,
  inputPath,
  outputPath,
  rootDir
}: {
  fileExtensions: string[];
  fileFilter?: ((path: string) => boolean) | undefined;
  inputPath: string[];
  outputPath: string[];
  rootDir: string;
}) {
  const inputDir = join(rootDir, ...inputPath);
  const outputDir = join(rootDir, ...outputPath);
  await mkdir(outputDir, { recursive: true });
  await rmFilesWithExtensions(outputDir, [".json"]);

  const files = await getFilesWithExtensions(
    inputDir,
    fileExtensions,
    fileFilter
  );

  return {
    files,
    inputDir,
    outputDir
  };
}
