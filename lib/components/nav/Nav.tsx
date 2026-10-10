import { useMatch } from "react-router-dom";
import type { NavConfig, NavLinkConfig, NavSectionConfig } from "../../types";
import { NavLink } from "./NavLink";
import { NavSection } from "./NavSection";
import { PageContents } from "./PageContents";

export function Nav({ nav }: { nav: NavConfig }) {
  // Group consecutive top-level links so they render as a single block
  const groups: Array<NavLinkConfig[] | NavSectionConfig> = [];
  for (const item of nav) {
    if ("links" in item) {
      groups.push(item);
    } else {
      const last = groups[groups.length - 1];
      if (Array.isArray(last)) {
        last.push(item);
      } else {
        groups.push([item]);
      }
    }
  }

  return (
    <nav
      className="w-full shrink-0 flex flex-col gap-4 py-4 h-full overflow-y-auto"
      data-sidebar-scroller
    >
      {groups.map((group, index) =>
        Array.isArray(group) ? (
          <div key={index}>
            <NavLinks links={group} />
          </div>
        ) : (
          <NavSection key={index} label={group.title}>
            <NavLinks links={group.links} />
          </NavSection>
        )
      )}
    </nav>
  );
}

function NavLinks({ links }: { links: NavLinkConfig[] }) {
  return links.map((link) => <NavItem key={link.path} link={link} />);
}

function NavItem({ link }: { link: NavLinkConfig }) {
  const isActive = !!useMatch(link.path);

  return (
    <div>
      <NavLink<string> path={link.path}>{link.title}</NavLink>
      {isActive && <PageContents />}
      {link.children && (
        <div className="ml-4 border-l border-white/10">
          <NavLinks links={link.children} />
        </div>
      )}
    </div>
  );
}
