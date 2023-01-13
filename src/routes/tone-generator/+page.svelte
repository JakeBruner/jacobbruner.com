<script lang="ts">
  import { Play, Pause, ArrowDownOnSquare, Plus } from "svelte-heros-v2";
  import { onMount } from "svelte";
  import ToneUI from "./ToneUI.svelte";
  import c from "$lib/c";
  import type { Tone } from "./types";

  let playing = false;
  let ctx: AudioContext;
  let analyzer: AnalyserNode;
  let bufferLength: number;
  let fftcanvas: HTMLCanvasElement;
  let fftctx: CanvasRenderingContext2D;
  let frequencies: Uint8Array;
  let barwidth: number;

  let uid = 0;
  let tones: Tone[] = [];

  onMount(() => {
    // @ts-expect-error
    ctx = new (AudioContext || window.webkitAudioContext)();
    analyzer = new AnalyserNode(ctx, { fftSize: 2048 });
    bufferLength = analyzer.frequencyBinCount;
    frequencies = new Uint8Array(bufferLength);
    barwidth = (fftcanvas.width / bufferLength) * 2;

    fftctx = fftcanvas.getContext("2d")!;

    return () => {
      ctx && ctx.close();
    };
  });

  const devonlyInit = () => {
    const oscNode = new OscillatorNode(ctx, { type: "sine", frequency: 400 });
    const gainNode = new GainNode(ctx);
    const panNode = new StereoPannerNode(ctx);
    oscNode.connect(panNode).connect(gainNode).connect(analyzer).connect(ctx.destination);
    // console.log(osc.frequency.value);
    tones.push({
      id: uid++,
      oscNode,
      gainNode,
      panNode,
      isOrphan: false,
      wave: "sine"
    });

    oscNode.start();
    requestAnimationFrame(animate);

    // console.log(tones);
    console.log("AudioContext initialized");
  };

  $: if (playing) {
    ctx && ctx.resume();
  } else {
    ctx && ctx.suspend();
  }

  const SF = 1 / 3.5;

  const animate = () => {
    if (ctx.state === "running" && fftcanvas) {
      fftctx.fillStyle = "white";
      let x = 0;
      fftctx.clearRect(0, 0, fftcanvas.width, fftcanvas.height);
      analyzer.getByteFrequencyData(frequencies);
      for (let i = 0; i < bufferLength; i++) {
        let barheight = frequencies[i] * SF;
        fftctx.fillRect(x, fftcanvas.height - barheight, barwidth, barheight);
        x += barwidth;
      }

      requestAnimationFrame(animate);
    } else {
      requestAnimationFrame(animate);
    }
  };
</script>

<svelte:head>
  <title>Tone Generator</title>
</svelte:head>

<svelte:window on:mousedown|once={devonlyInit} />

<header class="flex flex-row py-5 px-5 dark:bg-zinc-900 align-middle items-center z-10">
  <h1>Tone Generator</h1>
  <span class={c(ctx ? "text-green-500" : "text-red-500", "text-4xl")}>.</span>
  <div class="flex-grow min-width-none" />
  <!-- fft canvas -->
  <canvas class="w-40 h-10 border-b border-zinc-600" bind:this={fftcanvas} />
  <div class="flex-grow flex-shrink min-width-none" />
  <button
    class={c("rounded-md bg-inherit disabled:bg-zinc-750 transition-colors duration-10")}
    on:click={() => (playing = !playing)}
    disabled={playing}
  >
    <Play variation="solid" class={c("h-10 w-10", playing && "opacity-75")} ariaLabel="start" />
  </button>
  <button
    class={c("rounded-md bg-inherit disabled:bg-zinc-750 transition-colors duration-10")}
    on:click={() => (playing = false)}
    disabled={!playing}
  >
    <Pause variation="solid" class={c("h-10 w-10", !playing && "opacity-75")} ariaLabel="pause" />
  </button>
  <div class="px-2" />
  <ArrowDownOnSquare variation="outline" class="h-10 w-10 -translate-y-0.5" />
</header>
<main>
  <div class="mb-5 mx-5 p-7 dark:bg-zinc-800 rounded-3xl min-h-[800px] flex flex-col space-y-4">
    {#if tones.length > 0}
      {#each tones as tone (tone.id)}
        <ToneUI bind:tone />
      {/each}
    {/if}

    <button
      type="button"
      class="relative block w-full rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-400 text-center  hover:border-zinc-400/80"
      style="height: 98px;"
      on:click={() => {
        if (!ctx) return;
        const oscNode = new OscillatorNode(ctx, { type: "sine", frequency: 400 });
        const gainNode = new GainNode(ctx);
        const panNode = new StereoPannerNode(ctx);
        oscNode.connect(panNode).connect(gainNode).connect(analyzer).connect(ctx.destination);
        tones.push({
          id: uid++,
          oscNode,
          gainNode,
          panNode,
          isOrphan: false,
          wave: "sine"
        });
        tones = tones;
        oscNode.start();
        // console.log("There are now", tones.length, "tones");
      }}
    >
      <Plus class="mx-auto text-zinc-200 hover" />

      <span class="mt-2 block text-sm font-medium text-zinc-200 dark:text-zinc-300"
        >Add a new tone</span
      >
    </button>
  </div>
</main>
