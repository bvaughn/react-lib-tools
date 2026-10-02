import type { NavConfig, NavLinkConfig } from "../types";

export type FlatNavItem = {
  /** Title of the link this one is nested under, if any */
  parent: string | undefined;
  path: string;
  section: string | undefined;
  title: string;
};

/**
 * Flattens nav config into reading order (depth first), skipping duplicate paths.
 */
export function flattenNav(nav: NavConfig): FlatNavItem[] {
  const items: FlatNavItem[] = [];
  const paths = new Set<string>();

  const visit = (
    link: NavLinkConfig,
    section: string | undefined,
    parent: string | undefined
  ) => {
    if (!paths.has(link.path)) {
      paths.add(link.path);
      items.push({ parent, path: link.path, section, title: link.title });
    }

    link.children?.forEach((child) => visit(child, section, link.title));
  };

  for (const item of nav) {
    if ("links" in item) {
      item.links.forEach((link) => visit(link, item.title, undefined));
    } else {
      visit(item, undefined, undefined);
    }
  }

  return items;
}
