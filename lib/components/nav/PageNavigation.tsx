import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/20/solid";
import { useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";
import type { FlatNavItem } from "../../utils/flattenNav";
import { Link } from "../Link";

export function PageNavigation({ items }: { items: FlatNavItem[] }) {
  const { pathname } = useLocation();

  const normalizedPathname = pathname.replace(/\/+$/, "") || "/";
  const index = items.findIndex((item) => item.path === normalizedPathname);
  if (index < 0) {
    return null;
  }

  const current = items[index];
  const previous = items[index - 1];
  const next = items[index + 1];
  if (!previous && !next) {
    return null;
  }

  return (
    <nav
      aria-label="Previous and next pages"
      className="mt-12 grid grid-cols-2 gap-2 sm:gap-3"
      data-search-ignore
    >
      {previous && (
        <PageNavigationLink
          currentSection={current.section}
          direction="previous"
          item={previous}
        />
      )}
      {next && (
        <PageNavigationLink
          className={previous ? undefined : "col-start-2"}
          currentSection={current.section}
          direction="next"
          item={next}
        />
      )}
    </nav>
  );
}

function PageNavigationLink({
  className,
  currentSection,
  direction,
  item
}: {
  className?: string | undefined;
  currentSection: string | undefined;
  direction: "next" | "previous";
  item: FlatNavItem;
}) {
  const isNext = direction === "next";
  const Icon = isNext ? ArrowRightIcon : ArrowLeftIcon;

  // Context shown above the title: the section (only when navigating into a different one)
  // and the parent page for nested links, whose titles are often ambiguous on their own
  const context = [
    item.section !== currentSection ? item.section : undefined,
    item.parent
  ]
    .filter(Boolean)
    .join(" › ");

  const label = (
    <span className="shrink-0 flex items-center gap-1.5 text-sm text-white/60 group-hover:text-white/80">
      {isNext ? (
        <>
          <span className="sr-only sm:not-sr-only">Next</span>
          <Icon className="size-4" />
        </>
      ) : (
        <>
          <Icon className="size-4" />
          <span className="sr-only sm:not-sr-only">Previous</span>
        </>
      )}
    </span>
  );

  const title = (
    <span
      className={cn("min-w-0 flex flex-col", {
        "items-start text-left": isNext,
        "items-end text-right": !isNext
      })}
    >
      {context && <span className="text-sm text-white/40">{context}</span>}
      <span className="font-semibold text-white md:text-lg leading-snug wrap-break-word">
        {item.title}
      </span>
    </span>
  );

  return (
    <Link
      className={cn(
        "group flex items-center justify-between gap-2 sm:gap-4 rounded-md px-3 py-3 sm:px-5 sm:py-4 shadow-md shadow-black/30",
        "bg-white/10 hover:bg-white/15 active:bg-white/20",
        className
      )}
      to={item.path}
    >
      {isNext ? (
        <>
          {title}
          {label}
        </>
      ) : (
        <>
          {label}
          {title}
        </>
      )}
    </Link>
  );
}
