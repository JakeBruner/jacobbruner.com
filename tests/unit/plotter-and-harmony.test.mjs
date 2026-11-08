import assert from "node:assert/strict";
import test from "node:test";
import { draw, initBuffers, initShaderProgram } from "../../src/lib/plotter/shaderUtils.ts";
import {
  assertIsSupportedGenerationType,
  generateFrequencies,
  getHarmonicsFromChord,
  harmonyOptions
} from "../../src/lib/tonegen/generate.ts";

function createContext(options = {}) {
  const created = { shaders: [], programs: [], buffers: [] };
  const deleted = { shaders: [], programs: [], buffers: [] };
  const uniforms = [];
  let bufferAttempts = 0;
  let draws = 0;
  const gl = {
    VERTEX_SHADER: 1,
    FRAGMENT_SHADER: 2,
    COMPILE_STATUS: 3,
    LINK_STATUS: 4,
    ARRAY_BUFFER: 5,
    STATIC_DRAW: 6,
    DEPTH_TEST: 7,
    LEQUAL: 8,
    COLOR_BUFFER_BIT: 16,
    DEPTH_BUFFER_BIT: 32,
    FLOAT: 9,
    TRIANGLE_STRIP: 10,
    canvas: options.canvas ?? { width: 600, height: 300 },
    createShader(type) {
      if (type === options.missingShader) return null;
      const shader = { type };
      created.shaders.push(shader);
      return shader;
    },
    shaderSource(shader) { assert.ok(shader); },
    compileShader(shader) { assert.ok(shader); },
    getShaderParameter(shader) { return shader.type !== options.invalidShader; },
    getShaderInfoLog() { return "compile diagnostic"; },
    deleteShader(shader) { deleted.shaders.push(shader); },
    createProgram() {
      if (options.missingProgram) return null;
      const program = {};
      created.programs.push(program);
      return program;
    },
    attachShader(program, shader) { assert.ok(program && shader); },
    linkProgram(program) { assert.ok(program); },
    getProgramParameter() { return !options.invalidLink; },
    getProgramInfoLog() { return "link diagnostic"; },
    deleteProgram(program) { deleted.programs.push(program); },
    createBuffer() {
      bufferAttempts++;
      if (bufferAttempts === options.missingBuffer) return null;
      const buffer = {};
      created.buffers.push(buffer);
      return buffer;
    },
    bindBuffer(_target, buffer) { assert.ok(buffer); },
    bufferData(_target, values) { assert.ok(values instanceof Float32Array); },
    deleteBuffer(buffer) { deleted.buffers.push(buffer); },
    clearColor() {},
    clearDepth() {},
    enable() {},
    depthFunc() {},
    clear() {},
    vertexAttribPointer() {},
    enableVertexAttribArray() {},
    useProgram() {},
    uniformMatrix4fv(location, _transpose, values) {
      uniforms.push({ location, values });
    },
    drawArrays() { draws++; }
  };
  return { gl, created, deleted, uniforms, drawCount: () => draws };
}

test("linked programs retain their handle and release their compiled shaders", () => {
  const { gl, created, deleted } = createContext();
  const program = initShaderProgram(gl, "vertex", "fragment");
  assert.equal(program, created.programs[0]);
  assert.deepEqual(deleted.shaders, created.shaders);
  assert.deepEqual(deleted.programs, []);
});

test("shader allocation failure does not pass a null shader to WebGL", () => {
  const { gl, created, deleted } = createContext({ missingShader: 2 });
  assert.throws(() => initShaderProgram(gl, "vertex", "fragment"), /create a WebGL shader/);
  assert.deepEqual(deleted.shaders, created.shaders);
  assert.equal(created.programs.length, 0);
});

test("a fragment compilation failure reports the diagnostic and releases both shaders", () => {
  const { gl, created, deleted } = createContext({ invalidShader: 2 });
  assert.throws(() => initShaderProgram(gl, "vertex", "fragment"), /compile diagnostic/);
  assert.deepEqual(new Set(deleted.shaders), new Set(created.shaders));
  assert.equal(deleted.shaders.length, 2);
  assert.equal(created.programs.length, 0);
});

test("program allocation failure releases both shaders", () => {
  const { gl, created, deleted } = createContext({ missingProgram: true });
  assert.throws(() => initShaderProgram(gl, "vertex", "fragment"), /create a WebGL program/);
  assert.deepEqual(deleted.shaders, created.shaders);
  assert.deepEqual(deleted.programs, []);
});

test("link failure reports its diagnostic and releases the program and shaders", () => {
  const { gl, created, deleted } = createContext({ invalidLink: true });
  assert.throws(() => initShaderProgram(gl, "vertex", "fragment"), /link diagnostic/);
  assert.deepEqual(deleted.shaders, created.shaders);
  assert.deepEqual(deleted.programs, created.programs);
});

test("buffer allocation failure releases any previously allocated buffer", () => {
  for (const missingBuffer of [1, 2]) {
    const { gl, created, deleted } = createContext({ missingBuffer });
    assert.throws(() => initBuffers(gl), /create the WebGL .* buffer/);
    assert.deepEqual(deleted.buffers, created.buffers);
  }
});

test("successful buffer creation keeps both buffers available to the renderer", () => {
  const { gl, created, deleted } = createContext();
  const buffers = initBuffers(gl);
  assert.equal(buffers.color, created.buffers[0]);
  assert.equal(buffers.position, created.buffers[1]);
  assert.deepEqual(deleted.buffers, []);
});

const programInfo = {
  program: {},
  attribLocations: { vertexPosition: 0, vertexColor: 1 },
  uniformLocations: { projectionMatrix: {}, modelViewMatrix: {} }
};

test("projection uses CSS aspect for displayed canvases and backing size for offscreen or hidden canvases", () => {
  for (const canvas of [
    { width: 300, height: 300, clientWidth: 600, clientHeight: 300 },
    { width: 600, height: 300 },
    { width: 600, height: 300, clientWidth: 0, clientHeight: 0 }
  ]) {
    const { gl, uniforms, drawCount } = createContext({ canvas });
    draw(gl, programInfo, { position: {}, color: {} });
    const projection = uniforms.find(({ location }) => location === programInfo.uniformLocations.projectionMatrix);
    assert.ok(projection);
    assert.equal(projection.values[0], projection.values[5] / 2);
    assert.ok([...projection.values].every(Number.isFinite));
    assert.equal(drawCount(), 1);
  }
});

test("zero-sized canvases do not draw with a non-finite projection", () => {
  const { gl, uniforms, drawCount } = createContext({ canvas: { width: 0, height: 0 } });
  draw(gl, programInfo, { position: {}, color: {} });
  assert.equal(uniforms.length, 0);
  assert.equal(drawCount(), 0);
});

test("every selectable harmony retains its valid overtone or undertone mapping", () => {
  for (const { name } of harmonyOptions) {
    const harmonics = getHarmonicsFromChord(name);
    assert.ok(harmonics.length > 0);
    assert.ok(harmonics.every((value) => Number.isFinite(value) && value !== 0));
    const { frequencies, harmonySetting } = generateFrequencies({ baseFrequency: 220, harmony: name });
    assert.equal(harmonySetting, name);
    assert.equal(frequencies.length, harmonics.length);
    assert.ok(frequencies.every((value) => Number.isFinite(value) && value > 0));
  }
  assert.deepEqual(getHarmonicsFromChord("maj7"), [1, 3, 5, 15]);
  assert.deepEqual(getHarmonicsFromChord("min7"), [1, -21, -27, -9]);
});

test("unrecognized generation choices are rejected before indexing the harmony map", () => {
  for (const name of ["unknown", "constructor", "__proto__"]) {
    assert.throws(() => assertIsSupportedGenerationType(name), /not a valid Harmony/);
  }
  assert.doesNotThrow(() => assertIsSupportedGenerationType("Random"));
});
