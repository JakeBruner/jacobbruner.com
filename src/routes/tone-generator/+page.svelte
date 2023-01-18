<script lang="ts">
  import { Play, Pause, ArrowDownOnSquare, Plus } from "svelte-heros-v2";
  import { onMount } from "svelte";
  import ToneUI from "$components/tonegen/ToneUI.svelte";
  import c from "$lib/c";
  import type { Tone } from "$lib/tonegen/type";

  import type { Interval, Tuning } from "$lib/tonegen/intervals";

  import ToneRecorder from "$lib/tonegen/recorder";

  let recorder: ToneRecorder;

  let playing = false;
  let ctx: AudioContext;
  let analyzer: AnalyserNode;
  let bufferLength: number;
  let fftcanvas: HTMLCanvasElement;
  let fftctx: CanvasRenderingContext2D;
  let frequencies: Uint8Array;
  let barwidth: number;

  let uid = 0;
  let tones: Tone[] = [];

  const gainOptions = { gain: 0.75 };

  onMount(() => {
    // @ts-expect-error
    ctx = new (AudioContext || window.webkitAudioContext)();
    analyzer = new AnalyserNode(ctx, { fftSize: 2048 });
    bufferLength = analyzer.frequencyBinCount;
    frequencies = new Uint8Array(bufferLength);
    barwidth = (fftcanvas.width / bufferLength) * 2;

    fftctx = fftcanvas.getContext("2d")!;

    return () => {
      ctx && ctx.close();
    };
  });

  const devonlyInit = () => {
    const oscNode = new OscillatorNode(ctx, { type: "sine", frequency: 400 });
    const gainNode = new GainNode(ctx, gainOptions);
    const panNode = new StereoPannerNode(ctx);

    oscNode.connect(panNode).connect(gainNode).connect(analyzer).connect(ctx.destination);

    tones.push({
      id: uid++,
      oscNode,
      gainNode,
      panNode,
      isOrphan: false,
      wave: "sine"
    });

    oscNode.start();

    // oscNode.start();
    requestAnimationFrame(animate);

    // recorder.connectOscillator(oscNode);

    recorder = new ToneRecorder(ctx, tones, "ogg");

    // console.log(tones);
    console.log("AudioContext initialized");
  };

  $: if (playing) {
    ctx && ctx.resume();
  } else {
    ctx && ctx.suspend();
  }

  const SF = 1 / 3.5;

  const animate = () => {
    if (ctx.state === "running" && fftcanvas) {
      let x = 0;
      fftctx.clearRect(0, 0, fftcanvas.width, fftcanvas.height);
      analyzer.getByteFrequencyData(frequencies);
      for (let i = 0; i < bufferLength; i++) {
        let barheight = frequencies[i] * SF;
        fftctx.fillStyle = `hsl(${barheight * 2}, 100%, 50%)`;
        fftctx.fillRect(x, fftcanvas.height - barheight, barwidth, barheight);
        x += barwidth;
      }

      requestAnimationFrame(animate);
    } else {
      requestAnimationFrame(animate);
    }
  };

  const spawnChild = (tone: Tone, interval: Interval, tuning: Tuning) => {
    // console.log(interval, tuning);
    const frequency = interval[tuning] * tone.oscNode.frequency.value;
    const oscNode = new OscillatorNode(ctx, { type: "sine", frequency });
    const gainNode = new GainNode(ctx, gainOptions);
    const panNode = new StereoPannerNode(ctx);

    oscNode.connect(panNode).connect(gainNode).connect(analyzer).connect(ctx.destination);

    tones.push({
      id: uid++,
      oscNode,
      gainNode,
      panNode,
      isOrphan: true,
      wave: "sine"
    });
    tones = tones;
    oscNode.start();

    // console.log(tones);
  };

  const removeTone = (id: number) => {
    const tone = tones.find((t) => t.id === id);
    if (tone) {
      tone.oscNode.stop();
      tone.oscNode.disconnect();
      tone.gainNode.disconnect();
      tone.panNode.disconnect();
      tones = tones.filter((t) => t.id !== id);
    }
  };
</script>

<svelte:head>
  <title>Tone Generator</title>
</svelte:head>

<svelte:window
  on:mousedown|once|trusted={devonlyInit}
  on:keypress|={(e) => {
    // console.log(e);
    if (e.code === "Space") {
      e.preventDefault();
      playing = ctx.state === "suspended";
    }
  }}
/>

<header class="flex flex-row py-5 px-5 dark:bg-zinc-900 align-middle items-center z-10">
  <h1>Tone Generator</h1>
  <span class={c(ctx ? "text-green-500" : "text-red-500", "text-4xl")}>.</span>
  <div class="flex-grow min-width-none" />
  <!-- fft canvas -->
  <canvas class="w-40 h-10 border-b dark:border-zinc-600 border-zinc-300" bind:this={fftcanvas} />
  <div class="flex-grow flex-shrink min-width-none" />
  <button
    class={c(
      "rounded-md bg-inherit disabled:dark:bg-zinc-750 disabled:bg-zinc-200 transition-colors duration-10"
    )}
    on:click={() => (playing = !playing)}
    disabled={playing}
    title="Play"
  >
    <Play variation="solid" class={c("h-10 w-10", playing && "opacity-75")} ariaLabel="start" />
  </button>
  <button
    class={c(
      "rounded-md bg-inherit disabled:dark:bg-zinc-750 disabled:bg-zinc-200 transition-colors duration-10"
    )}
    on:click={() => (playing = false)}
    disabled={!playing}
    title="Pause"
  >
    <Pause variation="solid" class={c("h-10 w-10", !playing && "opacity-75")} ariaLabel="pause" />
  </button>
  <div class="px-2" />
  <button
    class={c(
      "rounded-md bg-inherit disabled:dark:bg-zinc-750 disabled:bg-zinc-200 transition-colors duration-10",
      recorder?.status !== "stopped" && "bg-zinc-500"
    )}
    title="Record"
    disabled={recorder?.status !== "stopped"}
  >
    <ArrowDownOnSquare
      class={c(
        "h-10 w-10 -translate-y-0.5",
        recorder?.status && recorder?.status !== "stopped" && "opacity-75"
      )}
      on:click={() => {
        if (!recorder) return;
        recorder.startRecording();
        // recorder.saveRecording("tonegen-" + Date.now().toString());
        recorder.saveRecordingAsWav("tonegen-" + Date.now().toString());
        // tones.forEach((t) => {
        //   t.oscNode.start();
        // });
      }}
      variation="outline"
      disabled={recorder?.status !== "stopped"}
      ariaLabel="record"
    />
  </button>
  <div class="px-2" />
  <button
    class="rounded-full w-5 h-5 dark:bg-zinc-200 bg-zinc-600"
    on:click={() => recorder.stopRecording()}
  />
</header>
<main>
  <div
    class="relative mb-5 mx-5 p-7 bg-zinc-100 dark:bg-zinc-800 rounded-3xl min-h-[800px] flex flex-col space-y-4"
  >
    {#if tones.length > 0}
      {#each tones as tone (tone.id)}
        <ToneUI bind:tone {spawnChild} {removeTone} />
      {/each}
    {/if}

    <button
      type="button"
      class="relative block w-full rounded-2xl border-2 border-dashed border-zinc-800 dark:border-zinc-400 text-center  hover:border-black hover:dark:border-zinc-400/80 group transition-all duration-100 hover:bg-zinc-200/50 hover:dark:bg-zinc-900/50"
      style="height: 98px;"
      on:click|self={(e) => {
        e.currentTarget.blur();

        if (!ctx) return;
        const oscNode = new OscillatorNode(ctx, { type: "sine", frequency: 400 });
        const gainNode = new GainNode(ctx, gainOptions);
        const panNode = new StereoPannerNode(ctx);
        oscNode.connect(panNode).connect(gainNode).connect(analyzer).connect(ctx.destination);

        tones.push({
          id: uid++,
          oscNode,
          gainNode,
          panNode,
          isOrphan: false,
          wave: "sine"
        });
        tones = tones;
        oscNode.start();

        // recorder.connectOscillator(oscNode);
        // console.log("There are now", tones.length, "tones");
      }}
    >
      <Plus
        class="mx-auto text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 group-hover:dark:text-zinc-300 group-hover:scale-105"
      />
      <span
        class="mt-2 block text-sm font-medium text-zinc-800 dark:text-zinc-300 group-hover:text-black group-hover:dark:text-zinc-300 group-hover:scale-101"
        >Add a new tone</span
      >
    </button>
  </div>
  <!-- <button class="py-2 px-4 rounded-md bg-zinc-200" on:click={() f=> {}}> Stop Recording </button> -->
</main>
