<script lang="ts">
  import { SpeakerWave, SpeakerXMark, Plus, XMark } from "svelte-heros-v2";
  import Waveform from "./Waveform.svelte";
  import type { Tone } from "$lib/tonegen/type";
  import c from "$lib/c";

  const noteNames = {
    A: 0,
    "A#": 1,
    Bb: 1,
    B: 2,
    C: 3,
    "C#": 4,
    Db: 4,
    D: 5,
    "D#": 6,
    Eb: 6,
    E: 7,
    F: 8,
    "F#": 9,
    Gb: 9,
    G: 10,
    "G#": 11,
    Ab: 11
  };

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

  let popupActive = true;
  // $: console.log(popupActive);

  const togglePopup = (e: MouseEvent | KeyboardEvent) => {
    e.stopPropagation();
    popupActive = !popupActive;

    if (popupActive) {
      window.addEventListener(
        "click",
        () => {
          popupActive = false;
        },
        { once: true }
      );
    } else {
      window.removeEventListener("click", () => {
        popupActive = false;
      });
    }
  };

  const getNoteFrequency = (note: string): number | null => {
    if (!/^[A-G](b|#)?[0-9]$/.test(note)) {
      return null;
    }

    const noteName = note.slice(0, -1);
    const octave = parseInt(note.slice(-1));

    // @ts-ignore
    const noteNumber: number = noteNames[noteName];

    const basefreq = 440;
    const factor = Math.pow(2, (octave - 4) * noteNumber) / 12;

    return basefreq * factor;
  };

  // let pendingFrequency: string;

  // $: pendingFrequency = tone.oscNode.frequency.value.toString();
  // console.log("test C4", getNoteFrequency("A4"));
</script>

{#if tone}
  <div class="shadow-md">
    <div
      class="w-full bg-gradient-to-tr from-zinc-200 via-zinc-100 to-zinc-300  dark:from-zinc-700 dark:via-zinc-700 dark:to-zinc-600 shadow-inner z-0 rounded-2xl flex flex-row-reverse justify-between align-middle "
    >
      <div
        class={c(
          "flex peer transition-transform ease-in-out duration-150 -mr-2 w-10",
          popupActive ? "scale-100 z-50" : "hover:scale-110"
        )}
        on:click|self={togglePopup}
        on:keydown|self={(e) => {
          if (e.key === "Enter") {
            togglePopup(e);
          }
        }}
      >
        <Plus
          variation="solid"
          on:click={(e) => {
            togglePopup(e);
          }}
          class={c(
            "ml-0.5 my-auto h-6 w-6",
            popupActive ? "text-zinc-800 dark:text-zinc-400" : "dark:text-zinc-300 text-zinc-600"
          )}
        />
        <div class="overflow-hidden ">
          {#if popupActive}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
              class="absolute z-50 p-2 w-40 top-1/2 right-0 rounded-md dark:bg-zinc-400/80 bg-zinc-300/50 backdrop-blur-sm"
              transition:fade
              on:click|stopPropagation
            >
              <table class="z-50 w-full table-fixed">
                <thead>
                  <tr>
                    <th
                      colspan="3"
                      class="dark:text-zinc-50 text-zinc-700 text-lg font-semibold text-center"
                      >Add interval</th
                    >
                  </tr>
                  <tr>
                    <th class="dark:text-zinc-50 text-zinc-600 text-sm font-medium text-center"
                      >Equal</th
                    >
                    <th class="dark:text-zinc-50 text-zinc-600 text-sm font-medium text-center"
                      >Just</th
                    >
                    <th class="dark:text-zinc-50 text-zinc-600 text-sm font-medium text-center"
                      >Pyth.</th
                    >
                  </tr>
                </thead>
                <tbody>
                  {#each Intervals as interval}
                    <tr>
                      <td class="font-medium text-center text-base font-mono">
                        <button
                          class={c(
                            "w-7 p-px rounded-md bg-zinc-400 hover:shadow dark:bg-zinc-500 hover:dark:bg-zinc-500/75 hover:bg-zinc-400/90 dark:text-zinc-50 text-white hover:text-zinc-100",
                            interval.name === "diminished fifth" && "hidden",
                            interval.name === "augmented fourth" && "translate-y-3"
                          )}
                          class:hidden={interval.name === "diminished fifth"}
                          title={"equal tempered " + interval.name}
                          on:click={(e) => {
                            togglePopup(e);
                            spawnChild(tone, interval, "equal");
                          }}
                          ><span class="block translate-y-px -translate-x-px"
                            >{interval.unicode}</span
                          ></button
                        >
                      </td>
                      <td class="font-medium text-center text-base font-mono">
                        <button
                          class="w-7 p-px rounded-md bg-zinc-400 hover:shadow dark:bg-zinc-500 hover:dark:bg-zinc-500/75 hover:bg-zinc-400/90 dark:text-zinc-50 text-white hover:text-zinc-100"
                          title={"just tempered " + interval.name}
                          class:hidden={interval.just === interval.equal}
                          on:click={(e) => {
                            togglePopup(e);
                            spawnChild(tone, interval, "just");
                          }}
                          ><span class="block translate-y-0.5 -translate-x-px"
                            >{interval.unicode}</span
                          ></button
                        >
                      </td>
                      <td class="font-medium text-center text-base font-mono">
                        <button
                          class="w-7 p-px rounded-md bg-zinc-400 hover:shadow dark:bg-zinc-500 hover:dark:bg-zinc-500/75 hover:bg-zinc-400/90 dark:text-zinc-50 text-white hover:text-zinc-100"
                          title={"pythagoran tempered " + interval.name}
                          class:hidden={interval.pyth === interval.equal ||
                            interval.pyth === interval.just}
                          on:click={(e) => {
                            togglePopup(e);
                            spawnChild(tone, interval, "pyth");
                          }}
                          ><span class="block translate-y-0.5 -translate-x-px"
                            >{interval.unicode}</span
                          ></button
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
          "rounded-2xl flex flex-row px-6 py-4 items-center align-middle z-0 transition-all duration-150 ease-in-out bg-zinc-300 dark:bg-zinc-750 shadow-inner relative",
          popupActive ? "w-[94%] -z-10 rounded-r-3xl" : "w-[96%] peer-hover:w-[94%]"
        )}
      >
        <div class="absolute top-0 left-0 z-30 p-2">
          <XMark
            class="h-4 w-4 text-zinc-650 dark:text-zinc-400"
            on:click={() => removeTone(tone.id)}
          />
        </div>
        <!-- volume slider -->

        <button>
          {#if tone.gainNode.gain.value === 0}
            <SpeakerXMark
              variation="solid"
              class="h-4 w-4 mr-2 dark:text-zinc-300 text-zinc-700"
              on:click={() => {
                tone.gainNode.gain.value = storedGain ?? 0.5;
                storedGain = null;
              }}
            />
          {:else}
            <SpeakerWave
              variation="solid"
              class="h-4 w-4 mr-2 dark:text-zinc-300 text-zinc-700"
              on:click={() => {
                storedGain = tone.gainNode.gain.value;
                tone.gainNode.gain.value = 0;
              }}
            />
          {/if}
        </button>
        <div
          class={c(
            "flex-grow max-w-3xs border-2 border-zinc-700 dark:border-zinc-400 rounded-sm h-5 relative z-10",
            tone.gainNode.gain.value === 0 ? "cursor-not-allowed" : "cursor-pointer"
          )}
          bind:this={volumeParent}
        >
          <span
            style:width={(tone.gainNode.gain.value || storedGain || 0) * 100 + "%"}
            bind:this={volume}
            class={c(
              "dark:bg-zinc-950 bg-zinc-400 h-[1.04rem] absolute -z-10 left-0",
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
          type="alphanumeric"
          class="w-24 rounded-md bg-zinc-200 dark:bg-zinc-700 text-lg text-center touch-none dark:text-zinc-300 text-zinc-800"
          value={tone.oscNode.frequency.value}
          on:change={(e) => {
            // try to parse the input as a number
            let parsed = parseInt(e.currentTarget.value);

            if (isNaN(parsed)) {
              parsed = getNoteFrequency(e.currentTarget.value) || 400;
            } else {
              e.currentTarget.value = Math.round(parsed);
            }

            if (parsed) {
              tone.oscNode.frequency.value = parsed;
              // round
              e.currentTarget.value = Math.round(parsed);
            }
          }}
          on:wheel|preventDefault={(e) =>
            e.deltaY > 0 ? tone.oscNode.frequency.value-- : tone.oscNode.frequency.value++}
        />
        <span class="text-zinc-300 text-base pl-1">Hz</span>
        <div class="px-2" />
        <!-- double frequency button -->
        <button
          class="py-1 px-1 mr-1 rounded-md bg-zinc-400 dark:bg-zinc-500 hover:bg-zinc-600 text-sm text-center touch-none text-zinc-50 dark:text-zinc-300"
          title="double frequency"
          on:click={() => (tone.oscNode.frequency.value *= 2)}>2x</button
        >
        <button
          class="py-1 px-1 rounded-md bg-zinc-400 dark:bg-zinc-500 hover:bg-zinc-600 text-sm text-center touch-none text-zinc-50 dark:text-zinc-300"
          title="half frequency"
          on:click={() => (tone.oscNode.frequency.value /= 2)}>½x</button
        >
        <div class="px-4" />
        <!-- dial -->
        <div class="flex flex-col translate-y-1" title="pan stereo channels">
          <div class="relative w-10 h-10 block">
            <div
              class="rounded-full w-full h-full border-2 dark:border-zinc-300 border-zinc-500"
              bind:this={dial}
              on:mousedown={handleMouseDown}
            >
              <div
                class="absolute w-1 h-1/2 bg-zinc-600 dark:bg-zinc-100 origin-bottom bottom-1/2 left-[18.5px] rounded-sm z-10"
                bind:this={indicator}
              />
              <div
                class="rounded-full absolute top-0.5 left-0.5 w-[90%] h-[90%] border-4 border-dotted dark:border-zinc-400/80 border-zinc-500 -z-10 rotate-15"
              />
            </div>
          </div>
          <div
            class="mx-auto bg-zinc-200 dark:bg-zinc-800 text-zinc-700 rounded-md px-1 mt-1 text-xs"
          >
            {Math.trunc(tone.panNode.pan.value * 100)}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input {
    -moz-appearance: textfield;
  }
</style>
