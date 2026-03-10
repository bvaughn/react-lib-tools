import { ChevronRightIcon } from "@heroicons/react/20/solid";
import type { FuseResult } from "fuse.js";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { cn } from "../../../utils/cn";
import type { SiteSearchRecord } from "./SiteSearchTypes";
import { Link } from "../../Link";

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

function renderHighlightedText(
  text: string,
  query: string,
  config?: {
    maxLength: number;
    leading: number;
  }
) {
  const { maxLength = 250, leading = 0 } = config ?? {};

  query = query.toLowerCase();

  if (maxLength && text.length > maxLength) {
    const firstIndex = text.toLowerCase().indexOf(query);
    const startIndex = Math.max(0, firstIndex - leading);
    const stopIndex = Math.min(text.length, startIndex + maxLength);

    text = text.substring(startIndex, stopIndex);

    if (startIndex > 0) {
      text = "…" + text;
    }
  }

  const rendered: ReactNode[] = [];
  const chunks = text.toLowerCase().split(query);

  let firstIndex = -1;
  let index = 0;
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];

    rendered.push(text.substring(index, index + chunk.length));

    index += chunk.length;

    if (firstIndex < 0) {
      firstIndex = index;
    }

    const match = text.substring(index, index + query.length);
    if (match) {
      rendered.push(
        <mark className="bg-transparent text-sky-300" key={index}>
          {match}
        </mark>
      );
    }

    index += query.length;
  }

  if (index < text.length - 1) {
    rendered.push(text.substring(index));
  }

  return rendered;
}
