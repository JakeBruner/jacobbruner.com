import { sveltekit } from "@sveltejs/kit/vite";
import type { UserConfig } from "vite";
import wasmPack from "vite-plugin-wasm-pack";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
// import path from "path";

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
    topLevelAwait(),
    wasmPack("./game-of-life")
  ],
  optimizeDeps: {
    exclude: ["./game-of-life"]
  },
  ssr: {
    noExternal: ["three", "troika-three-text"]
  },
  build: {
    minify: true
  },
  server: {
    host: "localhost",
    port: 4000
  }
  // resolve: {
  //   alias: {
  //     $rust: path.resolve(__dirname, "./game-of-life/pkg")
  //   }
  // }
};

export default config;
