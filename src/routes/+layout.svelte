<script lang="ts">
  import "../app.css";

  import Header from "$lib/Header.svelte";
  import Footer from "$lib/Footer.svelte";
  import "animate.css";

  import { fade } from "svelte/transition";

  import { navigating } from "$app/stores";
  import { loading } from "$lib/loading";

  $: $loading = !!$navigating;
  // this ugly thing hacks an object into a bool
  // onmount was giving vite a headache
</script>

<Header />

<main class="mt-[60px]">
  {#if $loading}
    <div
      out:fade={{ duration: 100 }}
      class="loader fixed inset-0 opacity-100 h-full w-full z-[9999] bg-[url('/images/loader.gif)'] bg-center bg-no-repeat"
    />
  {/if}
  <slot />
</main>

<Footer />

<style>
  @media (prefers-color-scheme: light) {
    .loader {
      background: url(/images/loader.gif) center no-repeat #fff;
    }
  }
  @media (prefers-color-scheme: dark) {
    .loader {
      background: url(/images/loader.gif) center no-repeat #18181b;
      /* #18181B is zinc-900 */
    }
  }
</style>
