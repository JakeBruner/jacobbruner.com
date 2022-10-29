<script lang="ts">
  import { onMount } from "svelte";

  const featuredposts = [
    "/Math/ComplexNumbers",
    "/Math/EulerExploration",
    "/Computer-Science/Guess The Build Solver",
    "/Writing/PublicDefenders",
    "/Computer-Science/EllipticCurve",
    "/Music",
    "/Photography"
  ];
  // let w: number;
  // let h: number;

  const rand = (max: number): number => {
    return Math.floor(Math.random() * max);
  };

  //TODO look into https://vercel.com/templates/svelte/sveltekit-edge-functions

  const randomlink: string = featuredposts[rand(featuredposts.length)];

  // if ios mobile
  const isiOS = () => {
    return (
      ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(
        navigator.platform
      ) ||
      // iPad on iOS 13 detection
      (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    );
  };

  let ios = false;
  onMount(() => {
    ios = isiOS();
  });

  let y: number;

  import type { PostInfo } from "$lib/blog/blog";
  import Post from "$components/Post.svelte";
  const projectList = [
    {
      slug: "/elliptic-curve",
      title: "Elliptic Curve Cayley Table Generator",
      date: 1, // yes I know this is abuse of my functionality
      datestring: "March 30th, 2022",
      thumbnailpath: "/thumbnails/ellipticcurve.jpg"
    },
    {
      slug: "/game-of-life",
      title: "Conway's Game of Life: Cellular Automaton Simulation",
      date: 2,
      datestring: "October 10th, 2022",
      thumbnailpath: "/thumbnails/gameoflife.png"
    },
    {
      slug: "/guess-the-build-solver",
      title: "Hypixel 'Guess the Build' Game Solver",
      date: 3,
      datestring: "July 30th, 2022",
      thumbnailpath: "/thumbnails/guessthebuild.jpg"
    }
  ] as PostInfo[];
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<svelte:window bind:innerHeight={y} />

<section class="-mt-[60px] inset-0">
  <div
    class="codybowl ios bg-[url('/images/codybowl.jpg')] dark:bg-[url('/images/jacksonstars.jpg')] md:bg-fixed h-screen min-h-screen bg-cover bg-center flex flex-col justify-center items-center"
    style={ios ? `height: ${y}px; background-attachment: scroll !important;` : ""}
  >
    <div class="absolute items-center flex flex-col">
      <h1
        class="bg-white_translucent dark:bg-zinc-900/70 sm:text-[53px] text-4xl text-zinc-700 dark:text-zinc-300 font-light py-3 sm:pb-[13px] sm:pt-[17px] px-2 my-2 sm:my-4 fadeInDown text-center"
      >
        Learning as a Hobby
        <!-- Learning is a skill -->
      </h1>
      <h2
        class="bg-white_translucent dark:bg-zinc-900/70 sm:text-[25px] text-xl text-zinc-600 dark:text-zinc-300 italic py-0.1 px-1.5 font-normal fadeInDown"
      >
        The work of Jacob Bruner
      </h2>
      <div>
        <!-- scroll to next section -->
        <button
          class="my-3 px-3 py-1.5 text-base lg:font-medium font-small text-center text-white dark:text-black transition duration-500 ease-in-out transform bg-blue-400/80 lg:px-7 lg:py-2 rounded-xl hover:bg-blue-400 hover:scale-[102%] focus:ring-2 focus:ring-offset-0.5 focus:ring-white"
          on:click={() => {
            window.scrollTo({
              top: y - 60,
              behavior: "smooth"
            });
          }}
          aria-label="Scroll to next section"
        >
          About Me
        </button>
        <a href={randomlink}>
          <button
            class="my-3 px-3 py-1.5 text-base lg:font-medium font-small text-center text-white dark:text-black transition duration-500 ease-in-out transform bg-primary/80 lg:px-7 lg:py-2 rounded-xl hover:bg-primary hover:scale-[102%] focus:ring-2 focus:ring-offset-0.5 focus:ring-white"
            data-svelte-prefetch>Random Post</button
          ></a
        >
      </div>
    </div>
  </div>
</section>

<section class="mt-16 mb-2 px-6 xl:px-30">
  <!-- MD IS MY BREAKPOINT FOR THIS TO BE A COLUMN -->
  <div
    class="md:flex md:flex-row lg:px-20 md:pb-20 md:px-30 justify-center content-center align-middle"
  >
    <div class="md:w-1/2 md:h-full flex align-middle">
      <div
        class="w-[350px] h-auto lg:w-[420px] mx-auto p-5 shadow-lg shadow-zinc-300 dark:shadow-zinc-800 rounded-md"
      >
        <img
          class="md:shrink-0 max-h-full object-cover overflow-hidden top-0"
          src="/images/websitephoto.jpg"
          alt="Jacob Bruner"
        />
      </div>
    </div>

    <div class="flex md:w-1/2 align-middle">
      <div class="w-full my-auto">
        <p
          class="xl:leading-relaxed xl:text-2xl lg:text-xl text-justify leading-snug text-lg py-10 md:py-5 md:px-10 px-3 font-light dark:text-zinc-300"
        >
          Jacob Bruner is a 18 year-old student at The Dwight School in New York City. During his
          senior year in high-school, he is exploring his various creative interests through his
          out-of-school self-study and projects. Beyond his class' curriculum, he spends his free
          time learning new things. He would best describe himself as an interdisciplinary thinker,
          who thrives on his inability to stick to one thing. The culmination of these efforts is a
          wide variety of projects demonstrating his ability and understanding across a range of
          fields, including some more STEM-oriented and some more humanities oriented. Explore this
          website to find out more!
        </p>
      </div>
    </div>
  </div>
</section>

<!-- Interactive stuff on this website :) -->
<!-- TODO these should be svelte components -->
<section class="bg-primary items-center pt-10 pb-20 px-4 sm:px-6 lg:pt-16 lg:pb-28 lg:px-8">
  <!-- TODO -->
  <!-- <style>
    .anim {
      /* text-shadow: 0.03em 0.03em 0 hsla(230, 40%, 50%, 1); */
    }
    .anim:after {
      content: "Interactive Projects!";
      position: relative;
      top: 0.06em;
      left: 0.06em;
      z-index: -1;
      text-shadow: none;
      background-image: linear-gradient(
        45deg,
        transparent 80%,
        hsla(48, 20%, 90%, 1) 45%,
        hsla(48, 20%, 90%, 1) 55%,
        transparent 0
      );
      background-size: 0.05em 0.05em;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;

      animation: shad-anim 15s linear infinite;
    }

    @keyframes shad-anim {
      0% {
        background-position: 0 0;
      }
      0% {
        background-position: 100% -100%;
      }
    }
  </style> -->
  <h1 class="anim text-6xl text-zinc-50 dark:text-zinc-800 italic text-center">
    Interactive Projects!
  </h1>
  <!-- look at how neat this is! -->
  <div class="mt-12 grid gap-16 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-12 content-center">
    {#each projectList as post}
      <Post {post} />
    {/each}
  </div>
</section>

<div class="h-20 md:h-0" />

<style>
  @supports (-webkit-touch-callout: none) {
    .h-screen {
      height: -webkit-fill-available;
    }
  }
  /* hopefully this fixes my h-screen issues on mobile */
</style>
