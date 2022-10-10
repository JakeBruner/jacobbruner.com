<script lang="ts">
  import init, { Universe } from "game-of-life";
  import { onMount } from "svelte";

  // LIGHTMODE
  let GRID_COLOR = "#CCCCCC";
  let DEAD_COLOR = "#FFFFFF";
  let ALIVE_COLOR = "#27272A"; // zinc-800

  let universe: Universe;
  // let pre: HTMLPreElement;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  let ticknum = 0;
  let now: number, then: number, delta: number;

  let animate: number | null;

  let memory: ArrayBuffer;

  onMount(() => {
    //* ensure canvas is mounted
    // check for darkmode
    let darkmode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (darkmode) {
      // DARKMODE
      GRID_COLOR = "#52525B"; // zinc-600
      DEAD_COLOR = "#18181B"; // zinc-900
      ALIVE_COLOR = "#D4D4D8"; // zinc-100
    }

    init().then((instance) => {
      //* ensure wasm is loaded
      // const tick = instance.exports.tick as CallableFunction;
      // console.log(instance.memory);

      updateWidthHeight();
      universe = Universe.new(width, height, mode, density);
      ctx = canvas.getContext("2d")!; // ignore null union type
      // instance.exports.
      memory = instance.memory.buffer;

      if (canvas && ctx) {
        const universe_width = universe.width();
        const universe_height = universe.height();

        canvas.height = (CELL_SIZE + 1) * universe_height + 1;
        canvas.width = (CELL_SIZE + 1) * universe_width + 1;

        //* helper functions
        // (in this scope becuase they mutate global state which fucks with null checking)

        //* render loop

        requestAnimationFrame(renderLoop);
        drawGrid();
        drawCells(memory);
      }

      then = performance.now();
    });
  }); // onMount

  const renderLoop = () => {
    now = performance.now();
    delta = now - then;

    if (delta > ms) {
      ticknum++;
      then = now - (delta % ms);

      // debugger;
      universe.tick();
      drawGrid();
      drawCells(memory);
    }

    animate = requestAnimationFrame(renderLoop);
    // return
  };

  const drawGrid = () => {
    ctx.beginPath();
    ctx.strokeStyle = GRID_COLOR;

    // Vertical lines.
    for (let i = 0; i <= width; i++) {
      ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
      ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
    }

    // Horizontal lines.
    for (let j = 0; j <= height; j++) {
      ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
      ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
    }

    ctx.stroke();
  };
  const getIndex = (row: number, column: number) => {
    return row * width + column;
  };
  const bitIsSet = (n: number, arr: Uint8Array) => {
    const byte = Math.floor(n / 8);
    const mask = 1 << n % 8;
    return (arr[byte] & mask) === mask;
  };
  const drawCells = (memory: ArrayBuffer) => {
    const cellsPtr = universe.cells(); // usize pointer to cells

    const cells = new Uint8Array(memory, cellsPtr, (width * height) / 8); // 8 bits per byte

    ctx.beginPath();

    // alive
    ctx.fillStyle = ALIVE_COLOR;
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(row, col);

        if (bitIsSet(idx, cells)) {
          ctx.fillRect(col * (CELL_SIZE + 1) + 1, row * (CELL_SIZE + 1) + 1, CELL_SIZE, CELL_SIZE);
        }
      }
    }
    // dead
    ctx.fillStyle = DEAD_COLOR;
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(row, col);

        if (!bitIsSet(idx, cells)) {
          ctx.fillRect(col * (CELL_SIZE + 1) + 1, row * (CELL_SIZE + 1) + 1, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    ctx.stroke();
  };

  const reset = (mode: number) => {
    // universe = Universe.new(width, height, 0, density);
    // updateWidthHeight();
    universe = Universe.new(width, height, mode, density);
    const universe_width = universe.width();
    const universe_height = universe.height();
    canvas.height = (CELL_SIZE + 1) * universe_height + 1;
    canvas.width = (CELL_SIZE + 1) * universe_width + 1;
    ticknum = 0;
    drawGrid();
    drawCells(memory);
  };

  const start = () => {
    //TODO start doesn't work
    requestAnimationFrame(renderLoop);
  };
  const stop = () => {
    cancelAnimationFrame(animate!);
    animate = null;
    // im just so enthusiastic with this exclamation mark...
  };

  $: isPaused = animate == undefined;

  // $: console.log("isPaused", isPaused);
  const updateWidthHeight = () => {
    width = Math.floor(window_width / (CELL_SIZE + 1));
    height = Math.floor((window_height * (3.5 / 5)) / (CELL_SIZE + 1));
  }; // yes, this has to mutate global state.

  const toggleCell = (e: MouseEvent) => {
    const boundingRect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / boundingRect.width;
    const scaleY = canvas.height / boundingRect.height;

    const canvasLeft = (e.clientX - boundingRect.left) * scaleX;
    const canvasTop = (e.clientY - boundingRect.top) * scaleY;

    const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
    const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

    universe.toggle_cell(row, col);

    drawGrid();
    drawCells(memory);
  };

  // const addGliderClick = (e: MouseEvent) => {
  //   const boundingRect = canvas.getBoundingClientRect();

  //   const scaleX = canvas.width / boundingRect.width;
  //   const scaleY = canvas.height / boundingRect.height;

  //   const canvasLeft = (e.clientX - boundingRect.left) * scaleX;
  //   const canvasTop = (e.clientY - boundingRect.top) * scaleY;

  //   const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
  //   const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

  //   universe.add_glider(row, col);

  //   drawGrid();
  //   drawCells(memory);
  // };

  // $: reset(mode);

  let tps = 20;
  $: ms = 1000 / tps;

  const CELL_SIZE = 8; // px
  let window_height: number; // see svelte:window
  let window_width: number;
  let width: number;
  let height: number;
  let mode: number; // default set on the dropdown menu below
  let density = 0.5;
  // $: console.log("density", density);
</script>

<svelte:head>
  <title>Conway's Game of Life</title>
  <meta
    name="keywords"
    content="John Conway, Game of Life, Cellular Automata, mathematics, math, chaotic systems, symbolic dynamics"
  />
  <meta
    content="John Conway's Game of Life is a cellular automaton created to demonstrate the unpredictability of emergent behavior in chaotic systems."
    name="description"
  />
</svelte:head>

<svelte:window bind:innerHeight={window_height} bind:innerWidth={window_width} />

<div class="pt-5 text-center">
  <h1>Conway's Game of Life</h1>
  <h2 class="text-xl">Running with Rust + Webassembly</h2>
  <p class="pt-3">
    Tick: {ticknum} running at tps:
    <input
      class="bg-zinc-200 rounded p-0.5 pl-1.5 dark:bg-zinc-700 w-14 shadow-inner"
      type="text"
      min="0"
      bind:value={tps}
    />
  </p>
</div>

<!-- <!-- <pre
  bind:this={pre}
  class="mx-auto overflow-x-auto pt-5 md:leading-[0.92rem] leading-[0.6rem] text-sm md:text-lg inset-0 w-full h-full flex flex-col items-center justify-center"
/> -->
<canvas
  class="mx-auto overflow-x-auto mt-5 border-zinc-300 dark:border-zinc-600 border-2 rounded-sm"
  bind:this={canvas}
  on:click={toggleCell}
  class:paused={isPaused}
/>

<!-- bind:this isnt working -->

<div class=" pt-5 text-center">
  <div class="flex flex-row justify-center space-x-3">
    <style>
      .disabled {
        pointer-events: none;
        opacity: 0.5;
      }
    </style>
    <button
      class=" bg-amber-500 hover:bg-amber-600 text-white font-bold py-1 px-2 rounded-md"
      class:disabled={isPaused}
      on:click={stop}
    >
      Stop
    </button>
    <button
      class=" bg-lime-500 hover:bg-lime-600 text-white font-bold py-1 px-2 rounded-md"
      class:disabled={!isPaused}
      on:click={start}>Start</button
    >
    <button
      class=" bg-primary hover:brightness-[80%] text-white font-bold py-1 px-2 rounded-md"
      on:click={() => reset(mode)}>Reset</button
    >
  </div>
  <!-- {mode} -->

  <div class="pt-5 !no-underline">
    <label for="mode">Mode:</label>
    <select
      class="bg-zinc-200 rounded-md p-2 pl-1 dark:bg-zinc-700 shadow-inner"
      bind:value={mode}
      on:change={() => reset(mode)}
    >
      <option selected value="1">Random</option>
      <option value="0">Clear Canvas</option>

      <option value="2">Math Pattern</option>
      <option value="3">Spawn Glider</option>
      <option value="4">Spawn Glider Gun</option>
    </select>

    {#if mode == 1}
      <p class="pt-3">
        Density (0.0 - 1.0):
        <input
          class="bg-zinc-200 rounded p-0.5 pl-1.5 dark:bg-zinc-700 w-14 shadow-inner"
          type="text"
          min="0"
          max="1"
          on:change={() => reset(mode)}
          bind:value={density}
        />
      </p>
    {/if}
  </div>
  <br />
  <br />

  <a class="" href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life">wikipedia</a>
</div>

<div class="px-5 pt-5 md:px-20">
  <p class="italic text-justify">
    John Conway's Game of Life is a cellular automaton created to demonstrate the unpredictability
    of emergent behavior in chaotic systems. It was invented by Cambridge mathematician John Conway
    in 1970. John Conway is a personal role-model of mine, influencing many fields of mathematics
    with his work. For instance, his work in finite group theory during the completion of the
    classification of finite simple groups is a major contribution to the field. His work on the
    Game of Life is a great example of his ability to think outside the box and create something
    beautiful and interesting from a simple set of rules.
  </p>
</div>

<style>
  button {
    text-decoration: none;
    transition: all 0.2s ease-in-out;
  }
  .paused {
    filter: brightness(95%);
  }
</style>
