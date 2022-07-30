<script>
  import Header from "$lib/Header.svelte";
  import Footer from "$lib/Footer.svelte";
  import "animate.css";
  import "../app.css";

  import { fade } from "svelte/transition";

  import { navigating } from "$app/stores";
  import { loading } from "$lib/loading";

  $: $loading = !!$navigating;
  // this ugly thing hacks an object into a bool
  // onmount was giving vite a headache
</script>

<Header />

<main>
  {#if $loading}
    <div out:fade="{{ duration: 100 }}" class="loader"></div>
  {/if}
  <slot />
</main>

<Footer />

<style>
  .loader {
    position: fixed;
    left: 0px;
    top: 0px;
    opacity: 100%;
    width: 100%;
    height: 100%;
    z-index: 9999;
    background: url(/images/loader.gif) center no-repeat #fff;
  }
</style>
