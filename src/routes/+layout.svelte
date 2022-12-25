<script lang="ts">
  import "../app.css";

  // import "@fontsource/rubik";
  // import "@fontsource/nunito"; half decent
  // import "@fontsource/lato"; nice
  import "@fontsource/inter/variable.css";

  // import Header from "$components/Header.svelte";
  import Footer from "$components/Footer.svelte";

  import { webVitals } from "$lib/vitals";
  import { inject } from "@vercel/analytics";

  import { browser, dev } from "$app/environment";
  import { page } from "$app/stores";

  import { fade } from "svelte/transition";

  import { navigating } from "$app/stores";
  import { loading } from "$lib/loading";
  import { onMount, onDestroy } from "svelte";

  import { Megaphone, XMark } from "svelte-heros-v2";

  import { fly } from "svelte/transition";
  import { sineIn } from "svelte/easing";

  $: if (!dev) {
    inject();
  }

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

  let popup = false;
  onMount(() => {
    if (!(localStorage.getItem("popup") === "closed")) {
      popup = true;
    }
  });

  $: if (popup && $page.url.pathname === "/Math/ECC") {
    popup = false;
    localStorage.setItem("popup", "closed");
  }

  // set the popup to closed
  const closePopup = () => {
    popup = false;
    localStorage.setItem("popup", "closed");
  };
</script>

{#if popup}
  <div
    class="fixed top-0 w-full z-[700]"
    in:fly={{ x: 0, y: -100, duration: 1000, easing: sineIn, delay: 1000 }}
    out:fly={{ x: 0, y: -100, duration: 500, opacity: 0 }}
  >
    {#if $page.url.pathname !== "/"}
      <div class="h-18" />
    {/if}
    <div class="bg-primary-500/80 dark:bg-primary-700/80 mt-16 rounded-lg mx-0.5 backdrop-blur-sm">
      <div class="mx-auto max-w-7xl py-2 px-2 sm:px-6 lg:px-8">
        <div class="flex flex-wrap items-center justify-between">
          <div class="flex w-0 flex-1 items-center">
            <span class="flex rounded-lg bg-primary-600 dark:bg-primary-700 p-2">
              <Megaphone class="h-5 w-5 text-white dark:text-zinc-200" aria-hidden="true" />
            </span>
            <p class="ml-3 truncate font-medium text-white dark:text-zinc-200">
              <span class="md:hidden">New: 'Group Theory and Cryptography'</span>
              <span class="hidden md:inline"
                >Check out my newest paper on Group Theory and Cryptography!</span
              >
            </p>
          </div>
          <div class="order-3 mt-2 w-full flex-shrink-0 sm:order-2 sm:mt-0 sm:w-auto">
            <a
              href="/Math/ECC"
              class="flex items-center justify-center rounded-md border border-transparent bg-white dark:bg-zinc-200 px-4 py-1.5 text-sm font-medium text-primary-600 shadow-sm hover:bg-primary-50 dark:hover:bg-primary-100"
            >
              Learn more
            </a>
          </div>
          <div class="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
            <button
              type="button"
              on:click={closePopup}
              class="-mr-1 flex rounded-md p-2 hover:bg-primary-500 dark:hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2"
            >
              <span class="sr-only">Dismiss</span>
              <XMark class="h-6 w-6 text-white dark:text-zinc-100" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if $loading}
  <div
    out:fade={{ duration: 200 }}
    class="loader fixed inset-0 opacity-100 h-full w-full z-[9999] bg-center bg-no-repeat"
    style="background-image: url(/images/loading);"
  />
{/if}
<slot />

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
