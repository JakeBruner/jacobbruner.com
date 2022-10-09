<script lang="ts">
  import { fade } from "svelte/transition";
  import {
    EllipticCurve,
    isPrime,
    hsl2hex,
    Point,
    RawPoint,
    getSubgroup,
    getFactors
  } from "$lib/math/curve";

  import MobilePopup from "$components/MobilePopup.svelte";

  let a: number = 4;
  let b: number = 6;
  let p: number = 13;
  let prime: number;

  $: discriminant = (-16 * (4 * a ** 3 + 27 * (b * b))) % prime;

  $: {
    a = a;
    b = b;
    p = p;
    selected = null;
  } // this ugly shit makes the subgroup disappear if these values change

  let inputIsPrime: boolean = true;

  $: {
    // prime = p;
    if (isPrime(p)) {
      prime = p;
      inputIsPrime = true;
    } else {
      inputIsPrime = false;
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

  let selected: RawPoint | null;

  // let selected: Point = new Point(curve);

  let sg: RawPoint[];
  $: {
    if (selected) {
      sg = getSubgroup(selected, curve);
      console.log(sg);
    }
  }

  // compute first 11 prime numbers congruent to 1 mod 12
  let primes: number[] = [];
  $: {
    for (let i = 1; i < 100; i++) {
      if (isPrime(i) && i % 12 === 1) {
        primes.push(i);
      }
    }
  }

  // first ten primes === 1 mod 12:  [1, 13, 25, 37, 49, 61, 73, 85, 97, 109];
</script>

<svelte:head>
  <title>Elliptic Curve Viewer</title>
  <meta
    name="keywords"
    content="Elliptic Curve, Group theory, Cryptography, mathematics, math, finite groups, group structure"
  />
  <meta
    content="Elliptic curves are a special type of algebraic curve that have a well-defined group structure
    on them by drawing secants through points. Over a finite field, however, they posess different
    properties that make them suitable for use in cryptography. To attempt to understand their group
    structure, I've built a program that calculates the number of points on the curve and generates
    the cayley table."
    name="description"
  />
</svelte:head>

<MobilePopup />

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
        on:change={() => {
          selected = null;
        }}
        min="-20"
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
    <input
      type="range"
      bind:value={a}
      on:change={() => {
        selected = null;
      }}
      min="-20"
      max="20"
    />
    <label class="p-8">
      <input
        type="number"
        bind:value={b}
        min="-20"
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
            border border-solid border-zinc-300 dark:border-zinc-600
            rounded
            bg-inherit bg-clip-padding
            m-0
            shadow-inner

            focus:text-zinc-700 dark:focus:text-zinc-200 focus:border-primary focus:outline-none"
        style:color={inputIsPrime ? "" : "red"}
      />
      <span style:color={inputIsPrime ? "" : "red"}>*must be prime</span>
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
      <span
        class="p-1 rounded-md"
        style:background-color={discriminant === 0 ? "rgba(249, 255, 124, 0.3)" : ""}
        >discriminant = {discriminant}</span
      >
    </div>
  </div>
</div>
<div class="pt-5 w-full flex flex-col content-center text-center">
  {#if selected}
    <div class=" w-auto pb-2 font-semibold text-xl" transition:fade>
      {#each sg as elem, i}
        <span class="">
          {#if i !== 0}
            &#10230;
          {/if}{elem.formatted}
        </span>
      {/each}
    </div>
    <h5 class="pb-2 align-center">
      <span class=" text-zinc-600 dark:text-zinc-400">| ⟨</span>
      <span class="font-bold">{selected.formatted}</span>
      <span class=" text-zinc-600 dark:text-zinc-400">⟩ |</span>
      = {sg.length}
    </h5>
  {:else}
    <h4 class="italic pb-5">Click on a point to generate its subgroup!</h4>
  {/if}
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
                on:click={() => {
                  const pt = table[x][y].getRawPoint;
                  selected = pt;
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
  {#if curve}
    {@const len = curve.points.length}
    {#key curve}
      order = {len}, which has divisors 1{#each getFactors(len) as factor},
        {factor}{/each}, {len}
      <!-- , and is therefore {len === 1 ? "not" : ""} cyclic -->
    {/key}
  {/if}
</div>

<div class="sm:px-40 px-10 pt-5 sm:pt-10">
  <p class="font-light text-lg">
    Some quick notes about the group structure on an elliptic curve: The elliptic curve group 𝐸(𝔽<sub
      >𝑞</sub
    >) for a prime power 𝑞 is a finitely generated abelian group. That is, the group operation obeys
    the commutative law and the group can be generated by a finite set of elements (generators).
    These properties make it especially useful in cryptography. This group isn't nessecarily cyclic,
    but its quite easy to see that 𝐸(𝔽<sub>𝑞</sub>) is necessarily a direct product/sum of cyclic
    groups (by the fund. thm. finitely generated abelian groups). This means 𝐸(𝔽<sub>𝑞</sub>) ≅ ℤ/𝑝<sup
      >𝛼</sup
    >ℤ ⨉ ℤ/𝑝<sup>𝛽</sup>ℤ with this product being taken over the primes dividing the order of the
    group, i.e., it is isomorphic to a product of p-primary groups.
    <br />
    Importantly, this group structure is markedly more complex than plain cyclic groups ℤ/𝑝<sup
      >𝛼</sup
    >ℤ, which are employed cryptosystems such as RSA and ElGamal—requiring much larger keys to
    achieve the same level of security (as compared to elliptic curve cryptosystems). In this
    respect, elliptic curve cryptography achieves a beautiful balance between security and
    efficiency. Who said pure math didn't have real-world applications? :3
    <br />
    <br />
    <span class="text-zinc-500 italic text-base ">
      For a good introduction to the number theory and group theory behind cryptography, I have to
      reccomend "A Course in Number Theory and Cryptography" by Neal Koblitz—its quite approachable
      without many prerequisites.
    </span>
  </p>
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
