<script lang="ts">
  import { lazyImage } from "#lib/actions/LazyImage.ts";
  export let src: string;
  export let alt: string;
  export let observe = true;

  let error = false;
</script>

{#if observe}
  <img
    use:lazyImage={src}
    src="/images/placeholder.png"
    {alt}
    class:error
    class="object-cover select-none object-center w-full h-full rounded-lg shadow-xs animate-pulse"
    on:error={() => (error = true)}
  />
{:else}
  <img
    {src}
    {alt}
    class:error
    class="object-cover select-none object-center w-full h-full rounded-lg shadow-xs"
    on:error={() => (error = true)}
  />
{/if}

<style lang="postcss">
  @reference "../app.css";
  .error {
    @apply bg-red-300;
  }
</style>
