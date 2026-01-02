import bytes from "bytes";
import { stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";
import sharp from "sharp";

/**
 * Compress og:image.
 */
export async function compressOgImage({
  inputPath = ["public", "og.png"],
  outputPath = ["public", "og.png"]
}: {
  inputPath?: string[] | undefined;
  outputPath?: string[] | undefined;
} = {}) {
  const input = join(cwd(), ...inputPath);
  const statsBefore = await stat(input);

  const png = sharp(input).png({
    quality: 100,
    compressionLevel: 9
  });

  const output = join(cwd(), ...outputPath);
  const buffer = await png.toBuffer();
  await writeFile(output, buffer, {
    encoding: "base64"
  });

  const statsAfter = await stat(output);

  console.log(
    "Compressed image:\n  before: %s\n  after: %s",
    bytes(statsBefore.size),
    bytes(statsAfter.size)
  );
}
