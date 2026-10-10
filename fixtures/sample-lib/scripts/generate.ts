/**
 * Regenerates the sample library's docs, examples, and search index (in public/generated)
 * by running each react-lib-tools script against it.
 *
 * Run with `pnpm fixtures:generate` from the repository root.
 */
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { compileDocs } from "../../../scripts/compile-docs.ts";
import { compileExamples } from "../../../scripts/compile-examples.ts";
import { compileSearchIndex } from "../../../scripts/compile-search-index.ts";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(rootDir, "..", "..");

await compileDocs({
  componentNames: ["Badge", "Counter"],
  imperativeHandleNames: ["CounterImperativeHandle"],
  rootDir
});

await compileExamples({ rootDir });

// The search index is built by crawling the running docs site
const server = await createServer({
  configFile: resolve(repoRoot, "vite.config.ts"),
  root: repoRoot,
  server: { host: "localhost", port: 3100 }
});

try {
  await server.listen();

  const url = server.resolvedUrls?.local[0];
  if (!url) {
    throw Error("Dev server did not start");
  }

  await compileSearchIndex({
    chromeExecutablePath: process.env.CHROME_PATH,
    host: url.replace(/\/$/, ""),
    rootDir
  });
} finally {
  await server.close();
}
