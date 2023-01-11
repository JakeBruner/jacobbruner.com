<script lang="ts">
  import { Play, Pause, ArrowDownOnSquare } from "svelte-heros-v2";
  import ToneUI from "./ToneUI.svelte";
</script>

<svelte:head>
  <title>Tone Generator</title>
</svelte:head>

<header class="flex flex-row py-3 px-5 dark:bg-zinc-900 align-middle items-center z-10">
  <h1>Tone Generator</h1>
  <div class="flex-grow" />
  <Play variation="solid" class="h-10 w-10" />
  <Pause variation="solid" class="h-10 w-10" />
  <div class="px-2" />
  <ArrowDownOnSquare variation="outline" class="h-10 w-10 -translate-y-0.5" />
</header>
<main class="m-5 p-7 dark:bg-zinc-800 rounded-xl">
  <ToneUI />
</main>
