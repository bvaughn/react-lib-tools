export interface SiteMapHeading {
  id: string;
  text: string;
  title: string;
}

export interface SiteMapPage {
  /** Sections of the page marked with data-toc (e.g. individual props); their text is not repeated in the page's text */
  headings?: SiteMapHeading[] | undefined;
  path: string;
  section?: string | undefined;
  text: string;
  title: string;
}
