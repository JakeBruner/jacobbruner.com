<script lang="ts">
  import init, { Universe, Cell } from "game-of-life";
  import { onMount } from "svelte";
  // const width = 64;

  const CELL_SIZE = 10; // px
  const GRID_COLOR = "#CCCCCC";
  const DEAD_COLOR = "#FFFFFF";
  const ALIVE_COLOR = "#27272A"; // zinc-800

  let universe: Universe;
  // let pre: HTMLPreElement;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  let ticknum = 0;
  let now: number, then: number, delta: number;

  let width = 64;
  let height = 64;
  let mode: number; // default set on the dropdown menu below
  let density = 0.5;

  let stopped: boolean = false;
  onMount(() => {
    //* ensure canvas is mounted
    init().then((instance) => {
      //* ensure wasm is loaded
      // const tick = instance.exports.tick as CallableFunction;
      // console.log(instance.memory);

      universe = Universe.new(width, height, mode, density);
      ctx = canvas.getContext("2d")!; // ignore null union type
      // instance.exports.

      if (canvas && ctx) {
        const width = universe.width();
        const height = universe.height();

        canvas.height = (CELL_SIZE + 1) * height + 1;
        canvas.width = (CELL_SIZE + 1) * width + 1;

        //* helper functions
        // (in this scope becuase they mutate global state which fucks with null checking)
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

          const cells = new Uint8Array(instance.memory.buffer, cellsPtr, (width * height) / 8); // 8 bits per byte

          ctx.beginPath();

          for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
              const idx = getIndex(row, col);

              ctx.fillStyle = bitIsSet(idx, cells) ? ALIVE_COLOR : DEAD_COLOR;

              ctx.fillRect(
                col * (CELL_SIZE + 1) + 1,
                row * (CELL_SIZE + 1) + 1,
                CELL_SIZE,
                CELL_SIZE
              );
            }
          }

          ctx.stroke();
        };

        //* render loop
        const renderLoop = () => {
          now = Date.now();
          delta = now - then;
          if (!stopped) {
            if (delta > ms) {
              ticknum++;
              then = now - (delta % ms);

              universe.tick();
              drawGrid();
              drawCells();
            }

            requestAnimationFrame(renderLoop);
          } else {
            if (delta > ms) {
              then = now - (delta % ms);
            }
          }
          // return
        };

        drawGrid();
        drawCells();
        requestAnimationFrame(renderLoop);
      }

      then = Date.now();
    });
  }); // onMount

  const reset = (mode: number) => {
    universe = Universe.new(width, height, 0, density);
    universe = Universe.new(width, height, mode, density);
    ticknum = 0;
  };

  const start = () => {
    //TODO start doesn't work
    stopped = false;
  };
  const stop = () => {
    stopped = true;
  };

  // $: reset(mode);

  let tps = 20;
  $: ms = 1000 / tps;
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

<div class="pt-5 text-center">
  <h1>Conway's Game of Life</h1>
  <h2 class="text-xl">Running with Rust + Webassembly</h2>
  <p class="pt-3">
    Tick: {ticknum} running at tps:
    <input
      class="bg-zinc-200 rounded-md-md p-0.5 pl-1 dark:bg-zinc-700 w-14"
      type="text"
      bind:value={tps}
    />
  </p>
</div>

<!-- <pre
  bind:this={pre}
  class="mx-auto overflow-x-auto pt-5 md:leading-[0.92rem] leading-[0.6rem] text-sm md:text-lg inset-0 w-full h-full flex flex-col items-center justify-center"
/> -->
<canvas
  class="mx-auto overflow-x-auto mt-5 bortder-zinc-600 border-2 rounded-sm"
  bind:this={canvas}
/>

<!-- bind:this isnt working -->

<div class=" pt-5 text-center underline">
  <div class="flex flex-row justify-center space-x-3" style="text-decoration: underline;">
    <button
      class=" bg-amber-500 hover:bg-amber-600 text-white font-bold py-1 px-2 rounded-md"
      on:click={stop}><span>Stop</span></button
    >
    <button
      class=" bg-sky-400 hover:bg-sky-600 text-white font-bold py-1 px-2 rounded-md"
      on:click={start}><span style="text-decoration: underline;">Start</span></button
    >
    <button
      class=" bg-primary hover:bg-primary/60 text-white font-bold py-1 px-2 rounded-md"
      on:click={() => reset(mode)}><span class="!no-underline!">Reset</span></button
    >
  </div>
  {mode}

  <div class="pt-5">
    <select class="bg-zinc-200 rounded-md p-1 pl-1 dark:bg-zinc-700" bind:value={mode}>
      <option
        on:change={() => {
          console.log("nofuknway");
          reset(mode);
        }}
        selected
        value="1">Random</option
      >
      <option
        on:change={() => {
          console.log("nofuknway");
          reset(mode);
        }}
        value="2">Math Pattern</option
      >
      <option
        on:change={() => {
          console.log("nofuknway");
          reset(mode);
        }}
        value="2">Spawn Glider</option
      >
      <option
        on:change={() => {
          console.log("nofuknway");
          reset(mode);
        }}
        value="3">Spawn Glider Gun</option
      >
    </select>
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
    font: inherit;
    transition: all 0.2s ease-in-out;
  }
  span {
    text-decoration: none !important;
  }
</style>
