import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { preview } from "vite";

// Run after `pnpm build` to exercise the compiled article renderer over HTTP.
const server = await preview({
  preview: { host: "127.0.0.1", port: 0, open: false }
});

try {
  const address = server.httpServer.address();
  assert(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}`;
  let checked = 0;

  for (const category of ["Computer-Science", "Math", "Music", "Writing"]) {
    const files = await readdir(new URL(`../src/posts/${category}/`, import.meta.url));
    for (const file of files.filter((name) => name.endsWith(".md"))) {
      const route = `/${category}/${encodeURIComponent(file.slice(0, -3))}`;
      const response = await fetch(base + route);
      assert.equal(response.status, 200, `${route} must render successfully`);
      const html = await response.text();
      assert.match(html, /<article[\s>]/, `${route} must contain the article`);
      assert.match(html, /class="[^"]*prose[\s-]/, `${route} must contain the article body`);
      checked++;
    }
  }

  assert(checked > 0, "Expected at least one article");
  for (const route of ["/Writing/__missing_post__", "/__invalid_blog__/__missing_post__"]) {
    const response = await fetch(base + route);
    assert.equal(response.status, 404, `${route} must remain a 404`);
    await response.text();
  }
  console.log(`Verified ${checked} article routes and 2 missing-article responses.`);
} finally {
  server.httpServer.closeAllConnections();
  await new Promise((resolve, reject) => {
    server.httpServer.close((error) => (error ? reject(error) : resolve()));
  });
}
