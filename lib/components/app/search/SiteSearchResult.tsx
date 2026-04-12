import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { useEffect, useMemo, useRef } from "react";
import type { SiteMapPage } from "../../../../types";
import { cn } from "../../../utils/cn";
import { Link } from "../../Link";
import { renderHighlightedText } from "./renderHighlightedText";

export function SiteSearchResult({
  isActive,
  result,
  searchTextDeferred
}: {
  isActive: boolean;
  result: SiteMapPage;
  searchTextDeferred: string;
}) {
  const ref = useRef<HTMLLIElement>(null);

  const { section, text, title } = useMemo(
    () => ({
      section: renderHighlightedText(result.section ?? "", searchTextDeferred),
      text: result.text,
      title: renderHighlightedText(result.title, searchTextDeferred)
    }),
    [result, searchTextDeferred]
  );

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
            "bg-sky-950 hover:bg-sky-950 text-white": isActive
          }
        )}
        data-active-search-result={isActive || undefined}
        to={result.path}
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
