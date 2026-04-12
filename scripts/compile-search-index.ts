import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { SiteMapPage } from "../types";
import { crawlPage } from "./utils/search/crawlPage";
import { scheduleWork } from "./utils/search/scheduleWork";
import { waitForConnection } from "./utils/search/waitForConnection";

export async function compileSearchIndex({
  chromeExecutablePath,
  filterSelector,
  host = "http://localhost:3000",
  outputPath = ["public", "generated"]
}: {
  chromeExecutablePath?: string | undefined;
  filterSelector?: string | undefined;
  host?: string;
  outputPath?: string[];
} = {}) {
  const siteMap: Record<string, SiteMapPage> = {};

  const url = new URL(host);

  await waitForConnection({
    host: url.hostname,
    port: parseInt(url.port)
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

  await writeFile(
    join(...outputPath, `site-map.json`),
    JSON.stringify(Object.values(siteMap), null, 2)
  );
}
