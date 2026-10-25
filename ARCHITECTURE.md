# Architecture

`react-lib-tools` has two halves that work together:

- A set of **build-time scripts** that run in a consuming library's repository and generate JSON (component docs, highlighted code examples, a search index).
- A **React component library** that renders that JSON as a documentation website.

## Repository layout

| Path                                            | Published?        | What it is                                                                                                                                       |
| :---------------------------------------------- | :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| [`lib/`](./lib)                                 | Yes, via `dist/`  | React components, hooks, and utilities. The public API is whatever [`lib/index.ts`](./lib/index.ts) exports.                                     |
| [`scripts/`](./scripts)                         | Yes, as raw `.ts` | Node scripts that consumers import directly (for example `react-lib-tools/scripts/compile-docs.ts`).                                             |
| [`styles.css`](./styles.css)                    | Yes               | Tailwind theme variables and base styles that consumers import.                                                                                  |
| [`types.ts`](./types.ts)                        | Yes               | Types shared between `scripts/` and `lib/` (the site map format).                                                                                |
| [`src/`](./src)                                 | No                | Internal tools served by `pnpm dev`: a theme color picker and generators for each library's OG image.                                            |
| [`fixtures/sample-lib/`](./fixtures/sample-lib) | No                | A fictional library with its own docs site, served at `/` by `pnpm dev`. Its `public/generated/` files come from running the scripts against it. |
| [`public/svgs/`](./public/svgs)                 | Bundled           | Icons imported by `lib/` components as React components (via `vite-plugin-svgr`).                                                                |

[`vite.config.ts`](./vite.config.ts) has two configurations, selected with the `TARGET` environment variable:

- `TARGET=lib` builds `lib/index.ts` into `dist/` (ESM and CJS, plus a single rolled-up `.d.ts`). Only `react` and `react-dom` are external; everything else (React Router, Headless UI, Floating UI, Heroicons, etc.) is bundled.
- Any other value builds the website into `docs/`. Its entry point, [`index.tsx`](./index.tsx), lazily loads either the color picker (`/color-picker`) or the sample library's docs (every other path), so that only one app's global CSS is applied. `publicDir` points at `fixtures/sample-lib/public`, so the sample site's `/generated/site-map.json` is served the same way it would be by a consumer.

## Data flow

All of the scripts resolve their input and output paths relative to a `rootDir` option, which defaults to the current working directory. `filePath` values in the generated docs (used for "view source" links) are relative to the current working directory, which should be the repository root.

```
consumer repo (build time)                         consumer docs site (runtime)
──────────────────────────                         ────────────────────────────

lib/components/*.tsx  ──compileDocs──────▶  public/generated/docs/*.json      ──▶ <ComponentProps json={…} />
  (TSDoc comments)                                                                <ImperativeHandle json={…} />

src/routes/**/examples/* ─compileExamples─▶ public/generated/examples/*.json  ──▶ <Code html={…} />

running dev server ──compileSearchIndex──▶  public/generated/site-map.json    ──▶ site search (fetched at runtime)
```

### `compileDocs` ([`scripts/compile-docs.ts`](./scripts/compile-docs.ts))

- **Components** are parsed with `react-docgen-typescript`. Each name in `componentNames` must match a file named `lib/components/**/<Name>.tsx` under `rootDir` (by default the current working directory). Props inherited from `node_modules` types (like HTML attributes) are dropped.
- **Imperative handles** are parsed with `@ts-ast-parser/core`. Each name in `imperativeHandleNames` is looked up as an interface declared under `lib/`. Every method needs a JSDoc comment; both method syntax (`reset(): void`) and function-typed properties (`reset: () => void`) are supported.
- TSDoc descriptions are split into `Section`s by [`parseDescription`](./scripts/utils/docs/parseDescription.ts):
  - Paragraphs that start with `ℹ️`, `⚠️`, `❌`, `✅` or `NOTE:` become callouts with the matching intent.
  - Fenced code blocks are syntax highlighted.
  - `@deprecated`, `@param` and `@return` are rewritten into plain text.
- **Side effect:** unless `readmePath` is `false`, props tables are also written into the consumer's `README.md`, between `<!-- Name:description:begin -->` / `<!-- Name:description:end -->` style markers (sections `description`, `required-props` and `optional-props`).

### `compileExamples` ([`scripts/compile-examples.ts`](./scripts/compile-examples.ts))

- Only files inside an `examples/` directory are compiled; each produces a `<name>.json` file containing `{ html }`.
- Only the text between `// <begin>` and `// <end>` markers is kept, which lets an example file contain imports or setup code that the docs don't show.
- Lines containing `// hidden`, `prettier-ignore`, `eslint-disable-next-line` or `@ts-expect-error` are removed.
- Highlighting uses CodeMirror's Lezer parsers ([`scripts/utils/syntax-highlight.ts`](./scripts/utils/syntax-highlight.ts)); the `.tok-*` classes in the output are styled by [`styles.css`](./styles.css).

### `compileSearchIndex` ([`scripts/compile-search-index.ts`](./scripts/compile-search-index.ts))

Crawls a running instance of the docs site with Puppeteer, starting at `/` and following every element with a `data-link` attribute. For each page it records:

- the page title and section, read from `[data-title]` and `[data-section]` inside `<header>`
- the page text from `[data-main-scrollable]`, minus anything marked `data-search-ignore` (including the content of every `Block`, since live demos may render after the page is read)
- one entry per `[data-toc][id]` element (the same headings shown in "On this page"), each with its own text

Pages are crawled concurrently, so `site-map.json` is sorted by path to keep the output the same between runs.

At runtime, [`SiteSearchCache`](./lib/components/app/search/SiteSearchCache.ts) fetches `/generated/site-map.json`, and [`search.ts`](./lib/components/app/search/search.ts) ranks results using stemmed terms.

This means **components in `lib/` contain attributes that the crawler depends on**. Renaming or removing `data-link`, `data-title`, `data-section`, `data-toc`, `data-search-ignore`, `data-main-scrollable` or `data-route-loading` (on the loading indicator shown while a page's code loads) will silently degrade search.

### Dev server port ([`scripts/dev-server.js`](./scripts/dev-server.js))

Reads the docs dev server port from the `"react-lib-tools": { "devServerPort": number }` field in the consumer's package.json (3000 by default). Consumers pass `getDevServerConfig()` to their Vite config, and `compileSearchIndex` uses the same port for its default `host`. The config sets `strictPort`, so a port conflict stops the dev server rather than leaving the crawler to index whatever else is listening on that port.

Unlike the other scripts, this one is **plain JavaScript** (with its types in [`dev-server.d.ts`](./scripts/dev-server.d.ts)). Vite doesn't bundle dependencies when it loads a config file, and Node won't strip TypeScript types from files inside `node_modules`, so a `.ts` file would fail to load from a consumer's `vite.config.ts`.

## The app shell

[`AppRoot`](./lib/components/app/AppRoot.tsx) is the main entry point for consumers. It:

- stores package metadata (name, description, repository URL, versions, …) in a [`LibraryContext`](./lib/contexts/LibraryContext.tsx), which components read with `useLibraryContext()`;
- creates a `BrowserRouter` and merges the consumer's `routes` over the [default routes](./lib/components/app/routes.ts) (`/`, `/common-questions`, `/support`, `/versions`, and a 404 page);
- renders the header, the sidebar [`Nav`](./lib/components/nav/Nav.tsx), and previous/next [`PageNavigation`](./lib/components/nav/PageNavigation.tsx), all driven by the same `NavConfig`;
- optionally renders the site search modal (`enableSiteSearch`).
- renders the header's project menu ([`ProjectSwitcher`](./lib/components/app/projects/ProjectSwitcher.tsx)), which fetches the list of projects from `projectsUrl` at runtime. The default URL serves [`projects.json`](./projects.json) from this repository's deployed docs site (the website build in [`vite.config.ts`](./vite.config.ts) serves and emits it), so every consumer site shares one list without being rebuilt. Unknown or invalid entries are skipped, so the file's format can grow without breaking sites running older versions.

Because React Router is bundled rather than a peer dependency, consumer route components must navigate with this package's [`Link`](./lib/components/Link.tsx). Their own copy of `react-router-dom` won't see `AppRoot`'s router.

## Styling

Components are styled with Tailwind CSS 4, but the package doesn't ship compiled utility classes. Consumers add `@source "node_modules/react-lib-tools"` so that their own Tailwind build scans this package, and import [`styles.css`](./styles.css) for the theme variables. As a result, **class names in `lib/` must be complete static strings** that Tailwind can find by scanning; don't build them dynamically (for example `` `text-${color}` ``).

Sites follow the system's light or dark preference. Theme colors are CSS variables with light values set in a `prefers-color-scheme: light` media query in `styles.css`. Components use `ink` (text, borders, tints) and `paper` (surfaces) rather than `white` and `black`, and `dark:` variants for other colors (e.g. `text-sky-700 dark:text-sky-300`). Tailwind outputs `dark:` rules after `hover:`/`focus:` rules, so a state color paired with a `dark:` base color needs its own `dark:` variant (e.g. `dark:hover:text-ink`). Code blocks use `bg-code-background` rather than a `dark:` variant so that a `className` like `bg-transparent` can still override it. The header stays on the background gradient, so its colors are the same in both themes.
