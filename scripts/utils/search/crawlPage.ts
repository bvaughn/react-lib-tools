import puppeteer from "puppeteer";
import { stopWords } from "./stopWords";
import type { SiteSearchPage } from "./types";

export async function crawlPage({
  host,
  path,
  records
}: {
  host: string;
  path: string;
  records: Record<string, SiteSearchPage>;
}) {
  console.log(`Crawling ${host}${path} ...`);

  const browser = await puppeteer.launch({
    headless: true
  });

  const page = await browser.newPage();

  // Navigate the page to a URL.
  await page.goto(`${host}${path}`);
  await page.waitForSelector("main");

  const result = await page.evaluate(
    async ([stopWords]) => {
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

      const main = document.body.querySelector("header")?.parentElement;
      if (main) {
        for (const child of main.children) {
          switch (child.tagName) {
            case "CODE":
            case "HEADER": {
              continue;
            }
          }

          if (child.hasAttribute("data-demo")) {
            continue;
          }

          child.textContent?.split(/[\s.:]/).forEach((word) => {
            word = word.trim().toLowerCase();
            if (word && !stopWords.includes(word)) {
              words.add(word);
            }
          });
        }
      }

      return {
        paths,
        section,
        title,
        words: Array.from(words)
      };
    },
    [stopWords]
  );

  records[path] = {
    path,
    section: result.section,
    text: result.words.join(" "),
    title: result.title
  };

  await Promise.all(
    result.paths
      .filter((current) => !records[current])
      .map((current) => {
        records[current] = {
          path: current,
          text: "",
          title: ""
        };

        return crawlPage({
          host,
          path: current,
          records
        });
      })
  );

  await browser.close();
}
