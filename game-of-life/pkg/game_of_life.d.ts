/* tslint:disable */
/* eslint-disable */
/**
 */
export enum Cell {
  Dead,
  Alive
}
/**
 */
export class Universe {
  free(): void;
  /**
   */
  tick(): void;
  /**
   * @param {number} width
   * @param {number} height
   * @param {number} mode
   * @param {number} density
   * @returns {Universe}
   */
  static new(width: number, height: number, mode: number, density: number): Universe;
  /**
   * @returns {string}
   */
  render(): string;
  /**
   * @returns {number}
   */
  width(): number;
  /**
   * @returns {number}
   */
  height(): number;
  /**
   * @returns {number}
   */
  cells(): number;
  /**
   * @param {number} row
   * @param {number} col
   */
  toggle_cell(row: number, col: number): void;
  /**
   * @param {number} inrow
   * @param {number} incol
   */
  add_glider(inrow: number, incol: number): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_universe_free: (a: number) => void;
  readonly universe_tick: (a: number) => void;
  readonly universe_new: (a: number, b: number, c: number, d: number) => number;
  readonly universe_render: (a: number, b: number) => void;
  readonly universe_width: (a: number) => number;
  readonly universe_height: (a: number) => number;
  readonly universe_cells: (a: number) => number;
  readonly universe_toggle_cell: (a: number, b: number, c: number) => void;
  readonly universe_add_glider: (a: number, b: number, c: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {SyncInitInput} module
 *
 * @returns {InitOutput}
 */
export function initSync(module: SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {InitInput | Promise<InitInput>} module_or_path
 *
 * @returns {Promise<InitOutput>}
 */
export default function init(module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
