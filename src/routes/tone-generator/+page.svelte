<script lang="ts">
  import { Play, Pause, ArrowDownOnSquare, Plus } from "svelte-heros-v2";
  import { onMount } from "svelte";
  import ToneUI from "$components/tonegen/ToneUI.svelte";
  import c from "$lib/c";
  import type { Tone } from "$lib/tonegen/type";

  import type { Interval, Tuning } from "$lib/tonegen/intervals";

  import { generateFrequencies } from "./generate";

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

  let numberOvertones: number;

  let uid = 0;
  let tones: Tone[] = [];

  type GenSetting = "maj9sharp11" | "min11";

  const gainOptions = { gain: 0.75 };

  onMount(() => {
    numberOvertones = parseInt(localStorage.getItem("numberOvertones") || "10");
    // window.localStorage.setItem("numberOvertones", numberOvertones.toString());

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

  // $: localStorage &&
  //   numberOvertones &&
  //   localStorage.setItem("numberOvertones", numberOvertones.toString());

  const initSound = () => {
    // const oscNode = new OscillatorNode(ctx, { type: "sine", frequency: 400 });
    // const gainNode = new GainNode(ctx, gainOptions);
    // const panNode = new StereoPannerNode(ctx);

    // oscNode.connect(panNode).connect(gainNode).connect(analyzer).connect(ctx.destination);

    // tones.push({
    //   id: uid++,
    //   oscNode,
    //   gainNode,
    //   panNode,
    //   isOrphan: false,
    //   wave: "sine"
    // });

    // oscNode.start();

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
  on:mousedown|once|trusted={initSound}
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
      class="relative block w-full rounded-2xl border-2 border-dashed border-zinc-800 dark:border-zinc-400 text-center hover:border-black hover:dark:border-zinc-400/80 group transition-all duration-100 hover:bg-zinc-200/50 hover:dark:bg-zinc-900/50"
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

  <button
    type="button"
    class="shadow-inner text-cyan-700 bg-cyan-100 group hover:bg-cyan-200 relative flex items-center rounded-md border border-transparent px-4 py-0.5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 mb-3 mx-5"
    on:click={(e) => {
      e.currentTarget.blur();
      const frequencyList = generateFrequencies({});

      frequencyList.map((f) => {
        const oscNode = new OscillatorNode(ctx, { type: "sine", frequency: f });
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
      });
    }}
  >
    Generate Random!
    <svg
      aria-hidden="true"
      class="-ml-2 -mr-0.5 w-10 h-10 fill-cyan-700 translate-y-1 translate-x-2 group-hover:scale-105 transition-transform duration-75"
      version="1.1"
      viewBox="0 0 700 700"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path
          d="m378.39 249.65c37.715 19.332 30.93 21.145 30.93 94.305v2.1016l0.41797 0.03125c13.75 1.1953 23.891 2.2812 32.461 3.1875 8.3203 0.88672 14.91 1.5859 20.027 1.9961l-42.648-98.328c-9.2812 0.32422-21.781-1.3047-41.188-3.3008zm-145.93-169.42 11.117 60.766c1.3633 7.4219 8.4922 12.336 15.902 10.965 7.4297-1.3477 12.348-8.4648 10.984-15.902l-11.137-60.758c-1.3633-7.4336-8.5078-12.344-15.914-10.992-7.4219 1.3633-12.328 8.4922-10.953 15.922zm-55.531 103.18c6.125 4.3984 14.695 2.9961 19.09-3.168 4.4062-6.1328 2.9883-14.695-3.1289-19.082l-34.012-24.281c-6.1445-4.3984-14.703-2.9883-19.121 3.1406-4.3906 6.1562-3.0039 14.695 3.1602 19.121zm243.33 137.31c-3.1758 0-5.7461 2.6133-5.7461 5.8477 0 3.2227 2.5742 5.832 5.7461 5.832 3.1797 0 5.7539-2.6133 5.7539-5.832 0-3.2344-2.5742-5.8477-5.7539-5.8477zm1.7148-37.609c-3.1875 0-5.7617 2.6133-5.7617 5.832 0 3.2344 2.5742 5.8477 5.7617 5.8477 3.1797 0 5.7461-2.6133 5.7461-5.8477 0-3.2227-2.5664-5.832-5.7461-5.832zm7.4688 20.836c-3.1797 0-5.7539 2.6133-5.7539 5.832 0 3.2266 2.5742 5.832 5.7539 5.832 3.1758 0 5.7539-2.6055 5.7539-5.832 0-3.2227-2.5781-5.832-5.7539-5.832zm9.1016 24.223c-3.1758 0-5.7617 2.6133-5.7617 5.8398 0 3.2227 2.5859 5.8398 5.7617 5.8398 3.168 0 5.7539-2.6211 5.7539-5.8398 0-3.2266-2.5859-5.8398-5.7539-5.8398zm73.914-143.37c-4.3984-1-9.0078 5.5547-10.316 14.637-1.2969 9.0938 1.2188 17.27 5.6094 18.273 4.3906 0.99219 9.0156-5.5625 10.316-14.652 1.2891-9.0898-1.2188-17.27-5.6094-18.262zm-16.723 93.109c-4.4531-0.62891-9.1016 6.2188-10.402 15.312-1.3047 9.0898 1.25 16.98 5.7031 17.594 4.4531 0.64062 9.0938-6.2109 10.398-15.293 1.2969-9.0898-1.25-16.973-5.6953-17.613zm-77.094-114.35c4.6758 3.7031 0.11719 12.27-10.188 19.148-10.305 6.8789-22.461 9.4531-27.145 5.7461-4.6836-3.6914-0.11719-12.277 10.191-19.148 10.305-6.8711 22.457-9.4531 27.137-5.7461zm-76.48 202.51c-3.8281-2.3398-10.82 2.0977-15.609 9.9336-4.8008 7.8242-5.582 16.078-1.7461 18.414 3.8359 2.3477 10.82-2.0977 15.609-9.9297 4.8008-7.8242 5.5898-16.074 1.7461-18.422zm25.266-39.539c-3.6367-2.6602-10.484 1.5352-15.273 9.3672-4.7891 7.8242-5.7266 16.332-2.0898 18.977 3.6328 2.6719 10.477-1.5195 15.273-9.3477 4.7891-7.8242 5.7266-16.336 2.0898-18.996zm-52.254 78.867c-3.8281-2.3398-10.82 2.1094-15.621 9.9336-4.7891 7.8242-5.5703 16.078-1.7383 18.422 3.8359 2.3398 10.828-2.1016 15.617-9.9336 4.8008-7.8164 5.582-16.074 1.7461-18.422zm-149.68-78.867c3.6523-2.6602 10.477 1.5352 15.273 9.3672 4.7891 7.8242 5.7227 16.332 2.0898 18.977-3.6445 2.6719-10.477-1.5195-15.273-9.3477-4.7969-7.8242-5.7266-16.336-2.0898-18.996zm52.246 28.395c3.8281-2.3398 10.828 2.0977 15.617 9.9219 4.7891 7.8359 5.582 16.078 1.7383 18.426-3.8359 2.3477-10.812-2.1016-15.609-9.9297-4.7891-7.8242-5.5742-16.078-1.7461-18.422zm-52.246 22.09c3.6523-2.6602 10.477 1.5195 15.273 9.3672 4.7891 7.8242 5.7227 16.324 2.0898 18.984-3.6445 2.6641-10.477-1.5352-15.273-9.3594-4.7969-7.832-5.7266-16.344-2.0898-18.988zm52.246 28.383c3.8281-2.3398 10.828 2.1094 15.617 9.9336 4.7891 7.8242 5.582 16.078 1.7383 18.422-3.8359 2.3398-10.812-2.1016-15.609-9.9336-4.7891-7.8164-5.5742-16.074-1.7461-18.422zm65.539-159.43c0.37109 4.4922-6.7852 8.1289-15.965 8.1289-9.1758 0-16.914-3.6367-17.277-8.1289-0.36328-4.4922 6.7812-8.1367 15.961-8.1367 9.1797 0 16.918 3.6445 17.281 8.1367zm-51.5 29.723c0 4.4961-7.4414 8.1367-16.621 8.1367-9.1758 0-16.613-3.6367-16.613-8.1367 0-4.4766 7.4414-8.1211 16.613-8.1211 9.1797 0 16.621 3.6445 16.621 8.1211zm107.3 1.2188c0 4.4922-7.4297 8.1289-16.609 8.1289-9.1875 0-16.629-3.6367-16.629-8.1289 0-4.4922 7.4414-8.1289 16.629-8.1289 9.1797 0 16.609 3.6367 16.609 8.1289zm-54.852-0.77344c0.54297 4.4766-6.4609 8.3867-15.637 8.7383-9.1758 0.34375-17.059-2.9883-17.586-7.4688-0.53516-4.4844 6.4609-8.3867 15.645-8.7383 9.168-0.35156 17.043 2.9961 17.582 7.4688zm-0.066406 28.375c0.36328 4.4844-6.7852 8.1289-15.973 8.1289-9.1797 0-16.906-3.6445-17.27-8.1289-0.37109-4.4961 6.7734-8.1406 15.953-8.1406 9.1797 0 16.914 3.6445 17.289 8.1406zm125.45 68.363c0.97266 59.41 0.64062 47.332-71.738 86.223-83.973 45.109-58.898 45.109-142.88 0-82.34-44.242-71.434-22.5-71.434-115.13 0-92.625-10.906-70.883 71.434-115.13 57.816-31.047 63.945-40.73 89.551-29.023 7.4219-9.1797 17.918-21.105 31.812-38.621 59.289-74.641 36.254-64.715 131.23-56.504 93.141 8.0625 74.516-7.5781 111.15 77.5 36.621 85.07 38.051 60.797-20.082 133.99-58.832 74.066-36.645 64.887-129.04 56.703zm-101.12-160.31c3.9297 2.2148 8.2344 4.6484 12.969 7.2812l64 5.0469 37.066 2.6992c0.11719-0.046876 0.25-0.11719 0.37891-0.16406l76.898-92.488c-4.6172-0.39062-10.879-0.76172-18.941-1.2422-10.637-0.62891-23.441-1.3906-35.578-2.4258-13.758-1.2031-23.891-2.2812-32.469-3.1953-20.047-2.1289-30.066-3.2031-33.641-1.6602-3.5703 1.5352-9.6758 9.5508-21.906 25.578-5.2383 6.8672-11.418 14.973-20.008 25.781-7.5742 9.5391-15.82 19.367-22.672 27.516-2.25 2.6797-4.293 5.1133-6.0898 7.2773zm135.42 29.586 42.496 97.938c3.0508-3.8281 6.7656-8.7031 11.344-14.711 5.2461-6.8711 11.422-14.973 20.008-25.781 7.5742-9.543 15.816-19.359 22.672-27.516 11.371-13.547 17.184-20.473 17.535-22.812 0.39844-2.6211-3.6523-11.602-11.945-30.008-4.5234-10.059-9.7812-21.727-11.832-26.504-2.0625-4.7891-6.9258-16.629-11.125-26.828-2.3867-5.8008-4.3906-10.684-6.0898-14.703-6.3047 9.1094-17.754 21.285-35.434 43.547-19.137 24.082-29.117 38.777-37.629 47.379zm-177.65 89.664c0.13281 0 0.26562-0.007813 0.39844-0.011719l107.21-54.527c-4.0859-2.1758-9.6914-5-16.918-8.625-9.5117-4.7969-20.98-10.551-31.703-16.312-12.172-6.543-21.039-11.543-28.559-15.77-17.574-9.8945-26.352-14.836-30.242-14.836-3.8945 0-12.68 4.9414-30.234 14.836-7.5273 4.2266-16.41 9.2266-28.574 15.77-10.727 5.7617-22.184 11.516-31.715 16.312-6.2852 3.1562-11.352 5.7031-15.238 7.7383l72.59 38.281zm13.875 21.82 0.29688 106.76c4.3242-2.3086 9.6719-5.3242 16.25-9.0234 7.5195-4.2266 16.391-9.2344 28.559-15.77 10.723-5.7695 22.191-11.535 31.703-16.312 15.781-7.9297 23.871-12.004 25.129-14.023 1.3945-2.25 1.2422-12.09 0.89844-32.277-0.17969-11.027-0.39062-23.832-0.39062-29.031s0.21094-18.004 0.39062-29.023c0.097656-6.2773 0.20312-11.555 0.22656-15.922-9.3984 5.875-24.723 12.535-49.758 25.98-27.098 14.559-42.086 24.102-53.305 28.633zm-26.324 107.48-0.30469-107.17c-11.289-4.4102-26.336-14.047-54.059-28.945-25.559-13.723-40.742-20.234-49.766-26 0.03125 4.3594 0.11719 9.6562 0.21875 15.941 0.18359 11.02 0.39844 23.824 0.39844 29.023s-0.21094 18.004-0.39844 29.031c-0.33203 20.188-0.48828 30.027 0.90625 32.277 1.2422 2.0156 9.3398 6.0898 25.113 14.023 9.5312 4.7773 20.988 10.543 31.715 16.312 12.164 6.5352 21.047 11.543 28.574 15.77 7.2773 4.1016 13.055 7.3477 17.602 9.7422z"
          fill-rule="evenodd"
        />
      </g>
    </svg>
  </button>
  <div class="w-200 absolute px-5">
    <input
      bind:value={numberOvertones}
      type="range"
      min="5"
      max="25"
      class="range slider bg-blue-500"
      step="5"
    />
    <div class="w-full flex justify-between text-xs px-2">
      <span class="border-l border-gray-500 h-4">|</span>
      <span class="border-l border-gray-500 h-4">|</span>
      <span class="border-l border-gray-500 h-4">|</span>
      <span class="border-l border-gray-500 h-4">|</span>
      <span class="border-l border-gray-500 h-4">|</span>
    </div>
  </div>
</main>
