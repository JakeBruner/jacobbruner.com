<script lang="ts">
  import { Play, Pause, ArrowDownOnSquare } from "svelte-heros-v2";
  import { onMount } from "svelte";
  import ToneUI from "./ToneUI.svelte";
  import c from "$lib/c";
  import type { Tone } from "./types";

  let playing = false;
  let ctx: AudioContext | null = null;

  let osc: OscillatorNode | null = null;

  onMount(() => {
    return () => {
      ctx && ctx.close();
      ctx = null;
    };
  });

  const devonlyInit = () => {
    if (ctx) return;
    ctx = new AudioContext();
  };

  let test: Tone = {
    frequency: 400,
    volume: 0.5
  };

  $: {
    if (ctx) {
      osc = ctx.createOscillator();
      osc.connect(ctx.destination);
      osc.start();
    }
  }

  $: if (playing) {
    ctx && ctx.resume();
  } else {
    ctx && ctx.suspend();
  }

  $: if (osc) {
    osc.frequency.value = test.frequency;
    // not working
    // a: because the gain node is not connected to the oscillator
  }

  // $: test && console.log(test.frequency);
</script>

<svelte:head>
  <title>Tone Generator</title>
</svelte:head>

<svelte:window on:mousedown={devonlyInit} />

<header class="flex flex-row py-5 px-5 dark:bg-zinc-900 align-middle items-center z-10">
  <h1>Tone Generator</h1>
  <span class={c(ctx ? "text-green-500" : "text-red-500", "text-4xl")}>.</span>
  <div class="flex-grow" />
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
  <div class="mb-5 mx-5 p-7 dark:bg-zinc-800 rounded-3xl min-h-[800px]">
    <ToneUI bind:tone={test} />
  </div>
</main>
