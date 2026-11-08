import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? process.env.BASE_URL ?? "http://127.0.0.1:4179",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [{
    name: "chromium",
    use: { ...devices["Desktop Chrome"], launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
      args: ["--enable-unsafe-swiftshader", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"]
    } }
  }, {
    name: "firefox",
    // Recording and microphone acceptance use Chromium's fake hardware.
    testIgnore: /audio\.spec\.mjs/,
    use: { ...devices["Desktop Firefox"] }
  }, {
    name: "webkit",
    testIgnore: /audio\.spec\.mjs/,
    use: { ...devices["Desktop Safari"] }
  }],
  webServer: (process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL) ? undefined : {
    command: "pnpm preview --host 127.0.0.1 --port 4179 --strictPort",
    url: "http://127.0.0.1:4179", reuseExistingServer: !process.env.CI
  }
});
