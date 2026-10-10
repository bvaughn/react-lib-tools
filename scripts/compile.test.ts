// @vitest-environment node

import { copyFile, mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { compileDocs } from "./compile-docs";
import { compileExamples } from "./compile-examples";

// These tests run the scripts against the sample library and compare the output to its committed files.
// If a change to the scripts is intentional, run "pnpm fixtures:generate" and commit the updated files.

const rootDir = resolve(__dirname, "..", "fixtures", "sample-lib");
const generatedDir = join(rootDir, "public", "generated");

let outputDir: string;

beforeEach(async () => {
  outputDir = await mkdtemp(join(tmpdir(), "react-lib-tools-"));

  // Silence progress logging
  vi.spyOn(console, "debug").mockImplementation(() => {});
});

afterEach(async () => {
  await rm(outputDir, { force: true, recursive: true });
});

async function expectOutputToMatchFixture(expectedDir: string) {
  const expectedFiles = (await readdir(expectedDir)).sort();
  const actualFiles = (await readdir(outputDir)).sort();

  expect(actualFiles).toEqual(expectedFiles);

  for (const file of expectedFiles) {
    const actual = await readFile(join(outputDir, file), "utf-8");
    const expected = await readFile(join(expectedDir, file), "utf-8");

    expect(actual, file).toBe(expected);
  }
}

describe("compileDocs", () => {
  test("should generate component and imperative handle docs", async () => {
    await compileDocs({
      componentNames: ["Badge", "Counter"],
      imperativeHandleNames: ["CounterImperativeHandle"],
      outputPath: [outputDir],
      readmePath: false,
      rootDir
    });

    await expectOutputToMatchFixture(join(generatedDir, "docs"));
  }, 60_000);

  test("should update props tables in the README", async () => {
    const readmePath = join(outputDir, "README.md");
    await copyFile(join(rootDir, "README.md"), readmePath);

    await compileDocs({
      componentNames: ["Badge", "Counter"],
      outputPath: [outputDir, "docs"],
      readmePath: [readmePath],
      rootDir
    });

    expect(await readFile(readmePath, "utf-8")).toBe(
      await readFile(join(rootDir, "README.md"), "utf-8")
    );
  }, 60_000);
});

describe("compileExamples", () => {
  test("should generate syntax highlighted examples", async () => {
    await compileExamples({
      outputPath: [outputDir],
      rootDir
    });

    await expectOutputToMatchFixture(join(generatedDir, "examples"));
  });

  test("should strip excluded text and hidden lines", async () => {
    await compileExamples({
      outputPath: [outputDir],
      rootDir
    });

    const { html } = JSON.parse(
      await readFile(join(outputDir, "CounterBasic.json"), "utf-8")
    );

    expect(html).not.toContain("&#60;begin&#62;");
    expect(html).not.toContain("hidden");
    expect(html).not.toContain("export");
    expect(html).toContain("CounterBasicExample");
  });
});
