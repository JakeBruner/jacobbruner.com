// vite.config.ts
import { sveltekit } from "file:///Users/jakebruner/Documents/GitHub/jacobbruner.com/node_modules/@sveltejs/kit/src/exports/vite/index.js";
import wasm from "file:///Users/jakebruner/Documents/GitHub/jacobbruner.com/node_modules/vite-plugin-wasm/exports/import.mjs";
import path from "path";
var config = {
  plugins: [
    // I made this plugin to fix a weird bug with vite saying that the extension '.css' was unknown
    {
      name: "fix-animatecss-bug",
      transform(code, id, options = {}) {
        if (options.ssr) return code.replace(/import .animate\.css.*$/gm, "");
      }
      // gets rid of the import
    },
    sveltekit(),
    wasm()
    // wasmPack(["./game-of-life"]),
  ],
  define: {
    "import.meta.env.VERCEL_ANALYTICS_ID": JSON.stringify(process.env.VERCEL_ANALYTICS_ID)
  },
  optimizeDeps: {
    exclude: ["./game-of-life", "svelte-heros-v2"]
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
    port: 4e3,
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
var vite_config_default = config;
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvamFrZWJydW5lci9Eb2N1bWVudHMvR2l0SHViL2phY29iYnJ1bmVyLmNvbVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2pha2VicnVuZXIvRG9jdW1lbnRzL0dpdEh1Yi9qYWNvYmJydW5lci5jb20vdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2pha2VicnVuZXIvRG9jdW1lbnRzL0dpdEh1Yi9qYWNvYmJydW5lci5jb20vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tIFwiQHN2ZWx0ZWpzL2tpdC92aXRlXCI7XG5pbXBvcnQgdHlwZSB7IFVzZXJDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuLy8gaW1wb3J0IHdhc21QYWNrIGZyb20gXCJ2aXRlLXBsdWdpbi13YXNtLXBhY2tcIjtcbmltcG9ydCB3YXNtIGZyb20gXCJ2aXRlLXBsdWdpbi13YXNtXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuXG4vKiogQHR5cGUge2ltcG9ydCgndml0ZScpLlVzZXJDb25maWd9ICovXG5jb25zdCBjb25maWc6IFVzZXJDb25maWcgPSB7XG4gIHBsdWdpbnM6IFtcbiAgICAvLyBJIG1hZGUgdGhpcyBwbHVnaW4gdG8gZml4IGEgd2VpcmQgYnVnIHdpdGggdml0ZSBzYXlpbmcgdGhhdCB0aGUgZXh0ZW5zaW9uICcuY3NzJyB3YXMgdW5rbm93blxuICAgIHtcbiAgICAgIG5hbWU6IFwiZml4LWFuaW1hdGVjc3MtYnVnXCIsXG4gICAgICB0cmFuc2Zvcm0oY29kZSwgaWQsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBpZiAob3B0aW9ucy5zc3IpIHJldHVybiBjb2RlLnJlcGxhY2UoL2ltcG9ydCAuYW5pbWF0ZVxcLmNzcy4qJC9nbSwgXCJcIik7XG4gICAgICB9IC8vIGdldHMgcmlkIG9mIHRoZSBpbXBvcnRcbiAgICB9LFxuICAgIHN2ZWx0ZWtpdCgpLFxuICAgIHdhc20oKVxuICAgIC8vIHdhc21QYWNrKFtcIi4vZ2FtZS1vZi1saWZlXCJdKSxcbiAgXSxcbiAgZGVmaW5lOiB7XG4gICAgXCJpbXBvcnQubWV0YS5lbnYuVkVSQ0VMX0FOQUxZVElDU19JRFwiOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5WRVJDRUxfQU5BTFlUSUNTX0lEKVxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbXCIuL2dhbWUtb2YtbGlmZVwiLCBcInN2ZWx0ZS1oZXJvcy12MlwiXVxuICB9LFxuICBzc3I6IHtcbiAgICBub0V4dGVybmFsOiBbXCJ0aHJlZVwiLCBcInRyb2lrYS10aHJlZS10ZXh0XCJdXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgbWluaWZ5OiB0cnVlXG4gICAgLy8gdGFyZ2V0OiBcImVzbmV4dFwiXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwibG9jYWxob3N0XCIsXG4gICAgcG9ydDogNDAwMCxcbiAgICBmczoge1xuICAgICAgLy8hIHRoaXMgc2hvdWxkIGJlIGNoYW5nZWQgdG8gb25seSBpbmNsdWRlIHNwZWNpZmljIHBhdGhzXG4gICAgICBzdHJpY3Q6IGZhbHNlXG4gICAgfVxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICRjb21wb25lbnRzOiBwYXRoLnJlc29sdmUoXCIuL3NyYy9jb21wb25lbnRzXCIpXG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjb25maWc7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdVLFNBQVMsaUJBQWlCO0FBR2xXLE9BQU8sVUFBVTtBQUNqQixPQUFPLFVBQVU7QUFHakIsSUFBTSxTQUFxQjtBQUFBLEVBQ3pCLFNBQVM7QUFBQTtBQUFBLElBRVA7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLFVBQVUsTUFBTSxJQUFJLFVBQVUsQ0FBQyxHQUFHO0FBQ2hDLFlBQUksUUFBUSxJQUFLLFFBQU8sS0FBSyxRQUFRLDZCQUE2QixFQUFFO0FBQUEsTUFDdEU7QUFBQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFVBQVU7QUFBQSxJQUNWLEtBQUs7QUFBQTtBQUFBLEVBRVA7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLHVDQUF1QyxLQUFLLFVBQVUsUUFBUSxJQUFJLG1CQUFtQjtBQUFBLEVBQ3ZGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsa0JBQWtCLGlCQUFpQjtBQUFBLEVBQy9DO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDSCxZQUFZLENBQUMsU0FBUyxtQkFBbUI7QUFBQSxFQUMzQztBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBO0FBQUEsRUFFVjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sSUFBSTtBQUFBO0FBQUEsTUFFRixRQUFRO0FBQUEsSUFDVjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLGFBQWEsS0FBSyxRQUFRLGtCQUFrQjtBQUFBLElBQzlDO0FBQUEsRUFDRjtBQUNGO0FBRUEsSUFBTyxzQkFBUTsiLAogICJuYW1lcyI6IFtdCn0K
