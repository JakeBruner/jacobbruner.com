<script lang="ts">
  // audio-fft.ts
  import { onMount } from "svelte";
  import { error } from "@sveltejs/kit";
  import AudioFFT from "./audio";

  let analyser: AnalyserNode;
  let audioContext: AudioContext;

  const initAudio = async () => {
    console.log("navigator.mediaDevices", navigator.mediaDevices);
    if (!navigator.mediaDevices) {
      throw error(500, "MediaDevices not supported");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    // Create an AudioNode from the stream
    console.log("stream", stream);
    audioContext = new AudioContext();
    const audioSource = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    audioSource.connect(analyser);

    if (!analyser) {
      throw error(500, "Analyser not supported");
    }
    const audioFFT = new AudioFFT(c, analyser);
  };

  onMount(() => {
    console.log(navigator.mediaDevices?.enumerateDevices());
  });

  let c: HTMLCanvasElement;
</script>

<svelte:head>
  <title>Real-time Audio FFT</title>
</svelte:head>

<h1>Real-time Audio FFT</h1>
<div class="container flex">
  <canvas
    bind:this={c}
    class="mx-auto stroke-black  dark:stroke-slate-100 dark:fill-zinc-300 bg-white"
    width="1024px"
    height="512px"
  />
</div>

<button on:click={initAudio} class="bg-primary text-white rounded-md px-3 py-2 ml-2">Start</button>
