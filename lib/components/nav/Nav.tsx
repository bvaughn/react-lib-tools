import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { useId, useState } from "react";
import { matchPath, useLocation, useMatch } from "react-router-dom";
import { cn } from "../../utils/cn";
import type { NavConfig, NavLinkConfig, NavSectionConfig } from "../../types";
import { NavLink } from "./NavLink";
import { NavSection } from "./NavSection";
import { PageContents } from "./PageContents";
import { MIN_PAGE_ENTRIES, usePageEntries } from "./usePageEntries";

export function Nav({
  collapseSections = false,
  nav
}: {
  collapseSections?: boolean | undefined;
  nav: NavConfig;
}) {
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
            isActive={
              collapseSections ? containsPath(group.links, pathname) : true
            }
            key={index}
            label={group.title}
          >
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
      {isActive ? (
        <CurrentPageNavItem link={link} />
      ) : (
        <NavLink<string> path={link.path}>
          {link.navTitle ?? link.title}
        </NavLink>
      )}
      {link.children && (
        <div className="ml-4 border-l border-ink/10">
          <NavLinks links={link.children} />
        </div>
      )}
    </div>
  );
}

/**
 * The current page's link, followed by its contents list (if it has one).
 * The list is expanded when the page opens; like a section header, clicking the link collapses (or expands) it,
 * e.g. to see the links below a long list.
 */
function CurrentPageNavItem({ link }: { link: NavLinkConfig }) {
  const entries = usePageEntries();
  const [isExpanded, setIsExpanded] = useState(true);
  const contentsId = useId();
  const label = link.navTitle ?? link.title;

  if (entries.length < MIN_PAGE_ENTRIES) {
    return <NavLink<string> path={link.path}>{label}</NavLink>;
  }

  return (
    <div data-current-page>
      <div className="group relative">
        <NavLink<string>
          aria-controls={contentsId}
          aria-expanded={isExpanded}
          className="pr-10"
          onClick={(event) => {
            // Modified clicks (e.g. open in new tab) still navigate
            if (
              event.button === 0 &&
              !event.altKey &&
              !event.ctrlKey &&
              !event.metaKey &&
              !event.shiftKey
            ) {
              event.preventDefault();
              setIsExpanded(!isExpanded);
            }
          }}
          path={link.path}
        >
          {label}
        </NavLink>
        <ChevronRightIcon
          aria-hidden
          className={cn(
            "absolute top-1/2 right-4 -translate-y-1/2 size-4 pointer-events-none fill-ink/60 group-hover:fill-ink",
            { "rotate-90": isExpanded }
          )}
        />
      </div>
      <div id={contentsId}>
        {isExpanded && <PageContents entries={entries} />}
      </div>
    </div>
  );
}

function containsPath(links: NavLinkConfig[], pathname: string): boolean {
  return links.some(
    (link) =>
      matchPath(link.path, pathname) !== null ||
      (link.children !== undefined && containsPath(link.children, pathname))
  );
}
