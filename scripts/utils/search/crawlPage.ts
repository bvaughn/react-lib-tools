import puppeteer from "puppeteer";
import type { SiteMapPage } from "../../../types";
import { scheduleWork } from "./scheduleWork";

export async function crawlPage({
  chromeExecutablePath,
  filterSelector,
  host,
  path,
  siteMap
}: {
  chromeExecutablePath?: string | undefined;
  filterSelector?: string | undefined;
  host: string;
  path: string;
  siteMap: Record<string, SiteMapPage>;
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
    async ([HTML_ENTITIES, filterSelector]) => {
      const paths: string[] = [];
      for (const element of document.body.querySelectorAll("[data-link]")) {
        const to = element.getAttribute("data-link");
        if (to) {
          paths.push(to.split("#")[0]);
        }
      }

      const sectionElement = document.body.querySelector(
        "header [data-section]"
      );
      if (sectionElement) {
        sectionElement.parentElement?.removeChild(sectionElement);
      }
      const section = sectionElement?.textContent || undefined;

      const titleElement = document.body.querySelector("header [data-title]");
      if (titleElement) {
        titleElement.parentElement?.removeChild(titleElement);
      }
      const title = titleElement?.textContent ?? "";

      let text = "";

      const main = document.body.querySelector("[data-main-scrollable]");
      if (main) {
        // Pre-convert content inside of <code> blocks (example code) into plain text
        for (const code of main.querySelectorAll("code")) {
          // eslint-disable-next-line no-self-assign
          code.textContent = code.textContent;
        }

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
        for (const chars in HTML_ENTITIES) {
          text = text.replaceAll(chars, HTML_ENTITIES[chars]);
        }

        // Remove excess white space
        text = text.replaceAll(/ {2,}/g, " ");
      }

      return {
        paths,
        section,
        text,
        title
      };
    },
    [HTML_ENTITIES, filterSelector] as const
  );

  siteMap[path] = {
    path,
    section: result.section,
    text: result.text,
    title: result.title
  };

  const filteredPaths = result.paths.filter((current) => {
    if (!siteMap[current]) {
      siteMap[current] = {
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
          siteMap
        })
    )
  );
}

const HTML_ENTITIES: { [chars: string]: string } = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#039;": "'",
  "&ndash;": "-",
  "&nbsp;": " "
};
