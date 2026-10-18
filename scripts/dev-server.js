// This file is plain JavaScript (with types in dev-server.d.ts) so that it can be imported by a Vite config.
// Vite doesn't bundle dependencies when it loads a config file, and Node won't strip types from files in node_modules.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cwd } from "node:process";

export const DEFAULT_DEV_SERVER_PORT = 3000;

/**
 * Returns the port the docs dev server should use.
 * This is read from the `"react-lib-tools": { "devServerPort": number }` field in the app's package.json,
 * and defaults to 3000.
 */
export function getDevServerPort({ rootDir = cwd() } = {}) {
  const packageJsonPath = resolve(rootDir, "package.json");

  let packageJson;
  try {
    packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  } catch (error) {
    if (error?.code === "ENOENT") {
      return DEFAULT_DEV_SERVER_PORT;
    }
    throw error;
  }

  const port = packageJson?.["react-lib-tools"]?.devServerPort;
  if (port === undefined) {
    return DEFAULT_DEV_SERVER_PORT;
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw Error(
      `Invalid "react-lib-tools.devServerPort" in ${packageJsonPath}: ${JSON.stringify(port)}`
    );
  }

  return port;
}

/**
 * Returns Vite `server` options for the docs dev server.
 * The server fails to start (rather than trying another port) if the configured port is already in use,
 * so that scripts like `compileSearchIndex` don't connect to some other server.
 */
export function getDevServerConfig({ rootDir = cwd() } = {}) {
  return {
    port: getDevServerPort({ rootDir }),
    strictPort: true
  };
}
