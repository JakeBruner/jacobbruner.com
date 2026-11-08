import { readFile } from "node:fs/promises";
import {
  test, expect, visit, installRuntimeProbe, navigateToMath,
  expectDetachedCanvasesStopped, canvasColorCount
} from "./fixtures.mjs";

test.use({ viewport: { width: 1440, height: 1000 }, colorScheme: "light", permissions: ["microphone"] });

async function addTone(page) {
  await page.getByRole("button", { name: "Add a new tone", exact: true }).click();
  await expect(page.getByLabel("Frequency", { exact: true }).first()).toBeVisible();
}

async function setFrequency(page, text, index = 0) {
  const input = page.getByLabel("Frequency", { exact: true }).nth(index);
  await input.fill(text);
  await input.press("Tab");
}

function inspectWav(bytes) {
  expect(bytes.toString("ascii", 0, 4)).toBe("RIFF");
  expect(bytes.toString("ascii", 8, 12)).toBe("WAVE");
  expect(bytes.readUInt32LE(4) + 8).toBe(bytes.length);
  let format;
  let data;
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const id = bytes.toString("ascii", offset, offset + 4);
    const size = bytes.readUInt32LE(offset + 4);
    expect(offset + 8 + size).toBeLessThanOrEqual(bytes.length);
    if (id === "fmt ") {
      format = {
        encoding: bytes.readUInt16LE(offset + 8),
        channels: bytes.readUInt16LE(offset + 10),
        sampleRate: bytes.readUInt32LE(offset + 12),
        bits: bytes.readUInt16LE(offset + 22)
      };
    }
    if (id === "data") data = bytes.subarray(offset + 8, offset + 8 + size);
    offset += 8 + size + size % 2;
  }
  expect(format).toBeDefined();
  expect(format.encoding).toBe(1);
  expect(format.bits).toBe(16);
  expect([1, 2]).toContain(format.channels);
  expect(format.sampleRate).toBeGreaterThanOrEqual(8000);
  expect(data?.length).toBeGreaterThan(format.sampleRate * format.channels);
  let peak = 0;
  for (let offset = 0; offset + 1 < data.length; offset += 2) peak = Math.max(peak, Math.abs(data.readInt16LE(offset)));
  expect(peak, "The recorded WAV must contain audible PCM samples").toBeGreaterThan(100);
  return { ...format, duration: data.length / (format.sampleRate * format.channels * 2), peak };
}

test("tone controls map musical notes correctly and update the real oscillator, gain, and pan", async ({ page }) => {
  await installRuntimeProbe(page);
  await visit(page, "/tone-generator");
  await addTone(page);
  await expect(page.getByLabel("Frequency", { exact: true })).toHaveValue("400");
  const frequency = () => page.evaluate(() => window.__siteProbe.oscillators[0].frequency.value);
  for (const [note, hz] of [["A4", 440], ["A3", 220], ["C4", 261.625565], ["Bb4", 466.163762], ["A#4", 466.163762]]) {
    await setFrequency(page, note);
    expect(await frequency(), note).toBeCloseTo(hz, 3);
  }
  await setFrequency(page, "A4");
  await page.getByTitle("double frequency", { exact: true }).click();
  expect(await frequency()).toBe(880);
  await page.getByTitle("half frequency", { exact: true }).click();
  expect(await frequency()).toBe(440);
  await setFrequency(page, "not-a-note");
  expect(await frequency()).toBe(440);

  await page.getByRole("button", { name: "Mute tone", exact: true }).click();
  expect(await page.evaluate(() => window.__siteProbe.gains[0].gain.value)).toBe(0);
  await page.getByRole("button", { name: "Unmute tone", exact: true }).click();
  expect(await page.evaluate(() => window.__siteProbe.gains[0].gain.value)).toBeGreaterThan(0);
  await page.getByRole("slider", { name: "Volume", exact: true }).press("End");
  expect(await page.evaluate(() => window.__siteProbe.gains[0].gain.value)).toBe(1);
  await page.getByRole("slider", { name: "Volume", exact: true }).press("ArrowLeft");
  expect(await page.evaluate(() => window.__siteProbe.gains[0].gain.value)).toBeCloseTo(0.99, 4);
  await page.getByRole("slider", { name: "Pan stereo channels", exact: true }).press("End");
  expect(await page.evaluate(() => window.__siteProbe.panners[0].pan.value)).toBe(1);
  await page.getByRole("slider", { name: "Pan stereo channels", exact: true }).press("Home");
  expect(await page.evaluate(() => window.__siteProbe.panners[0].pan.value)).toBe(-1);

  await page.getByRole("button", { name: "Sine", exact: true }).click();
  await page.getByRole("dialog").getByText("Square", { exact: true }).click();
  await expect(page.getByRole("button", { name: "Square", exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.__siteProbe.oscillators[0].type)).toBe("custom");
  await page.getByRole("button", { name: "Add interval", exact: true }).click();
  await page.getByTitle("just tempered perfect fifth", { exact: true }).click();
  await expect(page.getByLabel("Frequency", { exact: true })).toHaveCount(2);
  expect(await page.evaluate(() => window.__siteProbe.oscillators[1].frequency.value)).toBe(660);
  await page.getByRole("button", { name: "Remove tone", exact: true }).last().click();
  await expect(page.getByLabel("Frequency", { exact: true })).toHaveCount(1);
  await page.getByRole("button", { name: "Remove all tones", exact: true }).click();
  await expect(page.getByLabel("Frequency", { exact: true })).toHaveCount(0);
  await navigateToMath(page);
  await expect.poll(() => page.evaluate(() => window.__siteProbe.contexts.every((context) => context.state === "closed"))).toBe(true);
  await expectDetachedCanvasesStopped(page);
});

test("tone generation uses the chosen harmony and playback can pause and resume", async ({ page }) => {
  await installRuntimeProbe(page);
  await visit(page, "/tone-generator");
  const selector = page.getByRole("combobox", { name: "Generation mode:" });
  await selector.click();
  await selector.fill("maj7");
  await page.getByRole("option").filter({ hasText: /^maj7\s+1, 3, 5, 7/ }).click();
  await page.getByRole("button", { name: "Generate Maj7!", exact: true }).click();
  await expect(page.getByLabel("Frequency", { exact: true })).toHaveCount(4);
  await expect(page.getByText(/Generated a maj7 chord in the key of/)).toBeVisible();
  await page.getByTitle("Play", { exact: true }).click();
  await expect(page.getByTitle("Pause", { exact: true })).toBeEnabled();
  await expect.poll(() => page.evaluate(() => window.__siteProbe.contexts[0].state)).toBe("running");
  await expect.poll(() => page.evaluate(() => window.__siteProbe.analyserPeak)).toBeGreaterThan(0);
  await page.getByTitle("Pause", { exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__siteProbe.contexts[0].state)).toBe("suspended");
  await page.getByTitle("Play", { exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__siteProbe.contexts[0].state)).toBe("running");
});

test("two successive recordings download valid non-silent WAV files", async ({ page }, testInfo) => {
  await installRuntimeProbe(page);
  await visit(page, "/tone-generator");
  await addTone(page);
  await setFrequency(page, "A4");
  await page.getByTitle("Play", { exact: true }).click();
  const records = [];
  for (let recording = 0; recording < 2; recording++) {
    await page.getByTitle("Record", { exact: true }).click();
    await expect(page.getByRole("button", { name: "Stop recording", exact: true })).toBeEnabled();
    const started = await page.evaluate(() => window.__siteProbe.contexts[0].currentTime);
    await expect.poll(() => page.evaluate(() => window.__siteProbe.contexts[0].currentTime), { timeout: 5000 }).toBeGreaterThan(started + 1);
    const pendingDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: "Stop recording", exact: true }).click();
    const download = await pendingDownload;
    expect(download.suggestedFilename()).toMatch(/^tonegen-.*\.wav$/);
    expect(await download.failure()).toBeNull();
    const bytes = await readFile(await download.path());
    records.push(inspectWav(bytes));
    await expect(page.getByTitle("Record", { exact: true })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Stop recording", exact: true })).toBeDisabled();
  }
  await testInfo.attach("recorded-wav-metadata", { body: JSON.stringify(records, null, 2), contentType: "application/json" });
});

test("FFT uses a fake microphone through real Web Audio, draws its spectrum, and releases it on navigation", async ({ page }) => {
  await installRuntimeProbe(page);
  await visit(page, "/fft");
  expect(await page.evaluate(() => window.__siteProbe.streams.length)).toBe(0);
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByRole("button", { name: "Start", exact: true })).toBeDisabled();
  await expect.poll(() => page.evaluate(() => window.__siteProbe.streams.length)).toBe(1);
  await expect.poll(() => page.evaluate(() => window.__siteProbe.analyserReads)).toBeGreaterThan(5);
  await expect.poll(() => page.evaluate(() => window.__siteProbe.analyserPeak)).toBeGreaterThan(0);
  await expect.poll(() => canvasColorCount(page.locator("canvas"))).toBeGreaterThan(0);
  await navigateToMath(page);
  await expect.poll(() => page.evaluate(() => window.__siteProbe.streams.every((stream) => stream.getTracks().every((track) => track.readyState === "ended")))).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__siteProbe.contexts.every((context) => context.state === "closed"))).toBe(true);
  await expectDetachedCanvasesStopped(page);
});
