# react-lib-tools

Tools for building documentation websites for React component libraries. Used by [react-window](https://react-window.vercel.app/), [react-resizable-panels](https://react-resizable-panels.vercel.app/), and others.

It has two parts:

- **Build scripts** that run in your repository and generate JSON: props documentation from TSDoc comments, syntax-highlighted code examples, and a search index.
- **React components** that render that JSON as a documentation site, with navigation, search, and an "On this page" contents list.

For a complete, working example see the [sample library](./fixtures/sample-lib) in this repository; its [`App.tsx`](./fixtures/sample-lib/src/App.tsx) and [`scripts/generate.ts`](./fixtures/sample-lib/scripts/generate.ts) are a good starting point.

> [!NOTE]
> This package is still in `0.0.x` and its API may change between releases.

## Installation

```sh
npm install react-lib-tools
```

React 18 or 19 is required. The components are styled with [Tailwind CSS](https://tailwindcss.com/) 4, which your docs site will also need.

The build scripts are TypeScript files that run in Node; the examples below use [tsx](https://tsx.is/) to run them. Some of the packages they use aren't installed automatically, so add the ones for the scripts you use as dev dependencies:

| Script            | Packages                                                         |
| :---------------- | :--------------------------------------------------------------- |
| `compileDocs`     | `typescript`, `react-docgen-typescript`, `markdown-it`, `marked` |
| `compressOgImage` | `sharp`, `bytes`                                                 |

## Setting up the docs site

### Styles

Add the following to your site's root CSS file. The `@source` directive tells Tailwind to generate the classes used by this package's components.

```css
@source "node_modules/react-lib-tools";

@import "tailwindcss";
@import "react-lib-tools/styles.css";
```

### The app shell

Render your site with `AppRoot`. It provides the header, sidebar navigation, previous/next page links, site search, and routing:

```tsx
import { lazy } from "react";
import { AppRoot, type DefaultPath, type NavConfig } from "react-lib-tools";

const routes = {
  "/list": lazy(() => import("./routes/ListRoute")),
  "/list/props": lazy(() => import("./routes/ListPropsRoute"))
};

type Path = keyof typeof routes;

const nav: NavConfig<Path | DefaultPath> = [
  { path: "/", title: "Getting started" },
  {
    title: "Lists",
    links: [
      { path: "/list", title: "Rendering a list" },
      { path: "/list/props", title: "List props" }
    ]
  },
  { path: "/common-questions", title: "Common questions" },
  { path: "/support", title: "Support" }
];

export function App() {
  return (
    <AppRoot
      enableSiteSearch
      nav={nav}
      overview={<p>my-library renders large lists quickly.</p>}
      packageDescription="render large lists"
      packageName="my-library"
      repositoryUrl="https://github.com/me/my-library"
      routes={routes}
    />
  );
}
```

| Prop                  | Required | Description                                                                                                                                       |
| :-------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| `nav`                 | Yes      | Site navigation, in reading order. Links can be grouped into titled sections and nested with `children`. Also determines the previous/next links. |
| `packageDescription`  | Yes      | Short description shown in the header when the [project menu](#project-menu) is disabled.                                                         |
| `packageName`         | Yes      | Shown in the header and used for the npm link and installation instructions.                                                                      |
| `repositoryUrl`       | Yes      | Used for "view source" links on props pages.                                                                                                      |
| `routes`              | Yes      | Map of paths to lazy-loaded page components.                                                                                                      |
| `collapseNavSections` | No       | Collapses sidebar nav sections by default, except for the section containing the current page.                                                    |
| `commonQuestions`     | No       | Questions and answers shown on the `/common-questions` page.                                                                                      |
| `enableSiteSearch`    | No       | Shows the search button and enables the Cmd/Ctrl+K shortcut. Requires a [search index](#search-index).                                            |
| `overview`            | No       | Introduction shown on the getting started (`/`) page.                                                                                             |
| `packageLogo`         | No       | Replaces the default React logo in the header.                                                                                                    |
| `projectsUrl`         | No       | URL of the [project list](#project-menu) shown in a menu under the package name. Defaults to the shared list; pass `false` to disable the menu.   |
| `showOpenCollectLink` | No       | Adds an Open Collective link to the getting started page.                                                                                         |
| `versions`            | No       | Map of version numbers to documentation URLs for older releases; adds a `/versions` page and a link to it in the header.                          |

`AppRoot` provides these pages by default; your `routes` can override any of them:

| Path                | Page                                                   |
| :------------------ | :----------------------------------------------------- |
| `/`                 | Getting started: `overview`, installation, and support |
| `/common-questions` | `commonQuestions`                                      |
| `/support`          | Where to ask questions and report bugs                 |
| `/versions`         | Links to documentation for older releases (`versions`) |
| any other path      | Page not found                                         |

#### Project menu

Clicking the logo and package name in the header opens a menu that links to other projects' docs sites. The list is loaded (when the menu is first hovered, focused, or opened) from [`projects.json`](./projects.json) in this repository, which is deployed to `https://react-lib-tools.vercel.app/projects.json`. To add a project to every site's menu, edit that file and deploy this repository; the sites themselves don't need to be updated.

Each entry has a `name`, `description`, and `url`, plus an optional `icon` (resolved relative to `url`; defaults to `/favicon.svg`). The entry whose `name` matches `packageName` is marked as the current project.

> [!NOTE]
> Some links currently assume the package's repository is `github.com/bvaughn/<packageName>`: the GitHub icon in the header, the support and "page not found" pages, and the release links on the versions page. The getting started page also includes links for sponsoring the maintainer of this package.

### Writing pages

Pages are ordinary React components. This package exports components for the common pieces of a documentation page, including:

| Component                                        | Use                                                                                                       |
| :----------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| `Header`                                         | Page title, with an optional section label. Its text is also used for the browser tab and search results. |
| `SectionHeader`                                  | A heading within the page; included in the "On this page" contents list.                                  |
| `Code`                                           | Syntax-highlighted code from [compiled examples](#code-examples), with a copy button.                     |
| `ComponentProps`                                 | A component's props, from [compiled docs](#props-documentation).                                          |
| `ImperativeHandle`                               | An imperative API's methods, from [compiled docs](#props-documentation).                                  |
| `HookSignature`, `HookSignatureItem`             | A hook's parameters or return values, with their types and default values.                                |
| `Callout`                                        | A highlighted note, with an `intent` of `"none"`, `"primary"`, `"success"`, `"warning"` or `"danger"`.    |
| `Link`                                           | A link to another page of the site.                                                                       |
| `ExternalLink`                                   | A link to another site; opens in a new tab.                                                               |
| `Box`, `Block`                                   | Layout helpers (a flex container, and a bordered block for live demos).                                   |
| `Button`, `Checkbox`, `Input`, `Radio`, `Select` | Form controls for interactive demos.                                                                      |

Use `Link` rather than `react-router-dom` for links between pages. React Router is bundled into this package, so your own copy of `react-router-dom` won't be connected to `AppRoot`'s router.

A props page can be as small as this:

```tsx
import { ComponentProps, type ComponentMetadata } from "react-lib-tools";
import json from "../../public/generated/docs/List.json";

export default function ListPropsRoute() {
  return <ComponentProps json={json as ComponentMetadata} section="Lists" />;
}
```

### Theme

Override any of these CSS variables in your root CSS file (after importing `react-lib-tools/styles.css`):

```css
@theme {
  /* Animated page background */
  --color-background-gradient-1: var(--color-emerald-400);
  --color-background-gradient-2: var(--color-indigo-500);
  --color-background-gradient-3: var(--color-emerald-400);

  /* Header */
  --color-header-package-name: var(--color-white);
  --color-header-package-description: var(--color-white);
  --color-header-section: var(--color-emerald-200);
  --color-header-icons: var(--color-white);

  /* Links and focus outlines */
  --color-link: var(--color-sky-400);
  --color-data-focus: var(--color-sky-300);

  /* Sidebar navigation */
  --color-nav-active: var(--color-emerald-300);
  --color-nav-hover: var(--color-emerald-200);

  /* Site search */
  --color-search-match: var(--color-emerald-300);
  --color-search-result-active: var(--color-emerald-950);

  /* Common questions page */
  --color-common-question-header: var(--color-indigo-100);
}
```

#### Light theme

Sites follow the system's light or dark preference. The header sits on the background gradient in both themes, so its colors are shared, but the other colors above are chosen for a dark background. If you customize them, also set light theme values (in a media query after your `@theme` block):

```css
@media (prefers-color-scheme: light) {
  :root {
    --color-header-section: var(--color-emerald-700);
    --color-link: var(--color-sky-700);
    --color-data-focus: var(--color-sky-600);
    --color-nav-active: var(--color-emerald-700);
    --color-nav-hover: var(--color-emerald-600);
    --color-search-match: var(--color-emerald-700);
    --color-search-result-active: var(--color-emerald-100);
    --color-common-question-header: var(--color-indigo-700);
  }
}
```

For your own pages and demos, two more theme colors follow the color scheme: `ink` (white in the dark theme, near-black in the light theme) for text, borders, and tints, and `paper` for surfaces. For example, `text-ink/60` instead of `text-white/60`. For other colors, use Tailwind's `dark:` variant, which also follows the system preference.

[This tool](https://react-lib-tools.vercel.app/color-picker?color1=emerald-400&color2=indigo-500&color3=emerald-400&packageDescription=render+everything&packageName=react-window) can help with picking theme colors, and generates an OG image to match.

### Dev server

The docs dev server uses port 3000 by default. To use a different port, add a `react-lib-tools` field to your package.json:

```json
{
  "react-lib-tools": {
    "devServerPort": 3010
  }
}
```

Then pass `getDevServerConfig()` to your Vite config's `server` options:

```ts
import { getDevServerConfig } from "react-lib-tools/scripts/dev-server.js";

export default defineConfig({
  server: {
    ...getDevServerConfig(),
    host: true
  }
});
```

`getDevServerConfig` sets Vite's `strictPort` option, so the dev server fails to start if the port is already in use, rather than switching to another port. Scripts that connect to the dev server, like [`compileSearchIndex`](#search-index), use the same port, so they won't accidentally crawl some other website.

## Generating content

The build scripts are imported from `react-lib-tools/scripts/*` and write JSON into `public/generated/` by default. A typical setup is one small script per step, run with tsx:

```json
{
  "scripts": {
    "compile:docs": "tsx ./scripts/compile-docs.ts",
    "compile:examples": "tsx ./scripts/compile-examples.ts",
    "compile:search-index": "tsx ./scripts/compile-search-index.ts"
  }
}
```

All of the scripts resolve paths relative to the current working directory; pass a `rootDir` option to use a different directory.

### Props documentation

`compileDocs` turns the TSDoc comments on your components' props, and on imperative handle interfaces, into JSON for the `ComponentProps` and `ImperativeHandle` components:

```ts
import { compileDocs } from "react-lib-tools/scripts/compile-docs.ts";

await compileDocs({
  componentNames: ["List", "grid/Grid"],
  imperativeHandleNames: ["ListImperativeAPI"]
});
```

- Each component name must match a file at `lib/components/**/<name>.tsx`; include a directory (e.g. `"grid/Grid"`) to disambiguate.
- Each imperative handle name must match an interface declared under `lib/`, and every method needs a comment.
- Output is written to `public/generated/docs/<name>.json`.

Within comments, Markdown is supported, along with a few conventions:

| Syntax                                | Rendered as                  |
| :------------------------------------ | :--------------------------- |
| A paragraph starting with `ℹ️`        | An informational callout     |
| A paragraph starting with `⚠️`        | A warning callout            |
| A paragraph starting with `❌`        | A danger callout             |
| A paragraph starting with `✅`        | A success callout            |
| A paragraph starting with `NOTE:`     | A neutral callout            |
| `@deprecated <reason>`                | A deprecation notice         |
| `@param <name> <description>`         | A list of parameters         |
| A fenced code block (e.g. ` ```tsx `) | A syntax-highlighted example |

By default `compileDocs` also inserts props tables into your `README.md`, between markers like these (for each of the `description`, `required-props` and `optional-props` sections):

```md
<!-- List:optional-props:begin -->
<!-- List:optional-props:end -->
```

Pass `readmePath: false` to skip this, or a different path to update another file.

### Code examples

`compileExamples` syntax-highlights example files for the `Code` component:

```ts
import { compileExamples } from "react-lib-tools/scripts/compile-examples.ts";

await compileExamples();
```

- Only files inside a directory named `examples` (anywhere under `src/routes`, by default) are compiled. CSS, HTML, JSON, JavaScript and TypeScript (including JSX) are supported.
- Each file is written to `public/generated/examples/<name>.json` (a `.example` suffix is dropped, so `List.example.tsx` becomes `List.json`).
- Only the code between `// <begin>` and `// <end>` comments is included, so examples can contain imports or setup code that isn't shown.
- Lines containing `// hidden`, `prettier-ignore`, `eslint-disable-next-line` or `@ts-expect-error` are removed.

Because examples are real source files, they can also be imported and rendered as live demos:

```tsx
import { Code } from "react-lib-tools";
import { html } from "../../public/generated/examples/BasicList.json";
import { BasicList } from "./examples/BasicList";

<Code html={html} />
<BasicList />
```

### Search index

`compileSearchIndex` builds the index used by site search by crawling your running docs site with [Puppeteer](https://pptr.dev/), so start your dev server first:

```ts
import { compileSearchIndex } from "react-lib-tools/scripts/compile-search-index.ts";

await compileSearchIndex({
  chromeExecutablePath: process.env.CHROME_PATH
});
```

- By default the crawler connects to `http://localhost:<port>`, using the [dev server port](#dev-server) from your package.json (or 3000). Pass a `host` to crawl a different URL.

- The crawler starts at `/` and follows every `Link`, so pages that aren't linked from anywhere won't be indexed.
- Headings rendered by `SectionHeader`, `ComponentProps` and `ImperativeHandle` become separate search results that link directly to that part of the page.
- Pass a `filterSelector` to exclude content from the index, such as long lists of demo data.
- The index is written to `public/generated/site-map.json`, and the site loads it from `/generated/site-map.json`.

### OG image

`compressOgImage` compresses `public/og.png` in place. The [color picker](https://react-lib-tools.vercel.app/color-picker) can generate the image.

```ts
import { compressOgImage } from "react-lib-tools/scripts/compress-og-image.ts";

await compressOgImage();
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines, and [ARCHITECTURE.md](./ARCHITECTURE.md) for an overview of how the project is organized.
