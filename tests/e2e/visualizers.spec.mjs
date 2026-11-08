import {
  test, expect, visit, installRuntimeProbe, canvasColorCount,
  navigateToMath, expectDetachedCanvasesStopped
} from "./fixtures.mjs";

test.use({ viewport: { width: 1000, height: 800 } });

test("j-invariant compiles real shaders, changes hue, and switches to a functioning CPU renderer", async ({ page }) => {
  await installRuntimeProbe(page);
  await visit(page, "/jvar");
  const canvas = page.getByLabel("Klein j-invariant visualization");
  await expect(canvas).toBeVisible();
  const shaders = await page.evaluate(() => ({ compiles: window.__siteProbe.webgl.compiles, links: window.__siteProbe.webgl.links }));
  expect(shaders.compiles.length).toBeGreaterThanOrEqual(2);
  expect(shaders.links.length).toBeGreaterThanOrEqual(1);
  expect(shaders.compiles.filter(({ ok }) => !ok), "Actual shader compilation must succeed").toEqual([]);
  expect(shaders.links.filter(({ ok }) => !ok), "Actual program linking must succeed").toEqual([]);
  await expect.poll(() => page.evaluate(() => Math.max(0, ...window.__siteProbe.webgl.samples.map(({ colors }) => colors)))).toBeGreaterThan(1);
  const before = await page.evaluate(() => window.__siteProbe.webgl.samples.at(-1).checksum);
  const captures = await page.evaluate(() => { window.__siteProbe.webgl.capture = true; return window.__siteProbe.webgl.samples.length; });
  await page.getByLabel("Color Hue:").evaluate((input) => {
    input.value = "0.5";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect.poll(() => page.evaluate(() => window.__siteProbe.webgl.samples.length)).toBeGreaterThan(captures);
  expect(await page.evaluate(() => window.__siteProbe.webgl.samples.at(-1).checksum)).not.toBe(before);

  const documentMarker = await page.evaluate(() => window.__testDocumentMarker = crypto.randomUUID());
  const webgl = page.getByLabel("Use WebGL:");
  await webgl.uncheck();
  await expect(webgl).not.toBeChecked();
  expect(await page.evaluate(() => window.__testDocumentMarker)).toBe(documentMarker);
  await expect.poll(() => canvasColorCount(canvas), { timeout: 15000 }).toBeGreaterThan(1);
  await webgl.check();
  await expect(webgl).toBeChecked();
  await expect.poll(() => page.evaluate(() => window.__siteProbe.webgl.links.length)).toBeGreaterThan(shaders.links.length);
  await page.setViewportSize({ width: 1100, height: 820 });
  await expect(canvas).toHaveAttribute("width", "1100");
  await expect(canvas).toHaveAttribute("height", "820");
  await navigateToMath(page);
  await expectDetachedCanvasesStopped(page);
});

test("Mandelbrot draws a nonuniform image through WebGL and stops after navigation", async ({ page }) => {
  await installRuntimeProbe(page);
  await visit(page, "/mandelbrot");
  await expect(page.locator("canvas")).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__siteProbe.webgl.draws)).toBeGreaterThan(1);
  await expect.poll(() => page.evaluate(() => Math.max(0, ...window.__siteProbe.webgl.samples.map(({ colors }) => colors)))).toBeGreaterThan(1);
  const links = await page.evaluate(() => window.__siteProbe.webgl.links);
  expect(links.some(({ ok }) => ok)).toBe(true);
  await navigateToMath(page);
  await expectDetachedCanvasesStopped(page);
});

test("p-adic output shows the last 50 decimal digits of the displayed powers and draws them", async ({ page }) => {
  await visit(page, "/p-adic");
  const expected = Array.from({ length: 5 }, (_, index) => {
    const exponent = 10n ** BigInt(index);
    return `${(2n ** exponent).toString().slice(-50)} (${index})`;
  });
  await expect(page.locator("pre")).toHaveText(expected.join("\n"));
  await expect.poll(() => canvasColorCount(page.locator("canvas"))).toBeGreaterThan(1);
});
