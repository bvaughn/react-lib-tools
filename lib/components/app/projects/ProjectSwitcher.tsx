import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Suspense, use, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { clearFailedRead, read } from "./ProjectsCache";

const allProjectsUrl = "https://github.com/bvaughn?tab=repositories";

export function ProjectSwitcher({
  packageLogo,
  packageName,
  projectsUrl
}: {
  packageLogo: ReactNode;
  packageName: string;
  projectsUrl: string;
}) {
  const preload = () => {
    clearFailedRead(projectsUrl);
    read(projectsUrl).catch(() => {});
  };

  return (
    <Menu>
      <MenuButton
        className="group min-w-0 flex flex-row items-center gap-4 cursor-pointer border-none!"
        onClick={preload}
        onFocus={preload}
        onKeyDown={preload}
        onPointerEnter={preload}
      >
        {packageLogo}
        <div className="text-xl text-header-package-name font-bold truncate">
          {packageName}
        </div>
        <span className="sr-only">(other projects)</span>
        <ChevronDownIcon className="shrink-0 -ml-3 size-5 text-header-icons group-data-open:rotate-180 transition-transform" />
      </MenuButton>
      <MenuItems
        anchor="bottom start"
        className="z-30 flex flex-col w-80 max-w-[calc(100vw-1.5rem)] p-2 rounded-lg bg-black/80 backdrop-blur-md shadow-lg ring-1 ring-white/10 outline-none [--anchor-gap:0.5rem] origin-top transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0"
        modal={false}
        transition
      >
        <ErrorBoundary
          fallback={
            <>
              <div className="px-2 py-1" role="status">
                Projects are unavailable right now.
              </div>
              <AllProjectsLink />
            </>
          }
        >
          <Suspense
            fallback={<div className="px-2 py-1 text-white/60">Loading…</div>}
          >
            <div className="min-h-0 max-h-104 overflow-y-auto overscroll-contain [scrollbar-color:rgb(255_255_255/0.35)_transparent]">
              <ProjectList
                packageName={packageName}
                projectsUrl={projectsUrl}
              />
            </div>
            <AllProjectsLink />
          </Suspense>
        </ErrorBoundary>
      </MenuItems>
    </Menu>
  );
}

function AllProjectsLink() {
  return (
    <>
      <div className="shrink-0 my-2 border-t border-white/10" />
      <MenuItem>
        <a
          className="block px-2 py-1 rounded border-none! text-white/80 data-focus:bg-search-result-active data-focus:text-white"
          href={allProjectsUrl}
        >
          All projects on GitHub
        </a>
      </MenuItem>
    </>
  );
}

function ProjectList({
  packageName,
  projectsUrl
}: {
  packageName: string;
  projectsUrl: string;
}) {
  const projects = use(read(projectsUrl));

  // Links deliberately omit data-link, so the search index crawler doesn't follow them to other sites
  return projects.map(({ description, icon, name, url }, index) => {
    const isCurrent = name === packageName;

    return (
      <MenuItem key={index}>
        <a
          aria-current={isCurrent ? "page" : undefined}
          className="group flex flex-row items-center gap-3 px-2 py-1.5 rounded border-none! text-white/80 data-focus:bg-search-result-active data-focus:text-white"
          href={url}
        >
          <img
            alt=""
            className="shrink-0 size-6"
            onError={(event) => {
              event.currentTarget.style.visibility = "hidden";
            }}
            src={icon}
          />
          <div className="min-w-0">
            <div className="truncate text-white group-aria-[current=page]:text-nav-active group-aria-[current=page]:[-webkit-text-stroke:0.5px_currentColor]">
              {name}
            </div>
            {description && (
              <div className="truncate text-sm">{description}</div>
            )}
          </div>
        </a>
      </MenuItem>
    );
  });
}
