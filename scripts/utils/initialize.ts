import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";
import { getFilesWithExtensions } from "./getFilesWithExtensions.ts";
import { rmFilesWithExtensions } from "./rmFilesWithExtensions.ts";

export async function initialize({
  fileExtensions,
  fileFilter,
  inputPath,
  outputPath
}: {
  fileExtensions: string[];
  fileFilter?: ((path: string) => boolean) | undefined;
  inputPath: string[];
  outputPath: string[];
}) {
  const inputDir = join(cwd(), ...inputPath);
  const outputDir = join(cwd(), ...outputPath);
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
