<script lang="ts">
  export const prerender = false;
  export const ssr = false;

  let c: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  import { onDestroy, onMount } from "svelte";
  import E8 from "$lib/math/E8";

  let instance: E8 | null = null;
  let darkmode: boolean = false;

  onMount(() => {
    console.log("onMount");
    if (window) {
      // check if window supports canvas
      if (!("HTMLCanvasElement" in window)) {
        console.log("Canvas not supported");
        return;
      }

      darkmode = window.matchMedia("(prefers-color-scheme: dark)").matches;
      ctx = c.getContext("2d")!;
      instance = new E8(ctx, darkmode);

      // listen for darkmode changes

      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        darkmode = e.matches;
        instance?.handleDarkmodeChange(darkmode);
      });
    }
  });

  // $: if (window) {
  //   darkmode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  //   if (instance) {
  //     instance.handleDarkmodeChange(darkmode);
  //   }
  // }
  onDestroy(() => {
    if (instance) {
      instance.stop();
      instance = null;
    }
  });
</script>

<div class="w-full h-screen p-10">
  <button class="px-3 py-2 bg-primary rounded-md" on:click={() => instance?.stop()}>Stop</button>
  <!-- <button on:click={() => instance?.start()}>Start</button> -->
  <canvas width="1000px" height="1100px" bind:this={c} />
</div>
