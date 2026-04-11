import { ChevronRightIcon } from "@heroicons/react/20/solid";
import type { FuseResult } from "fuse.js";
import { useEffect, useMemo, useRef } from "react";
import { cn } from "../../../utils/cn";
import { Link } from "../../Link";
import { renderHighlightedText } from "./renderHighlightedText";
import type { SiteSearchRecord } from "./SiteSearchTypes";

export function SiteSearchResult({
  isActive,
  result: {
    item: { path, section, text: textProp, title: titleProp }
  },
  searchTextDeferred
}: {
  isActive: boolean;
  result: FuseResult<SiteSearchRecord>;
  searchTextDeferred: string;
}) {
  const ref = useRef<HTMLLIElement>(null);

  const title = useMemo(
    () => renderHighlightedText(titleProp, searchTextDeferred),
    [searchTextDeferred, titleProp]
  );

  const text = useMemo(
    () =>
      textProp
        ? renderHighlightedText(textProp, searchTextDeferred, {
            maxLength: 150,
            leading: 25
          })
        : "",
    [searchTextDeferred, textProp]
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
        to={path}
      >
        <div className="grow-1 shrink-1 overflow-auto flex flex-col gap-1">
          <div className="grow text-lg truncate text-white">
            {section}
            {section && " "}
            {title}
          </div>
          {text && <div className="text-sm truncate pb-1">{text}</div>}
        </div>
        <ChevronRightIcon className="h-4 w-4 shrink-0" />
      </Link>
    </li>
  );
}
