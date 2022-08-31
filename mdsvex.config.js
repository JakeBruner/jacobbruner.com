import { defineMDSveXConfig as defineConfig } from "mdsvex";

import { fileURLToPath } from "url";

import * as path from "path";

const dirname = path.resolve(fileURLToPath(import.meta.url), "../");

// https://mdsvex.pngwn.io/docs#smartypants=
const config = defineConfig({
  extensions: [".md", ".svx"],
  smartypants: {
    dashes: "oldschool",
  },
  layout: {
    blog: path.join(dirname, "./src/lib/blog/layout.svelte"),
  },
});

export default config;
