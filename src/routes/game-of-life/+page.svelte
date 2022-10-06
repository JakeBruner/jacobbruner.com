<script lang="ts">
  import init, { Universe, Cell } from "game-of-life";
  import memory from "game-of-life/game_of_life_bg.wasm";

  import { onMount } from "svelte";
  const width = 64;

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

  onMount(() => {
    //* ensure canvas is mounted
    init().then((exports) => {
      //* ensure wasm is loaded
      universe = Universe.new();
      ctx = canvas.getContext("2d")!; // ignore null union type

      if (canvas && ctx && universe) {
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
        const drawCells = () => {
          const cellsPtr = universe.cells();

          const cells = new Uint8Array(exports.memory.buffer, cellsPtr, width * height);

          ctx.beginPath();

          for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
              const idx = getIndex(row, col);

              ctx.fillStyle = cells[idx] === Cell.Dead ? DEAD_COLOR : ALIVE_COLOR;

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

          if (delta > ms) {
            ticknum++;
            then = now - (delta % ms);

            universe.tick();
            drawGrid();
            drawCells();
          }

          requestAnimationFrame(renderLoop);
        };

        drawGrid();
        drawCells();
        requestAnimationFrame(renderLoop);
      }

      universe = Universe.new();

      then = Date.now();
    });
  }); // onMount

  const reset = () => {
    universe = Universe.new();
    ticknum = 0;
  };

  // const start = () => {
  //   requestAnimationFrame(() => {
  //     universe.tick();
  //   });
  // };
  let fps = 2;
  $: ms = 1000 / fps;
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
    Tick: {ticknum} running at fps:
    <input
      class="bg-zinc-200 rounded-md p-0.5 pl-1 dark:bg-zinc-700 w-14"
      type="text"
      bind:value={fps}
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
  <button
    class="bg-primary hover:bg-primary/60 text-white font-bold py-1 px-2 rounded"
    on:click={reset}>Reset</button
  >
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
