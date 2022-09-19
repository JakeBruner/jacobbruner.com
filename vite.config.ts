import { sveltekit } from "@sveltejs/kit/vite";
import type { UserConfig } from "vite";

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
  ],
  ssr: {
    noExternal: ["three", "troika-three-text"],
  },
  server: {
    host: "localhost",
    port: 3000,
  },
};

export default config;
