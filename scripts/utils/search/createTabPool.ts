import type { Browser, Page } from "puppeteer";

export type TabPool = ReturnType<typeof createTabPool>;

/**
 * Reuses browser tabs between page crawls.
 * Once a tab has loaded the docs site, later pages can be shown by navigating client-side,
 * which is much faster than reloading the app (and all of its modules, when crawling a dev server).
 */
export function createTabPool(browser: Browser) {
  const idle: { canNavigateClientSide: boolean; page: Page }[] = [];

  return {
    async acquire(): Promise<{ canNavigateClientSide: boolean; page: Page }> {
      const tab = idle.pop();
      if (tab) {
        return tab;
      }

      const page = await browser.newPage();
      page.on("console", (event) => console.log(event.text()));

      return { canNavigateClientSide: false, page };
    },

    /**
     * Returns a tab to the pool.
     * `canNavigateClientSide` should be true if the tab has loaded a site that reports rendered routes (see `RenderedRouteMarker`);
     * sites built with older versions of `AppRoot` don't, so their pages must be loaded in full.
     */
    release(page: Page, canNavigateClientSide: boolean) {
      idle.push({ canNavigateClientSide, page });
    }
  };
}
