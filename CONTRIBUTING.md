# Contributing

Thanks for your interest in contributing to `react-lib-tools`! This package powers the documentation sites for libraries like [react-window](https://github.com/bvaughn/react-window) and [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels).

The package is still in `0.0.x`, so breaking API changes are allowed when they make things better. Call them out clearly in your pull request.

For an overview of how the code is organized, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Prerequisites

- Node.js 24 (see [`.nvmrc`](./.nvmrc); run `nvm use` if you use nvm)
- [pnpm](https://pnpm.io/) 10

## Getting started

```sh
git clone https://github.com/bvaughn/react-lib-tools.git
cd react-lib-tools
pnpm install
pnpm dev
```

The dev server runs at http://localhost:3000. It also listens on your local network, so you can open it from a phone to test mobile layouts.

It serves two apps:

- `/` is the documentation site for a fictional **sample library** (see below). It's built with `AppRoot` and the other components in `lib/`, so it's the quickest way to see your changes; edits to `lib/` hot-reload.
- `/color-picker` is an internal tool for picking theme colors and generating OG images (`src/`).

## The sample library

[`fixtures/sample-lib/`](./fixtures/sample-lib) is a small, fictional component library that uses `react-lib-tools` the same way a real library (like `react-window`) does:

| Path                  | Contents                                                                                              |
| :-------------------- | :---------------------------------------------------------------------------------------------------- |
| `lib/`                | Components and an imperative handle, with TSDoc comments covering the features `compileDocs` supports |
| `src/`                | The documentation site: `App.tsx` (the `AppRoot` config), routes, and example snippets                |
| `public/generated/`   | Output of the compile scripts: docs and examples JSON, plus the search index                          |
| `README.md`           | Props tables inserted by `compileDocs`                                                                |
| `scripts/generate.ts` | Runs every compile script against the sample library                                                  |

Pages import from `react-lib-tools` and `sample-lib`; both are aliases for local source (`lib/` and `fixtures/sample-lib/lib/`).

The generated files are committed, so you only need to regenerate them when you change the compile scripts in `scripts/`, the sample library's TSDoc or examples, or page content that affects search:

```sh
pnpm fixtures:generate
```

This also starts a temporary dev server so the search index can be built by crawling the site with Puppeteer. If Puppeteer can't find a browser, set `CHROME_PATH` to a Chrome executable.

Review changes to the generated files as part of your pull request; they show exactly how a change to the scripts affects their output.

## Common commands

| Command                  | Description                                                     |
| :----------------------- | :-------------------------------------------------------------- |
| `pnpm dev`               | Start the dev server                                            |
| `pnpm fixtures:generate` | Regenerate the sample library's docs, examples and search index |
| `pnpm test`              | Run tests in watch mode                                         |
| `pnpm test:ci`           | Run tests once                                                  |
| `pnpm test:coverage`     | Run tests once with a coverage report (written to `coverage/`)  |
| `pnpm test:debug`        | Run tests with the Node inspector attached                      |
| `pnpm lint`              | Run ESLint                                                      |
| `pnpm prettier`          | Format all files                                                |
| `pnpm tsc`               | Type check                                                      |
| `pnpm build:lib`         | Build the published package into `dist/`                        |
| `pnpm build`             | Build the package and the docs website                          |

CI runs the build, ESLint, Prettier, TypeScript, and Vitest checks on every pull request; it's a good idea to run them locally before pushing.

## Writing tests

Tests use [Vitest](https://vitest.dev/) and live next to the code they test (`foo.ts` → `foo.test.ts`).

- The default test environment is `jsdom`. Tests for code in `scripts/`, which runs in Node, can opt out with a `// @vitest-environment node` comment at the top of the file.
- Use [Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for component tests.
- Tests fail on any unexpected `console.error` or `console.warn` (see [`vitest.setup.ts`](./vitest.setup.ts)). If an error is expected, assert on it with the `toLogError` matcher:

  ```ts
  expect(() => doSomething()).toLogError("Expected error message");
  ```

- `clientWidth`, `clientHeight`, `offsetWidth` and `offsetHeight` are stubbed to `0` in tests, because jsdom doesn't do layout.

## Code conventions

- Formatting is handled by Prettier, including Tailwind class sorting; don't hand-format.
- Style with Tailwind classes, and combine them with the `cn()` helper rather than string concatenation.
- Prefer `offsetWidth`/`offsetHeight` or `getBoundingClientRect()` over `clientWidth`/`clientHeight` (enforced by ESLint).
- TypeScript runs with `exactOptionalPropertyTypes`, so optional props that may be explicitly passed `undefined` should be typed `foo?: T | undefined`.
- React is a peer dependency with support for versions 18 and 19; avoid React 19-only APIs in `lib/`.
- Add a TSDoc comment to anything exported from [`lib/index.ts`](./lib/index.ts) or from a file in `scripts/`.

## Testing changes in a consuming project

The sample library covers most changes, but it's worth checking larger changes in a real documentation site such as `react-window`'s.

1. Build the package: `pnpm build:lib`. (Repeat this after each change to `lib/`. Changes to `scripts/` take effect immediately, because consumers import them as raw TypeScript.)
2. In the consuming project, point the dependency at your local checkout:

   ```sh
   pnpm link /path/to/react-lib-tools
   ```

   or set `"react-lib-tools": "file:../react-lib-tools"` in its `package.json` and reinstall.

3. Restart the consumer's dev server.

If styles are missing, check that the consumer's Tailwind `@source` directive resolves to your local checkout; Tailwind needs to scan this package's files to generate the classes it uses.

Remember to restore the consumer's original dependency when you're done.

## Submitting a pull request

1. Create a branch from `main`.
2. Make your change, including tests where practical.
3. If you changed anything in `scripts/`, run `pnpm fixtures:generate` and commit the updated output.
4. Make sure `pnpm lint`, `pnpm prettier:ci`, `pnpm tsc`, and `pnpm test:ci` all pass.
5. Open a pull request describing what changed and why. For visual changes, include before and after screenshots, ideally both desktop and mobile.

## Releasing (maintainers)

1. Bump `version` in `package.json` in a commit titled `<old> -> <new>` (for example `0.0.58 -> 0.0.59`).
2. Run `pnpm prerelease` to do a clean build of `dist/`.
3. Publish with `pnpm publish`.
4. Tag the release (for example `git tag 0.0.59`) and push the tag.
