import { sveltekit } from "@sveltejs/kit/vite";
import type { UserConfig } from "vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import path from "path";

/** @type {import('vite').UserConfig} */
const config: UserConfig = {
  plugins: [
    // I made this plugin to fix a weird bug with vite saying that the extension '.css' was unknown
    {
      name: "fix-animatecss-bug",
      transform(code, id, options = {}) {
        if (options.ssr) return code.replace(/import .animate\.css.*$/gm, ""); // woo i did some regex
      }, // gets rid of the import
    },
    sveltekit(),
    wasm(),
    topLevelAwait(),
  ],
  optimizeDeps: {
    exclude: ["./game-of-life"],
  },
  ssr: {
    noExternal: ["three", "troika-three-text"],
  },
  build: {
    minify: true,
  },
  server: {
    host: "localhost",
    port: 3000,
  },
  resolve: {
    alias: {
      $rust: path.resolve("./game-of-life/pkg"),
    },
  },
};

export default config;
