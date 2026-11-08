import {
  test, expect, visit, installRuntimeProbe, navigateToMath,
  expectDetachedCanvasesStopped, settleFrames
} from "./fixtures.mjs";

test.use({ colorScheme: "light", viewport: { width: 1280, height: 900 } });

async function tickCount(page) {
  const text = await page.locator("p").filter({ hasText: /Tick:\s*\d+/ }).innerText();
  return Number(text.match(/Tick:\s*(\d+)/)[1]);
}

async function readBoard(page) {
  return page.getByLabel("Game of Life cells").evaluate((canvas) => {
    const context = canvas.getContext("2d");
    const columns = Math.floor((canvas.width - 1) / 9);
    const rows = Math.floor((canvas.height - 1) / 9);
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    const alive = [];
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const offset = ((row * 9 + 5) * canvas.width + column * 9 + 5) * 4;
        if (data[offset + 3] > 0 && data[offset] < 100 && data[offset + 1] < 100 && data[offset + 2] < 100) {
          alive.push([row, column]);
        }
      }
    }
    return { columns, rows, alive };
  });
}

test("Game of Life modes, cell toggling, reset, pause, and resume retain their behavior", async ({ page }) => {
  await installRuntimeProbe(page);
  await visit(page, "/game-of-life");
  await expect.poll(() => tickCount(page)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(page.getByRole("button", { name: "Start", exact: true })).toBeEnabled();
  const pausedAt = await tickCount(page);
  await settleFrames(page, 8);
  expect(await tickCount(page)).toBe(pausedAt);

  const mode = page.getByLabel("Mode:", { exact: true });
  await mode.selectOption({ label: "Clear Canvas" });
  expect((await readBoard(page)).alive).toHaveLength(0);
  expect(await tickCount(page)).toBe(0);
  const canvas = page.getByLabel("Game of Life cells");
  const point = await canvas.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return { x: (5 * 9 + 5) * box.width / element.width, y: (5 * 9 + 5) * box.height / element.height };
  });
  await canvas.click({ position: point });
  expect((await readBoard(page)).alive).toEqual([[5, 5]]);
  await canvas.click({ position: point });
  expect((await readBoard(page)).alive).toHaveLength(0);

  for (const [label, expected] of [["Spawn Glider", 5], ["Spawn Glider Gun", 36]]) {
    await mode.selectOption({ label });
    expect((await readBoard(page)).alive, label).toHaveLength(expected);
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    expect((await readBoard(page)).alive, `${label} reset`).toHaveLength(expected);
    expect(await tickCount(page)).toBe(0);
  }
  await mode.selectOption({ label: "Math Pattern" });
  const math = await readBoard(page);
  const expectedMathCells = Array.from({ length: math.columns * math.rows }, (_, i) => i)
    .filter((i) => i % 3 === 0 || i % 7 === 0).length;
  expect(math.alive).toHaveLength(expectedMathCells);

  await mode.selectOption({ label: "Random" });
  const density = page.getByLabel("Density", { exact: true });
  await density.fill("0");
  await density.press("Tab");
  expect((await readBoard(page)).alive).toHaveLength(0);
  await density.fill("1");
  await density.press("Tab");
  const full = await readBoard(page);
  expect(full.alive).toHaveLength(full.columns * full.rows);
  await mode.selectOption({ label: "Spawn Glider" });
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect.poll(() => tickCount(page)).toBeGreaterThan(0);
  await navigateToMath(page);
  await expectDetachedCanvasesStopped(page);
});

test("Game of Life zero or blank TPS pauses progression and valid TPS recovers", async ({ page }) => {
  await visit(page, "/game-of-life");
  await expect.poll(() => tickCount(page)).toBeGreaterThan(0);
  const tps = page.getByLabel("Ticks per second");
  for (const value of ["0", ""]) {
    await tps.fill(value);
    await tps.press("Tab");
    await settleFrames(page);
    const frozen = await tickCount(page);
    await settleFrames(page, 8);
    expect(await tickCount(page)).toBe(frozen);
    await tps.fill("30");
    await expect.poll(() => tickCount(page)).toBeGreaterThan(frozen);
  }
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  expect(await tickCount(page)).toBe(0);
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect.poll(() => tickCount(page)).toBeGreaterThan(0);
});

test("elliptic curve table has the known order, identity, symmetry, and selected subgroups", async ({ page }) => {
  await visit(page, "/elliptic-curve");
  await expect(page.locator("body")).toContainText(/order\s*=\s*14/);
  const table = page.locator("table");
  await expect(table.locator("tr")).toHaveCount(15);
  const cells = await table.locator("tr").evaluateAll((rows) => rows.map((row) => [...row.cells].map((cell) => cell.textContent.trim())));
  expect(cells.every((row) => row.length === 15)).toBe(true);
  expect(cells[0][1]).toBe("∞");
  expect(cells[1].slice(1)).toEqual(cells[0].slice(1));
  for (let row = 1; row < cells.length; row++) {
    expect(cells[row][1]).toBe(cells[row][0]);
    for (let column = 1; column < cells.length; column++) expect(cells[row][column]).toBe(cells[column][row]);
  }
  // (7,0) has order 2: doubling a point with y=0 gives the point at infinity.
  await table.getByRole("button", { name: "(7, 0)", exact: true }).first().click();
  await expect(page.locator("h5").filter({ hasText: "(7, 0)" })).toContainText(/=\s*2/);
  await table.getByRole("button", { name: "∞", exact: true }).first().press("Enter");
  await expect(page.locator("h5").filter({ hasText: "∞" })).toContainText(/=\s*1/);
  await page.getByLabel("Curve coefficient a", { exact: true }).fill("5");
  await expect(page.getByText("Click on a point to generate its subgroup!", { exact: true })).toBeVisible();
});

test("elliptic curve rejects composite/blank moduli and recovers after valid input", async ({ page }) => {
  await visit(page, "/elliptic-curve");
  const prime = page.getByLabel("Prime modulus", { exact: true });
  for (const value of ["9", "1", ""]) {
    await prime.fill(value);
    await prime.press("Tab");
    await expect(page.getByText("*must be prime", { exact: true })).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(page.locator("table tr")).toHaveCount(15);
  }
  await prime.fill("13");
  await expect(page.getByText("*must be prime", { exact: true })).not.toHaveCSS("color", "rgb(255, 0, 0)");
  await expect(page.locator("body")).toContainText(/order\s*=\s*14/);
  await page.getByLabel("Curve coefficient a", { exact: true }).fill("0");
  await page.getByLabel("Curve coefficient b", { exact: true }).fill("0");
  await expect(page.getByText("discriminant = 0", { exact: true })).toBeVisible();
  await page.getByLabel("Curve coefficient a", { exact: true }).fill("4");
  await page.getByLabel("Curve coefficient b", { exact: true }).fill("6");
  await expect(page.locator("body")).toContainText(/order\s*=\s*14/);
});

test("GTB returns all 209 four-letter matches, narrows known letters, and handles invalid patterns", async ({ page }) => {
  await visit(page, "/guess-the-build-solver");
  const input = page.getByLabel("Enter guess here:");
  const resultCount = page.locator("h4").filter({ hasText: /result/ });
  const results = page.locator("ul.mono li");
  await input.fill("____");
  await expect(resultCount).toHaveText("209 results");
  await expect(results).toHaveCount(209);
  const words = await results.allTextContents();
  expect(words.every((word) => word.trim().length === 4)).toBe(true);
  expect(new Set(words.map((word) => word.trim().toLowerCase())).size).toBe(209);
  const known = words[0].trim();
  await input.fill(known.toUpperCase());
  await expect(resultCount).toHaveText("1 result");
  await expect(results).toHaveText([new RegExp(`^\\s*${known}\\s*$`, "i")]);
  await input.fill(`${known[0]}___`);
  const narrowed = await results.allTextContents();
  expect(narrowed.length).toBeGreaterThan(0);
  expect(narrowed.length).toBeLessThan(209);
  expect(narrowed.every((word) => word.trim().toLowerCase().startsWith(known[0].toLowerCase()))).toBe(true);
  for (const value of ["[___", "zzzzzzzzzzzzzzzz", ""]) {
    await input.fill(value);
    await expect(resultCount).toHaveText("0 results");
    await expect(results).toHaveCount(0);
  }
});
