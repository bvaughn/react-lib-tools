// @vitest-environment node

import { parseFromSource, type InterfaceNode } from "@ts-ast-parser/core";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { compileImperativeHandle } from "./compileImperativeHandle";

let outputDir: string;

beforeEach(async () => {
  outputDir = await mkdtemp(join(tmpdir(), "react-lib-tools-handle-"));
  vi.spyOn(console, "debug").mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  await rm(outputDir, { force: true, recursive: true });
});

async function compile(source: string) {
  const result = await parseFromSource(source);
  const node = result.project
    ?.getModules()[0]
    ?.getDeclarationByName("Handle") as unknown as InterfaceNode;

  const readme = await compileImperativeHandle({
    filePath: "lib/Handle.ts",
    interfaceNode: node,
    outputDir
  });
  const json = JSON.parse(
    await readFile(join(outputDir, "Handle.json"), "utf8")
  );

  return { json, readme };
}

describe("compileImperativeHandle", () => {
  test("should keep dotted @param names intact", async () => {
    const { json, readme } = await compile(`
/** Handle. */
export interface Handle {
  /**
   * Summary.
   *
   * @param tab Tab to add
   * @param options.size Size of the tabset
   */
  addTab: (tab: string, options?: { size?: number }) => void;
}
`);

    const description = readme.methods[0].description;
    expect(description).toContain("@param tab Tab to add");
    expect(description).toContain("@param options.size Size of the tabset");
    expect(description).not.toContain("options .size");

    const html = json.methods[0].description
      .map((section: { content: string }) => section.content)
      .join("");
    expect(html).toContain("<li><code>tab</code> Tab to add</li>");
    expect(html).toContain(
      "<li><code>options.size</code> Size of the tabset</li>"
    );
  });
});
