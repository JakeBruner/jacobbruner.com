<script lang="ts">
  import { fade } from "svelte/transition";
  import { EllipticCurve, isPrime, hsl2hex, Point, RawPoint, getSubgroup } from "$lib/curve/curve";

  let a: number = 4;
  let b: number = 3;
  let p: number = 17;
  let prime: number;

  $: {
    if (isPrime(p)) {
      prime = p;
    }
  }

  $: curve = new EllipticCurve(a, b, prime);
  $: table = curve.getCayleyTable;

  const createColorArray = (curve: EllipticCurve): string[] => {
    const len = curve.points.length;
    const huediff = 360 / len;
    let hues: number[] = [0];
    for (let i = 1; i < len; i++) {
      hues.push(huediff * i);
    }
    hues = hues;
    return hues.map((e) => hsl2hex(e, 40, 85));
  };

  const getColor = (p: Point): string => {
    return colors[p.getIndex];
  };

  $: colors = createColorArray(curve);

  let x: number = -1;
  let y: number = -1;

  // let selected: Point = new Point(curve);
  let hidePopup = false;

  $: {
    let selected: RawPoint = curve?.points[1];

    let sg = getSubgroup(selected, curve);
    console.log(sg);
  }
</script>

<!-- mobile popup -->
<div
  class="fixed z-[200] sm:!hidden inset-0 w-full h-full bg-black/40 transition-all ease-in-out"
  style={hidePopup ? "visibility: hidden;" : "visibility: visible"}
  transition:fade
  on:click={() => (hidePopup = true)}
>
  <div class="m-5 mt-20">
    <div class="w-full flex flex-col p-3 rounded-lg bg-white dark:bg-zinc-800 shadow-xl">
      <span class="flex absolute h-4 w-4 top-0 right-0 mr-[.75em] mt-[4em]">
        <span
          class="animate-ping duration-300 absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"
        />
        <span class="relative inline-flex rounded-full h-4 w-4 bg-primary" />
      </span>
      <h3 class="pt-2 mx-auto text-xl font-semibold tracking-wide">
        It looks like you're on mobile!
      </h3>
      <p class="px-2 text-center whitespace-normal pt-2 text-zinc-500 dark:text-zinc-300">
        This part of the site in particular isn't made/optimized for viewing on mobile because of
        the difficulty styling all of the procedurally generated maths. For this reason, this is
        best viewed on a computer.
      </p>
      <span class="text-right px-4 !no-underline">—Jacob</span>
      <h6 class="italic pl-2 text-zinc-400">Tap to dismiss.</h6>
    </div>
  </div>
</div>

<div class="relative sm:px-40 px-10 sm:pt-10">
  <h1 class="font-medium py-5 dark:text-grey-0">Elliptic Curve Visualiser</h1>
  <h3 class="font-light text-lg">
    Elliptic curves are a special type of algebraic curve that have a well-defined group structure
    on them by drawing secants through points. Over a finite field, however, they posess different
    properties that make them suitable for use in cryptography. To attempt to understand their group
    struture, I've built a program that calculates the number of points on the curve and generates
    the cayley table.
  </h3>
  <div class="pt-4 pb-10">
    <h3>Curve:</h3>
    <h3 class="curve text-2xl">
      y<sup>2</sup> &equiv; x<sup>3</sup> + <span class="font-bold underline">{a}</span>x +
      <span class="font-bold underline">{b}</span>
      <span class="text-xl italic">‎ mod</span>
      <span class="font-bold underline">{p}</span>
    </h3>
    <label class="p-8">
      <input
        type="number"
        bind:value={a}
        min="0"
        max="20"
        class="block
        py-1
        px-2
        text-xl
        font-normal
        text-zinc-600 dark:text-zinc-300
        bg-inherit bg-clip-padding
        border border-solid border-zinc-300 dark:border-zinc-600
        rounded

        m-0
        shadow-inner

        focus:text-zinc-700 dark:focus:text-zinc-200 focus:border-primary focus:outline-none"
      />
    </label>
    <input type="range" bind:value={a} min="0" max="20" />
    <label class="p-8">
      <input
        type="number"
        bind:value={b}
        min="0"
        max="20"
        class="block
          py-1
          px-2
          text-xl
          font-normal
          text-zinc-600 dark:text-zinc-300
          bg-inherit bg-clip-padding
          border border-solid border-zinc-300 dark:border-zinc-600
          rounded

          m-0
          shadow-inner

          focus:text-zinc-700 dark:focus:text-zinc-200 focus:border-primary focus:outline-none"
      />
    </label>
    <input type="range" bind:value={b} min="0" max="20" />
    <label class="p-8">
      <input
        type="number"
        bind:value={p}
        min="0"
        max="73"
        class="block
            py-1
            px-2
            text-xl
            font-normal
            text-zinc-600 dark:text-zinc-300
            bg-inherit bg-clip-padding
            border border-solid border-zinc-300 dark:border-zinc-600
            rounded

            m-0
            shadow-inner

            focus:text-zinc-700 dark:focus:text-zinc-200 focus:border-primary focus:outline-none"
      />
      *must be prime
      <!-- <input type="range" bind:value={p} min="0" max="10" /> -->
    </label>
    <!-- <div class="flex-col">
          {#each curve.kRationalPoints as point}
            {point?.formatted},,
          {/each}
        </div> -->

    <div>
      <!-- {#if selected}
        {#each selected.subgroup as subgroup}
          {subgroup.formatted}
        {/each}
      {/if} -->
    </div>
  </div>
</div>
<div class="pt-5 w-full flex content-center">
  <div class=" mx-auto overflow-auto">
    <table class="border rounded-lg border-zinc-400 dark:border-zinc-500">
      <tbody
        class="divide-y  dark:divide-zinc-600 divide-zinc-300 shadow-lg dark:shadow-white/10"
        on:mouseleave={() => {
          x = -1;
          y = -1;
        }}
      >
        {#each table as row, i}
          <tr class="divide-x dark:divide-zinc-600 divide-zinc-300 y{i}">
            {#each row as p, j}
              <td
                on:mouseenter={() => {
                  x = j;
                  y = i;
                }}
                class="x{j} first:hover:!bg-white/90"
                class:active2={y === i}
                class:active={x === j}
                style:background-color={getColor(p)}>{p.formatted}</td
              >
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  /* button {
    all: unset;
  } */
  .x0 {
    @apply bg-zinc-100 dark:bg-zinc-700 dark:text-zinc-100 !important;
  }
  .active {
    @apply bg-white/90 !important;
  }
  .active2 {
    @apply bg-white/90 !important;
  }
  td {
    @apply p-1 whitespace-nowrap dark:text-zinc-700  text-center text-sm md:text-base;
  }
  .y0 td {
    @apply bg-zinc-100 dark:bg-zinc-700 dark:text-zinc-100 !important;
  }
</style>
