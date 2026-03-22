import Fuse from "fuse.js";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { SiteSearchRecord } from "react-lib-tools";
import { crawlPage } from "./utils/search/crawlPage";
import { scheduleWork } from "./utils/search/scheduleWork";
import type { SiteSearchPage } from "./utils/search/types";
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
  const recordsMap: Record<string, SiteSearchPage> = {};

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
      records: recordsMap
    })
  );

  const records = Object.values(recordsMap);

  const searchIndex = Fuse.createIndex<SiteSearchRecord>(
    ["title", "section", "text"],
    records
  );

  await writeFile(
    join(...outputPath, `search-records.json`),
    JSON.stringify(records, null, 2)
  );

  await writeFile(
    join(...outputPath, `search-index.json`),
    JSON.stringify(searchIndex, null, 2)
  );
}
