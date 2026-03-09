import { ChevronRightIcon } from "@heroicons/react/20/solid";
import type { FuseResult } from "fuse.js";
import { useMemo, type ReactNode } from "react";
import { cn } from "../../../utils/cn";
import type { SiteSearchRecord } from "./SiteSearchTypes";
import { Link } from "../../Link";

export function SiteSearchResult({
  isActive,
  result: {
    item: { path, section, title }
  },
  searchTextDeferred
}: {
  isActive: boolean;
  result: FuseResult<SiteSearchRecord>;
  searchTextDeferred: string;
}) {
  const text = useMemo(() => {
    const rendered: ReactNode[] = [];
    const chunks = title.toLowerCase().split(searchTextDeferred.toLowerCase());

    let index = 0;
    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex];

      rendered.push(title.substring(index, index + chunk.length));

      index += chunk.length;

      rendered.push(
        <mark className="bg-transparent text-yellow-500" key={index}>
          {title.substring(index, index + searchTextDeferred.length)}
        </mark>
      );

      index += searchTextDeferred.length;
    }

    if (index < title.length - 1) {
      rendered.push(title.substring(index));
    }

    return rendered;
  }, [searchTextDeferred, title]);

  return (
    <li
      className={cn(
        "rounded px-2 py-1 hover:bg-white/10 cursor-pointer transition",
        {
          "bg-white/10": isActive
        }
      )}
    >
      <Link
        className="flex flex-row items-center gap-2 text-lg"
        data-active-search-result={isActive || undefined}
        to={path}
      >
        {section && <div className="text-sm text-white/80">{section}</div>}
        <div className="grow">{text}</div>
        <ChevronRightIcon className="h-4 w-4" />
      </Link>
    </li>
  );
}
