<script lang="ts">
  import { SpeakerWave, SpeakerXMark } from "svelte-heros-v2";
  import Waveform from "./Waveform.svelte";

  export let freq = 440;
</script>

<div
  class="px-6 py-4 w-full h-22 dark:bg-zinc-750 shadow-md rounded-[10px] flex flex-row items-center align-middle"
>
  <!-- volume slider -->
  <SpeakerWave variation="solid" class="h-4 w-4 mr-2 text-zinc-300" />
  <div class="w-24 border-2 border-zinc-400 rounded-sm h-5 relative z-10">
    <!-- TODO make the width vary with screen width -->
    <span style:width="50%" class="bg-zinc-950 h-[1.04rem] absolute -z-10 left-0" />
  </div>

  <div class="px-4" />

  <!-- waveform canvas -->
  <Waveform />

  <div class="px-4" />

  <!-- frequency picker -->
  <!-- TODO handle disabled state -->
  <input
    type="numeric"
    class="w-14 rounded-md bg-zinc-700 text-xl"
    bind:value={freq}
    on:wheel|preventDefault={(e) => (e.deltaY > 0 ? freq-- : freq++)}
  />

  <span class="text-zinc-300 text-base">Hz</span>
</div>

<style>
  /* input {
    all: unset;
  } */
</style>
