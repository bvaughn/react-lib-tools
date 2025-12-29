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
import TagsIcon from "../../../public/svgs/tags.svg?react";
import {
  LibraryContext,
  type LibraryContextType
} from "../../contexts/LibraryContext";
import { useNavStore } from "../../hooks/useNavStore";
import { cn } from "../../utils/cn";
import { Box } from "../Box";
import { ErrorBoundary } from "../ErrorBoundary";
import { ExternalLink } from "../ExternalLink";
import { Link } from "../Link";
import { Nav } from "../nav/Nav";
import { RouteChangeHandler } from "./components/RouteChangeHandler";
import { routes as defaultRoutes } from "./routes";

export function AppRoot({
  hideVersions = false,
  navLinks,
  overview,
  packageDescription,
  packageName,
  routes,
  showOpenCollectLink = false
}: {
  hideVersions?: boolean | undefined;
  navLinks: ReactNode;
  overview?: ReactNode | undefined;
  packageDescription: ReactNode;
  packageName: string;
  routes: Record<string, LazyExoticComponent<ComponentType<unknown>>>;
  showOpenCollectLink?: boolean | undefined;
}) {
  const { toggle, visible } = useNavStore();

  const context = useMemo<LibraryContextType>(
    () => ({ overview, packageName, showOpenCollectLink }),
    [overview, packageName, showOpenCollectLink]
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
            justify="between"
            gap={4}
          >
            <Box
              className="overflow-hidden"
              align="center"
              direction="row"
              gap={4}
            >
              <Link
                children={packageName}
                className="text-xl text-white! text-shadow-black/80 text-shadow-xs font-bold cursor-pointer truncate"
                to="/"
              />
              <div className="hidden md:block text-black text-shadow-white/50 text-shadow-xs">
                {packageDescription}
              </div>
            </Box>
            <Box align="center" direction="row" gap={4}>
              {hideVersions || (
                <Link
                  aria-label="Documentation for other versions"
                  className="text-xs font-bold text-white! drop-shadow-black/20 drop-shadow-sm cursor-pointer"
                  title="Past releases"
                  to="/versions"
                >
                  <TagsIcon className="w-6 h-6" />
                </Link>
              )}
              <ExternalLink
                aria-label="NPM project page"
                className="text-white! drop-shadow-black/20 drop-shadow-sm"
                href={`https://www.npmjs.com/package/${packageName}`}
                title="NPM package"
              >
                <NpmHubIcon className="w-8 h-8" />
              </ExternalLink>
              <ExternalLink
                aria-label="GitHub project page"
                className="text-white! drop-shadow-black/20 drop-shadow-sm"
                href={`https://github.com/bvaughn/${packageName}`}
                title="Source code"
              >
                <GitHubIcon className="w-6 h-6" />
              </ExternalLink>
              <button
                aria-label="Site navigation menu"
                className={cn("block md:hidden cursor-pointer rounded-lg p-1", {
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
