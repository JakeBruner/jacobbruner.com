<script lang="ts">
  //@ts-ignore
  import init, { Universe } from "game-of-life";

  import { onMount } from "svelte";

  let universe: Universe;
  let pre: HTMLPreElement;

  onMount(async () => {
    await init();

    universe = Universe.new();

    if (pre != undefined) {
      const renderLoop = () => {
        pre.textContent = universe.render();
        universe.tick();
        console.log("hi");
        requestAnimationFrame(renderLoop);
      };

      requestAnimationFrame(renderLoop);
    }
  });

  // const start = () => {
  //   requestAnimationFrame(() => {
  //     universe.tick();
  //   });
  // };
</script>

<div class="pt-5 text-center">
  <h1>Conway's Game of Life</h1>
  <h2 class="text-xl">Running with Rust + Webassembly</h2>
</div>

<pre
  bind:this={pre}
  class="pt-5 leading-[0.92rem] inset-0 w-full h-full flex flex-col items-center justify-center"
/>
<!-- bind:this isnt working -->

<div class=" pt-5 text-center underline">
  <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life">wikipedia</a>
</div>
