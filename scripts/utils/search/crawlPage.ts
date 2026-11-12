import type { SiteMapPage } from "../../../types";
import type { TabPool } from "./createTabPool";
import { scheduleWork } from "./scheduleWork";

/**
 * Loads a page of the docs site in a headless browser and records its searchable content in the site map,
 * then schedules crawls of any pages it links to (via `data-link`) that haven't been seen yet.
 *
 * For each page this records:
 * - its title and section, from the `[data-title]` and `[data-section]` elements rendered by `Header`
 * - the text of the main content (`[data-main-scrollable]`), minus elements marked `data-search-ignore`
 *   and anything matching `filterSelector`
 * - the text of each `[data-toc]` heading's section, separately, so sections can be returned as their own results
 */
export async function crawlPage({
  filterSelector,
  host,
  path,
  siteMap,
  tabPool
}: {
  filterSelector?: string | undefined;
  host: string;
  path: string;
  siteMap: Record<string, SiteMapPage>;
  tabPool: TabPool;
}) {
  console.log(`Crawling ${host}${path} ...`);

  const { canNavigateClientSide, page } = await tabPool.acquire();

  // Poll on DOM mutations while waiting; the default (requestAnimationFrame) doesn't run in background tabs
  if (canNavigateClientSide) {
    // Navigate client-side (the router listens for "popstate") rather than reloading the app
    await page.evaluate((path) => {
      history.pushState(null, "", path);
      dispatchEvent(new PopStateEvent("popstate"));
    }, path);

    // The previous page's content remains visible until the next page has rendered (navigation happens in a transition)
    await page.waitForFunction(
      (path) =>
        document.documentElement.getAttribute("data-rendered-path") === path &&
        document.querySelector("[data-route-loading]") === null,
      { polling: "mutation" },
      path
    );
  } else {
    await page.goto(`${host}${path}`);

    // Wait for the page's (lazy loaded) content, not just the app shell
    await page.waitForFunction(
      () =>
        document.querySelector("main") !== null &&
        document.querySelector("[data-route-loading]") === null,
      { polling: "mutation" }
    );
  }

  // Sites built with older versions of AppRoot don't report rendered routes, so can't be navigated client-side
  const reportsRenderedRoutes = await page.evaluate(() =>
    document.documentElement.hasAttribute("data-rendered-path")
  );

  const result = await page.evaluate(
    async ([HTML_ENTITIES, HEADING_MARKER, filterSelector]) => {
      const paths: string[] = [];
      for (const element of document.body.querySelectorAll("[data-link]")) {
        const to = element.getAttribute("data-link");
        if (to) {
          paths.push(to.split("#")[0]);
        }
      }

      // Work on a copy of the page so that React's DOM is left intact for the next (client-side) navigation
      const body = document.body.cloneNode(true) as HTMLElement;

      const sectionElement = body.querySelector("header [data-section]");
      if (sectionElement) {
        sectionElement.parentElement?.removeChild(sectionElement);
      }
      const section = sectionElement?.textContent || undefined;

      const titleElement = body.querySelector("header [data-title]");
      if (titleElement) {
        titleElement.parentElement?.removeChild(titleElement);
      }
      const title = titleElement?.textContent ?? "";

      let text = "";
      const headings: { id: string; title: string }[] = [];

      const main = body.querySelector("[data-main-scrollable]");
      if (main) {
        // Remove site chrome that shouldn't be indexed (e.g. previous/next page links)
        for (const element of main.querySelectorAll("[data-search-ignore]")) {
          element.parentElement?.removeChild(element);
        }

        // Pre-convert content inside of (inline) <code> elements into plain text;
        // code blocks (the Code component) are marked data-search-ignore and were removed above
        for (const code of main.querySelectorAll("code")) {
          // eslint-disable-next-line no-self-assign
          code.textContent = code.textContent;
        }

        // Mark the start of each heading (same as the "On this page" contents) so the text can be split into sections
        for (const element of main.querySelectorAll<HTMLElement>(
          "[data-toc][id]"
        )) {
          if (filterSelector && element.closest(filterSelector)) {
            continue;
          }

          headings.push({
            id: element.id,
            title: (
              element.dataset.tocTitle ??
              element.textContent ??
              ""
            ).trim()
          });
          element.before(HEADING_MARKER);
        }

        text = main.innerHTML;

        // Filter out special content (e.g. lorem ipsum type text)
        if (filterSelector) {
          const matches = body.querySelectorAll(filterSelector);
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

      const [intro, ...sectionTexts] = text.split(HEADING_MARKER);

      return {
        headings: headings
          .map((heading, index) => ({
            ...heading,
            text: sectionTexts[index]?.trim() ?? ""
          }))
          // Skip headings with no content of their own (e.g. a "Required props" label)
          .filter((heading) => heading.text !== heading.title),
        paths,
        section,
        text: intro.trim(),
        title
      };
    },
    [HTML_ENTITIES, HEADING_MARKER, filterSelector] as const
  );

  siteMap[path] = {
    headings: result.headings.length > 0 ? result.headings : undefined,
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

  tabPool.release(page, reportsRenderedRoutes);

  scheduleWork(
    ...filteredPaths.map(
      (current) => () =>
        crawlPage({
          filterSelector,
          host,
          path: current,
          siteMap,
          tabPool
        })
    )
  );
}

// Private use character that won't appear in page content
const HEADING_MARKER = "\uE000";

const HTML_ENTITIES: { [chars: string]: string } = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#039;": "'",
  "&ndash;": "-",
  "&nbsp;": " "
};
