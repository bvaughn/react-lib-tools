import {
  Bars4Icon,
  MagnifyingGlassIcon,
  XMarkIcon
} from "@heroicons/react/20/solid";
import {
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
import { useLibraryContext } from "../../hooks/useLibraryContext";
import type { CommonQuestion } from "../../types";
import { cn } from "../../utils/cn";
import { Box } from "../Box";
import { ErrorBoundary } from "../ErrorBoundary";
import { Link } from "../Link";
import { HeaderButton } from "../nav/HeaderButton";
import { HeaderLink } from "../nav/HeaderLink";
import { Nav } from "../nav/Nav";
import { LibraryContextProvider } from "./components/LibraryContextProvider";
import { RouteChangeHandler } from "./components/RouteChangeHandler";
import { routes as defaultRoutes } from "./routes";
import { SiteSearchModal } from "./search/SiteSearchModal";

const siteSearchShortcutKey =
  typeof navigator !== "undefined" && navigator.userAgent.indexOf("Win") >= 0
    ? "^K"
    : "⌘K";

/**
 * Displays an application shell with desktop and mobile layouts.
 */
export function AppRoot({
  enableSiteSearch,
  navLinks,
  routes,
  ...context
}: {
  commonQuestions?: CommonQuestion[];
  enableSiteSearch?: boolean | undefined;
  navLinks: ReactNode;
  overview?: ReactNode | undefined;
  packageDescription: string;
  packageName: string;
  repositoryUrl: string;
  routes: Record<string, LazyExoticComponent<ComponentType<unknown>>>;
  showOpenCollectLink?: boolean | undefined;
  versions?: Versions | undefined;
}) {
  return (
    <LibraryContextProvider {...context}>
      <App
        enableSiteSearch={enableSiteSearch}
        navLinks={navLinks}
        routes={routes}
      />
    </LibraryContextProvider>
  );
}

function App({
  enableSiteSearch,
  navLinks,
  routes
}: {
  enableSiteSearch?: boolean | undefined;
  navLinks: ReactNode;
  routes: Record<string, LazyExoticComponent<ComponentType<unknown>>>;
}) {
  const {
    isNavVisible,
    isSiteSearchVisible,
    packageDescription,
    packageName,
    setIsNavVisible,
    setIsSiteSearchVisible,
    versions
  } = useLibraryContext();

  return (
    <BrowserRouter>
      <RouteChangeHandler />

      <div className="h-full w-full max-w-350 mx-auto flex flex-col">
        <Box align="center" className="h-12 w-full p-4" direction="row" gap={4}>
          <ReactLogoIcon className="shrink-0 w-8 h-8" />
          <Box
            className="overflow-hidden"
            align="center"
            direction="row"
            gap={4}
          >
            <Link
              children={packageName}
              className="text-xl text-header-package-name! font-bold cursor-pointer truncate"
              to="/"
            />
            <div className="hidden md:block text-header-package-description">
              {packageDescription}
            </div>
          </Box>
          <div className="grow" />
          <Box align="center" direction="row" gap={4}>
            {enableSiteSearch && (
              <HeaderButton
                isActive={isSiteSearchVisible}
                onClick={() => setIsSiteSearchVisible(!isSiteSearchVisible)}
                title="Site search"
              >
                <div className="h-8 flex items-center justify-center gap-1 px-2 rounded-full text-sm bg-black/40 hover:bg-black/60 transition-colors!">
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  {siteSearchShortcutKey}
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
        <div className="grow shrink flex flex-row shadow-lg mx-2 rounded-t-3xl overflow-hidden">
          <section
            className={cn(
              "w-full bg-black/90 md:block md:w-80 md:bg-black/80 overflow-hidden",
              {
                hidden: !isNavVisible
              }
            )}
          >
            <Nav children={navLinks} />
          </section>
          <main
            className={cn("w-full bg-black/90 relative overflow-auto", {
              hidden: isNavVisible
            })}
          >
            <div
              className="h-full p-4 py-4 overflow-auto [mask-image:linear-gradient(to_bottom,transparent,black_1.5rem)]"
              data-main-scrollable
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
            </div>
          </main>
        </div>
      </div>

      {enableSiteSearch && <SiteSearchModal />}
    </BrowserRouter>
  );
}
