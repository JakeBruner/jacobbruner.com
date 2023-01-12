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

  let dial: HTMLDivElement;
  let indicator: HTMLDivElement;

  let pan = 0;

  const handleMouseDown = () => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener(
      "mouseup",
      () => window.removeEventListener("mousemove", handleMouseMove),
      { once: true }
    );
  };

  const handleMouseMove = (e: MouseEvent) => {
    const { left, top, width, height } = dial.getBoundingClientRect();
    const diffX = e.clientX - (left + width / 2);
    const diffY = e.clientY - (top + height / 2);
    const angle =
      Math.trunc(diffY) === 0
        ? Math.sign(diffX) === 1
          ? 0
          : -180
        : Math.atan2(diffY, diffX) * (180 / Math.PI);
    console.log(diffY, diffY === 0);

    // console.log(angle, angle <= 0);

    if ((angle >= -180 && angle <= 0) || Math.trunc(angle) === 180) {
      pan = angle * (10 / 9) + 100;
      indicator.style.transform = `rotate(${angle + 90}deg)`;
    }
  };
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
        <!-- dial -->
        <div class="flex flex-col">
          <div class="relative w-10 h-10 block">
            <div
              class="rounded-full w-full h-full border-2 border-zinc-300"
              bind:this={dial}
              on:mousedown={handleMouseDown}
            >
              <div
                class="absolute w-1 h-5 bg-zinc-100 origin-bottom top-0 left-[18px] rounded-sm"
                bind:this={indicator}
              />
            </div>
          </div>
          <div class="mx-auto bg-zinc-800 rounded-md px-1 mt-1 text-xs">
            {Math.trunc(pan)}
          </div>
        </div>
      </div>
      <Plus variation="solid" class="peer my-auto h-5 w-5 ml-2.5 text-zinc-300 " />
    </div>
  </div>
{/if}
