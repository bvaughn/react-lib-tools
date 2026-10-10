import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { useEffect, useMemo, useRef } from "react";
import { cn } from "../../../utils/cn";
import { Link } from "../../Link";
import { renderHighlightedText } from "./renderHighlightedText";
import type { SearchResult } from "./search";

export function SiteSearchResult({
  isActive,
  result,
  searchTextDeferred
}: {
  isActive: boolean;
  result: SearchResult;
  searchTextDeferred: string;
}) {
  const ref = useRef<HTMLLIElement>(null);

  const { path, section, text, title } = useMemo(() => {
    const { heading, page } = result;

    // Sections within a page are shown as "Page title > Heading title"
    return {
      path: heading ? `${page.path}#${heading.id}` : page.path,
      section: renderHighlightedText(
        (heading ? page.title : page.section) ?? "",
        searchTextDeferred
      ),
      text: heading ? heading.text : page.text,
      title: renderHighlightedText(
        heading ? heading.title : page.title,
        searchTextDeferred
      )
    };
  }, [result, searchTextDeferred]);

  useEffect(() => {
    if (isActive) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }, [isActive]);

  return (
    <li ref={ref}>
      <Link
        className={cn(
          "rounded px-2 py-1 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer transition-colors!",
          "flex flex-row items-center gap-2 overflow-auto",
          {
            "bg-search-result-active hover:bg-search-result-active text-white":
              isActive
          }
        )}
        data-active-search-result={isActive || undefined}
        to={path}
      >
        <div className="grow-1 shrink-1 overflow-auto flex flex-col gap-1">
          <div className="grow text-lg truncate text-white">
            {section && (
              <>
                {section}
                <ChevronRightIcon className="size-4 text-slate-400 inline" />{" "}
              </>
            )}
            {title}
          </div>
          {text && <div className="text-sm truncate pb-1">{text}</div>}
        </div>
        <ChevronRightIcon className="h-4 w-4 shrink-0" />
      </Link>
    </li>
  );
}
