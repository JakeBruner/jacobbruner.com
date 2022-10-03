<script lang="ts">
  //@ts-ignore
  import init, { Universe } from "game-of-life";

  import { onMount } from "svelte";

  let universe: Universe;
  let pre: HTMLPreElement;

  let ticknum = 0;
  let now: number, then: number, delta: number;

  onMount(async () => {
    await init();

    universe = Universe.new();
    then = Date.now();

    if (pre) {
      const renderLoop = () => {
        // if (pre === null) {
        //   console.log("pre is null");
        // }

        now = Date.now();
        delta = now - then;
        // console.log("delta", delta);

        if (delta > ms) {
          universe.tick();
          ticknum++;
          // console.log("hi");
          then = now - (delta % ms);
          pre.textContent = universe.render();
        }

        requestAnimationFrame(renderLoop);
      };

      requestAnimationFrame(renderLoop);
    }
  });

  const reset = () => {
    universe = Universe.new();
  };

  // const start = () => {
  //   requestAnimationFrame(() => {
  //     universe.tick();
  //   });
  // };
  let fps = 30;
  $: ms = 1000 / fps;
</script>

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

<pre
  bind:this={pre}
  class="pt-5 leading-[0.92rem] inset-0 w-full h-full flex flex-col items-center justify-center"
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
