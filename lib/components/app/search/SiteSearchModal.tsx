import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useLibraryContext } from "../../../hooks/useLibraryContext";
import { read } from "./SiteSearchCache";
import { SiteSearchResults } from "./SiteSearchResults";

// Searching is fast (well under 1ms); this mostly avoids re-rendering results on every keystroke
const SEARCH_DEBOUNCE_MS = 100;

export function SiteSearchModal() {
  const { isSiteSearchVisible, setIsSiteSearchVisible } = useLibraryContext();

  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const [searchText, setSearchText] = useState("");

  const searchTextDeferred = useDebouncedValue(searchText, SEARCH_DEBOUNCE_MS);

  // Start downloading the site map as soon as the modal opens, rather than after the first search
  useEffect(() => {
    if (isSiteSearchVisible) {
      // Errors are surfaced when the results read the (cached) promise
      read().catch(() => {});
    }
  }, [isSiteSearchVisible]);

  useEffect(() => {
    if (!isSiteSearchVisible) {
      const onKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
          case "K":
          case "k": {
            if (event.metaKey || event.ctrlKey) {
              setIsSiteSearchVisible(true);
            }
            break;
          }
        }
      };
      document.body.addEventListener("keydown", onKeyDown);
      return () => {
        document.body.removeEventListener("keydown", onKeyDown);
      };
    }
  }, [isSiteSearchVisible, setIsSiteSearchVisible]);

  if (!isSiteSearchVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 backdrop-blur-md p-4 flex flex-col items-center animate duration-500 animate-fade-in"
      onClick={() => {
        setSearchText("");
        setIsSiteSearchVisible(false);
      }}
    >
      <div className="shadow-background-gradient-2/20 shadow-md bg-black/80 rounded-lg py-3 pl-4 pr-3 max-w-full w-200 max-h-full overflow-auto flex flex-col">
        <div
          className="flex items-center gap-3 shrink-0"
          onClick={(event) => event.stopPropagation()}
        >
          <MagnifyingGlassIcon className="w-4 h-4" />
          <input
            autoFocus
            className="grow text-lg md:tex-md"
            onKeyDown={(event) => {
              switch (event.key) {
                case "Escape": {
                  setSearchText("");
                  setIsSiteSearchVisible(false);
                  break;
                }
              }
            }}
            onChange={(event) => {
              setSearchText(event.currentTarget.value);
            }}
            ref={setInputRef}
            placeholder="Search documentation"
            value={searchText}
          />
          <div
            className="border border-white/20 rounded text-sm px-1 cursor-pointer"
            onClick={() => setIsSiteSearchVisible(false)}
          >
            esc
          </div>
        </div>
        {searchTextDeferred && (
          <SiteSearchResults
            inputRef={inputRef}
            key={searchTextDeferred}
            searchTextDeferred={searchTextDeferred}
          />
        )}
      </div>
    </div>
  );
}
