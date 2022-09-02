<script lang="ts">
  import { fade } from "svelte/transition";
  import { EllipticCurve, isPrime, hsl2hex, Point } from "$lib/curve";

  let a: number = 4;
  let b: number = 3;
  let p: number = 13;

  if (!isPrime(p)) {
    p = 7;
  }

  $: curve = new EllipticCurve(a, b, p);
  $: table = curve.getCayleyTable;

  // const getColor = (p: Point): number => {
  //   const index = curve.points.indexOf(p);
  //   return index === -1 ? 0 : colors[index];
  // };
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
  $: console.log(colors);
  $: console.log(curve.points);

  // $: console.log(getHueString(new Point(curve, 0, 4)));

  // let test = new Point(curve, 1, 1);
  // let p2 = new Point(curve, 1, 1);

  // console.log(p2.plus(test));
  // console.log(test.plus(p2));

  let x: number = -1;
  let y: number = -1;
</script>

<div class="sm:px-40 px-20 sm:pt-20 pt-10">
  <h1 class="font-medium py-5 dark:text-grey-0">Elliptic Curve Visualiser</h1>
  <h3 class="font-light text-lg">
    Elliptic curves are a special type of algebraic curve that have a well-defined group structure
    on them by drawing secants through points. Over a finite field, however, they posess different
    properties that make them suitable for use in cryptography. To attempt to understand their group
    struture, I've built a program that calculates the number of points on the curve and generates
    the cayley table.
  </h3>
  <div class="pt-4 pb-10">
    <h3>y<sup>2</sup> = x<sup>3</sup> + {a}x + {b} mod {p}</h3>
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
        transition
        ease-in-out
        m-0
        shadow-inner
        hover:scale-[102%]
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
          transition
          ease-in-out
          m-0
          shadow-inner
          hover:scale-[102%]
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
            transition
            ease-in-out
            m-0
            shadow-inner
            hover:scale-[102%]
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

    <div class="pt-5">
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
              {#each row as point, j}
                <td
                  on:mouseenter={() => {
                    x = j;
                    y = i;
                  }}
                  class="x{j} first:hover:!bg-white/90"
                  class:active2={y === i}
                  class:active={x === j}
                  style:background-color={getColor(point)}>{point.formatted}</td
                >
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

<style>
  .x0 {
    @apply bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 !important;
  }

  .active {
    @apply bg-white/90 !important;
  }
  .active2 {
    @apply bg-white/90 first:bg-zinc-300 dark:first:bg-zinc-700 !important;
  }
  td {
    @apply p-1 whitespace-nowrap dark:text-zinc-700;
  }
  .y0 td {
    @apply bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 !important;
  }
</style>
