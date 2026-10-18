export declare const DEFAULT_DEV_SERVER_PORT = 3000;

/**
 * Returns the port the docs dev server should use.
 * This is read from the `"react-lib-tools": { "devServerPort": number }` field in the app's package.json,
 * and defaults to 3000.
 */
export declare function getDevServerPort(options?: {
  /**
   * Directory containing the app's package.json.
   * Defaults to the current working directory.
   */
  rootDir?: string | undefined;
}): number;

/**
 * Returns Vite `server` options for the docs dev server.
 * The server fails to start (rather than trying another port) if the configured port is already in use,
 * so that scripts like `compileSearchIndex` don't connect to some other server.
 */
export declare function getDevServerConfig(options?: {
  /**
   * Directory containing the app's package.json.
   * Defaults to the current working directory.
   */
  rootDir?: string | undefined;
}): {
  port: number;
  strictPort: true;
};
