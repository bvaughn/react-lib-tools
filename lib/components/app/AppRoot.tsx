import {
  Bars4Icon,
  MagnifyingGlassIcon,
  XMarkIcon
} from "@heroicons/react/20/solid";
import {
  Suspense,
  useMemo,
  useRef,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode
} from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import GitHubIcon from "../../../public/svgs/github.svg?react";
import NpmHubIcon from "../../../public/svgs/npm.svg?react";
import ReactLogoIcon from "../../../public/svgs/react-simplified.svg?react";
import TagsIcon from "../../../public/svgs/tags.svg?react";
import { type Versions } from "../../contexts/LibraryContext";
import { useCardEdges } from "../../hooks/useCardEdges";
import { useLibraryContext } from "../../hooks/useLibraryContext";
import { useNavScrollPosition } from "../../hooks/useNavScrollPosition";
import type { CommonQuestion, NavConfig } from "../../types";
import { cn } from "../../utils/cn";
import { flattenNav } from "../../utils/flattenNav";
import { Box } from "../Box";
import { ErrorBoundary } from "../ErrorBoundary";
import { LoadingSpinner } from "../LoadingSpinner";
import { HeaderButton } from "../nav/HeaderButton";
import { HeaderLink } from "../nav/HeaderLink";
import { Nav } from "../nav/Nav";
import { PageNavigation } from "../nav/PageNavigation";
import { LibraryContextProvider } from "./components/LibraryContextProvider";
import { RouteChangeHandler } from "./components/RouteChangeHandler";
import { ProjectSwitcher } from "./projects/ProjectSwitcher";
import { routes as defaultRoutes } from "./routes";
import { SiteSearchModal } from "./search/SiteSearchModal";

/** Shared by every docs site, so adding a project doesn't require updating each of them */
const defaultProjectsUrl = "https://react-lib-tools.vercel.app/projects.json";

const siteSearchShortcutKey =
  typeof navigator !== "undefined" && navigator.userAgent.indexOf("Win") >= 0
    ? "^K"
    : "⌘K";

/**
 * Documentation site shell: header, sidebar navigation, previous/next page links, site search, and routing.
 * Renders your pages (`routes`) along with a few default pages (getting started, common questions, support, versions, and not found).
 */
export function AppRoot({
  collapseNavSections,
  enableSiteSearch,
  nav,
  projectsUrl = defaultProjectsUrl,
  routes,
  ...context
}: {
  /** Collapse sidebar nav sections by default, except for the one containing the current page */
  collapseNavSections?: boolean | undefined;
  /** Questions and answers shown on the "/common-questions" page */
  commonQuestions?: CommonQuestion[];
  /**
   * Show the search button and enable the Cmd/Ctrl+K shortcut.
   * Requires a search index at "/generated/site-map.json" (see `compileSearchIndex`).
   */
  enableSiteSearch?: boolean | undefined;
  /** Site navigation, in reading order; drives the sidebar and previous/next page links */
  nav: NavConfig;
  /** Introduction shown on the getting started ("/") page */
  overview?: ReactNode | undefined;
  /** Short description shown in the header when the project menu is disabled (`projectsUrl={false}`) */
  packageDescription: string;
  /** Logo shown in the header; defaults to the React logo */
  packageLogo?: ReactNode;
  /** npm package name; shown in the header and used for the npm link and installation instructions */
  packageName: string;
  /** URL of the GitHub repository; used to link to source files from props pages */
  repositoryUrl: string;
  /**
   * URL of a JSON list of related projects (`{ name, description, url, icon? }[]`), shown in a menu opened from the header's package name.
   * Defaults to the list shared by all of bvaughn's docs sites; pass `false` to disable the menu.
   */
  projectsUrl?: string | false | undefined;
  /** Pages of the site, by path; these can also replace the default pages */
  routes: Record<string, LazyExoticComponent<ComponentType<unknown>>>;
  /** Add an Open Collective sponsorship link to the getting started page */
  showOpenCollectLink?: boolean | undefined;
  /** Documentation URLs for older releases, by version number; adds a "/versions" page and a link to it in the header */
  versions?: Versions | undefined;
}) {
  return (
    <LibraryContextProvider {...context}>
      <App
        collapseNavSections={collapseNavSections}
        enableSiteSearch={enableSiteSearch}
        nav={nav}
        projectsUrl={projectsUrl}
        routes={routes}
      />
    </LibraryContextProvider>
  );
}

function App({
  collapseNavSections,
  enableSiteSearch,
  nav,
  projectsUrl,
  routes
}: {
  collapseNavSections?: boolean | undefined;
  enableSiteSearch?: boolean | undefined;
  nav: NavConfig;
  projectsUrl: string | false;
  routes: Record<string, LazyExoticComponent<ComponentType<unknown>>>;
}) {
  const {
    isNavVisible,
    isSiteSearchVisible,
    packageDescription,
    packageLogo,
    packageName,
    setIsNavVisible,
    setIsSiteSearchVisible,
    versions
  } = useLibraryContext();

  const logo = (
    <div className="shrink-0 flex">
      {packageLogo ?? <ReactLogoIcon className="w-8 h-8" />}
    </div>
  );

  const flatNav = useMemo(() => flattenNav(nav), [nav]);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  useCardEdges(scrollerRef, cardRef);
  useNavScrollPosition(scrollerRef, isNavVisible);

  return (
    <BrowserRouter>
      <RouteChangeHandler />

      <div className="h-full w-full flex flex-col">
        <Box
          align="center"
          className="shrink-0 h-15 w-full max-w-350 mx-auto px-3 py-2.5 sm:px-5"
          data-app-header
          direction="row"
          gap={4}
        >
          {/* The project menu replaces the description, which looked out of place beside the menu's caret */}
          {projectsUrl === false ? (
            <Box className="min-w-0" align="center" direction="row" gap={4}>
              {logo}
              <div className="text-xl text-header-package-name font-bold truncate">
                {packageName}
              </div>
              <div className="hidden md:block truncate font-medium text-header-package-description text-shadow-xs text-shadow-black/40">
                {packageDescription}
              </div>
            </Box>
          ) : (
            <ProjectSwitcher
              packageLogo={logo}
              packageName={packageName}
              projectsUrl={projectsUrl}
            />
          )}
          <div className="grow" />
          <Box align="center" direction="row" gap={4}>
            {enableSiteSearch && (
              <HeaderButton
                isActive={isSiteSearchVisible}
                onClick={() => setIsSiteSearchVisible(!isSiteSearchVisible)}
                title="Site search"
              >
                <div className="h-8 flex items-center justify-center gap-1 px-2 rounded-full text-sm text-white bg-black/40 hover:bg-black/60 transition-colors!">
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  {/* Keyboard shortcuts don't apply on touch-sized screens */}
                  <span className="hidden sm:inline">
                    {siteSearchShortcutKey}
                  </span>
                </div>
              </HeaderButton>
            )}
            {versions !== undefined && (
              <HeaderLink
                ariaLabel="Documentation for other versions"
                children={<TagsIcon className="w-6 h-6" />}
                title="Previous versions"
                to="/versions"
              />
            )}
            <HeaderLink
              ariaLabel="NPM project page"
              children={<NpmHubIcon className="w-8 h-8" />}
              className="hidden sm:block"
              href={`https://www.npmjs.com/package/${packageName}`}
              title="NPM package"
            />
            <HeaderLink
              ariaLabel="GitHub project page"
              children={<GitHubIcon className="w-6 h-6" />}
              className="hidden sm:block"
              href={`https://github.com/bvaughn/${packageName}`}
              title="Source code"
            />
            <HeaderButton
              ariaLabel="Site navigation menu"
              className="block md:hidden"
              isActive={isNavVisible}
              onClick={() => setIsNavVisible(!isNavVisible)}
              title={isNavVisible ? "Hide menu" : "Show menu"}
            >
              {isNavVisible ? (
                <XMarkIcon className="w-6 h-6 fill-current drop-shadow-black/20 drop-shadow-xs" />
              ) : (
                <Bars4Icon className="w-6 h-6 fill-current drop-shadow-black/20 drop-shadow-xs" />
              )}
            </HeaderButton>
          </Box>
        </Box>
        {/* Everything below the header scrolls as one page, so the scrollbar sits at the window edge */}
        <div
          className="grow min-h-0 overflow-y-auto [scrollbar-color:rgb(255_255_255/0.35)_transparent]"
          data-app-scroller
          ref={scrollerRef}
        >
          <div className="min-h-full w-full max-w-350 mx-auto flex flex-col">
            <div
              className="grow flex flex-row shadow-lg mx-2 rounded-t-3xl overflow-clip"
              ref={cardRef}
            >
              <section
                className={cn(
                  "w-full bg-black/90 md:block md:w-72 md:shrink-0 md:bg-black/80",
                  {
                    hidden: !isNavVisible
                  }
                )}
              >
                {/* Sticks below the header (h-15) while the page scrolls */}
                <div className="sticky top-0 h-[calc(100dvh-3.75rem)]">
                  <Nav collapseSections={collapseNavSections} nav={nav} />
                </div>
              </section>
              <main
                className={cn("w-full min-w-0 bg-black/90 relative md:block", {
                  hidden: isNavVisible
                })}
              >
                <div
                  className="text-base md:text-[15px] leading-relaxed px-4 pt-7 pb-14 md:px-8 md:pt-9 md:pb-16 xl:px-10"
                  data-main-scrollable
                >
                  {/*
                    Routes are lazy loaded; without this boundary nothing (not even the header or nav) would render until the first one loads.
                    Navigation happens in a transition, so later route changes keep showing the current page rather than this fallback.
                  */}
                  <Suspense
                    fallback={
                      // The search index crawler waits for this to go away before reading the page
                      <div data-route-loading>
                        <LoadingSpinner />
                      </div>
                    }
                  >
                    <Routes>
                      {Object.entries({
                        ...defaultRoutes,
                        ...routes
                      }).map(([path, Component]) => (
                        <Route
                          element={
                            <ErrorBoundary key={path}>
                              <Component />
                            </ErrorBoundary>
                          }
                          key={path}
                          path={path}
                        />
                      ))}
                    </Routes>
                    <PageNavigation items={flatNav} />
                  </Suspense>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>

      {enableSiteSearch && <SiteSearchModal flatNav={flatNav} />}
    </BrowserRouter>
  );
}
