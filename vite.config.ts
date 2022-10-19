import { sveltekit } from "@sveltejs/kit/vite";
import type { UserConfig } from "vite";
// import wasmPack from "vite-plugin-wasm-pack";
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
        if (options.ssr) return code.replace(/import .animate\.css.*$/gm, "");
      } // gets rid of the import
    },
    sveltekit(),
    wasm(),
    // wasmPack(["./game-of-life"]),
    topLevelAwait()
  ],
  optimizeDeps: {
    exclude: ["./game-of-life"]
  },
  ssr: {
    noExternal: ["three", "troika-three-text"]
  },
  build: {
    minify: true
    // target: "esnext"
  },
  server: {
    host: "localhost",
    port: 4000,
    fs: {
      //! this should be changed to only include specific paths
      strict: false
    }
  },
  resolve: {
    alias: {
      $components: path.resolve("./src/components")
    }
  }
};

export default config;
