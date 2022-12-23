<script lang="ts">
  let c: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  import { onDestroy, onMount } from "svelte";
  import E8 from "$lib/math/E8";

  let instance: E8 | null = null;
  let darkmode: boolean = false;

  onMount(() => {
    if (window) {
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
    if (window) {
      if (instance) {
        instance.stop();
      }

      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", (e) => {
        darkmode = e.matches;
        instance?.handleDarkmodeChange(darkmode);
      });

      instance = null;
    }
  });
</script>

<div class="w-full h-screen">
  {#if instance}
    <button on:click={() => instance?.stop()}>Stop</button>
    <!-- <button on:click={() => instance?.start()}>Start</button> -->
    <canvas width="1000px" height="1100px" bind:this={c} />
  {/if}
</div>
