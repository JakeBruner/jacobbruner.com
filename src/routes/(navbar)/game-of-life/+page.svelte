<script lang="ts">
  import init, { Universe } from "game-of-life";
  import { onMount, onDestroy } from "svelte";

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

  let animate: number | null = null;
  let running = false;
  let ready = false;
  let destroyed = false;
  let loadError = "";

  type Cell = { row: number; column: number };
  let drawingPointer: number | null = null;
  let previousCell: Cell | null = null;
  let drawingAlive = true;
  let ignoreStrokeClick = false;

  let memory: WebAssembly.Memory;

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

    // // check if using firefox windows
    // let isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
    // let isWindows = navigator.platform.indexOf("Win") > -1;
    // if (isFirefox && isWindows) {
    //   // firefox windows
    //   alert(
    //     "Firefox on Windows has a bug that causes the game to run incorrectly. Sorry about that :L"
    //   );
    // }

    // check for wasm
    if (typeof WebAssembly === "undefined") {
      alert(
        "Your browser does not support WebAssembly! Perhaps update to something less ancient :P"
      );
      return;
    }

    init().then((instance) => {
      if (destroyed) return;
      //* ensure wasm is loaded
      // const tick = instance.exports.tick as CallableFunction;
      // console.log(instance.memory);

      updateWidthHeight();
      console.log("width", width, "height", height);
      universe = Universe.new(width, height, mode, density);
      ctx = canvas.getContext("2d")!; // ignore null union type
      // instance.exports.
      memory = instance.memory;

      if (canvas && ctx) {
        const universe_width = universe.width();
        const universe_height = universe.height();

        canvas.height = (CELL_SIZE + 1) * universe_height + 1;
        canvas.width = (CELL_SIZE + 1) * universe_width + 1;

        //* helper functions
        // (in this scope becuase they mutate global state which fucks with null checking)

        //* render loop

        ready = true;
        drawGrid();
        drawCells();
        start();
      }

    }).catch((error) => {
      if (!destroyed) loadError = `Unable to load the simulation: ${error.message}`;
    });
  }); // onMount

  onDestroy(() => {
    destroyed = true;
    stop();
    if (ready) universe.free();
    ready = false;
  });

  const renderLoop = () => {
    if (!running || destroyed) return;
    now = performance.now();
    delta = now - then;

    if (delta > ms) {
      ticknum++;
      then = now - (delta % ms);

      // debugger;
      universe.tick();
      drawGrid();
      drawCells();
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
  const drawCells = () => {
    const cellsPtr = universe.cells(); // usize pointer to cells

    const cells = new Uint8Array(memory.buffer, cellsPtr, Math.ceil((width * height) / 8)); // 8 bits per byte

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

  const reset = (selectedMode: number) => {
    if (!ready) return;
    const nextMode = Number(selectedMode);
    if (!Number.isInteger(nextMode) || nextMode < 0 || nextMode > 4) return;
    endStroke();
    if (nextMode === 0) stop();
    density = Number.isFinite(Number(density)) ? Math.min(1, Math.max(0, Number(density))) : 0.5;
    universe.free();
    universe = Universe.new(width, height, nextMode, density);
    canvas.height = (CELL_SIZE + 1) * universe.height() + 1;
    canvas.width = (CELL_SIZE + 1) * universe.width() + 1;
    ticknum = 0;
    drawGrid();
    drawCells();
  };

  const start = () => {
    if (!ready || running || destroyed) return;
    endStroke();
    running = true;
    then = performance.now();
    animate = requestAnimationFrame(renderLoop);
  };
  const stop = () => {
    endStroke();
    running = false;
    if (animate !== null) cancelAnimationFrame(animate);
    animate = null;
  };

  $: isPaused = !running;

  // $: console.log("isPaused", isPaused);
  const updateWidthHeight = () => {
    width = Math.max(40, Math.floor(0.96 * (window_width / (CELL_SIZE + 1))));
    height = Math.max(20, Math.floor((window_height * (3.5 / 5)) / (CELL_SIZE + 1)));
  }; // yes, this has to mutate global state.

  const pointerCell = (event: Pick<MouseEvent, "clientX" | "clientY">): Cell | null => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - canvas.clientLeft;
    const y = event.clientY - rect.top - canvas.clientTop;
    if (x < 0 || y < 0 || x >= canvas.clientWidth || y >= canvas.clientHeight) return null;
    return {
      row: Math.min(height - 1, Math.floor(y * canvas.height / canvas.clientHeight / (CELL_SIZE + 1))),
      column: Math.min(width - 1, Math.floor(x * canvas.width / canvas.clientWidth / (CELL_SIZE + 1)))
    };
  };

  const endStroke = () => {
    const pointer = drawingPointer;
    drawingPointer = null;
    previousCell = null;
    if (pointer !== null && canvas?.hasPointerCapture(pointer)) canvas.releasePointerCapture(pointer);
  };

  const paintTo = (cell: Cell | null) => {
    if (!cell) {
      // Leaving the board breaks the line instead of painting along its edge.
      previousCell = null;
      return;
    }
    let { row, column } = previousCell ?? cell;
    const dx = Math.abs(cell.column - column);
    const dy = -Math.abs(cell.row - row);
    const stepX = column < cell.column ? 1 : -1;
    const stepY = row < cell.row ? 1 : -1;
    let error = dx + dy;
    const cells = new Uint8Array(memory.buffer, universe.cells(), Math.ceil(width * height / 8));

    // Join sparse pointer samples in grid space. A stroke paints one value,
    // so crossing an already painted cell never toggles it back again.
    while (true) {
      if (bitIsSet(getIndex(row, column), cells) !== drawingAlive) universe.toggle_cell(row, column);
      if (row === cell.row && column === cell.column) break;
      const twiceError = 2 * error;
      if (twiceError >= dy) { error += dy; column += stepX; }
      if (twiceError <= dx) { error += dx; row += stepY; }
    }
    previousCell = cell;
    drawCells();
  };

  const beginStroke = (event: PointerEvent) => {
    if (!ready || !event.isPrimary || event.button !== 0 || drawingPointer !== null) return;
    ignoreStrokeClick = !running;
    if (running) return;
    const cell = pointerCell(event);
    if (!cell) return;
    event.preventDefault();
    const cells = new Uint8Array(memory.buffer, universe.cells(), Math.ceil(width * height / 8));
    drawingAlive = !bitIsSet(getIndex(cell.row, cell.column), cells);
    drawingPointer = event.pointerId;
    canvas.setPointerCapture(event.pointerId);
    paintTo(cell);
  };

  const continueStroke = (event: PointerEvent) => {
    if (event.pointerId !== drawingPointer) return;
    if (!(event.buttons & 1)) { endStroke(); return; }
    event.preventDefault();
    paintTo(pointerCell(event));
  };

  const finishStroke = (event: PointerEvent) => {
    if (event.pointerId !== drawingPointer) return;
    paintTo(pointerCell(event));
    endStroke();
  };

  const cancelStroke = (event: PointerEvent) => {
    if (event.pointerId === drawingPointer) endStroke();
  };

  const toggleRunningCell = (event: MouseEvent) => {
    if (ignoreStrokeClick) { ignoreStrokeClick = false; return; }
    if (!ready || !running) return;
    const cell = pointerCell(event);
    if (!cell) return;
    universe.toggle_cell(cell.row, cell.column);
    drawCells();
  };

  // const addGliderClick = (e: MouseEvent) => {
  //   const boundingRect = canvas.getBoundingClientRect();

  //   const scaleX = canvas.width / boundingRect.width;
  //   const scaleY = canvas.height / boundingRect.height;

  //   const canvasLeft = (e.clientX - boundingRect.left) * scaleX;
  //   const canvasTop = (e.clientY - boundingRect.top) * scaleY;

  //   const row = Math.max(0, Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1));
  //   const col = Math.max(0, Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1));

  //   universe.add_glider(row, col);

  //   drawGrid();
  //   drawCells();
  // };

  // $: reset(mode);

  let tps = 20;
  $: ms = Number.isFinite(Number(tps)) && Number(tps) > 0 ? 1000 / Math.min(240, Number(tps)) : Infinity;

  const CELL_SIZE = 8; // px
  let window_height: number; // see svelte:window
  let window_width: number;
  let width: number;
  let height: number;
  let mode: number = 1; // default set on the dropdown menu below
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

<svelte:window bind:innerHeight={window_height} bind:innerWidth={window_width} on:blur={endStroke} />

<div class="pt-5 text-center">
  <h1>Conway's Game of Life</h1>
  <h2 class="text-xl">Running with Rust + Webassembly</h2>
  <p class="pt-3">
    Tick: {ticknum} attempting to run at tps:
    <input
      aria-label="Ticks per second"
      class="bg-zinc-200 rounded-sm p-0.5 pl-1.5 dark:bg-zinc-700 w-14 shadow-inner"
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
{#if loadError}<p role="alert" class="text-center">{loadError}</p>{/if}
<canvas
  aria-label="Game of Life cells"
  class="mx-auto max-w-[96vw] h-auto overflow-x-auto mt-5 border-zinc-300 dark:border-zinc-600 border-2 rounded-xs"
  bind:this={canvas}
  on:click={toggleRunningCell}
  on:pointerdown={beginStroke}
  on:pointermove={continueStroke}
  on:pointerup={finishStroke}
  on:pointercancel={cancelStroke}
  on:lostpointercapture={cancelStroke}
  class:paused={isPaused}
></canvas>

<p class="text-center text-sm pt-2 px-5">
  Pause to draw: drag from an empty cell to paint, or a live cell to erase.
</p>

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
      disabled={!ready || isPaused}
      class:disabled={isPaused}
      on:click={stop}
    >
      Stop
    </button>
    <button
      class=" bg-lime-500 hover:bg-lime-600 text-white font-bold py-1 px-2 rounded-md"
      disabled={!ready || !isPaused}
      class:disabled={!isPaused}
      on:click={start}>Start</button
    >
    <button
      class=" bg-primary hover:brightness-[80%] text-white font-bold py-1 px-2 rounded-md"
      disabled={!ready}
      on:click={() => reset(mode)}>Reset</button
    >
  </div>
  <!-- {mode} -->

  <div class="pt-5 !no-underline">
    <label for="mode">Mode:</label>
    <select
      id="mode"
      disabled={!ready}
      class="bg-zinc-200 rounded-md p-2 pl-1 dark:bg-zinc-700 shadow-inner"
      bind:value={mode}
      on:change={() => reset(mode)}
    >
      <option value={1}>Random</option>
      <option value={0}>Clear Canvas</option>

      <option value={2}>Math Pattern</option>
      <option value={3}>Spawn Glider</option>
      <option value={4}>Spawn Glider Gun</option>
    </select>

    {#if mode == 1}
      <p class="pt-3">
        Density (0.0 - 1.0):
        <input
          aria-label="Density"
          disabled={!ready}
          class="bg-zinc-200 rounded-sm p-0.5 pl-1.5 dark:bg-zinc-700 w-14 shadow-inner"
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
    cursor: crosshair;
    touch-action: none;
  }
</style>
