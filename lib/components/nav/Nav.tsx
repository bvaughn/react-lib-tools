import { matchPath, useLocation } from "react-router-dom";
import type {
  NavConfig,
  NavGroupConfig,
  NavLinkConfig,
  NavSectionConfig
} from "../../types";
import { NavLink } from "./NavLink";
import { NavSection } from "./NavSection";

export function Nav({ nav }: { nav: NavConfig }) {
  const { pathname } = useLocation();

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
          <NavSection
            isActive={containsPath(group.links, pathname)}
            key={index}
            label={group.title}
          >
            {group.links.map((link, linkIndex) =>
              "links" in link ? (
                <NavGroup group={link} key={linkIndex} pathname={pathname} />
              ) : (
                <NavItem key={link.path} link={link} />
              )
            )}
          </NavSection>
        )
      )}
    </nav>
  );
}

function NavGroup({
  group,
  pathname
}: {
  group: NavGroupConfig;
  pathname: string;
}) {
  return (
    <NavSection
      isActive={containsPath(group.links, pathname)}
      label={group.title}
      variant="group"
    >
      <NavLinks links={group.links} />
    </NavSection>
  );
}

function NavLinks({ links }: { links: NavLinkConfig[] }) {
  return links.map((link) => <NavItem key={link.path} link={link} />);
}

function NavItem({ link }: { link: NavLinkConfig }) {
  return (
    <div>
      <NavLink<string> path={link.path}>{link.navTitle ?? link.title}</NavLink>
      {link.children && (
        <div className="ml-4 border-l border-ink/10">
          <NavLinks links={link.children} />
        </div>
      )}
    </div>
  );
}

function containsPath(
  links: Array<NavGroupConfig | NavLinkConfig>,
  pathname: string
): boolean {
  return links.some((link) =>
    "links" in link
      ? containsPath(link.links, pathname)
      : matchPath(link.path, pathname) !== null ||
        (link.children !== undefined && containsPath(link.children, pathname))
  );
}
