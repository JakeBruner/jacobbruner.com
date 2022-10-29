<script lang="ts">
  import { lazyImage } from "$lib/actions/LazyImage";
  export let src: string;
  export let alt: string;
  export let observe = true;

  import { onMount } from "svelte";

  let image: HTMLImageElement;
  let loaded = false;
  let error = false;
  onMount(() => {
    // check if loaded
    if (image.complete) {
      loaded = true;
    }
  });
  $: if (error) {
    console.log("error");
  }
</script>

{#if observe}
  <img
    use:lazyImage={src}
    src="/images/placeholder.png"
    {alt}
    class:error
    class="object-cover select-none object-center w-full h-full rounded-lg shadow-sm animate-pulse"
    bind:this={image}
  />
{:else}
  <img
    {src}
    {alt}
    class:error
    class="object-cover select-none object-center w-full h-full rounded-lg shadow-sm"
    bind:this={image}
  />
{/if}

<style>
  .error {
    @apply bg-red-300;
  }
</style>
