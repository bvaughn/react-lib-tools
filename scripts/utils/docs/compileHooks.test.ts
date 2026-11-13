// @vitest-environment node

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { compileHooks } from "./compileHooks";

let rootDir: string;
let warn: ReturnType<typeof vi.spyOn>;

beforeEach(async () => {
  rootDir = await mkdtemp(join(tmpdir(), "react-lib-tools-hooks-"));
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  await rm(rootDir, { force: true, recursive: true });
});

async function writeLib(files: Record<string, string>) {
  for (const [path, content] of Object.entries(files)) {
    const filePath = join(rootDir, "lib", path);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, content);
  }
}

function compile(names: string[]) {
  return compileHooks({
    compilerOptions: { strict: true },
    names,
    rootDir
  });
}

describe("compileHooks", () => {
  test("should return nothing without hook names", async () => {
    expect(await compile([])).toEqual([]);
  });

  test("should warn about hooks that are not found", async () => {
    await writeLib({ "index.ts": "export function useA() {}\n" });

    const hooks = await compile(["useA", "useMissing"]);

    expect(hooks.map((hook) => hook.name)).toEqual(["useA"]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("useMissing");
  });

  test("should expand an options object declared as a named type", async () => {
    await writeLib({
      "index.ts": `
type Opts = {
  /** Delay in ms. */
  delay?: number;
  /** Callback. */
  onDone: () => void;
};

export function useTimer({ delay, onDone }: Opts) {
  return [delay, onDone];
}
`
    });

    const [hook] = await compile(["useTimer"]);

    expect(hook.parameters).toEqual([
      { description: "Delay in ms.", name: "delay", optional: true },
      { description: "Callback.", name: "onDone", optional: false }
    ]);
  });

  test("should handle parameters without JSDoc", async () => {
    await writeLib({
      "index.ts":
        "export function useA(a: number, b?: string) { return [a, b]; }\n"
    });

    const [hook] = await compile(["useA"]);

    expect(hook.parameters).toEqual([
      { description: "", name: "a", optional: false },
      { description: "", name: "b", optional: true }
    ]);
  });

  test("should support @returns and @return but drop other tags", async () => {
    await writeLib({
      "index.ts": `
/**
 * First.
 *
 * @returns The first value.
 * @example
 * \`\`\`ts
 * useFirst();
 * \`\`\`
 * @see https://example.com
 * @since 1.0.0
 */
export function useFirst() {}

/**
 * Second.
 *
 * @return The second value.
 * @deprecated Use useFirst.
 */
export function useSecond() {}
`
    });

    const hooks = await compile(["useFirst", "useSecond"]);
    const first = hooks.find((hook) => hook.name === "useFirst")!;
    const second = hooks.find((hook) => hook.name === "useSecond")!;

    expect(first.description).toBe("First.\n@returns The first value.");
    expect(second.description).toContain("@return The second value.");
    expect(second.description).toContain("@deprecated Use useFirst.");
  });

  test("should prefer the hook exported from lib/index.ts", async () => {
    await writeLib({
      "index.ts": 'export { useA } from "./public";\n',
      "internal.ts":
        "/** Internal. */\nexport function useA(secret: number) { return secret; }\n",
      "public.ts":
        "/** Public. */\nexport function useA(value: number) { return value; }\n"
    });

    const hooks = await compile(["useA"]);

    expect(hooks).toHaveLength(1);
    expect(hooks[0].description).toBe("Public.");
    expect(hooks[0].parameters.map((parameter) => parameter.name)).toEqual([
      "value"
    ]);
  });

  test("should resolve aliased exports and barrel files outside of lib/index.ts", async () => {
    await writeLib({
      "hooks/impl.ts": `
/** Aliased hook. */
function impl(a: number) { return a; }
export { impl as useAliased };

/** Barrel hook. */
export function useBarrel(b: number) { return b; }
`,
      "hooks/index.ts": 'export * from "./impl";\n',
      "index.ts": "export const unrelated = 1;\n"
    });

    const hooks = await compile(["useAliased", "useBarrel"]);

    expect(hooks.map((hook) => hook.name).sort()).toEqual([
      "useAliased",
      "useBarrel"
    ]);
    expect(warn).not.toHaveBeenCalled();
  });
});
