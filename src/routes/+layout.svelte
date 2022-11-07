<script lang="ts">
  import "../app.css";

  import Header from "$components/Header.svelte";
  import Footer from "$components/Footer.svelte";

  import { webVitals } from "$lib/vitals";
  import { inject } from "@vercel/analytics";

  inject();

  import { browser } from "$app/environment";
  import { page } from "$app/stores";

  import { fade } from "svelte/transition";

  import { navigating } from "$app/stores";
  import { loading } from "$lib/loading";
  import { onDestroy } from "svelte";

  navigating.subscribe((value) => {
    $loading = !!value;
  });
  // $: console.log($loading, $navigating);
  // this ugly thing hacks an object into a bool
  // onmount was giving vite a headache
  onDestroy(() => {
    $loading = true;
  });

  //TODO : make another layout without the header and footer
  let analyticsId = import.meta.env.VERCEL_ANALYTICS_ID;

  $: if (browser && analyticsId) {
    webVitals({
      path: $page.url.pathname,
      params: $page.params,
      analyticsId
    });
  }
</script>

<Header />

<main class="mt-[60px]">
  {#if $loading}
    <div
      out:fade={{ duration: 200 }}
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
