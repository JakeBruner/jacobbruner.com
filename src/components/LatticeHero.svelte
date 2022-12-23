<script lang="ts">
  import { navitems } from "$components/Header.svelte";
  import { page } from "$app/stores";

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

  onMount(() => {
    // console.log("onMount");
    // console.log(x, y);
    if (window) {
      // check if window supports canvas
      if (!("HTMLCanvasElement" in window)) {
        console.log("Canvas not supported");
        return;
      }

      smallScreen = window.innerWidth < 768;

      if (smallScreen) {
        ctx = small_c.getContext("2d")!;
      } else {
        ctx = c.getContext("2d")!;
      }

      darkmode = window.matchMedia("(prefers-color-scheme: dark)").matches;

      const options: E8LatticeConstructor = {
        ctx,
        speed: smallScreen ? 0.2 : 0.08,
        darkmode,
        scalefactor: smallScreen ? 0.9 : 2,
        showLines: true,
        showPoints: true,
        randomConjugator: true,
        strokeWidth: smallScreen ? 0.05 : 0.1,
        darkmodeStroke: "#3f3f46", // zinc-700
        lightmodeStroke: "#a1a1aa", // zinc-300
        opacity: smallScreen ? 0.5 : 1
      };

      instance = new E8(options);

      // listen for darkmode changes

      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        darkmode = e.matches;
        instance?.handleDarkmodeChange(darkmode);
      });
    }
  });

  // $: if (window) {
  //   darkmode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  //   if (instance) {
  //     instance.handleDarkmodeChange(darkmode);
  //   }
  // }
  onDestroy(() => {
    if (instance) {
      instance.stop();
      instance = null;
    }
  });

  let totalDistance = 0;
  let mouseLastAt = { x: 0, y: 0 };
  let mouseDown = false;

  // const handleMouseOver = (e: MouseEvent) => {
  //   if (!instance) return;
  //   if (instance.isRunning) {
  //     instance.stop();
  //     mouseLastAt = { x: e.x, y: e.y };
  //   } else {
  //     instance.start();
  //   }
  // };

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

    if (mouseDown) {
      instance?.manualRotate(-1 * radians);
    } else {
      instance?.manualRotate(radians);
    }
    mouseLastAt = { x: mouseX, y: mouseY };
    // console.log("mouse move", totalDistance, radians);
  };

  const handleTouchEnd = () => {
    mouseLastAt = { x: 0, y: 0 };
    totalDistance = 0;
    if (!instance) return;
    if (!instance.isRunning) instance.start();
  };

  import GradientWander from "./GradientWander.svelte";
  import classnames from "$lib/classnames";
</script>

<svelte:window
  bind:innerHeight={y}
  bind:innerWidth={x}
  on:mousedown={() => (mouseDown = true)}
  on:mouseup={() => (mouseDown = false)}
/>

<!-- <button class="px-3 py-2 bg-primary rounded-md" on:click={() => instance?.stop()}>Stop</button> -->
<!-- <button on:click={() => instance?.start()}>Start</button> -->

<div class="w-full h-screen relative overflow-x-clip z-10 select-none">
  <GradientWander />
  <div class="mt-10 mx-5 absolute">
    <h1 class="text-7xl font-bold headingGradient">
      Welcome to <br />
      <span class="text-8xl">jacobbruner.com</span>
    </h1>
    <div class="flex flex-row">
      <div class="flex flex-col mt-14 relative flex-start w-auto">
        {#each navitems as item}
          {@const active =
            item.path === $page.url.pathname ||
            (item.path === "/" && $page.url.pathname === "/test")}

          <div class="relative z-20">
            <a
              class={classnames(
                "group text-5xl font-semibold text-transparent bg-clip-text self-start",
                "bigGradient hoverMove",
                "bg-gradient-to-bl from-teal-400 via-indigo-400 to-primary-500 leading-relaxed bg-pos-0 hover:bg-pos-x-100",
                "transition-all duration-700 ease-in-out whitespace-nowrap relative"
              )}
              class:active
              href={item.path}
            >
              {item.title}

              <span
                class="absolute -z-20 w-full h-0 bottom-0 left-0 bg-gradient-to-bl  from-primary-700/70 to-violet-700/70 group-hover:h-full transition-all duration-500 ease-in-out px-1"
                aria-hidden="true"
              />
            </a>
          </div>
        {/each}
      </div>
      <div class="flex-grow hidden -z-50" />
    </div>
  </div>
  <div class="absolute bottom-0 ml-5 mb-16">
    <h3 class="text-6xl font-semibold italic headingGradient">&ldquo;Learning as a Hobby&rdquo;</h3>
  </div>

  <div class="absolute left-0 bottom-0 translate-x-20 overflow-x-hidden">
    <canvas
      class="sm:hidden block overflow-x-clip select-none opacity-90 touch-none"
      on:touchstart={handleTouchStart}
      on:touchmove={handleTouchMove}
      on:touchend={handleTouchEnd}
      width={500}
      height={500}
      bind:this={small_c}
    />
    <canvas
      class="hidden sm:block overflow-x-clip select-none opacity-90 origin-center"
      on:mousemove={handleMouseMove}
      on:mouseleave={handleMouseLeave}
      width={1000}
      height={1000}
      bind:this={c}
      style={`transform: translateX(${x / 3}px);`}
    />
  </div>
</div>

<!-- <canvas class="" width={x} height={y} bind:this={c} /> -->
<style>
  .bigGradient {
    background-size: 300% 100%;
  }
  .hoverMove:hover {
    background-position-x: 100%;
  }

  .headingGradient {
    @apply text-transparent bg-clip-text;
    @apply bg-gradient-to-bl from-primary-500 via-violet-600 to-pink-500 leading-relaxed;
    @apply transition-colors duration-500 ease-in-out;
  }
</style>
