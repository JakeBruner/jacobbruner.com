<script lang="ts">
  import { onMount } from "svelte";

  // import { Text } from "troika-three-text";

  const featuredposts = [
    "/Math/ComplexNumbers",
    "/Math/EulerExploration",
    "/Computer-Science/Guess The Build Solver",
    "/Writing/PublicDefenders",
    "/Computer-Science/EllipticCurve",
    "/Music",
    "/Photography",
    "/Music/OrchestralPiece"
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
    return [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod"
    ].includes(navigator.platform);
  };

  let ios = false;
  onMount(() => {
    ios = isiOS();
    if (ios) {
      console.log("his");
    }
  });

  // // bound to window height below
  let y: number;
  // // since phones have shit at the bottom, this makes it look more centered
  // $: y2 = y - 44;

  import type { PostInfo } from "$lib/blog/blog";
  import Post from "$components/Post.svelte";
  import { fly } from "svelte/transition";
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

  import { inview } from "svelte-inview";
  import type { ObserverEventDetails, Options } from "svelte-inview";
  import { goto } from "$app/navigation";

  let isInView: boolean[] = new Array(7).fill(false);
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
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<svelte:window bind:innerHeight={y} />

<section class="-mt-[60px] inset-0">
  <div
    class="codybowl ios bg-[url('/images/codybowl.jpg')] dark:bg-[url('/images/jacksonstars.jpg')] md:bg-fixed h-screen min-h-screen bg-cover bg-center flex flex-col justify-center items-center"
    style={ios ? `background-attachment: scroll !important;` : ""}
  >
    <!-- <style>
      .fadeInDown {
        animation: fadeinDown 10s;
      }
      @keyframes fadeInDown {
        from {
          opacity: 0;
          -webkit-transform: translate3d(0, -100%, 0);
          transform: translate3d(0, -100%, 0);
        }

        to {
          opacity: 1;
          -webkit-transform: translate3d(0, 0, 0);
          transform: translate3d(0, 0, 0);
        }
      }
    </style> -->
    <div class="absolute items-center flex flex-col">
      <!-- <style>
        .animate {
          opacity: 0;
          transform: translateY(-20px);
        }
      </style> -->
      <div use:inview={options} on:change={handleChange} id="0" class="z-30">
        {#if isInView[0]}
          <h1
            class="bg-white/60 backdrop-blur-sm dark:bg-zinc-900/70 sm:text-[53px] text-4xl text-zinc-700 dark:text-zinc-300 font-light rounded-lg py-3 sm:py-4 px-4 my-2 sm:my-4 text-center"
            in:fly={{ x: 0, y: -100, duration: 1000, opacity: 0 }}
          >
            Learning as a Hobby
            <!-- Learning is a skill -->
          </h1>
        {/if}
      </div>
      <style>
        .glow {
          text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 21px #fff, 0 0 41px #fff, 0 0 46px #fff;
          color: #71717a;
          opacity: 0.2;
        }
      </style>
      <div class="absolute w-full my-auto">
        <h2
          class="glow absolute block sm:text-[53px] text-4xl font-light py-3 sm:pb-[13px] sm:pt-[17px] px-2 my-2 sm:my-4 text-center"
          style=""
        >
          Learning as a Hobby
        </h2>
      </div>
      <div>
        <div use:inview={options} on:change={handleChange} id="1">
          {#if isInView[1]}
            <h2
              class="bg-white/60 backdrop-blur-sm dark:bg-zinc-900/70 sm:text-[25px] text-xl text-zinc-600 dark:text-zinc-300 rounded-lg italic py-0.1 px-1.5 font-normal"
              in:fly={{ x: 0, y: -60, duration: 1000, delay: 100, opacity: 0 }}
            >
              The work of Jacob Bruner
            </h2>
          {/if}
        </div>
        <div>
          <!-- scroll to next section -->
          <div class="">
            <div use:inview={options} on:change={handleChange} id="2" class="inline">
              {#if isInView[2]}
                <button
                  class="my-3 backdrop-blur-sm px-3 py-1.5 text-base lg:font-medium text-center text-white dark:text-black transition-all duration-100 ease-in-out bg-blue-400/60 lg:px-7 lg:py-2 rounded-xl hover:bg-blue-500/50 hover:scale-[102%] focus:border-none focus:ring-2 focus:ring-blue-300/60 focus:ring-offset-2"
                  in:fly={{ x: 0, y: 40, duration: 1000, delay: 200, opacity: 0 }}
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
              {/if}
            </div>
            <div use:inview={options} on:change={handleChange} id="3" class="inline">
              {#if isInView[3]}
                <button
                  href={randomlink}
                  on:click={() => {
                    goto(randomlink);
                  }}
                  class="my-3 backdrop-blur-sm px-3 py-1.5 text-base lg:font-medium font-small text-center text-white dark:text-black transition-all duration-100 ease-in-out bg-primary/60 lg:px-7 lg:py-2 rounded-xl hover:bg-primary-600/60 hover:scale-[102%] focus:border-none focus:ring-2 focus:ring-primary-400/60 focus:ring-offset-2"
                  in:fly={{ x: 0, y: 40, duration: 1000, delay: 400, opacity: 0 }}
                  >Random Post</button
                >
              {/if}
            </div>
          </div>
        </div>
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

<section class="bg-primary items-center pt-10 pb-20 px-4 sm:px-6 lg:pt-16 lg:pb-28 lg:px-8 w-full">
  <!-- TODO -->
  <style>
    /* .anim {
      position: absolute;
      left: 50%;
      top: {y};
      transform: translate(-50%, -50%);
      display: block;
      color: #cf1b1b;
      font-size: 124px;
      letter-spacing: 8px;
      cursor: pointer;
    }

    .anim::before {
      content: "Interactive Projects!";
      position: absolute;
      color: transparent;
      background-image: repeating-linear-gradient(
        45deg,
        transparent 0,
        transparent 2px,
        white 2px,
        white 4px
      );
      -webkit-background-clip: text;
      top: 0px;
      left: 0;
      z-index: -1;
      transition: 1s;
    }

    .anim::after {
      content: "Interactive Projects!";
      position: absolute;
      color: transparent;
      background-image: repeating-linear-gradient(
        135deg,
        transparent 0,
        transparent 2px,
        white 2px,
        white 4px
      );
      -webkit-background-clip: text;
      top: 0px;
      left: 0px;
      transition: 1s;
    }

    .anim:hover:before {
      top: 10px;
      left: 10px;
    }

    .anim:hover:after {
      top: -10px;
      left: -10px;
    } */
  </style>
  <div class="text-center">
    <h1 class="anim text-6xl text-zinc-50 dark:text-zinc-800 italic">
      <span>Interactive Projects!</span>
    </h1>
  </div>

  <!-- look at how neat this is! -->
  <div class="mt-12 grid gap-16 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-12 content-center">
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

<style>
  @supports (-webkit-touch-callout: none) {
    .h-screen {
      height: -webkit-fill-available;
    }
  }
  /* hopefully this fixes my h-screen issues on mobile */
</style>
