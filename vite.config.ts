import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { visualizer } from "rollup-plugin-visualizer";
import preserveDirectives from "rollup-preserve-directives";
import { defineConfig, type UserConfig } from "vite";
import dts from "vite-plugin-dts";
import svgr from "vite-plugin-svgr";
import { getDevServerConfig } from "./scripts/dev-server.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const libraryConfig: UserConfig = {
  build: {
    lib: {
      entry: resolve(__dirname, "lib/index.ts"),
      name: "react-lib-tools",
      fileName: "react-lib-tools",
      formats: ["cjs", "es"]
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"]
    },
    sourcemap: true,
    terserOptions: {
      compress: {
        directives: false
      }
    }
  },
  plugins: [
    react(),
    svgr(),
    dts({
      exclude: ["**/*.test.{ts,tsx}", "lib/test-utils.tsx"],
      rollupTypes: true
    }),
    preserveDirectives()
  ],
  publicDir: false
};

const websiteConfig: UserConfig = {
  base: "/",
  build: {
    minify: "terser",
    outDir: "docs",
    sourcemap: true,
    terserOptions: {
      format: {
        comments: false
      }
    }
  },
  plugins: [
    react(),
    svgr(),
    tailwindcss({ optimize: { minify: false } }),
    visualizer({
      emitFile: true,
      filename: "stats.html"
    })
  ],
  // The dev site is the sample library's docs (plus internal tools like the color picker)
  publicDir: resolve(__dirname, "fixtures/sample-lib/public"),
  resolve: {
    alias: {
      "react-lib-tools": resolve(__dirname, "lib"),
      "sample-lib": resolve(__dirname, "fixtures/sample-lib/lib")
    }
  }
};

// Allow iPhone to connect to the DEV site using a local IP
if (process.env.NODE_ENV === "development") {
  websiteConfig.server = {
    ...getDevServerConfig({ rootDir: __dirname }),
    host: true
  };
}

let config: UserConfig = {};
switch (process.env.TARGET) {
  case "lib": {
    config = libraryConfig;
    break;
  }
  default: {
    config = websiteConfig;
    break;
  }
}

// https://vite.dev/config/
export default defineConfig(config);
