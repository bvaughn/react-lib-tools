import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { cwd } from "node:process";
import type { SiteMapPage } from "../types";
import { crawlPage } from "./utils/search/crawlPage";
import { scheduleWork } from "./utils/search/scheduleWork";
import { waitForConnection } from "./utils/search/waitForConnection";

/**
 * Crawl a running docs site and write the `site-map.json` index used by site search.
 */
export async function compileSearchIndex({
  chromeExecutablePath,
  filterSelector,
  host = "http://localhost:3000",
  outputPath = ["public", "generated"],
  rootDir = cwd()
}: {
  /**
   * Chrome executable for Puppeteer to use instead of its bundled browser.
   */
  chromeExecutablePath?: string | undefined;

  /**
   * Content matching this selector is excluded from the index (e.g. long lists of demo data).
   */
  filterSelector?: string | undefined;

  /**
   * URL of the running docs site to crawl.
   * By default this is `http://localhost:3000`.
   */
  host?: string;

  /**
   * Where should the output be stored?
   * By default the index is stored within the `public/generated` directory.
   */
  outputPath?: string[];

  /**
   * Directory that all other paths are relative to.
   * Defaults to the current working directory.
   */
  rootDir?: string | undefined;
} = {}) {
  const siteMap: Record<string, SiteMapPage> = {};

  const url = new URL(host);

  await waitForConnection({
    host: url.hostname,
    port: url.port ? parseInt(url.port) : url.protocol === "https:" ? 443 : 80
  });

  await scheduleWork(async () =>
    crawlPage({
      chromeExecutablePath,
      filterSelector,
      host,
      path: "/",
      siteMap
    })
  );

  const outputDir = resolve(rootDir, ...outputPath);
  await mkdir(outputDir, { recursive: true });

  await writeFile(
    join(outputDir, `site-map.json`),
    JSON.stringify(Object.values(siteMap), null, 2)
  );
}
