<script lang="ts">
  import type { toggle_class } from "svelte/internal";

  import { fade } from "svelte/transition";
  let fullscreen: boolean = false;

  let selected = {
    src: "",
    alt: ""
  };

  const selectMe = (e) => {
    selected.src = e.target.getAttribute("src");
    selected.alt = e.target.getAttribute("alt");
    fullscreen = true;
    document.body.classList.add("noscroll");
  };

  const deselectMe = () => {
    fullscreen = false;
    document.body.classList.remove("noscroll");
  };
</script>

<svelte:body class:overflow-y={fullscreen ? "hidden" : "auto"} />
<svelte:window on:keydown={() => deselectMe()} />

<div class="py-6 text-center">
  <h1 class="py-1">Kilimanjaro</h1>
  <h3 class="dark:text-zinc-400">Summer 2021, Tanzania</h3>
  <!-- <input type="checkbox" class="w-full" bind:checked={fullscreen} /> -->
</div>
{#if fullscreen}
  <div
    class="overflow-y-hidden flex mx-auto fixed inset-0 z-30 h-full w-full bg-zinc-800/70 dark:bg-zinc-800/70 items-center "
    transition:fade={{ duration: 100 }}
    on:click={() => deselectMe()}
  >
    <img
      src={selected.src}
      alt={selected.alt}
      class=" !rounded-none content-center object-contain object-center md:scale-95 shadow-md pointer-events-none"
    />
  </div>
{/if}

<section class="overflow-hidden">
  <div class="container px-5 py-2 mx-auto lg:px-32">
    <div class="flex flex-wrap -m-1.5 md:-m-3">
      <!-- gallery container -->
      <div class="w-full photoframe">
        <img
          alt="gallery"
          class="img"
          src="/images/kili/kilimanjaro-2465.jpg"
          on:click={selectMe}
        />
      </div>

      <div class="flex flex-wrap md:w-1/2 w-full">
        <div class="w-1/2 photoframe">
          <img
            alt="gallery"
            class="img"
            src="/images/kili/kilimanjaro-1747.jpg"
            on:click={selectMe}
          />
        </div>
        <div class="w-1/2 photoframe">
          <img
            alt="gallery"
            class="img"
            src="/images/kili/kilimanjaro-2058.jpg"
            on:click={selectMe}
          />
        </div>
        <div class="w-full photoframe">
          <img
            alt="gallery"
            class="img"
            src="/images/kili/kilimanjaro-2433.jpg"
            on:click={selectMe}
          />
        </div>
      </div>

      <div class="flex flex-wrap md:w-1/2 w-full">
        <div class="w-full photoframe">
          <img
            alt="gallery"
            class="img"
            src="/images/kili/kilimanjaro-2258.jpg"
            on:click={selectMe}
          />
        </div>
        <div class="w-1/2 photoframe">
          <img
            alt="gallery"
            class="img"
            src="/images/kili/kilimanjaro-2447.jpg"
            on:click={selectMe}
          />
        </div>
        <div class="w-1/2 photoframe">
          <img
            alt="gallery"
            class="img"
            src="/images/kili/kilimanjaro-1983.jpg"
            on:click={selectMe}
          />
        </div>
      </div>

      <div class="w-full photoframe">
        <img
          alt="gallery"
          class="img"
          src="/images/kili/kilimanjaro-2496.jpg"
          on:click={selectMe}
        />
      </div>

      <div class="flex flex-wrap md:w-1/2 w-full">
        <div class="w-full photoframe">
          <img
            alt="gallery"
            class="img"
            src="/images/kili/kilimanjaro-2334.jpg"
            on:click={selectMe}
          />
        </div>
        <div class="w-1/2 photoframe">
          <img
            alt="gallery"
            class="img"
            src="/images/kili/kilimanjaro-2458.jpg"
            on:click={selectMe}
          />
        </div>
        <div class="w-1/2 photoframe">
          <img
            alt="gallery"
            class="img"
            src="/images/kili/kilimanjaro-2190.jpg"
            on:click={selectMe}
          />
        </div>
      </div>

      <!-- end gallery container -->
    </div>
  </div>
</section>

<style>
  .photoframe {
    @apply transition-all ease-out hover:brightness-90 hover:contrast-[90%] hover:scale-[100.5%];
    @apply p-1 md:p-2;
  }
  .img {
    @apply block object-cover object-center w-full h-full rounded-lg shadow-sm;
  }
</style>
