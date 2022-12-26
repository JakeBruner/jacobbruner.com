<script lang="ts">
  // const featuredposts = [
  //   "/Math/ComplexNumbers",
  //   "/Math/EulerExploration",
  //   "/Computer-Science/Guess The Build Solver",
  //   "/Writing/PublicDefenders",
  //   "/Computer-Science/EllipticCurve",
  //   "/Music",
  //   "/Photography",
  //   "/Music/OrchestralPiece"
  // ];
  // // let w: number;
  // // let h: number;

  // const rand = (max: number): number => {
  //   return Math.floor(Math.random() * max);
  // };

  //TODO look into https://vercel.com/templates/svelte/sveltekit-edge-functions

  // const randomlink: string = featuredposts[rand(featuredposts.length)];

  import type { PostInfo } from "$lib/blog/blog";
  import Post from "$components/Post.svelte";
  // import { fly } from "svelte/transition";
  const projectList = [
    {
      slug: "/elliptic-curve",
      title: "Elliptic Curve Cayley Table Generator",
      utctimestamp: 1, // yes I know this is abuse of my functionality
      formatteddate: "March 30th, 2022",
      thumbnailpath: "/thumbnails/ellipticcurve.jpg"
    },
    {
      slug: "/game-of-life",
      title: "Conway's Game of Life: Cellular Automaton Simulation",
      utctimestamp: 2,
      formatteddate: "October 10th, 2022",
      thumbnailpath: "/thumbnails/gameoflife.png"
    },
    {
      slug: "/guess-the-build-solver",
      title: "Hypixel 'Guess the Build' Game Solver",
      utctimestamp: 3,
      formatteddate: "July 30th, 2022",
      thumbnailpath: "/thumbnails/guessthebuild.jpg"
    }
  ] as PostInfo[];
  //! tecnically I'm abusing my PostInfo type here, but it's fine

  import { inview } from "svelte-inview";
  import type { ObserverEventDetails, Options } from "svelte-inview";
  // import { goto } from "$app/navigation";

  let isInView: boolean[] = new Array(8).fill(false);
  // $: console.log("isInView", isInView);

  const options: Options = {
    rootMargin: "-50px",
    unobserveOnEnter: true
  };

  const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => {
    const node = detail.node;
    isInView[+node.id] = detail.inView;
    // scrollDirection = detail.scrollDirection;
  };

  import Typewriter from "$components/Typewriter.svelte";
  $: typewriterEffect = isInView[7];

  import LatticeHero from "$components/LatticeHero.svelte";
</script>

<svelte:head>
  <title>Jacob Bruner</title>
</svelte:head>

<main>
  <div class="h-screen relative min-h-[650px]">
    <LatticeHero />
  </div>
  <!-- thinline with gradient fading to zinc 800 on both sides-->
  <div class="w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

  <section class="mt-20 mb-2 px-6 xl:px-30">
    <!-- MD IS MY BREAKPOINT FOR THIS TO BE A COLUMN -->
    <div
      class="xl:max-w-6xl mx-auto md:flex md:flex-row lg:px-20 md:pb-20 md:px-30 justify-center content-center align-middle"
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
            class="xl:leading-relaxed xl:text-2xl lg:text-xl  leading-snug text-lg py-10 md:py-5 md:px-10 px-3 font-light dark:text-zinc-300"
          >
            Jacob Bruner is a 18 year-old student at The Dwight School in New York City. During his
            senior year in high-school, he is exploring his various creative interests through his
            out-of-school self-study and projects. Beyond his class' curriculum, he spends his free
            time learning new things. He would best describe himself as an interdisciplinary
            thinker, who thrives on his inability to stick to one thing. The culmination of these
            efforts is a wide variety of projects demonstrating his ability and understanding across
            a range of fields, including some more STEM-oriented and some more humanities oriented.
            Explore this website to find out more!
          </p>
        </div>
      </div>
    </div>
  </section>

  <section
    class="bg-primary items-center pt-10 pb-20 px-4 sm:px-6 lg:pt-16 lg:pb-28 lg:px-8 w-full"
  >
    <div class="flex" use:inview={options} on:change={handleChange} id="7">
      <h1
        class="w-full text-center underline anim text-4xl sm:text-5xl md:text-6xl text-zinc-50 dark:text-zinc-800 italic cursor-text"
      >
        <Typewriter text="Interactive Projects!" activated={typewriterEffect} />
      </h1>
    </div>

    <!-- look at how neat this is! -->

    <div
      class="mt-12 grid gap-16 max-w-md md:max-w-none mx-auto md:grid-cols-3 md:gap-x-5 md:gap-y-12 items-center"
    >
      {#each projectList as post, i}
        {@const arraypos = i + 4}
        <div use:inview={options} on:change={handleChange} id={arraypos.toString()}>
          {#if isInView[arraypos]}
            <Post {post} id={i} />
          {/if}
        </div>
      {/each}
    </div>
  </section>

  <div class="h-20 md:h-0" />
</main>
