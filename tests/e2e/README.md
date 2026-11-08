# Browser behavior checks

Run against a built local preview with `pnpm exec playwright test tests/e2e`.
The default origin is `http://127.0.0.1:4179`; set `PLAYWRIGHT_BASE_URL` (or
`BASE_URL`) to use a different preview. The repository's `playwright.config.ts`
owns browser setup, output directories, and any preview startup command.

The standard configuration runs the non-audio suite in Chromium, Firefox and WebKit.
Audio recording/microphone acceptance runs in Chromium, which supplies fake hardware.
Use Chromium with `--use-fake-device-for-media-stream` and
`--use-fake-ui-for-media-stream` for the FFT tests. The audio tests grant microphone
permission, then use Chromium's fake input through the real MediaStream and Web
Audio APIs. No test records the machine's physical microphone. WebGL must be
available; a software renderer is acceptable. The visualizer tests inspect real
shader compilation/linking and pixels captured synchronously after drawing.

The suite covers all 50 current routes (18 standalone pages and 32 articles),
article media references, missing-article responses, category/back navigation,
mobile navigation, homepage typewriter/E8 lifecycle, photo loading/lightbox,
Game of Life, elliptic curves, GTB search, tone controls and WAV recording, FFT,
j-invariant rendering/fallback, Mandelbrot rendering, and p-adic output.

Remote embeds, fonts, and analytics are stubbed. Local content, images, PDFs,
audio files, WASM, and application scripts remain real. Passing these checks does
not establish remote video or music playback. Each test attaches the browser
diagnostics and the remote URLs it stubbed; the recording test also attaches
metadata from the downloaded WAV files.

Tests reject uncaught exceptions and browser console errors. They intentionally
assert repaired behavior, including A4 = 440 Hz, all 209 four-letter GTB matches,
valid shader compilation, recoverable numeric input, and resources stopping when
their pages unmount. Existing broken behavior should be fixed rather than hidden
with blanket error filters or skipped assertions.
