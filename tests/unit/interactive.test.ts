import assert from "node:assert/strict";
import test from "node:test";
import { audioBufferToWav } from "../../src/lib/tonegen/wav.ts";
import { search } from "../../src/lib/gtb/gtb.ts";
import words from "../../src/lib/gtb/words.json" with { type: "json" };
import AudioFFT from "../../src/routes/(navbar)/fft/audio.ts";
import ToneRecorder from "../../src/lib/tonegen/recorder.ts";
import { jInvariant, invariantColor } from "../../src/routes/(navbar)/jvar/j-invariant.ts";

const audioBuffer = (channels: number[][] | Float32Array[], sampleRate = 48000) => {
  const data = channels.map((channel) => Float32Array.from(channel));
  return {
    length: data[0].length,
    numberOfChannels: data.length,
    sampleRate,
    getChannelData: (index: number) => data[index]
  } as AudioBuffer;
};

test("WAV header matches actual stereo data and preserves left/right order", async () => {
  const source = audioBuffer([[0.2, -0.4], [-0.4, 0.2]]);
  const blob = audioBufferToWav(source, { isFloat: false });
  const bytes = await blob.arrayBuffer();
  const view = new DataView(bytes);
  assert.equal(blob.type, "audio/wav");
  assert.equal(new TextDecoder().decode(bytes.slice(0, 4)), "RIFF");
  assert.equal(view.getUint32(4, true), bytes.byteLength - 8);
  assert.equal(view.getUint32(40, true), bytes.byteLength - 44);
  assert.equal(view.getUint16(22, true), 2);
  assert.equal(view.getUint32(24, true), 48000);
  assert.equal(view.getUint32(28, true), 192000);
  assert.equal(view.getUint16(32, true), 4);
  assert.equal(view.getUint16(34, true), 16);
  assert.ok(view.getInt16(44, true) > 0);
  assert.ok(view.getInt16(46, true) < 0);
  assert.ok(view.getInt16(48, true) < 0);
  assert.ok(view.getInt16(50, true) > 0);
  assert.deepEqual([...source.getChannelData(0)], [...Float32Array.from([0.2, -0.4])]);
});

test("long recordings encode without argument-stack overflow", async () => {
  const source = audioBuffer([new Float32Array(480000).fill(0.25), new Float32Array(480000).fill(-0.5)]);
  const bytes = await audioBufferToWav(source, { isFloat: false }).arrayBuffer();
  assert.equal(bytes.byteLength, 44 + 480000 * 4);
  assert.equal(new DataView(bytes).getUint32(40, true), 480000 * 4);
});

test("silent, mono, and nonfinite samples produce finite PCM", async () => {
  const source = audioBuffer([[0, NaN, Infinity, -Infinity]]);
  const bytes = await audioBufferToWav(source, { isFloat: false }).arrayBuffer();
  const view = new DataView(bytes);
  assert.equal(view.getUint16(22, true), 1);
  assert.equal(view.getUint32(40, true), 8);
  assert.deepEqual([...new Uint8Array(bytes, 44)], Array(8).fill(0));
});

test("floating-point WAV identifies IEEE float and has accurate data length", async () => {
  const bytes = await audioBufferToWav(audioBuffer([[1, -1]]), { isFloat: true }).arrayBuffer();
  const view = new DataView(bytes);
  assert.equal(view.getUint16(20, true), 3);
  assert.equal(view.getUint16(34, true), 32);
  assert.equal(view.getUint32(40, true), 8);
  assert.ok(Math.abs(view.getFloat32(44, true) - 0.7) < 0.00001);
  assert.ok(Math.abs(view.getFloat32(48, true) + 0.7) < 0.00001);
});

test("every word of the matching length survives an unknown-letter hint", () => {
  assert.deepEqual(search("____"), words.filter((word) => word.length === 4));
  assert.equal(search("____").length, 209);
  assert.deepEqual(search("...."), search("____"));
});

test("solver treats punctuation literally, keeps spaces, and ignores case", () => {
  assert.deepEqual(search("bAbY"), ["Baby"]);
  assert.ok(search("B___").includes("Baby"));
  assert.deepEqual(search(""), []);
  assert.deepEqual(search("["), []);
  assert.deepEqual(search("a+a"), words.filter((word) => word.toLowerCase() === "a+a"));
  const spaced = words.find((word) => word.includes(" "))!;
  assert.ok(search(spaced.toLowerCase()).includes(spaced));
});

test("FFT schedules one bound render callback and cancels it on disposal", () => {
  const oldRequest = globalThis.requestAnimationFrame;
  const oldCancel = globalThis.cancelAnimationFrame;
  const pending = new Map<number, FrameRequestCallback>();
  let id = 0;
  let draws = 0;
  globalThis.requestAnimationFrame = (callback) => { pending.set(++id, callback); return id; };
  globalThis.cancelAnimationFrame = (value) => { pending.delete(value); };
  try {
    const canvas = { width: 100, height: 50, getContext: () => ({ clearRect() {}, fillRect() { draws++; } }) } as unknown as HTMLCanvasElement;
    const analyser = { frequencyBinCount: 2, getByteFrequencyData(data: Uint8Array) { data.set([2, 3]); } } as AnalyserNode;
    const fft = new AudioFFT(canvas, analyser);
    assert.equal(pending.size, 1);
    assert.equal(draws, 2);
    const [key, callback] = [...pending][0];
    pending.delete(key);
    callback(16);
    assert.equal(draws, 4);
    assert.equal(pending.size, 1);
    fft.dispose();
    assert.equal(pending.size, 0);
    callback(32);
    assert.equal(draws, 4);
  } finally {
    globalThis.requestAnimationFrame = oldRequest;
    globalThis.cancelAnimationFrame = oldCancel;
  }
});

test("j invariant is periodic in real coordinate and symmetric about the imaginary axis", () => {
  const [real, imag] = jInvariant(0, 1);
  assert.ok(Math.abs(real - 1728) < 0.1);
  assert.equal(imag, 0);
  const left = jInvariant(0.2, 0.8);
  const right = jInvariant(-0.2, 0.8);
  const shifted = jInvariant(1.2, 0.8);
  assert.ok(Math.abs(left[0] - right[0]) < 0.00001);
  assert.ok(Math.abs(left[1] + right[1]) < 0.00001);
  assert.ok(Math.abs(left[0] - shifted[0]) < 0.00001);
  assert.notDeepEqual(invariantColor(0.2, 0.8, 0), invariantColor(0.2, 0.8, 0.5));
  assert.ok(invariantColor(0, 0.05, 1).every((value) => Number.isFinite(value) && value >= 0 && value <= 1));
});

test("recorder uses the post-gain mix, guards stop, updates state and downloads a valid WAV", async () => {
  const previous = { recorder: globalThis.MediaRecorder, document: globalThis.document };
  const recorderInstances: FakeRecorder[] = [];
  let connected: unknown;
  let disconnected: unknown;
  let trackStopped = false;
  let downloadName = "";
  let removed = false;
  const statuses: string[] = [];
  class FakeRecorder {
    static isTypeSupported(type: string) { return type === "audio/mp4"; }
    state = "inactive";
    mimeType: string;
    ondataavailable: ((event: { data: Blob }) => void) | null = null;
    onstop: (() => void) | null = null;
    onerror: (() => void) | null = null;
    starts = 0;
    stops = 0;
    constructor(_stream: unknown, options?: { mimeType: string }) { recorderInstances.push(this); this.mimeType = options?.mimeType || "audio/mp4"; }
    start() { this.starts++; this.state = "recording"; }
    stop() { this.stops++; this.state = "inactive"; queueMicrotask(() => { this.ondataavailable?.({ data: new Blob(["recording"]) }); this.onstop?.(); }); }
  }
  globalThis.MediaRecorder = FakeRecorder as unknown as typeof MediaRecorder;
  globalThis.document = {
    body: { appendChild() {} },
    createElement() { return { style: {}, href: "", download: "", click() { downloadName = this.download; }, remove() { removed = true; } }; }
  } as unknown as Document;
  const destination = { stream: { getTracks: () => [{ stop() { trackStopped = true; } }] } };
  const source = { connect(node: unknown) { connected = node; }, disconnect(node: unknown) { disconnected = node; } } as unknown as AudioNode;
  const ctx = { createMediaStreamDestination: () => destination, decodeAudioData: async () => audioBuffer([[0.5, -0.5], [0.1, -0.1]]) } as unknown as AudioContext;
  try {
    const recorder = new ToneRecorder(ctx, source, "ogg", (status) => statuses.push(status));
    assert.equal(connected, destination);
    assert.equal(recorderInstances[0].mimeType, "audio/mp4");
    recorder.stopRecording();
    assert.equal(recorderInstances[0].stops, 0);
    recorder.startRecording();
    recorder.startRecording();
    assert.equal(recorderInstances[0].starts, 1);
    const saved = recorder.saveRecordingAsWav("test-recording");
    recorder.stopRecording();
    recorder.stopRecording();
    await saved;
    assert.deepEqual(statuses, ["recording", "encoding", "stopped"]);
    assert.equal(downloadName, "test-recording.wav");
    assert.equal(removed, true);
    recorder.dispose();
    recorder.dispose();
    assert.equal(disconnected, destination);
    assert.equal(trackStopped, true);
  } finally {
    globalThis.MediaRecorder = previous.recorder;
    globalThis.document = previous.document;
  }
});
