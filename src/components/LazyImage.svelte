<script lang="ts">
  export let src: string;
  export let alt: string;
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  let image: HTMLImageElement;
  let loaded = false;
  let error = false;
  onMount(() => {
    image.onload = () => {
      loaded = true;
    };
    image.onerror = () => {
      error = true;
    };
  });
</script>

<!-- 
{#if !loaded && !error}
  <div class="w-full h-full bg-zinc-100 rounded-lg shadow-sm " />
{/if} -->

{#if loaded}
  <img
    class="object-cover object-center w-full h-full rounded-lg shadow-sm"
    {src}
    {alt}
    usemap="#image-map"
    transition:fade
    class:loaded
    bind:this={image}
  />
{:else}
  <div class="w-full h-full rounded-lg shadow-sm bg-zinc-100" />
{/if}
