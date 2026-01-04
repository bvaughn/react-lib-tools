import { Bars4Icon, XMarkIcon } from "@heroicons/react/20/solid";
import {
  useMemo,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode
} from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import GitHubIcon from "../../../public/svgs/github.svg?react";
import NpmHubIcon from "../../../public/svgs/npm.svg?react";
import ReactLogoIcon from "../../../public/svgs/react-simplified.svg?react";
import TagsIcon from "../../../public/svgs/tags.svg?react";
import {
  LibraryContext,
  type LibraryContextType,
  type Versions
} from "../../contexts/LibraryContext";
import { useNavStore } from "../../hooks/useNavStore";
import type { CommonQuestion } from "../../types";
import { cn } from "../../utils/cn";
import { Box } from "../Box";
import { ErrorBoundary } from "../ErrorBoundary";
import { ExternalLink } from "../ExternalLink";
import { Link } from "../Link";
import { Nav } from "../nav/Nav";
import { Tooltip } from "../Tooltip";
import { RouteChangeHandler } from "./components/RouteChangeHandler";
import { routes as defaultRoutes } from "./routes";

/**
 * Displays an application shell with desktop and mobile layouts.
 */
export function AppRoot({
  commonQuestions,
  navLinks,
  overview,
  packageDescription,
  packageName,
  routes,
  showOpenCollectLink = false,
  versions
}: {
  commonQuestions?: CommonQuestion[];
  navLinks: ReactNode;
  overview?: ReactNode | undefined;
  packageDescription: string;
  packageName: string;
  routes: Record<string, LazyExoticComponent<ComponentType<unknown>>>;
  showOpenCollectLink?: boolean | undefined;
  versions?: Versions | undefined;
}) {
  const { toggle, visible } = useNavStore();

  const context = useMemo<LibraryContextType>(
    () => ({
      commonQuestions,
      overview,
      packageDescription,
      packageName,
      showOpenCollectLink,
      versions
    }),
    [
      commonQuestions,
      overview,
      packageDescription,
      packageName,
      showOpenCollectLink,
      versions
    ]
  );

  return (
    <LibraryContext.Provider value={context}>
      <BrowserRouter>
        <RouteChangeHandler />

        <div className="h-full w-full max-w-350 mx-auto flex flex-col">
          <Box
            align="center"
            className="h-12 w-full p-4"
            direction="row"
            gap={4}
          >
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
              {versions !== undefined && (
                <Tooltip content="Previous versions">
                  <Link
                    aria-label="Documentation for other versions"
                    className="text-xs font-bold text-header-icons! cursor-pointer"
                    to="/versions"
                  >
                    <TagsIcon className="w-6 h-6" />
                  </Link>
                </Tooltip>
              )}
              <Tooltip content="NPM package">
                <ExternalLink
                  aria-label="NPM project page"
                  className="text-header-icons!"
                  href={`https://www.npmjs.com/package/${packageName}`}
                >
                  <NpmHubIcon className="w-8 h-8" />
                </ExternalLink>
              </Tooltip>
              <Tooltip content="Source code">
                <ExternalLink
                  aria-label="GitHub project page"
                  className="text-header-icons!"
                  href={`https://github.com/bvaughn/${packageName}`}
                >
                  <GitHubIcon className="w-6 h-6" />
                </ExternalLink>
              </Tooltip>
              <Tooltip
                className="block md:hidden"
                content={visible ? "Hide menu" : "Show menu"}
              >
                <button
                  aria-label="Site navigation menu"
                  className={cn("cursor-pointer rounded-lg p-1", {
                    "bg-black/40": !visible,
                    "bg-black/50 text-white": visible
                  })}
                  onClick={toggle}
                >
                  {visible ? (
                    <XMarkIcon className="w-6 h-6 fill-current drop-shadow-black/20 drop-shadow-xs" />
                  ) : (
                    <Bars4Icon className="w-6 h-6 fill-current drop-shadow-black/20 drop-shadow-xs" />
                  )}
                </button>
              </Tooltip>
            </Box>
          </Box>
          <div className="grow shrink flex flex-row shadow-lg mx-2 rounded-t-3xl overflow-hidden">
            <section
              className={cn(
                "w-full bg-black/90 md:block md:w-80 md:bg-black/80 overflow-auto",
                {
                  hidden: !visible
                }
              )}
            >
              <Nav children={navLinks} />
            </section>
            <main
              className={cn("w-full bg-black/90 relative overflow-auto", {
                hidden: visible
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
      </BrowserRouter>
    </LibraryContext.Provider>
  );
}
