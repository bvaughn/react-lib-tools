import { use, useEffect, useMemo, useState } from "react";
import { read } from "./SiteSearchCache";
import { SiteSearchResult } from "./SiteSearchResult";
import { search } from "./search";

export function SiteSearchResults({
  inputRef,
  searchTextDeferred
}: {
  inputRef: HTMLInputElement | null;
  searchTextDeferred: string;
}) {
  const siteMap = use(read());

  const [index, setIndex] = useState(0);

  const results = useMemo(() => {
    if (searchTextDeferred) {
      return search(siteMap, searchTextDeferred).slice(0, 10);
    } else {
      return [];
    }
  }, [searchTextDeferred, siteMap]);

  useEffect(() => {
    if (inputRef) {
      const onKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
          case "ArrowDown": {
            const nextIndex = index < results.length - 1 ? index + 1 : 0;
            setIndex(nextIndex);
            break;
          }
          case "ArrowUp": {
            const nextIndex = index > 0 ? index - 1 : results.length - 1;
            setIndex(nextIndex);
            break;
          }
          case "Enter": {
            const link = document.body.querySelector(
              "[data-active-search-result]"
            );
            if (link instanceof HTMLAnchorElement) {
              link.click();
            }
            break;
          }
        }
      };
      inputRef.addEventListener("keydown", onKeyDown);
      return () => {
        inputRef.removeEventListener("keydown", onKeyDown);
      };
    }
  }, [index, inputRef, results, searchTextDeferred]);

  return (
    <ul className="border-t border-white/10 pt-3 mt-3 flex flex-col gap-1 overflow-auto">
      {searchTextDeferred && results.length === 0 && (
        <div>No results for "{searchTextDeferred}"</div>
      )}
      {results.map((result, currentIndex) => (
        <SiteSearchResult
          isActive={index === currentIndex}
          key={currentIndex}
          result={result}
          searchTextDeferred={searchTextDeferred}
        />
      ))}
    </ul>
  );
}
