<script lang="ts">
  import { SpeakerWave, SpeakerXMark, Plus } from "svelte-heros-v2";
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
  <div class="shadow-md">
    <div
      class="w-full bg-gradient-to-tr from-zinc-700 via-zinc-700 to-zinc-600 shadow-inner z-0 rounded-2xl flex flex-row relative"
    >
      <div
        class=" rounded-2xl flex flex-row px-6 py-4 items-center align-middle z-10 w-[95%] peer-hover:w-[90%] transition-transform duration-150 dark:bg-zinc-750 shadow-inner"
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
        <div class="px-4" />
        <div class="dial-container">
          <div class="dial" id="pan-dial">
            <div class="dial-indicator" />
          </div>
        </div>
      </div>
      <Plus variation="solid" class="peer  my-auto h-5 w-5 ml-2.5 text-zinc-300 " />
    </div>
  </div>
{/if}

<style>
  .dial-container {
    width: 100px;
    height: 100px;
    position: relative;
  }

  .dial {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid black;
    position: absolute;
    top: 0;
    left: 0;
  }

  .dial-indicator {
    width: 10px;
    height: 50px;
    background-color: red;
    position: absolute;
    top: 25px;
    left: 45px;
    transform-origin: bottom center;
  }
</style>
