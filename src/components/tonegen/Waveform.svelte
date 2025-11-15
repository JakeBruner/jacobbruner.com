<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from "svelte";
  import {
    periodicWaveLibrary,
    periodicWaveOptions,
    type BuiltInWave,
    type PeriodicWaveDefinition
  } from "$lib/tonegen/type";
  import { fade } from "svelte/transition";
  import type { Action } from "svelte/action";

  import Portal from 'svelte-portal';

  export let wave: BuiltInWave;
  export let options: PeriodicWaveDefinition[] = periodicWaveOptions;
  export let className = "";
  export { className as class };

  const dispatch = createEventDispatcher<{ change: BuiltInWave }>();

  let canvasEl: HTMLCanvasElement;
  let triggerEl: HTMLDivElement;
  let waveCanvas: WaveCanvas | null = null;
  const sampleCache = new Map<BuiltInWave, Float32Array>();

  let selectedOption: PeriodicWaveDefinition | undefined;

  let popupPosition: { top: number; left: number } = { top: 0, left: 0 };

  const updatePopupPosition = () => {
    if (!triggerEl || typeof window === "undefined") return;
    const rect = triggerEl.getBoundingClientRect();
    popupPosition = {
      top: rect.bottom + 8 + window.scrollY,
      left: rect.left + window.scrollX
    };
  };

  onMount(() => {
    if (canvasEl) {
      waveCanvas = new WaveCanvas(canvasEl);
      waveCanvas.draw(wave);
    }

    if (typeof window === "undefined") {
      return;
    }

    const handleRelayout = () => {
      if (popupActive) updatePopupPosition();
    };

    window.addEventListener("resize", handleRelayout);
    window.addEventListener("scroll", handleRelayout, true);

    return () => {
      window.removeEventListener("resize", handleRelayout);
      window.removeEventListener("scroll", handleRelayout, true);
    };
  });

  $: if (waveCanvas && wave) {
    waveCanvas.draw(wave);
  }

  $: selectedOption = options.find((option) => option.id === wave);

  const getWaveSamples = (waveId: BuiltInWave, sampleCount = 256) => {
    const existing = sampleCache.get(waveId);
    if (existing) return existing;

    const definition = periodicWaveLibrary[waveId];
    const samples = new Float32Array(sampleCount);

    for (let i = 0; i < sampleCount; i += 1) {
      const phase = (i / (sampleCount - 1)) * 2 * Math.PI;
      let value = 0;

      for (let harmonic = 1; harmonic < definition.real.length; harmonic += 1) {
        const cosCoef = definition.real[harmonic] ?? 0;
        const sinCoef = definition.imag[harmonic] ?? 0;
        value += cosCoef * Math.cos(harmonic * phase) + sinCoef * Math.sin(harmonic * phase);
      }

      samples[i] = value;
    }

    let max = 0;
    for (let i = 0; i < samples.length; i += 1) {
      max = Math.max(max, Math.abs(samples[i]));
    }

    if (max > 0) {
      for (let i = 0; i < samples.length; i += 1) {
        samples[i] /= max;
      }
    }

    sampleCache.set(waveId, samples);
    return samples;
  };

  type WaveCanvasConfig = {
    width?: number;
    height?: number;
  };

  class WaveCanvas {
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private waveColor = "#10b981";
    private fillColor = "rgba(16, 185, 129, 0.18)";
    private background = "#18181b";
    private axisColor = "#52525b";

    constructor(private canvas: HTMLCanvasElement, config: WaveCanvasConfig = {}) {
      this.width = config.width ?? 140;
      this.height = config.height ?? 64;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Unable to create 2D context for waveform canvas.");
      }
      this.ctx = ctx;
      this.configureResolution();
      this.drawBackground();
    }

    draw(waveId: BuiltInWave) {
      this.drawBackground();
      this.drawAxis();
      const samples = getWaveSamples(waveId);
      this.drawWave(samples);
    }

    private configureResolution() {
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio ?? 1 : 1;
      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.scale(dpr, dpr);
    }

    private drawBackground() {
      this.ctx.fillStyle = this.background;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    private drawAxis() {
      this.ctx.strokeStyle = this.axisColor;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(0, this.height / 2);
      this.ctx.lineTo(this.width, this.height / 2);
      this.ctx.stroke();
    }

    private drawWave(samples: Float32Array) {
      if (samples.length === 0) return;

      const midY = this.height / 2;
      const amp = this.height / 2 - 6;
      const step = this.width / (samples.length - 1);

      this.ctx.beginPath();
      this.ctx.moveTo(0, midY);
      for (let i = 0; i < samples.length; i += 1) {
        const x = i * step;
        const y = midY - samples[i] * amp;
        this.ctx.lineTo(x, y);
      }
      this.ctx.lineTo(this.width, midY);
      this.ctx.closePath();
      this.ctx.fillStyle = this.fillColor;
      this.ctx.fill();

      this.ctx.beginPath();
      for (let i = 0; i < samples.length; i += 1) {
        const x = i * step;
        const y = midY - samples[i] * amp;
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.strokeStyle = this.waveColor;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }
  const renderWavePreview: Action<HTMLCanvasElement, BuiltInWave> = (node, waveId) => {
    let currentWave = waveId;
    const previewCanvas = new WaveCanvas(node);
    previewCanvas.draw(currentWave);

    return {
      update(nextWave) {
        if (!nextWave || nextWave === currentWave) return;
        currentWave = nextWave;
        previewCanvas.draw(currentWave);
      }
    };
  };

  let popupActive = false;
  let removeOutsideListener: (() => void) | null = null;

  const cleanupOutsideListener = () => {
    if (removeOutsideListener) {
      removeOutsideListener();
      removeOutsideListener = null;
    }
  };

  const togglePopup = (e: MouseEvent | KeyboardEvent) => {
    e.stopPropagation();
    popupActive = !popupActive;

    if (popupActive) {
      updatePopupPosition();
      if (typeof window === "undefined") return;
      const handleOutsideClick = () => {
        popupActive = false;
        cleanupOutsideListener();
      };
      window.addEventListener("click", handleOutsideClick);
      removeOutsideListener = () => window.removeEventListener("click", handleOutsideClick);
    } else {
      cleanupOutsideListener();
    }
  };

  onDestroy(() => {
    cleanupOutsideListener();
  });
</script>

<div class={`flex flex-row items-start gap-4 ${className}`}>
  <div class="relative" bind:this={triggerEl}>
    <div
      class="flex cursor-pointer select-none flex-col rounded-xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-100 to-zinc-200 p-3 shadow-lg outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 dark:border-zinc-600 dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800"
      on:click={togglePopup}
      on:keydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          togglePopup(e);
        }
      }}
      role="button"
      tabindex="0"
      aria-haspopup="dialog"
      aria-expanded={popupActive}
    >
      <div class="flex items-center gap-4">
        <div class="overflow-hidden rounded-md bg-zinc-900">
          <canvas class="block h-[64px] w-[140px]" bind:this={canvasEl} />
        </div>
        <div class="text-left">
          <p class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {selectedOption?.label ?? "Custom"}
          </p>
        </div>
      </div>
    </div>

    
  </div>
</div>
<Portal target="body">
  {#if popupActive}
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div
      class="w-[320px] rounded-lg border border-zinc-200 bg-gradient-to-br from-white via-zinc-100 to-zinc-200 p-3 shadow-2xl backdrop-blur-sm dark:border-zinc-700 dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800"
      style={`position:absolute; top:${popupPosition.top}px; left:${popupPosition.left}px; z-index: 9999;`}
      transition:fade|global
      on:click|stopPropagation
      on:keydown|stopPropagation
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="flex max-h-[60vh] flex-col gap-2 overflow-y-auto pr-1">
        {#each options as option}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class={`flex cursor-pointer items-center gap-3 rounded-md border border-transparent p-2 transition hover:border-emerald-400 hover:bg-emerald-400/10 ${
              wave === option.id ? "border-emerald-400 bg-emerald-400/10" : ""
            }`}
            on:click={() => {
              wave = option.id;
              popupActive = false;
              dispatch("change", option.id);
              cleanupOutsideListener();
            }}
          >
            <div class="overflow-hidden rounded-md bg-zinc-900">
              <canvas class="block h-16 w-36" use:renderWavePreview={option.id} />
            </div>
            <div class="flex flex-col">
              <div class="font-medium text-zinc-900 dark:text-zinc-200">{option.label}</div>
              <div class="text-sm text-zinc-600 dark:text-zinc-300">{option.description}</div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

</Portal>