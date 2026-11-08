import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import {
  test, expect, visit, canvasColorCount, installRuntimeProbe,
  navigateToMath, expectDetachedCanvasesStopped
} from "./fixtures.mjs";

const repository = fileURLToPath(new URL("../../", import.meta.url));
function pageRoutes(directory, segments = []) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      if (entry.name.includes("[")) return [];
      return pageRoutes(join(directory, entry.name), entry.name.startsWith("(") ? segments : [...segments, entry.name]);
    }
    return entry.name === "+page.svelte" ? ["/" + segments.join("/")] : [];
  });
}
function metadataValue(source, key) {
  const value = source.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim();
  if (!value) return undefined;
  if (value.startsWith('"') && value.endsWith('"')) return JSON.parse(value);
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1).replaceAll("''", "'");
  return value;
}
const staticRoutes = pageRoutes(join(repository, "src/routes")).sort();
const posts = ["Computer-Science", "Math", "Music", "Writing"].flatMap((category) =>
  readdirSync(join(repository, "src/posts", category)).filter((file) => file.endsWith(".md")).sort().map((file) => {
    const source = readFileSync(join(repository, "src/posts", category, file), "utf8").split("---")[1];
    return {
      route: `/${category}/${encodeURIComponent(file.slice(0, -3))}`,
      title: metadataValue(source, "title"),
      pdf: metadataValue(source, "pdfpath"),
      audio: metadataValue(source, "audiopath"),
      video: metadataValue(source, "videoid")
    };
  })
);

test("route inventory includes all 18 standalone pages and all 32 articles", async () => {
  expect(staticRoutes).toHaveLength(18);
  expect(posts).toHaveLength(32);
  expect(new Set([...staticRoutes, ...posts.map(({ route }) => route)]).size).toBe(50);
});

for (const route of staticRoutes) {
  test(`standalone route ${route} renders and hydrates`, async ({ page }) => {
    await visit(page, route);
    await expect(page.locator("body")).not.toContainText("Internal Error");
    await expect(page.locator("footer")).toContainText("Contact Information");
    await expect(page.locator("body")).not.toContainText("Failed to load module");
  });
}

for (const post of posts) {
  test(`article ${post.route} retains its content and media references`, async ({ page, request }) => {
    await visit(page, post.route);
    const article = page.locator("article");
    await expect(article.getByRole("heading", { name: post.title, exact: true })).toBeVisible();
    expect((await article.locator(".prose").innerText()).trim().length).toBeGreaterThan(20);
    await expect(page).toHaveTitle(new RegExp(post.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    for (const [path, selector, contentType] of [
      [post.pdf, 'embed[type="application/pdf"]', /application\/pdf/],
      [post.audio, "audio source", /audio\//]
    ]) {
      if (!path) continue;
      await expect(article.locator(selector)).toHaveAttribute("src", path);
      const response = await request.head(path);
      expect(response.status(), path).toBe(200);
      expect(response.headers()["content-type"], path).toMatch(contentType);
    }
    if (post.video) {
      await expect(article.locator("iframe")).toHaveAttribute("src", new RegExp(`/embed/${post.video}$`));
    }
  });
}

test("missing articles and unsupported categories remain 404 responses", async ({ request }) => {
  for (const route of ["/Writing/__missing_post__", "/__invalid_blog__/__missing_post__"]) {
    expect((await request.get(route)).status()).toBe(404);
  }
});

test("category cards navigate to articles and their back control restores the category", async ({ page }) => {
  await visit(page, "/Math");
  await page.getByRole("heading", { name: "Math", exact: true }).scrollIntoViewIfNeeded();
  await page.getByRole("link", { name: /Group Theory and Modern Cryptography/ }).click();
  await expect(page).toHaveURL(/\/Math\/ECC$/);
  await expect(page.locator("article")).toContainText("Group Theory and Modern Cryptography");
  await page.getByRole("button", { name: "back", exact: true }).click();
  await expect(page).toHaveURL(/\/Math$/);
});

test("homepage typewriter and E8 drawing survive navigation away and back", async ({ page }) => {
  await installRuntimeProbe(page);
  await visit(page, "/");
  const visibleLattice = page.locator('canvas[aria-label*="E8"]:visible');
  await expect(visibleLattice).toHaveCount(1);
  await expect.poll(() => canvasColorCount(visibleLattice)).toBeGreaterThan(1);
  // The empty heading is intentional until its section enters view.
  const heading = page.locator("h1").filter({ has: page.locator("span.cursor") });
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toContainText("Inter");
  await navigateToMath(page);
  await expectDetachedCanvasesStopped(page);
  // A client-side return creates a fresh component and must produce one complete heading.
  await page.locator('footer a[href="/"]').click();
  await expect(page).toHaveURL(/\/$/);
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveText("Interactive Projects!|", { timeout: 10000 });
  await expect(heading.locator(".cursor")).toBeHidden({ timeout: 5000 });
  await expect(page.locator('a[href="/tone-generator"]')).toBeVisible();
});

test.describe("mobile navigation", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("menu opens, routes to Math, closes, and can return Home", async ({ page }) => {
    await visit(page, "/Music");
    const toggle = page.getByRole("button", { name: /Pop-out Menu|navigation menu|menu/i });
    const panel = page.locator("nav aside");
    await toggle.click();
    await expect(panel.getByRole("link", { name: "Math", exact: true })).toBeInViewport();
    await panel.getByRole("link", { name: "Math", exact: true }).click();
    await expect(page).toHaveURL(/\/Math$/);
    await expect(panel.getByRole("link", { name: "Math", exact: true })).not.toBeInViewport();
    await toggle.click();
    await panel.getByRole("link", { name: "Home", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('canvas[aria-label*="E8"]:visible')).toHaveCount(1);
  });
});

test("Kilimanjaro lazy photos load and the full-resolution viewer closes cleanly", async ({ page }) => {
  await visit(page, "/Photography/Kilimanjaro");
  const photos = page.locator(".photoframe img");
  await expect(photos).toHaveCount(19);
  const last = photos.last();
  await expect(last).toHaveAttribute("src", /placeholder\.png$/);
  await last.scrollIntoViewIfNeeded();
  await expect(last).toHaveAttribute("src", /\/images\/kili\//);
  await expect.poll(() => last.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
  const first = photos.first();
  const alt = await first.getAttribute("alt");
  await first.click();
  const expanded = page.locator('img[src*="/kilihighres/"]');
  await expect(expanded).toHaveAttribute("alt", alt);
  await expect.poll(() => expanded.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  await page.keyboard.press("Escape");
  await expect(expanded).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  await first.click();
  await expect(expanded).toBeVisible();
  await page.mouse.click(20, 180);
  await expect(expanded).toHaveCount(0);
});
