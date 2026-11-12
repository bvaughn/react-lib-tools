// @vitest-environment node

import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createServer, type Plugin, type ViteDevServer } from "vite";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { compileSearchIndex } from "./compile-search-index";

// These tests crawl the dev site (the sample library's docs) and compare the output to its committed search index.
// If a change to the scripts is intentional, run "pnpm fixtures:generate" and commit the updated files.

const repoRoot = resolve(__dirname, "..");
const rootDir = resolve(repoRoot, "fixtures", "sample-lib");
const expectedSiteMapPath = join(
  rootDir,
  "public",
  "generated",
  "site-map.json"
);

let htmlRequestCount: number;
let outputDir: string;
let server: ViteDevServer | undefined;

beforeEach(async () => {
  htmlRequestCount = 0;
  outputDir = await mkdtemp(join(tmpdir(), "react-lib-tools-"));

  // Silence progress logging
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(async () => {
  await server?.close();
  server = undefined;

  await rm(outputDir, { force: true, recursive: true });
});

async function startServer(plugins: Plugin[] = []) {
  server = await createServer({
    configFile: resolve(repoRoot, "vite.config.ts"),
    logLevel: "silent",
    plugins: [
      ...plugins,
      {
        name: "count-html-requests",
        configureServer(server) {
          server.middlewares.use((request, _response, next) => {
            if (request.headers.accept?.includes("text/html")) {
              htmlRequestCount++;
            }
            next();
          });
        }
      }
    ],
    root: repoRoot,
    server: { host: "localhost", port: 3101 }
  });

  await server.listen();

  const url = server.resolvedUrls?.local[0];
  if (!url) {
    throw Error("Dev server did not start");
  }

  return url.replace(/\/$/, "");
}

async function crawl(host: string) {
  await compileSearchIndex({
    chromeExecutablePath: process.env.CHROME_PATH,
    host,
    outputPath: [outputDir],
    rootDir
  });

  const actual = await readFile(join(outputDir, "site-map.json"), "utf-8");
  const expected = await readFile(expectedSiteMapPath, "utf-8");

  expect(actual).toBe(expected);

  return JSON.parse(actual) as unknown[];
}

describe("compileSearchIndex", () => {
  test("should crawl the site, navigating client-side after each tab's first page load", async () => {
    const host = await startServer();

    const pages = await crawl(host);

    // Each tab loads the site once (tabs are limited by the crawl's concurrency)
    expect(pages.length).toBeGreaterThan(5);
    expect(htmlRequestCount).toBeLessThanOrEqual(5);
  }, 60_000);

  test("should load every page in full for sites that don't report rendered routes", async () => {
    // Simulate a site built with an older version of AppRoot
    const host = await startServer([
      {
        enforce: "pre",
        name: "remove-rendered-route-marker",
        transform(_code, id) {
          if (id.endsWith("RenderedRouteMarker.tsx")) {
            return "export function RenderedRouteMarker() { return null; }";
          }
        }
      }
    ]);

    const pages = await crawl(host);

    expect(htmlRequestCount).toBe(pages.length);
  }, 60_000);
});
