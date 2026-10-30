import type { NavConfig, NavLinkConfig } from "../types";

export type FlatNavItem = {
  /** Title of the group (within a section) this link is in, if any */
  group?: string | undefined;
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
    group: string | undefined,
    parent: string | undefined
  ) => {
    if (!paths.has(link.path)) {
      paths.add(link.path);
      items.push({
        ...(group !== undefined && { group }),
        parent,
        path: link.path,
        section,
        title: link.title
      });
    }

    link.children?.forEach((child) => visit(child, section, group, link.title));
  };

  for (const item of nav) {
    if ("links" in item) {
      for (const link of item.links) {
        if ("links" in link) {
          link.links.forEach((groupLink) =>
            visit(groupLink, item.title, link.title, undefined)
          );
        } else {
          visit(link, item.title, undefined, undefined);
        }
      }
    } else {
      visit(item, undefined, undefined, undefined);
    }
  }

  return items;
}
