<script lang="ts">
  import { navitems } from "$components/Header.svelte";
  import { page } from "$app/stores";
  import { fly } from "svelte/transition";

  let c: HTMLCanvasElement;
  let small_c: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  import { onDestroy, onMount } from "svelte";
  import E8, { type E8LatticeConstructor } from "$lib/math/E8";

  let instance: E8 | null = null;
  let darkmode: boolean = false;
  let y: number = 0;
  let x: number = 0;
  let smallScreen: boolean = false;

  let supportsCanvas: boolean;

  let ios: boolean;

  const isIosMobile = (): boolean => {
    const ua = window.navigator.userAgent;
    return (
      (!!ua.match(/iPad/i) || !!ua.match(/iPhone/i)) &&
      !!ua.match(/WebKit/i) &&
      !ua.match(/CriOS/i) && //TODO see if these change canvas opacity
      !ua.match(/FxiOS/i)
    );
  };

  const needsManualHeight = (ios: boolean) => {
    if (!ios) return false;
    const ua = window.navigator.userAgent;
    if (!ua.match(/WebKit/i)) return false;
    const version = ua.match(/Version\/(\d+)\.(\d+)/);
    if (version) {
      const major = parseInt(version[1], 10);
      const minor = parseInt(version[2], 10);
      if (major < 15 || (major === 15 && minor < 4)) {
        return true;
      }
    }
    return false;
  };

  const getOptions = (smallScreen: boolean): E8LatticeConstructor => {
    return {
      ctx,
      speed: smallScreen ? 0.3 : 0.4,
      darkmode,
      scalefactor: smallScreen ? 0.9 : 2,
      showLines: true,
      showPoints: true,
      randomConjugator: true,
      strokeWidth: smallScreen ? 0.05 : 0.1,
      darkmodeStroke: "#3f3f46", // zinc-700
      lightmodeStroke: "#81718a", // purpleish version of zinc-400
      opacity: smallScreen ? (ios ? 0.4 : 0.7) : 1
    };
  };

  // event handler for window resize
  function handleResize(this: Window, e: UIEvent): void {
    if (this.innerWidth <= 768) {
      if (!smallScreen) {
        smallScreen = true;
        instance?.stop();
        instance = null;
        ctx = small_c.getContext("2d")!;
        instance = new E8(getOptions(smallScreen));
      }
    } else {
      if (smallScreen) {
        smallScreen = false;
        instance?.stop();
        instance = null;
        ctx = c.getContext("2d")!;
        instance = new E8(getOptions(smallScreen));
      }
    }
  }

  // let test: string;
  let manualHeight: boolean;

  let opacity = 0;

  let mounted = false;

  onMount(() => {
    mounted = true;
    // test = window.navigator.userAgent;
    // scroll to top
    window.scrollTo(0, 0);

    // on a separate thread, slowly increase opacity to 1
    const interval = setInterval(() => {
      opacity += 0.05;
      if (opacity >= 1) {
        clearInterval(interval);
      }
    }, 10);

    ios = isIosMobile();

    manualHeight = needsManualHeight(ios);

    // dvh = iosHasDVH();

    // check if window supports canvas and javascript
    supportsCanvas = !!document.createElement("canvas").getContext;

    if (!supportsCanvas) {
      return;
    }

    smallScreen = window.innerWidth < 768;

    if (smallScreen) {
      ctx = small_c.getContext("2d")!;
    } else {
      ctx = c.getContext("2d")!;
    }

    darkmode = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const options = getOptions(smallScreen);

    instance = new E8(options);

    // listen for darkmode changes

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      darkmode = e.matches;
      instance?.stop();
      instance = null;
      instance = new E8(getOptions(smallScreen));
    });

    // // listen for resize above or below 768px

    // window.addEventListener("resize", handleResize);

    // return () => {
    //   window.removeEventListener("resize", handleResize);
    //   instance?.stop();
    //   instance = null;
    // };
  });

  onDestroy(() => {
    if (instance) {
      instance.stop();
      instance = null;
    }
  });

  let totalDistance = 0;
  let mouseLastAt = { x: 0, y: 0 };
  let mouseDown = false;

  const handleMouseMove = (e: MouseEvent) => {
    if (!instance) return;
    if (instance.isRunning) instance.stop();
    // add radians based on distance moved
    const { x: mouseX, y: mouseY } = e;
    const { x: lastX, y: lastY } = mouseLastAt;
    const distance = Math.sqrt((mouseX - lastX) ** 2 + (mouseY - lastY) ** 2);
    totalDistance += distance;
    // yeah technically this is accelerating...
    const radians = (totalDistance / 1000000) * Math.PI;

    if (mouseDown) {
      instance?.manualRotate(-1 * radians);
    } else {
      instance?.manualRotate(radians);
    }
    mouseLastAt = { x: mouseX, y: mouseY };
  };

  const handleMouseLeave = () => {
    mouseLastAt = { x: 0, y: 0 };
    totalDistance = 0;
    if (!instance) return;
    if (!instance.isRunning) instance.start();
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (!instance) return;
    if (instance.isRunning) {
      instance.stop();
      mouseLastAt = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      instance.start();
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!instance) return;
    if (instance.isRunning) instance.stop();
    // add radians based on distance moved
    const { clientX: mouseX, clientY: mouseY } = e.touches[0];
    const { x: lastX, y: lastY } = mouseLastAt;
    const distance = Math.sqrt((mouseX - lastX) ** 2 + (mouseY - lastY) ** 2);
    totalDistance += distance;
    // yeah technically this is accelerating...
    const radians = (totalDistance / 100000) * Math.PI;

    instance?.manualRotate(radians);

    mouseLastAt = { x: mouseX, y: mouseY };
  };

  const handleTouchEnd = () => {
    mouseLastAt = { x: 0, y: 0 };
    totalDistance = 0;
    if (!instance) return;
    if (!instance.isRunning) instance.start();
  };

  import GradientWander from "./GradientWander.svelte";
  import classnames from "$lib/classnames";
  import { cubicInOut } from "svelte/easing";
  // q: how to make use flexbox to make the child fill the parent height when the parent is absolute?
  // a: by using flexbox and setting the child to flex: 1
  // q: that didnt work
  // a: because the parent is absolute, so the child is relative to the viewport, not the parent
  // q: how to make the child fill the parent height when the parent is absolute?

  // const s = (...args: (string | boolean | undefined)[]) => {
  //   return args.filter((x) => x).join(" ");
  // };

  const invLerp = (a: number, b: number) => {
    if (a > b) throw new Error("a must be less than b");

    return (t: number) => {
      if (t < a) return 0;
      if (t > b) return 1;
      return (t - a) / (b - a);
    };
  };

  const moveSmallScreenCanvas = invLerp(390, 768);

  const moveLargeScreenCanvas = invLerp(768, 2000);

  // $: console.log(moveSmallScreenCanvas(x));

  // q: If i want to have each `nav` item fade in on mount one after another, what would be the best way to do that with the transition:fade directive?
  // a: use the `delay` option
  // q: how do I activate it on mount?
  // a: use the `in` option and set it to true
</script>

<svelte:window
  bind:innerHeight={y}
  bind:innerWidth={x}
  on:mousedown={() => (mouseDown = true)}
  on:mouseup={() => (mouseDown = false)}
  on:resize={handleResize}
/>

<!-- <button class="px-3 py-2 bg-primary rounded-md" on:click={() => instance?.stop()}>Stop</button> -->
<!-- <button on:click={() => instance?.start()}>Start</button> -->

<div
  class="dvh h-screen min-h-[700px] flex relative overflow-x-clip z-10 select-none xl:pb-10 xl:pt-6 xl:pl-20"
  style={manualHeight ? `height: ${y}px !important` : ""}
>
  <GradientWander />
  <div class="mt-12 md:mt-10 mx-5 flex-col flex">
    <h1 class="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold headingGradient flex-initial">
      Welcome to <br />
      <span class="text-4xl sm:text-6xl md:text-7xl lg:text-8xl decoration-clone"
        >jacobbruner.com</span
      >
    </h1>
    <div class="flex flex-col flex-1">
      <div class="flex-grow flex flex-row">
        {#if mounted}
          <div class="flex flex-col pt-12 pb-48 sm:py-20 relative flex-start mr-auto">
            {#each navitems as item, i}
              {@const active =
                item.path === $page.url.pathname ||
                (item.path === "/" && $page.url.pathname === "/test")}

              <div
                class="relative z-20 basis-1/6 self-start"
                in:fly={{
                  delay: 50 * i,
                  y: -30,
                  x: 5,
                  duration: 600,
                  opacity: 0,
                  easing: cubicInOut
                }}
              >
                <a
                  class={classnames(
                    "group text-3xl sm:text-4xl md:text-5xl font-semibold text-transparent bg-clip-text self-start",
                    "bigGradient hoverMove",
                    "bg-gradient-to-bl from-teal-500 via-indigo-500 to-primary-600 dark:from-teal-400 dark:via-indigo-400 dark:to-primary-500 bg-pos-0 hover:bg-pos-x-100",
                    "transition-all duration-300 sm:duration-700 ease-in-out whitespace-nowrap relative"
                  )}
                  class:active
                  href={item.path}
                >
                  {item.title}
                  <!-- hover box -->
                  <span
                    class={classnames(
                      "absolute -z-20 w-full bottom-0 left-0",
                      active
                        ? "h-1/3 from-primary-200/50 to-violet-400/50 group-hover:from-primary-400/70 group-hover:to-violet-400/50 dark:from-primary-700/50 dark:to-violet-700/50 dark:group-hover:from-primary-700/70 dark:group-hover:to-violet-700/50"
                        : "h-0 from-primary-200/70 to-violet-400/70 dark:from-primary-700/70 dark:to-violet-700/70",
                      "bg-gradient-to-bl  group-hover:h-full group-hover:opactiy-full transition-all duration-200 sm:duration-500 ease-in-out px-1"
                    )}
                    aria-hidden="true"
                  />
                </a>
              </div>
            {/each}
          </div>
        {/if}
        <div class="flex-grow hidden -z-50" />
      </div>
      <h3
        class="text-3xl sm:text-4xl md:text-6xl font-semibold italic headingGradient pb-6 bottom-0 overflow-visible"
      >
        &ldquo;Learning as a Hobby&rdquo; &nbsp;
      </h3>
    </div>
  </div>
  <div class="absolute bottom-0 ml-5 mb-16" />

  <div
    class="absolute mr-auto right-0 bottom-0 mb-4 sm:mb-0 overflow-x-hidden origin-center "
    style={`transform: translateX(
    ${
      x / 3 - (smallScreen ? 100 * moveSmallScreenCanvas(x) : 750 * moveLargeScreenCanvas(x))
    }px); opacity: ${opacity}`}
  >
    <canvas
      class="md:hidden block overflow-x-clip select-none origin-center"
      aria-label="Projection of the E8 root system in 8-dimensional space."
      on:touchstart={handleTouchStart}
      on:touchmove={handleTouchMove}
      on:touchend={handleTouchEnd}
      width={500}
      height={500}
      bind:this={small_c}
    />
    <canvas
      class="hidden md:block overflow-x-clip select-none origin-center touch-none {/** maybe add scale */ ''} "
      style="overflow-clip-margin: auto;"
      aria-label="Projection of the E8 root system in 8-dimensional space."
      on:mousemove={handleMouseMove}
      on:mouseleave={handleMouseLeave}
      on:touchstart={handleTouchStart}
      on:touchmove={handleTouchMove}
      on:touchend={handleTouchEnd}
      width={1000}
      height={1000}
      bind:this={c}
    />
  </div>
  <!-- placeholder -->

  <div
    class="{!supportsCanvas ||
      (instance &&
        '!hidden')} absolute mr-auto right-0 bottom-0 mb-4 sm:mb-0 overflow-x-hidden origin-center"
    style={`transform: translateX(
    ${
      x / 3 - (smallScreen ? 100 * moveSmallScreenCanvas(x) : 750 * moveLargeScreenCanvas(x))
    }px); opacity: ${opacity}`}
  >
    <div
      class="md:hidden block overflow-x-clip select-none opacity-90 origin-center bg-center bg-[url('/images/E8/E8SmallLight.png')] dark:bg-[url('/images/E8/E8SmallDark.png')] bg-cover bg-no-repeat"
      aria-label="Projection of the E8 root system in 8-dimensional space."
      style="width: 500px; height: 500px;"
    />
    <div
      aria-label="Projection of the E8 root system in 8-dimensional space."
      class="hidden md:block overflow-x-clip select-none opacity-90 origin-center touch-none bg-center bg-[url('/images/E8/E8LargeLight.png')] dark:bg-[url('/images/E8/E8LargeDark.png')] bg-cover bg-no-repeat"
      style="width: 1000px; height: 1000px;"
    />
  </div>
</div>

<!-- <canvas class="" width={x} height={y} bind:this={c} /> -->
<style>
  @supports (height: 100dvh) {
    .dvh {
      height: 100dvh !important;
    }
  }
  .bigGradient {
    background-size: 300% 100%;
  }
  .hoverMove:hover {
    background-position-x: 100%;
  }

  .headingGradient {
    @apply text-transparent bg-clip-text -z-20;
    @apply bg-gradient-to-bl from-primary-500 via-violet-600 to-pink-500 dark:from-primary-500 dark:via-violet-600 dark:to-pink-500 leading-relaxed;
    @apply transition-colors duration-500 ease-in-out;
  }
</style>
