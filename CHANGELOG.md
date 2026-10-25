# Changelog

## 0.0.70

- **Light theme:** docs sites now follow the system's light or dark preference (previously they were always dark). The dark theme is unchanged.
  - The header stays on the background gradient in both themes; the content card, sidebar, search, project menu, code blocks, callouts, and form controls all have light variants.
  - **Action needed** if your site customizes theme colors (e.g. `--color-nav-active`): those values are chosen for a dark background, so also set light theme values in a `@media (prefers-color-scheme: light)` block. Until you do, the light theme uses the defaults from `styles.css` for those colors. See "Light theme" in the README.
  - **Action needed** if your pages or demos use light-on-dark colors like `text-white/60`: use the new `ink` and `paper` theme colors (e.g. `text-ink/60`, `bg-paper/80`), which follow the color scheme, or Tailwind's `dark:` variant.
- The current page's contents (its headings, listed beneath its link in the sidebar) can be collapsed, e.g. to see the links below a long list: like a section header, clicking the current page's link toggles them (modified clicks, e.g. to open a new tab, still work). Contents are expanded each time a page opens.
- Fixed project menu icons sometimes being drawn in the wrong color scheme's colors (e.g. dark icons on the menu's dark background in Safari on iOS). Icons are now always white in the dark theme and black in the light theme.

## 0.0.69

- The header's logo and package name now open a menu linking to the docs sites of related projects. The list is shared by every site: it's loaded at runtime from `https://react-lib-tools.vercel.app/projects.json` (when the menu is first hovered, focused, or opened), so adding a project doesn't require updating each site. The current project is marked and can't be selected; projects without a `/favicon.svg` (or an `icon` in the list) are shown without an icon.
- New `AppRoot` `projectsUrl` prop, to load the project list from a different URL; pass `false` to disable the menu.
- **Behavior change:** `packageDescription` is no longer shown in the header while the project menu is enabled; it's still shown when `projectsUrl` is `false`.
- The site search dialog now has a muted border instead of a shadow tinted with the theme's background gradient color.

## 0.0.68

- New `HookSignature` and `HookSignatureItem` components, for documenting a hook's parameters or return values. Each `HookSignatureItem` shows a `name`, `type`, and optional `defaultValue` (pass `optional` to mark it with `?:`), followed by its description (`children`). Render items within a `HookSignature`, which lays them out as a list.

## 0.0.67

- `compileSearchIndex` output is now the same each time it runs (when the site hasn't changed):
  - Pages in `site-map.json` are sorted by path. Before, they were written in the order they were found, which varied because pages are crawled concurrently.
  - `Block` content is no longer indexed (`Block` now sets `data-search-ignore`). Live demos inside a `Block` (e.g. one that waits to be measured before rendering) sometimes rendered before the crawler read the page and sometimes after. Pass `data-search-ignore={undefined}` to a `Block` to index its content.

## 0.0.66

- The docs dev server port can now be configured with a `"react-lib-tools": { "devServerPort": number }` field in package.json (the default is still 3000). Pass `getDevServerConfig()` (from `react-lib-tools/scripts/dev-server.js`) to your Vite config's `server` options; it also sets `strictPort`, so the dev server fails to start if the port is in use instead of switching to another port.
- `compileSearchIndex` now connects to the configured dev server port by default, instead of always using `http://localhost:3000`.

## 0.0.65

- New `AppRoot` `collapseNavSections` prop. When enabled, sidebar nav sections are collapsed by default, except for the section containing the current page. Navigating to a page in a collapsed section expands it.

## 0.0.64

- Nav links accept an optional `navTitle`, a shorter label shown in the sidebar. `title` is still used for previous/next page links and site search.
- The active sidebar link no longer re-wraps when selected. It is emphasized with a text stroke instead of bold, which made the text wider.
- Long sidebar link titles now wrap onto multiple lines instead of overflowing into the next link.
- The sidebar is wider (`w-72`, up from `w-64`).

## 0.0.63

- **Breaking:** The `react` and `react-dom` peer dependency ranges are now `^19.0.0`. Site search (`use()`) and `Header` page titles (`<title>` hoisting) already required React 19; React 18 is no longer listed as supported.
- Fixed `compileDocs` and `compileExamples` on Windows:
  - `compileDocs` now finds component files on Windows. Before, its file filter only matched `/`-separated paths, so no component docs were generated.
  - `compileExamples` now finds files inside `examples` directories on Windows. Before, its directory check only matched `/`-separated paths, so no examples were compiled.
  - Generated component `filePath` values now use `/` for every separator. Before, only the first `\` was replaced (0.0.54 fixed only part of this).
- The deprecated `SiteSearchRecord` type now includes the `text` field that search records contained in 0.0.39–0.0.48.

## 0.0.62

- Fix generated docs mangling text that contains `$` characters. Prop descriptions in README props tables (e.g. a description containing `$'`, `$&`, or `$1`) and prop names in compiled component metadata (e.g. `$$value`) are now inserted verbatim instead of being interpreted as `String.prototype.replace` patterns.

## 0.0.61

- The header search button now uses the `--color-header-icons` CSS variable, matching the other header icons.

## 0.0.60

- `AppRoot` wraps routes in a `Suspense` boundary with a `LoadingSpinner` fallback, so the header and nav render while a lazy route loads.
- `compileSearchIndex` waits for the route loading fallback to disappear before reading a page, so lazy pages are indexed with their content.
- New `rootDir` option for `compileDocs`, `compileExamples`, `compileSearchIndex`, and `compressOgImage`; other paths resolve against it (defaults to `cwd()`).
- New `compileDocs` `readmePath` option: a custom README location, or `false` to skip updating README props tables.
- `compileSearchIndex` creates the output directory if missing and supports host URLs without an explicit port.
- Imperative handle docs accept JSDoc on method signatures (`reset(): void`) as well as function-typed properties; `@param` tags render as a list, and missing JSDoc fails with an error naming the method.
- README props-table insertion warns and leaves the README unchanged when the begin marker is missing or after the end marker.
- Added JSDoc to exported components, `AppRoot` props, and types. `SiteSearchRecord` is marked `@deprecated` (the search index uses `SiteMapPage`).
- Test files are no longer included in generated type declarations.

## 0.0.59

- Search results can link to individual headings within a page. Re-run `compileSearchIndex` to populate the new optional `headings` field on `SiteMapPage` (new `SiteMapHeading` type). Headings come from elements with `data-toc` and an `id`.
- New search ranking: field-weighted BM25-style scoring (title > path > section > text), typo correction, prefix matching, camelCase-aware tokenizing, stop-word handling, phrase and exact-title bonuses, and at most 2 heading results per page.
- Stemming support (e.g. "collapse" matches "collapsible").
- Search terms containing regex characters (e.g. `c++`, `(`) no longer crash the search input.
- Highlighting matches at word starts (including camelCase parts), and snippets trim at word boundaries around the best-matching section.
- The search modal is now an accessible dialog/combobox: `aria-activedescendant` arrow-key navigation, focus trap and restore, background scroll lock, Escape to close, Cmd/Ctrl+K toggle that no longer triggers the browser shortcut, and IME composition support.
- With an empty query, the modal lists every page in nav order. Results show 10 matches initially with a "Show N more results" button.
- Pressing Enter before debounced results arrive opens the first result once they arrive (within 1 second).
- Search debounce reduced to 100ms; the index starts downloading when the modal opens.
- A failed `site-map.json` load is no longer cached forever; the modal shows a "Try again" button, and "Loading…" while the index loads.
- Selecting a result for the heading already in the URL hash scrolls to it again; malformed `%` escapes in the hash no longer throw.
- "On this page" fixes: mixed nested and flat entries render correctly, modified clicks go to the browser, and it no longer measures or scrolls while the mobile sidebar is hidden.

## 0.0.58

- **Breaking:** The `AppRoot` `navLinks: ReactNode` prop is replaced by `nav: NavConfig`. New exported types: `NavConfig`, `NavLinkConfig` (with optional nested `children`), and `NavSectionConfig`.
- **Breaking:** `NavLink` and `NavSection` are no longer exported; the sidebar is rendered from `nav`.
- **Breaking:** Removed the `Callout` `inline` and `minimal` props, and the `minimal` argument of `getIntentClassNames`. All intents use a tinted background with a subtle border.
- **Breaking:** Removed the `--color-data-focus-bold` CSS variable.
- New `SectionHeader` component: an `<h2>` with an automatic id, included in "On this page" unless `showInContents={false}`.
- New "On this page" contents in the sidebar, built from elements marked `data-toc` (props, imperative handle methods, and common questions set it), with scroll tracking.
- New previous/next page links at the bottom of each page, based on `nav`.
- Navigating to a URL hash scrolls to that anchor.
- `Code` has a copy-to-clipboard button; set `copyable={false}` to turn it off.
- Fenced code blocks in JSDoc descriptions render as `Code` blocks (new `Section.code` field set by `compileDocs`).
- `Link` renders a real `<a href>`, so modified clicks are handled by the browser.
- Layout changes: the page scrolls as one with a sticky sidebar, a wider content card, an `md:w-64` sidebar, `text-3xl` page titles, the header package name is no longer a link, and the search shortcut hint is hidden on small screens.
- Prop and imperative method lists have dividers, and props are listed under a `SectionHeader`.
- Tooltips no longer stay open after a tap on touch devices.
- `styles.css`: focus-visible outlines for links and header controls; new `--color-search-match` and `--color-search-result-active` variables.
- `compileSearchIndex` skips elements marked `data-search-ignore`.

## 0.0.57

- Fixed iOS issues: scroll position resets after route changes, and main content shows again on `md+` after the mobile nav has been open.
- `--color-header-section` is now `--color-fuchsia-300`.

## 0.0.56

- New header layout: the section shows as a small label above an `<h1>` title, replacing the inline "Section > Title".
- New `--color-header-section` CSS variable.
- Base font size raised from 12px to 14px, with more header and content padding.

## 0.0.55

- New optional `AppRoot` `packageLogo` prop to replace the default React logo in the header.

## 0.0.54

- Fixed Windows file paths in generated component docs by normalizing `filePath` separators to `/` (#4, thanks @michaelboyles).

## 0.0.53

- `types.ts` is now included in the published package. Scripts have imported `SiteMapPage` from it since 0.0.49, so type-checking those imports failed before this release.

## 0.0.52

- Search results highlight the section name and show it before the title.
- Truncated search snippets add leading and trailing ellipses around the first matching term.
- `compileSearchIndex` no longer repeats the page title and section in the indexed text.

## 0.0.51

- Search highlighting ignores empty terms and centers truncated snippets on the first match.

## 0.0.50

- Leading, trailing, and repeated spaces in search queries no longer break highlighting.

## 0.0.49

- **Breaking:** Replaced Fuse.js with a built-in search. `compileSearchIndex` writes a single `site-map.json` instead of `search-records.json` and `search-index.json`, and the site fetches `/generated/site-map.json`. Re-run `compileSearchIndex` after upgrading.
- New `SiteMapPage` type for the index format, in `types.ts`.
- The crawler indexes code blocks as plain text, collapses extra whitespace, and no longer filters stop words.

## 0.0.48

- Multi-word search queries highlight each word separately, including overlapping matches.
- A `NavLink` with a pending navigation pulses instead of dimming.

## 0.0.47

- Fuzzier search matching (Fuse `threshold` 0.1, `distance: 1000`, extended search).
- `compileSearchIndex` indexes the full text of the `[data-main-scrollable]` region instead of only the children next to the page `<header>`.
- `compileSearchIndex` `filterSelector` removes each matching element from the indexed text, instead of skipping any block containing a match.
- `compileSearchIndex` forwards the crawled page's console output to the terminal.
- `ComponentProps` header title changed to "`{name}` component props".

## 0.0.46

- Fixed nav overflow: the nav list scrolls on its own inside `AppRoot`.

## 0.0.45

- `compileSearchIndex` crawls at most 5 pages at a time.
- `compileSearchIndex` waits for the `host` to accept connections before crawling (10 retries, 1s apart) and exits with code 1 if it never responds.
- `compileSearchIndex` no longer skips `[data-demo]` elements; use `filterSelector` to exclude content.

## 0.0.39 – 0.0.44

These versions were published in quick succession without individual commits. 0.0.41 was never published.

- **Breaking:** Site search is opt-in. Pass the new `AppRoot` `enableSiteSearch` prop to show the search button and Cmd/Ctrl+K modal.
- New `compileSearchIndex` options: `chromeExecutablePath` (launches Puppeteer with that Chrome and `--no-sandbox`, e.g. for GitHub Actions) and `filterSelector` (excludes matching content from the index).
- The search index stores page text instead of keywords, and code blocks are no longer excluded.
- Search results show the section, title, and a highlighted text snippet; the active result scrolls into view.
- Search ranking weights titles 5x over section and text, with a minimum match length of 2.
- The search modal scrolls when there are many results, and the search button has a hover state.
- `AppRoot` no longer crashes when `navigator` is undefined (SSR/Node).

## 0.0.38

- The site search shortcut label (^K vs ⌘K) is detected from `navigator.userAgent` instead of the deprecated `navigator.appVersion`.

## 0.0.37

- `puppeteer` is now a dependency, so `scripts/compile-search-index.ts` works without installing it separately.

## 0.0.36

- New site search: a header search button and a Cmd/Ctrl+K modal with arrow-key and Enter navigation, powered by `fuse.js`.
- New script `scripts/compile-search-index.ts` (`compileSearchIndex({ host, outputPath })`), which crawls the running docs site with Puppeteer and writes the search index to `public/generated`.
- New exported type `SiteSearchRecord`.
- `Header` renders a `<header>` with `data-section` and `data-title` attributes, used by the search crawler.
- `Link` renders an `<a>` (was a `<span>`) with `data-link={to}`.
- `NavLink` is generic over its `path` type (defaults to `DefaultPath`).
- The NPM and GitHub header icons are hidden below the `sm` breakpoint.

## 0.0.35

- New `Tooltip` props: `positions` (allowed placements) and `usePortal` (render into `document.body`).

## 0.0.34

- With reduced motion, the background keeps its gradient but stops animating.

## 0.0.33

- `styles.css` honors `prefers-reduced-motion: reduce` and turns off the animated background gradient.

## 0.0.32

- `compileDocs` matches component files by exact name, so `Bar` no longer matches `FooBar.tsx`.
- `compileDocs` logs a warning and continues when a component's README props markers are missing, instead of throwing.

## 0.0.31

- **Breaking:** New required `AppRoot` `repositoryUrl` prop, used for source code links.
- **Breaking:** The `versions` prop is now flat: `{ [version]: url }` instead of `{ [major]: { [fullVersion]: url } }`. The versions page lists one entry per major version.
- New optional `Header` `sourceCodePath` prop, which links to the file in the repository.
- Fixed `ComponentProps` and `ImperativeHandle` source links, which pointed at the react-lib-tools repository.

## 0.0.30

- The page `<title>` set by `Header` no longer starts with the package name.
- The Getting Started heading is now "Getting started with {packageName}".
- `compileExamples` handles `.json` files by default, with JSON syntax highlighting.
- CodeMirror and Lezer dependencies are pinned to semver ranges instead of `latest`.

## 0.0.29

- New `/common-questions` route, populated from the new `AppRoot` `commonQuestions` prop. New exported type `CommonQuestion` (`{ id, question, answer }`).
- **Breaking:** Renamed CSS variables: `--color-focus-1` → `--color-data-focus`, `--color-focus-2` → `--color-link`, `--color-focus-3` → `--color-data-focus-bold`.
- New `--color-common-question-header` CSS variable.
- `Tooltip` uses auto-placement.

## 0.0.28

- `Tooltip` closes on Escape or an outside click.
- `styles.css` disables CSS transitions globally, fixing text colors fading in on mount.
- The header logo no longer shrinks on narrow screens.

## 0.0.27

- The `AppRoot` header shows a React logo next to the package name.
- `Tooltip` applies `className` to its wrapper element.

## 0.0.26

- New exported `Tooltip` component (`content`, `className`, `showOnHover`, `showOnFocus`).
- Header icons show tooltips instead of native `title` attributes.
- New CSS variables: `--color-header-package-name`, `--color-header-package-description`, and `--color-header-icons`. Header text shadows were removed.

## 0.0.25

- Fixed the `Header` heading, which wrongly included a "packageName: section:" prefix in 0.0.23–0.0.24.

## 0.0.24

- Removed the Open Graph `<meta>` tags from `Header`, and the `AppRoot` `url` prop added in 0.0.23.

## 0.0.23

- **Breaking:** `AppRoot` `packageDescription` must be a `string` (was `ReactNode`).
- **Breaking:** New required `AppRoot` `url` prop (removed again in 0.0.24).
- `Header` sets the page title by rendering a `<title>` element, and renders Open Graph `<meta>` tags.

## 0.0.22

- New script `scripts/compress-og-image.ts` (`compressOgImage({ inputPath, outputPath })`), which recompresses a PNG og:image (both paths default to `public/og.png`).
- The `Select` dropdown no longer animates closed.

## 0.0.21

- **Breaking:** `compileDocs` and `compileExamples` replace the `outputDirName` (string) option with `outputPath` (string[]). Defaults are `["public", "generated", "docs"]` and `["public", "generated", "examples"]`.
- `compileExamples` includes `.js` and `.jsx` in the default `fileExtensions`.
- Added TSDoc to `AppRoot`, `compileDocs`, and `compileExamples` options.

## 0.0.20

- Docs compiler: every `@deprecated` tag is replaced (previously only the first), `@param name` renders as a list item, and `@return` tags are removed.

## 0.0.19

- Docs compiler: booleans, numbers, `null`, `undefined`, arrays, and objects in default values are no longer quoted as strings.
- `styles.css`: added `.tok-bool` and `.tok-number` syntax colors.

## 0.0.18

- `/versions` route tag links point to the current package's repository (they were hardcoded to `react-window`).
- `@codemirror/*`, `@lezer/highlight`, and `@ts-ast-parser/core` are now dependencies, so the compile scripts work without installing them separately.

## 0.0.16

- **Breaking:** Removed the `AppRoot` `hideVersions` prop. The header versions link shows only when the new `versions` prop is passed.
- New `AppRoot` `versions` prop (`{ [major]: { [fullVersion]: docsUrl } }`) and a default `/versions` route listing previous releases.

0.0.15 and 0.0.17 were never published.

## 0.0.14

- Docs compiler: `@deprecated` in a TSDoc description renders as "❌ This prop has been deprecated."

## 0.0.13

- **Breaking:** `styles.css` theme colors are Tailwind `@theme` variables. The `--template-*` variables are replaced by `--color-background-gradient-1/2/3` and `--color-focus-1/2/3`, plus new `--color-nav-active` and `--color-nav-hover`.
- `NavLink` active and hover colors come from `--color-nav-active` and `--color-nav-hover` instead of hardcoded fuchsia.

## 0.0.12

- **Breaking:** `compileDocs` replaces `compilerOptions` with `analyserOptions` (`@ts-ast-parser/core` `AnalyserOptions`); compiler options go in `analyserOptions.compilerOptions`.
- **Breaking:** `compileDocs` `componentNames` entries no longer include a file extension (`"Foo"`, not `"Foo.tsx"`).
- `compileDocs` `componentNames` and `imperativeHandleNames` are optional (default `[]`).
- `AppRoot` has default routes: `/` (Getting started), `/support`, and `*` (not found). Routes passed in `routes` override them.
- New `AppRoot` props: `overview` (Getting started content) and `showOpenCollectLink`.
- New exports: `ComponentPropsSection` and the `DefaultPath` type.
- `styles.css`: `.tok-labelName` is styled like `.tok-propertyName`.

## 0.0.11

- **Breaking:** The `Button` default `intent` changed from `"none"` to `"primary"`.
- `Button`: `intent="none"` has a neutral style, `intent="success"` has its own style, text contrast is higher, and there is a new `onKeyDown` prop.
- `compileExamples` supports `.css` example files with CSS syntax highlighting.
- Higher contrast for the package name in the `AppRoot` header.

## 0.0.10

- `compileExamples`: the default `inputPath` is `["src", "routes"]` again, and only files inside an `examples/` directory are processed.

## 0.0.9

- No functional changes.

## 0.0.8

- New export: `getIntentClassNames(intent, minimal?)`.

## 0.0.7

- **Breaking:** The `compileExamples` default `inputPath` changed to `["src", "routes", "examples"]`.
- `compileExamples` output file names drop the source extension (e.g. `Foo.example.tsx` → `Foo.json`).

## 0.0.6

- `compileDocs` applies default TypeScript compiler options, with the user's `compilerOptions` merged on top.
- Fixed string default values being quoted twice (e.g. `"div" as TagName`).

## 0.0.5

- The `compileDocs` `compilerOptions` option is optional.

## 0.0.4

- `lib/types.ts` is published, fixing type imports in the compile scripts that broke in 0.0.3.

## 0.0.3

- New required `compileDocs` `compilerOptions` option, used instead of reading the package's own `tsconfig.json`.
- Imperative handle docs only pick up declarations from files under `lib/`.

## 0.0.2

- New type exports: `ComponentMetadata`, `ImperativeHandleMetadata`, `Intent`, `Section`, and `Option`.

## 0.0.1

- Initial release: the `AppRoot` app shell (header, desktop and mobile nav, routing), a set of docs UI components, `styles.css`, and the `compileDocs` and `compileExamples` scripts.
