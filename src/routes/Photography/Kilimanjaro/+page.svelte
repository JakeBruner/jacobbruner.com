<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import LazyImage from "$components/LazyImage.svelte";

  // intersection observer
  let observer: IntersectionObserver;

  let fullscreen: boolean = false;

  interface Photo {
    src: string;
    alt: string;
  }

  let selected: Photo = {
    src: "",
    alt: ""
  };

  type Input = MouseEvent | KeyboardEvent;

  const selectMe = (e: Input): void => {
    const target = e.target as HTMLImageElement;
    selected = {
      src: target.src,
      alt: target.alt
    };
    fullscreen = true;
    document.body.style.overflow = "hidden";
  };

  const deselectMe = (): void => {
    fullscreen = false;
    document.body.style.overflow = "auto";
  };

  onMount(() => {
    // add event listener for keypress (A11Y) and mouse click on all images
    const images = document.querySelectorAll("img");
    images.forEach((image) => {
      image.addEventListener("click", selectMe);
      image.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          selectMe(e);
        }
      });
    });

    // check if webp is supported
    const webp = new Image();
    webp.onload = webp.onerror = () => {
      if (webp.height !== 2) {
        // webp is not supported
        const images = document.querySelectorAll("img");
        images.forEach((image) => {
          const src = image.src;
          const newSrc = src.replace(".webp", ".jpg");
          image.src = newSrc;
        });
      }
    };
    // log src and alt of all images
    let test = [];
    images.forEach((image) => {
      // get rid of https://127.0.0.1:4000/

      const src = image.src.replace("http://127.0.0.1:4000", "");
      console.log(`src: "${src}", alt: "${image.alt}"`);
    });
  });

  const photoList: Photo[] = [
    {
      src: "/images/kili/kilimanjaro-2465.webp",
      alt: "looking towards the receding 'Rebman Glacier' from the summit"
    },
    { src: "/images/kili/kilimanjaro-1747.webp", alt: "group pic at one of our first camps" },
    {
      src: "/images/kili/kilimanjaro-2058.webp",
      alt: "our family friends from jackson hole looking cheerful"
    },
    {
      src: "/images/kili/kilimanjaro-2433.webp",
      alt: "looking up towards the long summit hike from School Hut camp"
    },
    { src: "/images/kili/kilimanjaro-2258.webp", alt: "some kind of cool bird" },
    {
      src: "/images/kili/kilimanjaro-2447.webp",
      alt: "the start of our summit trek at ~12 midnight"
    },
    {
      src: "/images/kili/kilimanjaro-1983.webp",
      alt: "early morning sunrise from the first campsite on the mountain's plateau"
    },
    { src: "/images/kili/kilimanjaro-jake.webp", alt: "me at the summit" },
    {
      src: "/images/kili/kilimanjaro-2461.webp",
      alt: "sunrise coming up as we make our final steps to the summit sign"
    },
    { src: "/images/kili/kilimanjaro-2080.webp", alt: "one of our mountain guides ontop a rock" },
    {
      src: "/images/kili/kilimanjaro-2190.webp",
      alt: "me and our sick guide Dominique on a side-hike"
    },
    {
      src: "/images/kili/kilimanjaro-2248.webp",
      alt: "our group getting ready to hike in the morning from the breakfast tent"
    },
    {
      src: "/images/kili/kilimanjaro-2344.webp",
      alt: "sunrise over kilimanjaro on one of our far-out Northern-Circuit route camps"
    },
    {
      src: "/images/kili/kilimanjaro-1942.webp",
      alt: "milky way overtop one of our plateau campsites early in the morning"
    },
    {
      src: "/images/kili/kilimanjaro-1827.webp",
      alt: "a typical trail on kilimanjaro from the rainforest to the plateau zone"
    },
    {
      src: "/images/kili/kilimanjaro-2464.webp",
      alt: "the view of the melting snowpack about 300 yards from the summit sign"
    },
    {
      src: "/images/kili/kilimanjaro-2282.webp",
      alt: "the final steps to our 3rd to summit campsite"
    },
    {
      src: "/images/kili/kilimanjaro-1753.webp",
      alt: "late night gathering for dinner within the food tent"
    },
    {
      src: "/images/kili/kilimanjaro-.webp",
      alt: "first group to reach the top at 6:30 am. I'm on the bottom left!"
    }
  ];
</script>

<!-- <svelte:body class:overflow-y={fullscreen ? "hidden" : "auto"} /> -->
<svelte:window on:keydown={deselectMe} />

<div class="py-6 text-center">
  <h1 class="py-1">Kilimanjaro</h1>
  <h3 class="dark:text-zinc-400">Summer 2021, Tanzania</h3>
  <!-- <input type="checkbox" class="w-full" bind:checked={fullscreen} /> -->
</div>
{#if fullscreen}
  <div
    class="overflow-y-hidden flex mx-auto fixed inset-0 z-30 h-full w-full bg-zinc-800/70 dark:bg-zinc-800/70 items-center "
    transition:fade={{ duration: 100 }}
    on:click={deselectMe}
    on:keypress={deselectMe}
  >
    <img
      src={selected.src}
      alt={selected.alt}
      class="rounded-sm content-center object-contain object-center md:scale-95 shadow-md pointer-events-none"
    />
  </div>
{/if}

<section class="overflow-hidden">
  <div class="container px-5 py-2 mx-auto lg:px-32">
    <div class="flex flex-wrap -m-1.5 md:-m-3">
      <!-- gallery container -->
      <div class="w-full photoframe">
        <LazyImage src={photoList[0].src} alt={photoList[0].alt} />
      </div>

      <div class="flex flex-wrap md:w-1/2 w-full">
        <div class="w-1/2 photoframe">
          <img
            alt="group pic at one of our first camps"
            class="img"
            src="/images/kili/kilimanjaro-1747.webp"
          />
        </div>
        <div class="w-1/2 photoframe">
          <img
            alt="our family friends from jackson hole looking cheerful"
            class="img"
            src="/images/kili/kilimanjaro-2058.webp"
          />
        </div>
        <div class="w-full photoframe">
          <img
            alt="looking up towards the long summit hike from School Hut camp"
            class="img"
            src="/images/kili/kilimanjaro-2433.webp"
          />
        </div>
      </div>

      <div class="flex flex-wrap md:w-1/2 w-full">
        <div class="w-full photoframe">
          <img alt="some kind of cool bird" class="img" src="/images/kili/kilimanjaro-2258.webp" />
        </div>
        <div class="w-1/2 photoframe">
          <img
            alt="the start of our summit trek at ~12 midnight"
            class="img"
            src="/images/kili/kilimanjaro-2447.webp"
          />
        </div>
        <div class="w-1/2 photoframe">
          <img
            alt="early morning sunrise from the first campsite on the mountain's plateau"
            class="img"
            src="/images/kili/kilimanjaro-1983.webp"
          />
        </div>
      </div>

      <div class="w-full photoframe">
        <img alt="me at the summit" class="img" src="/images/kili/kilimanjaro-jake.webp" />
      </div>

      <div class="flex flex-wrap md:w-1/2 w-full">
        <div class="w-full photoframe">
          <img
            alt="sunrise coming up as we make our final steps to the summit sign"
            class="img"
            src="/images/kili/kilimanjaro-2461.webp"
          />
        </div>
        <div class="w-1/2 photoframe">
          <img
            alt="one of our mountain guides ontop a rock"
            class="img"
            src="/images/kili/kilimanjaro-2080.webp"
          />
        </div>
        <div class="w-1/2 photoframe">
          <img
            alt="me and our sick guide Dominique on a side-hike"
            class="img"
            src="/images/kili/kilimanjaro-2190.webp"
          />
        </div>
      </div>

      <div class="flex flex-wrap md:w-1/2 w-full">
        <div class="w-full photoframe">
          <img
            alt="our group getting ready to hike in the morning from the breakfast tent"
            class="img"
            src="/images/kili/kilimanjaro-2248.webp"
          />
        </div>

        <div class="w-full photoframe">
          <img
            alt="sunrise over kilimanjaro on one of our far-out Northern-Circuit route camps"
            class="img"
            src="/images/kili/kilimanjaro-2344.webp"
          />
        </div>
      </div>

      <div class="w-full photoframe">
        <img
          alt="milky way overtop one of our plateau campsites early in the morning"
          class="img"
          src="/images/kili/kilimanjaro-1942.webp"
        />
      </div>

      <div class="flex flex-wrap md:w-1/2 w-full">
        <div class="w-full photoframe">
          <img
            alt="a typical trail on kilimanjaro from the rainforest to the plateau zone"
            class="img"
            src="/images/kili/kilimanjaro-1827.webp"
          />
        </div>
      </div>
      <div class="flex flex-wrap md:w-1/2 w-full">
        <div class="w-1/2 photoframe">
          <img
            alt="the view of the melting snowpack about 300 yards from the summit sign"
            class="img"
            src="/images/kili/kilimanjaro-2464.webp"
          />
        </div>
        <div class="w-1/2 photoframe">
          <img
            alt="the final steps to our 3rd to summit campsite"
            class="img"
            src="/images/kili/kilimanjaro-2282.webp"
          />
        </div>
        <div class="w-full photoframe">
          <img
            alt="late night gathering for dinner within the food tent"
            class="img"
            src="/images/kili/kilimanjaro-1753.webp"
          />
        </div>
      </div>

      <div class="w-full photoframe">
        <img
          alt="first group to reach the top at 6:30 am. I'm on the bottom left!"
          class="img"
          src="/images/kili/kilimanjaro-.webp"
        />
      </div>
      <!-- end gallery container -->
    </div>
    <h5 class="pt-4 text-sm italic dark:text-zinc-500">
      Photos taken with a Sony A7RII and my Sony FE 24-105mm f4.0 lens :)
    </h5>
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
