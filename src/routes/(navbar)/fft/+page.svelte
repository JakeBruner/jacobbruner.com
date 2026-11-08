<script lang="ts">
  import { onDestroy } from "svelte";
  import AudioFFT from "./audio";

  let audioContext: AudioContext | undefined;
  let stream: MediaStream | undefined;
  let visualizer: AudioFFT | undefined;
  let starting = false;
  let started = false;
  let destroyed = false;
  let audioError = "";
  let c: HTMLCanvasElement;

  const initAudio = async () => {
    if (starting || started) return;
    starting = true;
    audioError = "";
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Microphone input is not supported by this browser.");
      const input = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (destroyed) {
        input.getTracks().forEach((track) => track.stop());
        return;
      }
      stream = input;
      audioContext = new AudioContext();
      await audioContext.resume();
      if (destroyed) return;
      const analyser = audioContext.createAnalyser();
      audioContext.createMediaStreamSource(stream).connect(analyser);
      visualizer = new AudioFFT(c, analyser);
      started = true;
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop());
      if (audioContext && audioContext.state !== "closed") void audioContext.close();
      if (!destroyed) audioError = error instanceof Error ? error.message : "Unable to start the microphone.";
    } finally {
      starting = false;
    }
  };

  onDestroy(() => {
    destroyed = true;
    visualizer?.dispose();
    stream?.getTracks().forEach((track) => track.stop());
    if (audioContext && audioContext.state !== "closed") void audioContext.close();
  });
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
  ></canvas>
</div>

<button disabled={starting || started} on:click={initAudio} class="bg-primary text-white rounded-md px-3 py-2 ml-2">Start</button>

{#if audioError}<p role="alert">{audioError}</p>{/if}
