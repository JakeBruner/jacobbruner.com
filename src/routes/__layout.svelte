<script>
  import Header from "$lib/Header.svelte";
  import Footer from "$lib/Footer.svelte";
  import "animate.css";
  import "../app.css";

  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  let pageLoaded = false;

  onMount(() => {
    pageLoaded = true;
  });
  // setTimeout(() => {
  //   pageLoaded = true;
  // }, 50);
</script>

<Header />
<main>
  {#if !pageLoaded}
    <div out:fade={{ duration: 100 }} class="loader" />
  {/if}

  <slot />
</main>

<Footer />

<style>
  .loader {
    position: fixed;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    z-index: 9999;
    background: url(/images/loader.gif) center no-repeat #fff;
  }
</style>
