<script lang="ts">
  import { SpeakerWave, SpeakerXMark, Plus } from "svelte-heros-v2";
  import Waveform from "./Waveform.svelte";
  import type { Tone } from "./types";

  export let tone: Tone;

  //TODO make a function prop that is passed down from page
  // which constructs a new child node from the existing one that is linked.

  let dial: HTMLDivElement;
  let indicator: HTMLDivElement;

  let pan = 0;
  let gain = 0;

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
    // console.log(diffY, diffY === 0);

    // console.log(angle, angle <= 0);

    if ((angle >= -180 && angle <= 0) || Math.trunc(angle) === 180) {
      tone.panNode.pan.value = (angle * (10 / 9) + 100) / 100;
      indicator.style.transform = `rotate(${angle + 90}deg)`;
    }
  };
</script>

{#if tone}
  <div class="shadow-md">
    <div
      class="w-full bg-gradient-to-tr from-zinc-700 via-zinc-700 to-zinc-600 shadow-inner z-0 rounded-2xl flex flex-row-reverse relative"
      style="justify-content: start;"
    >
      <div class="h-auto flex peer -mr-2 w-10" style="justify-self: end">
        <Plus variation="solid" class="ml-0.5 my-auto h-6 w-6 text-zinc-300" />
      </div>
      <div
        class="rounded-2xl flex flex-row px-6 py-4 items-center align-middle z-10 w-[96%] peer-hover:w-[94%] transition-all duration-150 ease-in-out dark:bg-zinc-750 shadow-inner"
      >
        <!-- volume slider -->
        <SpeakerWave variation="solid" class="h-4 w-4 mr-2 text-zinc-300" />
        <div class="flex-grow max-w-3xs border-2 border-zinc-400 rounded-sm h-5 relative z-10">
          <!-- TODO make the width vary with screen width -->
          <span
            style:width={tone.gainNode.gain.value + "%"}
            class="bg-zinc-950 h-[1.04rem] absolute -z-10 left-0"
            on:mousedown={(e) => {
              const { left, width } = e.currentTarget.getBoundingClientRect();
              const { clientX } = e;
              const x = clientX - left;
              const percent = x / width;
              console.log(percent);
              tone.gainNode.gain.value = percent;
              e.currentTarget.style.width = `${percent}`;
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
          bind:value={tone.oscNode.frequency.value}
          on:wheel|preventDefault={(e) =>
            e.deltaY > 0 ? tone.oscNode.frequency.value-- : tone.oscNode.frequency.value++}
        />
        <span class="text-zinc-300 text-base pl-1">Hz</span>
        <div class="px-4" />
        <!-- dial -->
        <div class="flex flex-col translate-y-1">
          <div class="relative w-10 h-10 block">
            <div
              class="rounded-full w-full h-full border-2 border-zinc-300"
              bind:this={dial}
              on:mousedown={handleMouseDown}
            >
              <div
                class="absolute w-1 h-1/2 bg-zinc-100 origin-bottom bottom-1/2 left-[18.5px] rounded-sm z-10"
                bind:this={indicator}
              />
              <div
                class="rounded-full absolute top-0.5 left-0.5 w-[90%] h-[90%] border-4 border-dotted border-zinc-400/80 -z-10 rotate-15"
              />
            </div>
          </div>
          <div class="mx-auto bg-zinc-800 rounded-md px-1 mt-1 text-xs">
            {Math.trunc(tone.panNode.pan.value * 100)}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
