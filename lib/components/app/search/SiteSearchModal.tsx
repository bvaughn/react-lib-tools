import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import {
  Suspense,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent
} from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useLibraryContext } from "../../../hooks/useLibraryContext";
import type { FlatNavItem } from "../../../utils/flattenNav";
import { clearFailedRead, read } from "./SiteSearchCache";
import { SiteSearchList } from "./SiteSearchList";
import type { SiteSearchItem } from "./SiteSearchResult";
import { SiteSearchResults } from "./SiteSearchResults";

// Searching is fast (well under 1ms); this mostly avoids re-rendering results on every keystroke
const SEARCH_DEBOUNCE_MS = 100;

export function SiteSearchModal({ flatNav }: { flatNav: FlatNavItem[] }) {
  const { isSiteSearchVisible, setIsSiteSearchVisible } = useLibraryContext();

  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const [searchText, setSearchText] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const searchTextDeferred = useDebouncedValue(searchText, SEARCH_DEBOUNCE_MS);

  // Once the input is cleared, show all pages right away rather than waiting for the debounced value
  const query = searchText.trim() ? searchTextDeferred.trim() : "";

  // Results lag behind typing (debounced); Enter pressed in the meantime selects the first result once they catch up
  const isStale = searchText.trim() !== query;
  const [selectWhenReady, setSelectWhenReady] = useState(false);
  const onSelectWhenReady = useCallback(() => setSelectWhenReady(true), []);

  // Without search text, list all pages in reading order
  const pages = useMemo<SiteSearchItem[]>(
    () =>
      flatNav.map(({ parent, path, section, title }) => ({
        context: parent ?? section,
        path,
        title
      })),
    [flatNav]
  );

  const close = useCallback(() => {
    setSearchText("");
    setSelectWhenReady(false);
    setIsSiteSearchVisible(false);
  }, [setIsSiteSearchVisible]);

  // Start downloading the site map as soon as the modal opens, rather than after the first search
  useEffect(() => {
    if (isSiteSearchVisible) {
      // If this fails, the first search tries again (and shows an error if that fails too)
      read().catch(clearFailedRead);
    }
  }, [isSiteSearchVisible]);

  // Cmd/Ctrl+K toggles the search (and shouldn't also trigger the browser's own shortcut, e.g. Firefox's search bar)
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (isSiteSearchVisible) {
          close();
        } else {
          setIsSiteSearchVisible(true);
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, isSiteSearchVisible, setIsSiteSearchVisible]);

  // While open: focus the input (and return focus to wherever it was before opening, once closed)
  // and prevent the page behind the modal from scrolling
  useLayoutEffect(() => {
    if (!isSiteSearchVisible) {
      return;
    }

    const previouslyFocused = document.activeElement;
    overlayRef.current?.querySelector("input")?.focus();

    const unlockScroll = lockScroll(overlayRef.current);

    return () => {
      unlockScroll();

      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [isSiteSearchVisible]);

  // While open, Escape closes from anywhere (not only from the input)
  useEffect(() => {
    if (!isSiteSearchVisible) {
      return;
    }

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      // While composing text with an input method editor (e.g. Japanese), Escape cancels the composition
      if (event.key === "Escape" && !event.isComposing) {
        event.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, isSiteSearchVisible]);

  if (!isSiteSearchVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 backdrop-blur-md p-4 flex flex-col items-center animate duration-500 animate-fade-in"
      onClick={close}
      ref={overlayRef}
    >
      <div
        aria-label="Search documentation"
        aria-modal="true"
        className="shadow-background-gradient-2/20 shadow-md bg-black/80 rounded-lg py-3 pl-4 pr-3 max-w-full w-200 max-h-full flex flex-col"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={trapFocus}
        role="dialog"
      >
        <div className="flex items-center gap-3 shrink-0">
          <MagnifyingGlassIcon aria-hidden className="w-4 h-4" />
          <input
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded="true"
            aria-label="Search documentation"
            className="grow text-lg md:text-base"
            onChange={(event) => {
              setSearchText(event.currentTarget.value);
              setSelectWhenReady(false);
            }}
            placeholder="Search documentation"
            ref={setInputRef}
            role="combobox"
            value={searchText}
          />
          <button
            aria-label="Close search"
            className="border border-white/20 rounded text-sm px-1 cursor-pointer"
            onClick={close}
            type="button"
          >
            esc
          </button>
        </div>
        {/*
          A failure to load the search index is shown here rather than breaking the page;
          changing the search text (or clicking "Try again") clears the failed request and retries.
          The Suspense boundary stays mounted so that, while the index loads during a search (a transition),
          the current list remains visible rather than being replaced by the fallback.
        */}
        <ErrorBoundary
          FallbackComponent={SearchUnavailable}
          onReset={clearFailedRead}
          resetKeys={[query]}
        >
          <Suspense fallback={<SearchLoading />}>
            {query ? (
              <SiteSearchResults
                inputRef={inputRef}
                isStale={isStale}
                key={query}
                listboxId={listboxId}
                onSelect={close}
                onSelectWhenReady={onSelectWhenReady}
                searchTextDeferred={query}
                selectFirst={selectWhenReady && !isStale}
              />
            ) : (
              <SiteSearchList
                inputRef={inputRef}
                isStale={isStale}
                items={pages}
                listboxId={listboxId}
                onSelect={close}
                onSelectWhenReady={onSelectWhenReady}
                selectFirst={false}
                terms={[]}
              />
            )}
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}

function SearchLoading() {
  return (
    <div className="border-t border-white/10 pt-3 mt-3 px-2 text-white/60">
      Loading…
    </div>
  );
}

function SearchUnavailable({ resetErrorBoundary }: FallbackProps) {
  return (
    <div className="border-t border-white/10 pt-3 mt-3 px-2 flex items-center gap-3">
      <span role="status">Search is unavailable right now.</span>
      <button
        className="border border-white/20 rounded text-sm px-1 cursor-pointer"
        onClick={resetErrorBoundary}
        type="button"
      >
        Try again
      </button>
    </div>
  );
}

/**
 * Prevents scrolling of the overlay's ancestors (e.g. mobile Safari may scroll the document or #root);
 * only elements that actually overflow are locked, to avoid shifting layout when a scrollbar disappears.
 * Returns a function that restores them.
 */
function lockScroll(overlay: HTMLElement | null) {
  const restore: (() => void)[] = [];

  let current = overlay?.parentElement ?? null;
  while (current) {
    const visibleHeight =
      current === document.scrollingElement
        ? window.innerHeight
        : current.getBoundingClientRect().height;
    if (current.scrollHeight > visibleHeight) {
      const element = current;
      const overflow = element.style.overflow;
      element.style.overflow = "hidden";
      restore.push(() => {
        element.style.overflow = overflow;
      });
    }
    current = current.parentElement;
  }

  return () => restore.forEach((callback) => callback());
}

/** Keeps keyboard focus within the dialog while it's open */
function trapFocus(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== "Tab") {
    return;
  }

  const focusable = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(
      "a[href], button, input, [tabindex]"
    )
  ).filter((element) => element.tabIndex >= 0);
  if (focusable.length === 0) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
