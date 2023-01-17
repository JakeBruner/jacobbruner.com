<script lang="ts">
  import { SpeakerWave, SpeakerXMark, Plus, XMark } from "svelte-heros-v2";
  import Waveform from "./Waveform.svelte";
  import type { Tone } from "$lib/tonegen/type";
  import c from "$lib/c";

  import { Intervals, type Interval, type Tuning } from "$lib/tonegen/intervals";
  import { fade } from "svelte/transition";

  export let tone: Tone;

  export let spawnChild: (tone: Tone, interval: Interval, tuning: Tuning) => void;
  export let removeTone: (id: number) => void;

  //TODO make a function prop that is passed down from page
  // which constructs a new child node from the existing one that is linked.

  let dial: HTMLDivElement;
  let indicator: HTMLDivElement;

  let volume: HTMLSpanElement;
  let volumeParent: HTMLDivElement;

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

  const handleVolume = (e: MouseEvent) => {
    const { left, width } = volumeParent.getBoundingClientRect();
    const { clientX } = e;
    const x = clientX - left;
    let percent = x / width;

    if (percent > 1) percent = 1;
    if (percent < 0) percent = 0;

    tone.gainNode.gain.value = percent;
    volume.style.width = `${percent}`;
  };

  let storedGain: number | null = null;

  let popupActive = false;
  $: console.log(popupActive);

  const togglePopup = () => {
    popupActive = !popupActive;
    if (popupActive) {
      window.addEventListener("click", () => {
        popupActive = false;
      });
    } else {
      window.removeEventListener("click", () => {
        popupActive = false;
      });
    }
  };
</script>

{#if tone}
  <div class="shadow-md">
    <div
      class="w-full bg-gradient-to-tr from-zinc-700 via-zinc-700 to-zinc-600 shadow-inner z-0 rounded-2xl flex flex-row-reverse justify-between align-middle "
    >
      <div
        class={c(
          "flex peer transition-transform ease-in-out duration-150 -mr-2 w-10",
          popupActive ? "scale-100 z-50" : "hover:scale-110"
        )}
        on:click|self={togglePopup}
        on:keydown|self={(e) => {
          if (e.key === "Enter") {
            togglePopup();
          }
        }}
      >
        <Plus
          variation="solid"
          on:click={() => {
            // console.log("clicked plus");
            popupActive = !popupActive;
          }}
          class={c("ml-0.5 my-auto h-6 w-6", popupActive ? "text-zinc-400" : "text-zinc-300")}
        />
        <div class="overflow-hidden ">
          {#if popupActive}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
              class="absolute z-50 p-2 w-40 top-1/2 right-0 rounded-md bg-zinc-400/80 backdrop-blur-sm"
              transition:fade
              on:click|stopPropagation
            >
              <table class="z-50 w-full table-fixed">
                <thead>
                  <tr>
                    <th colspan="3" class="text-zinc-50 text-lg font-semibold text-center"
                      >Add interval</th
                    >
                  </tr>
                  <tr>
                    <th class="text-zinc-50 text-sm font-medium text-center">Equal</th>
                    <th class="text-zinc-50 text-sm font-medium text-center">Just</th>
                    <th class="text-zinc-50 text-sm font-medium text-center">Pyth.</th>
                  </tr>
                </thead>
                <tbody>
                  {#each Intervals as interval}
                    <tr>
                      <td class="font-medium text-center text-base font-mono">
                        <button
                          class={c(
                            "w-7 p-px rounded-md bg-zinc-500 hover:bg-zinc-500/75 text-zinc-50 hover:text-zinc-100",
                            interval.name === "diminished fifth" && "hidden",
                            interval.name === "augmented fourth" && "translate-y-3"
                          )}
                          class:hidden={interval.name === "diminished fifth"}
                          title={"equal tempered " + interval.name}
                          on:click={() => {
                            console.log("click");
                            popupActive = false;
                            spawnChild(tone, interval, "equal");
                          }}>{interval.unicode}</button
                        >
                      </td>
                      <td class="font-medium text-center text-base font-mono">
                        <button
                          class="w-7 p-px rounded-md bg-zinc-500 hover:bg-zinc-500/75 text-zinc-50 hover:text-zinc-100"
                          title={"just tempered " + interval.name}
                          class:hidden={interval.just === interval.equal}
                          on:click={() => {
                            popupActive = false;
                            spawnChild(tone, interval, "just");
                          }}>{interval.unicode}</button
                        >
                      </td>
                      <td class="font-medium text-center text-base font-mono">
                        <button
                          class="w-7 p-px rounded-md bg-zinc-500 hover:bg-zinc-500/75 text-zinc-50 hover:text-zinc-100"
                          title={"pythagoran tempered " + interval.name}
                          class:hidden={interval.pyth === interval.equal ||
                            interval.pyth === interval.just}
                          on:click={() => {
                            popupActive = false;
                            spawnChild(tone, interval, "pyth");
                          }}>{interval.unicode}</button
                        >
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        </div>
      </div>
      <div
        class={c(
          "rounded-2xl flex flex-row px-6 py-4 items-center align-middle z-0 transition-all duration-150 ease-in-out dark:bg-zinc-750 shadow-inner relative",
          popupActive ? "w-[94%] -z-10" : "w-[96%] peer-hover:w-[94%]"
        )}
      >
        <div class="absolute top-0 left-0 z-30 p-2">
          <XMark class="h-4 w-4 text-zinc-400" on:click={() => removeTone(tone.id)} />
        </div>
        <!-- volume slider -->

        <button>
          {#if tone.gainNode.gain.value === 0}
            <SpeakerXMark
              variation="solid"
              class="h-4 w-4 mr-2 text-zinc-300"
              on:click={() => {
                tone.gainNode.gain.value = storedGain ?? 0.5;
                storedGain = null;
              }}
            />
          {:else}
            <SpeakerWave
              variation="solid"
              class="h-4 w-4 mr-2 text-zinc-300"
              on:click={() => {
                storedGain = tone.gainNode.gain.value;
                tone.gainNode.gain.value = 0;
              }}
            />
          {/if}
        </button>
        <div
          class={c(
            "flex-grow max-w-3xs border-2 border-zinc-400 rounded-sm h-5 relative z-10",
            tone.gainNode.gain.value === 0 ? "cursor-not-allowed" : "cursor-pointer"
          )}
          bind:this={volumeParent}
        >
          <span
            style:width={(tone.gainNode.gain.value || storedGain || 0) * 100 + "%"}
            bind:this={volume}
            class={c(
              "bg-zinc-950 h-[1.04rem] absolute -z-10 left-0",
              tone.gainNode.gain.value === 0 && "opacity-50 "
            )}
            on:mousedown={() => {
              window.addEventListener("mousemove", handleVolume);
              window.addEventListener(
                "mouseup",
                () => window.removeEventListener("mousemove", handleVolume),
                { once: true }
              );
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
          type="number"
          class="w-24 rounded-md bg-zinc-700 text-lg text-center touch-none"
          bind:value={tone.oscNode.frequency.value}
          on:wheel|preventDefault={(e) =>
            e.deltaY > 0 ? tone.oscNode.frequency.value-- : tone.oscNode.frequency.value++}
        />
        <span class="text-zinc-300 text-base pl-1">Hz</span>
        <div class="px-2" />
        <!-- double frequency button -->
        <button
          class="py-1 px-1 mr-1 rounded-md bg-zinc-500 hover:bg-zinc-600 text-sm text-center touch-none text-zinc-300"
          title="double frequency"
          on:click={() => (tone.oscNode.frequency.value *= 2)}>2x</button
        >
        <button
          class="py-1 px-1 rounded-md bg-zinc-500 hover:bg-zinc-600 text-sm text-center touch-none text-zinc-300"
          title="half frequency"
          on:click={() => (tone.oscNode.frequency.value /= 2)}>½x</button
        >
        <div class="px-4" />
        <!-- dial -->
        <div class="flex flex-col translate-y-1" title="pan stereo channels">
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

<style>
  /* Chrome, Safari, Edge, Opera */
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type="number"] {
    -moz-appearance: textfield;
  }
</style>
