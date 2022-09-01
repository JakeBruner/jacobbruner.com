<script lang="ts">
  import { EllipticCurve, isPrime } from "$lib/curve";

  let a: number = 4;
  let b: number = 3;
  let p: number = 13;

  if (!isPrime(p)) {
    p = 7;
  }

  $: curve = new EllipticCurve(a, b, p);
  $: table = curve.getCayleyTable;

  // let test = new Point(curve, 1, 1);
  // let p2 = new Point(curve, 1, 1);

  // console.log(p2.plus(test));
  // console.log(test.plus(p2));

  let active: number = -1;
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
        >
          {#each table as row}
            <tr
              class="divide-x dark:divide-zinc-600 divide-zinc-300 first:bg-zinc-300 dark:first:bg-zinc-700 group"
            >
              {#each row as point, j}
                {#if active == j}
                  <td
                    on:mouseenter={() => {
                      active = j;
                    }}
                    on:mouseleave={() => {
                      active = -1;
                    }}
                    class="first:bg-zinc-300 dark:first:bg-zinc-700 group-hover:bg-primary/20 hover:text-zinc-800 dark:hover:text-zinc-50 active p-1"
                    >{point.formatted}</td
                  >
                {:else}
                  <td
                    on:mouseenter={() => {
                      active = j;
                    }}
                    on:mouseleave={() => {
                      active = -1;
                    }}
                    class="first:bg-zinc-300 dark:first:bg-zinc-700 group-hover:bg-primary/20 p-1"
                    >{point.formatted}</td
                  >
                {/if}
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

<style>
  .active {
    @apply bg-primary/20;
  }
</style>
