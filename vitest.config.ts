import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      coverage: {
        include: ["lib/**/*.{ts,tsx}", "scripts/**/*.ts"],
        exclude: ["**/*.test.{ts,tsx}", "lib/test-utils.tsx"],
        provider: "v8",
        reporter: ["text-summary", "text", "html"]
      },
      environment: "jsdom",
      setupFiles: "./vitest.setup.ts"
    }
  })
);
