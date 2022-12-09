// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import adapter from "@sveltejs/adapter-auto";
import preprocess from "svelte-preprocess";
import { mdsvex } from "mdsvex";
import mdsvexConfig from "./mdsvex.config.js";
// import path from "path";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: [".svelte", ...mdsvexConfig.extensions],
  
  preprocess: [
    preprocess({
      postcss: true
    }),
    mdsvex(mdsvexConfig),
  ],
  kit: {
    adapter: adapter(),
  }
};

export default config;
