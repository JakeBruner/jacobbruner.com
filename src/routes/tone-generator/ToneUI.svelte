<script lang="ts">
  import { SpeakerWave, SpeakerXMark } from "svelte-heros-v2";
  import Waveform from "./Waveform.svelte";
  import type { Tone } from "./types";

  export let tone: Tone;

  console.log(tone.node.frequency.value);

  let newFreq = tone.node.frequency.value;

  $: if (newFreq !== tone.node.frequency.value) {
    // tone.node.frequency.value = newFreq;
    // tone.node.frequency.setValueAtTime(newFreq, 0);
  }
</script>

{#if tone}
  <div
    class="px-6 py-4 w-full dark:bg-zinc-750 shadow-md rounded-2xl flex flex-row items-center align-middle"
  >
    <!-- volume slider -->
    <SpeakerWave variation="solid" class="h-4 w-4 mr-2 text-zinc-300" />

    <div class="flex-grow max-w-3xs border-2 border-zinc-400 rounded-sm h-5 relative z-10">
      <!-- TODO make the width vary with screen width -->
      <span
        style:width="75%"
        class="bg-zinc-950 h-[1.04rem] absolute -z-10 left-0"
        on:mousedown={(e) => {
          const { left, width } = e.currentTarget.getBoundingClientRect();
          const { clientX } = e;
          const x = clientX - left;
          const percent = x / width;
          // tone.node.gain.value = percent;
        }}
      />
      <!-- q: what's wrong with the event listener above? -->
      <!-- a:  -->
    </div>

    <div class="px-4" />

    <!-- waveform canvas -->
    <Waveform />

    <div class="px-4" />

    <!-- frequency picker -->
    <!-- TODO handle disabled state -->
    <input
      type="numeric"
      class="w-14 rounded-md bg-zinc-700 text-xl text-center touch-none"
      bind:value={tone.node.frequency.value}
      on:wheel|preventDefault={(e) =>
        e.deltaY > 0 ? tone.node.frequency.value-- : tone.node.frequency.value++}
    />

    <span class="text-zinc-300 text-base pl-1">Hz</span>
  </div>
{/if}

<style>
  /* input {
    all: unset;
  } */
</style>
