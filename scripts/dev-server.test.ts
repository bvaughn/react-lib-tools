// @vitest-environment node

import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import {
  DEFAULT_DEV_SERVER_PORT,
  getDevServerConfig,
  getDevServerPort
} from "./dev-server.js";

let rootDir: string;

beforeEach(async () => {
  rootDir = await mkdtemp(join(tmpdir(), "react-lib-tools-"));
});

afterEach(async () => {
  await rm(rootDir, { force: true, recursive: true });
});

async function writePackageJson(json: object) {
  await writeFile(join(rootDir, "package.json"), JSON.stringify(json));
}

describe("getDevServerPort", () => {
  test("should default to port 3000 if there is no package.json", () => {
    expect(getDevServerPort({ rootDir })).toBe(DEFAULT_DEV_SERVER_PORT);
  });

  test("should default to port 3000 if no port is configured", async () => {
    await writePackageJson({ name: "test" });

    expect(getDevServerPort({ rootDir })).toBe(DEFAULT_DEV_SERVER_PORT);
  });

  test("should read the port from package.json", async () => {
    await writePackageJson({ "react-lib-tools": { devServerPort: 3456 } });

    expect(getDevServerPort({ rootDir })).toBe(3456);
  });

  test.each(["3456", 0, 1.5, 65536])(
    "should throw for an invalid port: %s",
    async (devServerPort) => {
      await writePackageJson({ "react-lib-tools": { devServerPort } });

      expect(() => getDevServerPort({ rootDir })).toThrow(
        'Invalid "react-lib-tools.devServerPort"'
      );
    }
  );
});

describe("getDevServerConfig", () => {
  test("should require the configured port", async () => {
    await writePackageJson({ "react-lib-tools": { devServerPort: 3456 } });

    expect(getDevServerConfig({ rootDir })).toEqual({
      port: 3456,
      strictPort: true
    });
  });
});
