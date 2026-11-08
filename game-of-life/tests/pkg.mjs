import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import init, { Universe } from '../pkg/game_of_life.js';

const { memory } = await init({
  module_or_path: await readFile(new URL('../pkg/game_of_life_bg.wasm', import.meta.url))
});

function liveCells(universe) {
  const count = universe.width() * universe.height();
  const bytes = new Uint8Array(memory.buffer, universe.cells(), Math.ceil(count / 8));
  return Array.from({ length: count }, (_, i) => i).filter(
    (i) => (bytes[Math.floor(i / 8)] & (1 << (i % 8))) !== 0
  );
}

test('the shipped Wasm exposes all cells, including a partial final byte', () => {
  const universe = Universe.new(5, 5, 0, 0);
  try {
    universe.toggle_cell(4, 4);
    assert.deepEqual(liveCells(universe), [24]);
    assert.equal(universe.render(), '◻◻◻◻◻\n◻◻◻◻◻\n◻◻◻◻◻\n◻◻◻◻◻\n◻◻◻◻◼\n');
  } finally {
    universe.free();
  }
});

test('the shipped Wasm advances a glider four generations', () => {
  const universe = Universe.new(8, 8, 0, 0);
  try {
    for (const [row, col] of [[1, 2], [2, 3], [3, 1], [3, 2], [3, 3]]) {
      universe.toggle_cell(row, col);
    }
    for (let i = 0; i < 4; i++) universe.tick();
    assert.deepEqual(liveCells(universe), [19, 28, 34, 35, 36]);
  } finally {
    universe.free();
  }
});

test('every initialization mode is available in the shipped package', () => {
  for (const [mode, density, expected] of [[0, 0, 0], [1, 0, 0], [1, 1, 400], [3, 0, 5], [4, 0, 36]]) {
    const universe = Universe.new(40, 10, mode, density);
    try {
      assert.equal(liveCells(universe).length, expected, `mode ${mode}, density ${density}`);
    } finally {
      universe.free();
    }
  }
  const universe = Universe.new(7, 5, 2, 0);
  try {
    assert.deepEqual(liveCells(universe), Array.from({ length: 35 }, (_, i) => i).filter((i) => i % 3 === 0 || i % 7 === 0));
  } finally {
    universe.free();
  }
});

test('fresh cell views remain valid after Wasm memory grows', () => {
  const universe = Universe.new(5, 5, 0, 0);
  try {
    universe.toggle_cell(4, 4);
    const previousBuffer = memory.buffer;
    memory.grow(1);
    assert.equal(previousBuffer.byteLength, 0);
    assert.deepEqual(liveCells(universe), [24]);
    universe.add_glider(4, 4);
    universe.tick();
    assert.equal(universe.render().split('\n').length, 6);
    assert.ok(liveCells(universe).length > 0);
  } finally {
    universe.free();
  }
});
