<script lang="ts">
  export const prerender = false;
  export const ssr = false;

  let c: HTMLCanvasElement;
  let small_c: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  import { onDestroy, onMount } from "svelte";
  import E8, { type E8LatticeConstructor } from "$lib/math/E8";

  let instance: E8 | null = null;
  let darkmode: boolean = false;
  let y: number = 0;
  let x: number = 0;
  let smallScreen: boolean = false;

  onMount(() => {
    console.log("onMount");
    console.log(x, y);
    if (window) {
      // check if window supports canvas
      if (!("HTMLCanvasElement" in window)) {
        console.log("Canvas not supported");
        return;
      }

      smallScreen = window.innerWidth < 768;

      if (smallScreen) {
        ctx = small_c.getContext("2d")!;
      } else {
        ctx = c.getContext("2d")!;
      }

      darkmode = window.matchMedia("(prefers-color-scheme: dark)").matches;

      const options: E8LatticeConstructor = {
        ctx,
        darkmode,
        scalefactor: smallScreen ? 0.9 : 2,
        showLines: true,
        showPoints: false,
        randomConjugator: false
      };

      instance = new E8(options);

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

  // $: smallScreen = x < 768;
</script>

<svelte:window bind:innerHeight={y} bind:innerWidth={x} />

<!-- <button class="px-3 py-2 bg-primary rounded-md" on:click={() => instance?.stop()}>Stop</button> -->
<!-- <button on:click={() => instance?.start()}>Start</button> -->

<div class="w-full h-screen -mt-16 relative">
  <div class="mt-40 mx-5 absolute">
    <h1
      class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-bl from-primary-500 via-violet-600 to-pink-500 leading-relaxed"
    >
      The Mystery: <br />
      <span class="text-6xl">E8</span>
    </h1>
  </div>

  <div class="absolute left-0 bottom-0 translate-x-20">
    <canvas class="sm:hidden block" width={500} height={500} bind:this={small_c} />
    <canvas class="hidden sm:block" width={1000} height={1000} bind:this={c} />
  </div>
</div>

<!-- <canvas class="" width={x} height={y} bind:this={c} /> -->
