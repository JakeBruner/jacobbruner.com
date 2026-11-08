<script lang="ts">
  import { SpeakerWave, SpeakerXMark, Plus, XMark } from "svelte-heros-v2";
  import Waveform from "./Waveform.svelte";
  import { applyPeriodicWave } from "#lib/tonegen/type.ts";
  import type { BuiltInWave, Tone } from "#lib/tonegen/type.ts";
  import c from "#lib/c.ts";

  const noteNames: Record<string, number> = {
    C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4,
    F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11
  };

  import { Intervals, type Interval, type Tuning } from "#lib/tonegen/intervals.ts";
  import { fade } from "svelte/transition";
  import { onDestroy } from "svelte";

  export let tone: Tone;

  export let spawnChild: (tone: Tone, interval: Interval, tuning: Tuning) => void;
  export let removeTone: (id: number) => void;

  //TODO make a function prop that is passed down from page
  // which constructs a new child node from the existing one that is linked.

  let dial: HTMLDivElement;
  let indicator: HTMLDivElement;

  let volume: HTMLSpanElement;
  let volumeParent: HTMLDivElement;

  let dragHandler: ((event: PointerEvent) => void) | undefined;
  const stopDragging = () => {
    if (dragHandler) window.removeEventListener("pointermove", dragHandler);
    window.removeEventListener("pointerup", stopDragging);
    window.removeEventListener("pointercancel", stopDragging);
    dragHandler = undefined;
  };
  const startDragging = (event: PointerEvent, handler: (event: PointerEvent) => void) => {
    event.preventDefault();
    stopDragging();
    dragHandler = handler;
    window.addEventListener("pointermove", handler);
    window.addEventListener("pointerup", stopDragging, { once: true });
    window.addEventListener("pointercancel", stopDragging, { once: true });
    handler(event);
  };
  const setPan = (value: number) => {
    tone.panNode.pan.value = Math.min(1, Math.max(-1, value));
    indicator.style.transform = `rotate(${tone.panNode.pan.value * 90}deg)`;
    tone = tone;
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
      setPan((angle + 90) / 90);
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
    tone = tone;
  };

  let storedGain: number | null = null;

  let popupActive = false;
  // $: console.log(popupActive);

  const closePopup = () => {
    popupActive = false;
    window.removeEventListener("click", closePopup);
  };
  const togglePopup = (e: MouseEvent | KeyboardEvent) => {
    e.stopPropagation();
    if (popupActive) closePopup();
    else {
      popupActive = true;
      window.addEventListener("click", closePopup);
    }
  };
  onDestroy(() => {
    if (typeof window !== "undefined") {
      stopDragging();
      window.removeEventListener("click", closePopup);
    }
  });

  const getNoteFrequency = (note: string): number | null => {
    const match = /^([A-Ga-g])([b#]?)([0-9])$/.exec(note);
    if (!match) return null;
    const pitch = noteNames[match[1].toUpperCase() + match[2]];
    if (pitch === undefined) return null;
    const midi = (Number(match[3]) + 1) * 12 + pitch;
    return 440 * 2 ** ((midi - 69) / 12);
  };

  const setFrequency = (value: number) => {
    if (!Number.isFinite(value)) return;
    tone.oscNode.frequency.value = Math.min(tone.oscNode.context.sampleRate / 2, Math.max(1, value));
    tone = tone;
  };

  // let pendingFrequency: string;

  // $: pendingFrequency = tone.oscNode.frequency.value.toString();
  // console.log("test C4", getNoteFrequency("A4"));

  const handleWaveChange = (waveId: BuiltInWave) => {
    if (!tone) return;
    tone.wave = waveId;
    applyPeriodicWave(tone.oscNode, waveId);
  };
</script>

{#if tone}
  <div class="shadow-md rounded-3xl">
    <div
      class="w-full bg-linear-to-tr/srgb from-zinc-50 via-zinc-100 to-zinc-300 dark:from-zinc-700 dark:via-zinc-700 dark:to-zinc-600 dark:shadow-inner z-0 rounded-2xl flex flex-row-reverse justify-between align-middle"
    >
      <div
        class={c(
          "flex peer transition-transform ease-in-out duration-150 -mr-2 w-10",
          popupActive ? "scale-100 z-50" : "hover:scale-110"
        )}
      >
        <button
          type="button"
          class="flex items-center"
          aria-label="Add interval"
          aria-expanded={popupActive}
          on:click={togglePopup}
        >
          <Plus
            variation="solid"
            class={c(
              "ml-0.5 my-auto h-6 w-6",
              popupActive ? "text-zinc-800 dark:text-zinc-400" : "dark:text-zinc-300 text-zinc-600"
            )}
          />
        </button>
        <div class="overflow-hidden">



          {#if popupActive}
            <div
              class="absolute z-50 p-2 w-40 top-1/2 right-0 rounded-md dark:bg-zinc-400/80 bg-white/50 backdrop-blur-xs"
              transition:fade|global
              on:click|stopPropagation
              on:keydown|stopPropagation
              role="dialog"
              aria-modal="true"
              tabindex="0"
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
                  {#each Intervals as interval (interval.name)}
                    <tr>
                      <td class="font-medium text-center text-base font-mono">
                        <button
                          class={c(
                            "w-7 p-px rounded-md bg-zinc-400 hover:shadow-sm dark:bg-zinc-500 hover:dark:bg-zinc-500/75 hover:bg-zinc-400/90 dark:text-zinc-50 text-white hover:text-zinc-100",
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
                          class="w-7 p-px rounded-md bg-zinc-400 hover:shadow-sm dark:bg-zinc-500 hover:dark:bg-zinc-500/75 hover:bg-zinc-400/90 dark:text-zinc-50 text-white hover:text-zinc-100"
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
                          class="w-7 p-px rounded-md bg-zinc-400 hover:shadow-sm dark:bg-zinc-500 hover:dark:bg-zinc-500/75 hover:bg-zinc-400/90 dark:text-zinc-50 text-white hover:text-zinc-100"
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
          "rounded-2xl flex flex-row px-6 py-4 items-center align-middle z-0 transition-all duration-150 ease-in-out bg-zinc-50/80 dark:bg-zinc-750 shadow-inner relative",
          popupActive ? "w-[94%] -z-10 rounded-r-3xl" : "w-[96%] peer-hover:w-[94%]"
        )}
      >
        <button type="button" aria-label="Remove tone" class="absolute top-0 left-0 z-30 p-2" on:click={() => removeTone(tone.id)}>
          <XMark
            class="h-4 w-4 text-zinc-650 dark:text-zinc-400"
          />
        </button>
        <!-- volume slider -->

        <button type="button" aria-label={tone.gainNode.gain.value === 0 ? "Unmute tone" : "Mute tone"} on:click={() => {
          if (tone.gainNode.gain.value === 0) {
            tone.gainNode.gain.value = storedGain ?? 0.5;
            storedGain = null;
          } else {
            storedGain = tone.gainNode.gain.value;
            tone.gainNode.gain.value = 0;
          }
          tone = tone;
        }}>
          {#if tone.gainNode.gain.value === 0}
            <SpeakerXMark
              variation="solid"
              class="h-4 w-4 mr-2 dark:text-zinc-300 text-zinc-700"
            />
          {:else}
            <SpeakerWave
              variation="solid"
              class="h-4 w-4 mr-2 dark:text-zinc-300 text-zinc-700"
            />
          {/if}
        </button>
        <div
          class={c(
            "grow max-w-3xs border-2 border-zinc-700 dark:border-zinc-400 rounded-xs h-5 relative z-10",
            tone.gainNode.gain.value === 0 ? "cursor-not-allowed" : "cursor-pointer"
          )}
          role="group"
          aria-label="Volume control"
          bind:this={volumeParent}
          on:pointerdown={(event) => startDragging(event, handleVolume)}
          style:touch-action="none"
        >
          <div
            role="slider"
            tabindex="0"
            aria-label="Volume"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={Math.round((tone.gainNode.gain.value || storedGain || 0) * 100)}
            style:width={(tone.gainNode.gain.value || storedGain || 0) * 100 + "%"}
            bind:this={volume}
            class={c(
              "dark:bg-zinc-950 bg-zinc-400 h-[1.04rem] absolute -z-10 left-0",
              tone.gainNode.gain.value === 0 && "opacity-50 "
            )}
            on:keydown={(e) => {
              if (["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp", "Home", "End"].includes(e.key)) e.preventDefault();
              const step = e.shiftKey ? 0.1 : 0.01;
              if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                tone.gainNode.gain.value = Math.max(0, tone.gainNode.gain.value - step);
              } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                tone.gainNode.gain.value = Math.min(1, tone.gainNode.gain.value + step);
              } else if (e.key === "Home") {
                tone.gainNode.gain.value = 0;
              } else if (e.key === "End") {
                tone.gainNode.gain.value = 1;
              }
            }}
          ></div>
        </div>
        <div class="px-2 xs:px-4" ></div>
        <!-- waveform selector -->
        <Waveform
          wave={tone.wave}
          class="flex-shrink-0"
          on:change={(event) => handleWaveChange(event.detail)}
        />
        <div class="px-2 sm:px-4" ></div>
        <!-- frequency picker -->
        <div class="flex flex-col gap-1">
          <span class="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-300"
            >Frequency</span
          >
          <div class="flex items-center">
            <!-- TODO handle disabled state -->
            <input
              type="text"
              aria-label="Frequency"
              class="w-24 rounded-md bg-zinc-200 shadow-inner dark:bg-zinc-700 text-lg text-center touch-none dark:text-zinc-300 text-zinc-900 pl-0.5"
              value={tone.oscNode.frequency.value}
              on:change={(event) => {
                const input = event.currentTarget as HTMLInputElement;
                const text = input.value.trim();
                if (text) setFrequency(getNoteFrequency(text) ?? Number(text));
                input.value = String(tone.oscNode.frequency.value);
              }}
              on:wheel|preventDefault={(e) => setFrequency(tone.oscNode.frequency.value + (e.deltaY > 0 ? -1 : 1))}
            />
            <span class="dark:text-zinc-300 text-zinc-500 text-base pl-1">Hz</span>
            <div class="px-2" ></div>
            <!-- double frequency button -->
            <button
              class="py-1 px-1 mr-1 rounded-md bg-zinc-400 dark:bg-zinc-500 hover:bg-zinc-600 text-sm text-center touch-none text-zinc-50 dark:text-zinc-300"
              title="double frequency"
              on:click={() => setFrequency(tone.oscNode.frequency.value * 2)}>2x</button
            >
            <button
              class="py-1 px-1 rounded-md bg-zinc-400 dark:bg-zinc-500 hover:bg-zinc-600 text-sm text-center touch-none text-zinc-50 dark:text-zinc-300"
              title="half frequency"
              on:click={() => setFrequency(tone.oscNode.frequency.value / 2)}>½x</button
            >
          </div>
        </div>
        <div class="px-1 sm:px-4" ></div>
        <!-- dial -->
        <div class="flex-col translate-y-1 sm:flex hidden" title="pan stereo channels">
          <div class="relative w-10 h-10 block">
            <div
              class="rounded-full w-full h-full border-2 dark:border-zinc-300 border-zinc-500"
              bind:this={dial}
              on:pointerdown={(event) => startDragging(event, handleMouseMove)}
              style:touch-action="none"
              on:keydown={(event) => {
                const step = event.shiftKey ? 0.1 : 0.01;
                if (event.key === "ArrowLeft" || event.key === "ArrowDown") setPan(tone.panNode.pan.value - step);
                else if (event.key === "ArrowRight" || event.key === "ArrowUp") setPan(tone.panNode.pan.value + step);
                else if (event.key === "Home") setPan(-1);
                else if (event.key === "End") setPan(1);
                else return;
                event.preventDefault();
              }}
              role="slider"
              tabindex="0"
              aria-label="Pan stereo channels"
              aria-valuemin="-1"
              aria-valuemax="1"
              aria-valuenow={Math.round(tone.panNode.pan.value * 100) / 100}
            >
              <div
                class="absolute w-1 h-1/2 bg-zinc-600 dark:bg-zinc-100 origin-bottom bottom-1/2 left-[18.5px] rounded-xs z-10"
                bind:this={indicator}
                style:transform={`rotate(${tone.panNode.pan.value * 90}deg)`}
              ></div>
              <div
                class="rounded-full absolute top-0.5 left-0.5 w-[90%] h-[90%] border-4 border-dotted dark:border-zinc-400/80 border-zinc-500 -z-10 rotate-15"
              ></div>
            </div>
          </div>
          <div
            class="mx-auto bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 rounded-md px-1 mt-1 text-xs"
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
    appearance: textfield;
    -moz-appearance: textfield;
  }
</style>
