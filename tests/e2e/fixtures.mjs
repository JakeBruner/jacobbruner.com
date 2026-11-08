import { test as base, expect } from "@playwright/test";

export { expect };
export const test = base.extend({
  siteDiagnostics: [async ({ page, baseURL }, use, testInfo) => {
    const errors = [];
    const externalRequests = new Set();
    page.on("pageerror", (error) => errors.push(`Uncaught: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`Console: ${message.text()}`);
    });
    // Keep remote embeds/analytics out of the acceptance signal. No remote playback is tested.
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (!/^https?:$/.test(url.protocol)) return route.continue();
      if (url.origin === new URL(baseURL).origin && !url.pathname.startsWith("/_vercel/")) {
        return route.continue();
      }
      externalRequests.add(url.origin + url.pathname);
      const kind = route.request().resourceType();
      if (kind === "document") {
        return route.fulfill({ contentType: "text/html", body: "<!doctype html><title>External embed stub</title><p>External playback is outside this test.</p>" });
      }
      if (kind === "stylesheet") return route.fulfill({ contentType: "text/css", body: "" });
      if (kind === "script") return route.fulfill({ contentType: "application/javascript", body: "" });
      if (kind === "image") {
        return route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>' });
      }
      return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });
    await page.addInitScript((origin) => {
      // Chromium also runs init scripts in its PDF viewer, where storage is unavailable.
      if (window === window.top && location.origin === origin) localStorage.setItem("popup", "closed");
    }, new URL(baseURL).origin);
    await use({ errors });
    await testInfo.attach("browser-diagnostics", {
      body: JSON.stringify({ errors, externalRequestsStubbed: [...externalRequests], remotePlaybackVerified: false }, null, 2),
      contentType: "application/json"
    });
    expect(errors, "The website must not emit uncaught exceptions or console errors").toEqual([]);
  }, { auto: true }]
});

export async function visit(page, path) {
  const response = await page.goto(path, { waitUntil: "networkidle" });
  expect(response?.status(), `${path} document response`).toBe(200);
  await expect(page.locator(".loader")).toBeHidden();
  return response;
}

export async function navigateToMath(page) {
  await page.locator('footer a[href="/Math"]').click();
  await expect(page).toHaveURL(/\/Math$/);
  await expect(page.locator(".loader")).toBeHidden();
}

export async function settleFrames(page, count = 3) {
  await page.evaluate((frames) => new Promise((resolve) => {
    const frame = () => --frames <= 0 ? resolve() : requestAnimationFrame(frame);
    requestAnimationFrame(frame);
  }), count);
}

export async function canvasColorCount(canvas) {
  return canvas.evaluate((element) => {
    const context = element.getContext("2d");
    if (!context) return 0;
    const pixels = context.getImageData(0, 0, element.width, element.height).data;
    const colors = new Set();
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] > 0) colors.add(`${pixels[i]},${pixels[i + 1]},${pixels[i + 2]}`);
      if (colors.size > 32) break;
    }
    return colors.size;
  });
}

// Observe the real browser APIs without substituting renderers, oscillators, or analyser data.
export async function installRuntimeProbe(page) {
  await page.addInitScript(() => {
    const probe = window.__siteProbe = {
      canvases: [], contexts: [], oscillators: [], gains: [], panners: [], streams: [],
      analyserReads: 0, analyserPeak: 0,
      webgl: { compiles: [], links: [], samples: [], draws: 0, capture: false }
    };
    const canvasRecords = new WeakMap();
    const recordDraw = (canvas) => {
      let record = canvasRecords.get(canvas);
      if (!record) {
        record = { canvas, draws: 0 };
        canvasRecords.set(canvas, record);
        probe.canvases.push(record);
      }
      record.draws++;
    };
    for (const method of ["fillRect", "stroke", "putImageData"]) {
      const original = CanvasRenderingContext2D.prototype[method];
      CanvasRenderingContext2D.prototype[method] = function (...args) {
        recordDraw(this.canvas);
        return Reflect.apply(original, this, args);
      };
    }
    for (const name of ["AudioContext", "OscillatorNode", "GainNode", "StereoPannerNode"]) {
      const Original = window[name];
      if (!Original) continue;
      const destination = { AudioContext: "contexts", OscillatorNode: "oscillators", GainNode: "gains", StereoPannerNode: "panners" }[name];
      window[name] = new Proxy(Original, {
        construct(target, args) {
          const instance = Reflect.construct(target, args);
          probe[destination].push(instance);
          return instance;
        }
      });
    }
    if (navigator.mediaDevices?.getUserMedia) {
      const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia = async (...args) => {
        const stream = await original(...args);
        probe.streams.push(stream);
        return stream;
      };
    }
    const readSpectrum = AnalyserNode.prototype.getByteFrequencyData;
    AnalyserNode.prototype.getByteFrequencyData = function (array) {
      const result = Reflect.apply(readSpectrum, this, [array]);
      probe.analyserReads++;
      probe.analyserPeak = Math.max(probe.analyserPeak, ...array);
      return result;
    };
    for (const Type of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
      if (!Type) continue;
      const compile = Type.prototype.compileShader;
      Type.prototype.compileShader = function (shader) {
        const result = Reflect.apply(compile, this, [shader]);
        probe.webgl.compiles.push({ ok: Boolean(this.getShaderParameter(shader, this.COMPILE_STATUS)), log: this.getShaderInfoLog(shader) });
        return result;
      };
      const link = Type.prototype.linkProgram;
      Type.prototype.linkProgram = function (program) {
        const result = Reflect.apply(link, this, [program]);
        probe.webgl.links.push({ ok: Boolean(this.getProgramParameter(program, this.LINK_STATUS)), log: this.getProgramInfoLog(program) });
        return result;
      };
      for (const method of ["drawArrays", "drawElements"]) {
        const original = Type.prototype[method];
        Type.prototype[method] = function (...args) {
          const result = Reflect.apply(original, this, args);
          recordDraw(this.canvas);
          probe.webgl.draws++;
          if (probe.webgl.samples.length < 4 || probe.webgl.capture) {
            probe.webgl.capture = false;
            const width = this.drawingBufferWidth;
            const height = this.drawingBufferHeight;
            if (width > 0 && height > 0) {
              const pixels = new Uint8Array(width * height * 4);
              this.readPixels(0, 0, width, height, this.RGBA, this.UNSIGNED_BYTE, pixels);
              const colors = new Set();
              let checksum = 0;
              const step = Math.max(1, Math.floor(width * height / 4096)) * 4;
              for (let i = 0; i < pixels.length; i += step) {
                colors.add(`${pixels[i]},${pixels[i + 1]},${pixels[i + 2]},${pixels[i + 3]}`);
                checksum = (checksum * 31 + pixels[i] + pixels[i + 1] * 3 + pixels[i + 2] * 7) >>> 0;
              }
              probe.webgl.samples.push({ colors: colors.size, checksum });
            }
          }
          return result;
        };
      }
    }
  });
}

export async function expectDetachedCanvasesStopped(page) {
  await settleFrames(page);
  const count = () => page.evaluate(() => window.__siteProbe.canvases
    .filter(({ canvas }) => !canvas.isConnected).reduce((sum, { draws }) => sum + draws, 0));
  const before = await count();
  await settleFrames(page, 8);
  expect(await count(), "Unmounted canvases must stop drawing").toBe(before);
}
