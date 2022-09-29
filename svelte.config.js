import adapter from "@sveltejs/adapter-auto";
import preprocess from "svelte-preprocess";
import { mdsvex } from "mdsvex";
import mdsvexConfig from "./mdsvex.config.js";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: [".svelte", ...mdsvexConfig.extensions],
  preprocess: [
    preprocess({
      postcss: true,
    }),
    mdsvex(mdsvexConfig),
  ],
  kit: {
    adapter: adapter(),
    // vite: {
    //   plugins: [
    //     wasmPack('./game-of-life/pkg',
    //     //   {
    //     //   crateDirectory: './wasm',
    //     //   outDir: './wasm/pkg',
    //     //   outName: 'wasm',
    //     //   outExtension: '.js',
    //     //   outDirRelative: true,
    //     //   watchDirectories: ['./wasm/src'],
    //     //   extraArgs: '--target web',
    //     // }
    //     ),
    //   ],
    //   optimizeDeps: {
    //     exclude: ['game-of-life'],
    //   },
    // },
  },
};

export default config;
