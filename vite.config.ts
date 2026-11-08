import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import adapter from "@sveltejs/adapter-vercel";
import tailwindcss from "@tailwindcss/vite";
import { mdsvex } from "mdsvex";
import wasm from "vite-plugin-wasm";
import mdsvexConfig from "./mdsvex.config.js";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      extensions: [".svelte", ...mdsvexConfig.extensions!],
      preprocess: [vitePreprocess({ script: true }), mdsvex(mdsvexConfig)],
      adapter: adapter({ runtime: "nodejs24.x" })
    }),
    wasm()
  ],
  define: {
    "import.meta.env.VERCEL_ANALYTICS_ID": JSON.stringify(process.env.VERCEL_ANALYTICS_ID ?? "")
  },
  ssr: { noExternal: ["game-of-life"] },
  server: { host: "localhost", port: 4000 }
});
