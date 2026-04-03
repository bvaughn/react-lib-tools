import puppeteer from "puppeteer";
import { scheduleWork } from "./scheduleWork";
import { stopWords } from "./stopWords";
import type { SiteSearchPage } from "./types";

export async function crawlPage({
  chromeExecutablePath,
  filterSelector,
  host,
  path,
  records
}: {
  chromeExecutablePath?: string | undefined;
  filterSelector?: string | undefined;
  host: string;
  path: string;
  records: Record<string, SiteSearchPage>;
}) {
  console.log(`Crawling ${host}${path} ...`);

  const browser = await puppeteer.launch(
    chromeExecutablePath
      ? {
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          executablePath: chromeExecutablePath,
          headless: true
        }
      : {
          headless: true
        }
  );

  const page = await browser.newPage();

  // Navigate the page to a URL.
  await page.goto(`${host}${path}`);
  await page.waitForSelector("main");

  page.on("console", (event) => console.log(event.text()));

  const result = await page.evaluate(
    async ([filterSelector, stopWords]) => {
      const paths: string[] = [];
      for (const element of document.body.querySelectorAll("[data-link]")) {
        const to = element.getAttribute("data-link");
        if (to) {
          paths.push(to.split("#")[0]);
        }
      }

      const section =
        document.body.querySelector("header [data-section]")?.textContent ||
        undefined;
      const title =
        document.body.querySelector("header [data-title]")?.textContent ?? "";

      const words = new Set<string>();
      let text = "";

      const main = document.body.querySelector("[data-main-scrollable]");
      if (main) {
        text = main.innerHTML;

        // Filter out special content (e.g. lorem ipsum type text)
        if (filterSelector) {
          const matches = document.querySelectorAll(filterSelector);
          for (const match of matches) {
            text = text.replace(match.outerHTML, "");
          }
        }

        // Ensure whitespace between HTML tags
        text = text.replaceAll("><", "> <");

        // Strip HTML tags
        text = text.replaceAll(/<[^>]+>/g, "");

        // Replace HTML entities
        const HTML_ENTITIES: { [chars: string]: string } = {
          "&amp;": "&",
          "&lt;": "<",
          "&gt;": ">",
          "&quot;": '"',
          "&#039;": "'",
          "&ndash;": "-",
          "&nbsp;": " "
        };
        for (const chars in HTML_ENTITIES) {
          text = text.replaceAll(chars, HTML_ENTITIES[chars]);
        }

        text.split(/[\s.:?]/).forEach((word) => {
          word = word.trim().toLowerCase();
          if (word && !stopWords.includes(word)) {
            words.add(word);
          }
        });
      }

      return {
        paths,
        section,
        text,
        title,
        words: Array.from(words)
      };
    },
    [filterSelector, stopWords] as const
  );

  records[path] = {
    path,
    section: result.section,
    text: result.text,
    title: result.title
  };

  const filteredPaths = result.paths.filter((current) => {
    if (!records[current]) {
      records[current] = {
        path: current,
        text: "",
        title: ""
      };

      return path;
    }
  });

  await browser.close();

  scheduleWork(
    ...filteredPaths.map(
      (current) => () =>
        crawlPage({
          chromeExecutablePath,
          filterSelector,
          host,
          path: current,
          records
        })
    )
  );
}
