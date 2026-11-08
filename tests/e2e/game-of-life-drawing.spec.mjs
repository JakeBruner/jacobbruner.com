import { test, expect, visit, settleFrames } from "./fixtures.mjs";

test.use({ colorScheme: "light", viewport: { width: 1280, height: 900 } });

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
    return alive;
  });
}

const rowCells = (row, first, last) => Array.from({ length: last - first + 1 }, (_, index) => [row, first + index]);

async function cellPoint(page, row, column) {
  return page.getByLabel("Game of Life cells").evaluate((canvas, cell) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: rect.left + canvas.clientLeft + (cell.column * 9 + 5) * canvas.clientWidth / canvas.width,
      y: rect.top + canvas.clientTop + (cell.row * 9 + 5) * canvas.clientHeight / canvas.height
    };
  }, { row, column });
}

async function moveToCell(page, row, column) {
  const point = await cellPoint(page, row, column);
  // One sample deliberately leaves gaps for the application to interpolate.
  await page.mouse.move(point.x, point.y, { steps: 1 });
}

async function beginMouseStroke(page, row, column) {
  const canvas = page.getByLabel("Game of Life cells");
  await canvas.evaluate((element) => {
    element.addEventListener("pointerdown", (event) => {
      element.dataset.testPointerId = String(event.pointerId);
    }, { once: true });
  });
  await moveToCell(page, row, column);
  await page.mouse.down();
  return canvas.evaluate((element) => Number(element.dataset.testPointerId));
}

async function emptyPausedBoard(page) {
  await visit(page, "/game-of-life");
  await expect(page.getByRole("button", { name: "Stop", exact: true })).toBeEnabled();
  await page.getByLabel("Mode:", { exact: true }).selectOption({ label: "Clear Canvas" });
  await expect(page.getByRole("button", { name: "Start", exact: true })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Stop", exact: true })).toBeDisabled();
  expect(await readBoard(page)).toEqual([]);
  await page.getByLabel("Game of Life cells").scrollIntoViewIfNeeded();
}

test("Game of Life clear mode pauses automatically and single clicks toggle exactly once", async ({ page }) => {
  await emptyPausedBoard(page);
  await settleFrames(page, 8);
  await expect(page.locator("p").filter({ hasText: /Tick:\s*\d+/ })).toContainText(/Tick:\s*0/);
  const point = await cellPoint(page, 5, 5);
  await page.mouse.click(point.x, point.y);
  expect(await readBoard(page)).toEqual([[5, 5]]);
  await page.mouse.click(point.x, point.y);
  expect(await readBoard(page)).toEqual([]);

  // Keep the simulation running without generations changing the clicked cell.
  await page.getByLabel("Ticks per second").fill("0");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByRole("button", { name: "Stop", exact: true })).toBeEnabled();
  await page.getByLabel("Game of Life cells").scrollIntoViewIfNeeded();
  const runningPoint = await cellPoint(page, 5, 5);
  await page.mouse.click(runningPoint.x, runningPoint.y);
  expect(await readBoard(page)).toEqual([[5, 5]]);
  await page.mouse.click(runningPoint.x, runningPoint.y);
  expect(await readBoard(page)).toEqual([]);
});

test("Game of Life sparse mouse drags paint continuous lines without retoggling revisited cells", async ({ page }) => {
  await emptyPausedBoard(page);
  await beginMouseStroke(page, 5, 4);
  await moveToCell(page, 5, 14);
  await moveToCell(page, 5, 4);
  await moveToCell(page, 5, 14);
  await page.mouse.up();
  expect(await readBoard(page)).toEqual(rowCells(5, 4, 14));

  // Starting on an empty cell paints through existing live cells unchanged.
  await beginMouseStroke(page, 5, 2);
  await moveToCell(page, 5, 16);
  await page.mouse.up();
  expect(await readBoard(page)).toEqual(rowCells(5, 2, 16));
});

test("Game of Life starting on a live cell erases the entire stroke, including revisits and empty cells", async ({ page }) => {
  await emptyPausedBoard(page);
  await beginMouseStroke(page, 5, 4);
  await moveToCell(page, 5, 14);
  await page.mouse.up();
  await beginMouseStroke(page, 5, 7);
  await moveToCell(page, 5, 16);
  await moveToCell(page, 5, 4);
  await page.mouse.up();
  expect(await readBoard(page)).toEqual([]);
});

test("Game of Life sparse diagonal and vertical drags leave no missing cells", async ({ page }) => {
  await emptyPausedBoard(page);
  await beginMouseStroke(page, 4, 4);
  await moveToCell(page, 12, 12);
  await page.mouse.up();
  const diagonal = Array.from({ length: 9 }, (_, index) => [4 + index, 4 + index]);
  expect(await readBoard(page)).toEqual(diagonal);
  await beginMouseStroke(page, 4, 18);
  await moveToCell(page, 12, 18);
  await page.mouse.up();
  const combined = [...diagonal, ...Array.from({ length: 9 }, (_, index) => [4 + index, 18])]
    .sort(([rowA, columnA], [rowB, columnB]) => rowA - rowB || columnA - columnB);
  expect(await readBoard(page)).toEqual(combined);
});

test("Game of Life ignores right buttons and other pointers during a primary stroke", async ({ page }) => {
  await emptyPausedBoard(page);
  await moveToCell(page, 5, 5);
  await page.mouse.down({ button: "right" });
  await moveToCell(page, 5, 12);
  await page.mouse.up({ button: "right" });
  await page.keyboard.press("Escape");
  expect(await readBoard(page)).toEqual([]);

  const secondaryPoint = await cellPoint(page, 10, 10);
  await page.getByLabel("Game of Life cells").dispatchEvent("pointerdown", {
    pointerId: 99, pointerType: "touch", isPrimary: false, button: 0, buttons: 1,
    clientX: secondaryPoint.x, clientY: secondaryPoint.y
  });
  expect(await readBoard(page)).toEqual([]);

  const pointerId = await beginMouseStroke(page, 5, 5);
  const otherPoint = await cellPoint(page, 10, 10);
  await page.getByLabel("Game of Life cells").evaluate((canvas, details) => {
    // Secondary touch and another primary device must not replace the active pointer.
    for (const [offset, isPrimary, pointerType] of [[1000, false, "touch"], [1001, true, "pen"]]) {
      for (const type of ["pointerdown", "pointermove", "pointerup", "pointercancel"]) {
        canvas.dispatchEvent(new PointerEvent(type, {
          bubbles: true, cancelable: true, pointerId: details.pointerId + offset,
          isPrimary, pointerType, button: 0, buttons: type === "pointerup" ? 0 : 1,
          clientX: details.point.x, clientY: details.point.y
        }));
      }
    }
  }, { pointerId, point: otherPoint });
  expect(await readBoard(page)).toEqual([[5, 5]]);
  await moveToCell(page, 5, 9);
  await page.mouse.up();
  expect(await readBoard(page)).toEqual(rowCells(5, 5, 9));
});

for (const reason of ["pointercancel", "lostpointercapture"]) {
  test(`Game of Life ${reason} ends drawing until a fresh press`, async ({ page }) => {
    await emptyPausedBoard(page);
    const pointerId = await beginMouseStroke(page, 5, 5);
    await moveToCell(page, 5, 8);
    const canvas = page.getByLabel("Game of Life cells");
    expect(await canvas.evaluate((element, id) => element.hasPointerCapture(id), pointerId)).toBe(true);
    await canvas.evaluate((element, details) => {
      if (details.reason === "lostpointercapture") {
        element.releasePointerCapture(details.pointerId);
      } else {
        element.dispatchEvent(new PointerEvent("pointercancel", {
          bubbles: true, pointerId: details.pointerId, pointerType: "mouse", isPrimary: true
        }));
      }
    }, { pointerId, reason });
    await moveToCell(page, 5, 14);
    await page.mouse.up();
    expect(await readBoard(page)).toEqual(rowCells(5, 5, 8));
    await beginMouseStroke(page, 8, 5);
    await moveToCell(page, 8, 8);
    await page.mouse.up();
    expect(await readBoard(page)).toEqual([...rowCells(5, 5, 8), ...rowCells(8, 5, 8)]);
  });
}

test("Game of Life leaving and reentering the canvas breaks a segment and release outside ends the stroke", async ({ page }) => {
  await emptyPausedBoard(page);
  const canvas = page.getByLabel("Game of Life cells");
  const box = await canvas.boundingBox();
  await beginMouseStroke(page, 5, 5);
  await moveToCell(page, 5, 8);
  await page.mouse.move(box.x - 5, box.y + 50);
  await moveToCell(page, 10, 15);
  await page.mouse.up();
  expect(await readBoard(page)).toEqual([...rowCells(5, 5, 8), [10, 15]]);

  await beginMouseStroke(page, 12, 5);
  await moveToCell(page, 12, 8);
  await page.mouse.move(box.x - 5, box.y + 120);
  await page.mouse.up();
  const released = await readBoard(page);
  await moveToCell(page, 14, 15);
  await moveToCell(page, 14, 20);
  expect(await readBoard(page)).toEqual(released);
  await beginMouseStroke(page, 14, 15);
  await moveToCell(page, 14, 20);
  await page.mouse.up();
  expect(await readBoard(page)).toEqual([...released, ...rowCells(14, 15, 20)]);
});

for (const action of ["Start", "Reset"]) {
  test(`Game of Life ${action.toLowerCase()} cancels an in-progress stroke`, async ({ page }) => {
    await emptyPausedBoard(page);
    await page.getByLabel("Ticks per second").fill("0");
    await page.getByLabel("Game of Life cells").scrollIntoViewIfNeeded();
    await beginMouseStroke(page, 5, 5);
    await moveToCell(page, 5, 8);
    // Invoke the actual control while the pointer remains down on the board.
    await page.getByRole("button", { name: action, exact: true }).evaluate((button) => button.click());
    const expected = action === "Start" ? rowCells(5, 5, 8) : [];
    await moveToCell(page, 5, 14);
    await page.mouse.up();
    expect(await readBoard(page)).toEqual(expected);
    if (action === "Start") await page.getByRole("button", { name: "Stop", exact: true }).click();
    await page.getByLabel("Game of Life cells").scrollIntoViewIfNeeded();
    await beginMouseStroke(page, 8, 5);
    await moveToCell(page, 8, 8);
    await page.mouse.up();
    expect(await readBoard(page)).toEqual([...expected, ...rowCells(8, 5, 8)]);
  });
}

test.describe("Game of Life mobile drawing", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("native touch drags paint, erase, and cancel without scrolling the mobile page", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Native touch dragging uses Chromium CDP; mouse PointerEvents run in all engines.");
    await emptyPausedBoard(page);
    const client = await page.context().newCDPSession(page);
    const initialScroll = await page.evaluate(() => window.scrollY);
    const touch = async (type, row, column) => {
      const point = type === "touchEnd" || type === "touchCancel" ? null : await cellPoint(page, row, column);
      await client.send("Input.dispatchTouchEvent", {
        type,
        touchPoints: point ? [{ x: point.x, y: point.y, id: 1, radiusX: 1, radiusY: 1, force: 1 }] : []
      });
    };
    try {
      await touch("touchStart", 5, 5);
      await touch("touchMove", 5, 15);
      await touch("touchMove", 5, 5);
      await touch("touchEnd");
      expect(await readBoard(page)).toEqual(rowCells(5, 5, 15));
      expect(await page.evaluate(() => window.scrollY)).toBe(initialScroll);
      await touch("touchStart", 5, 5);
      await touch("touchMove", 5, 15);
      await touch("touchEnd");
      expect(await readBoard(page)).toEqual([]);

      await touch("touchStart", 8, 5);
      await touch("touchMove", 12, 5);
      await touch("touchCancel");
      await touch("touchStart", 8, 12);
      await touch("touchMove", 12, 12);
      await touch("touchEnd");
      const expected = Array.from({ length: 5 }, (_, index) => [[8 + index, 5], [8 + index, 12]]).flat();
      expect(await readBoard(page)).toEqual(expected);
      expect(await page.evaluate(() => window.scrollY)).toBe(initialScroll);
    } finally {
      await client.detach();
    }
  });
});
