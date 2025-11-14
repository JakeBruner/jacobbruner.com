<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import {
    periodicWaveLibrary,
    periodicWaveOptions,
    type BuiltInWave,
    type PeriodicWaveDefinition
  } from "$lib/tonegen/type";

  export let wave: BuiltInWave;
  export let options: PeriodicWaveDefinition[] = periodicWaveOptions;
  export let className = "";
  export { className as class };

  const dispatch = createEventDispatcher<{ change: BuiltInWave }>();

  let canvasEl: HTMLCanvasElement;
  let waveCanvas: WaveCanvas | null = null;
  const sampleCache = new Map<BuiltInWave, Float32Array>();

  let selectedOption: PeriodicWaveDefinition | undefined;

  const handleChange = (event: Event) => {
    if (!(event.currentTarget instanceof HTMLSelectElement)) return;
    const nextWave = event.currentTarget.value as BuiltInWave;
    wave = nextWave;
    dispatch("change", nextWave);
  };

  onMount(() => {
    if (!canvasEl) return;
    waveCanvas = new WaveCanvas(canvasEl);
    waveCanvas.draw(wave);
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

  class WaveCanvas {
    private ctx: CanvasRenderingContext2D;
    private width = 140;
    private height = 64;
    private waveColor = "#10b981";
    private fillColor = "rgba(16, 185, 129, 0.18)";
    private background = "#18181b";
    private axisColor = "#52525b";

    constructor(private canvas: HTMLCanvasElement) {
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
</script>

<div class={`flex flex-row items-start gap-4 ${className}`}>
  <div
    class="flex h-[78px] w-[158px] flex-shrink-0 items-center justify-center rounded-xl border border-zinc-600/70 bg-zinc-900/80 p-2 shadow-inner dark:border-zinc-500/70"
  >
    <div class="overflow-hidden rounded-md bg-zinc-900">
      <canvas class="block h-[64px] w-[140px]" bind:this={canvasEl} />
    </div>
  </div>
  <div class="flex min-w-[160px] flex-col">
    <label class="mb-1 block text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-300"
      >Waveform</label
    >
    <select
      class="w-full rounded-md border-2 border-zinc-600 bg-zinc-200 p-1 text-sm font-medium text-zinc-800 shadow-inner dark:border-zinc-400 dark:bg-zinc-700 dark:text-zinc-50"
      bind:value={wave}
      on:change={handleChange}
    >
      {#each options as option}
        <option value={option.id}>{option.label}</option>
      {/each}
    </select>
    <p class="mt-1 text-[0.7rem] leading-tight text-zinc-500 dark:text-zinc-300">
      {selectedOption?.description}
    </p>
  </div>
</div>
