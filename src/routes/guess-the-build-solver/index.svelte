<script>
  import { search } from "$lib/gtb/gtb.js";
  // import { test } from "$lib/gtb/gtb";
  let input = "";
  $: guesses = search(input);
  $: numresults = guesses.length;
</script>

<svelte:head>
  <title>GTB Solver</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300&display=swap"
    rel="stylesheet"
  />
  <meta content="notranslate" name="google" />
  <meta
    name="keywords"
    content="guess the build, cheat, solver, hypixel, hypixel network, guess the build cheat, guess the build list, list"
  />
  <meta
    content="Guess the Build Solver is a cheat that gives you every possible answer for a given hint in the game Guess the Build."
    name="description"
  />
</svelte:head>
<!-- <button on:click="{test}">hi</button> -->
<div class="sm:px-40 px-20 sm:pt-20 pt-10">
  <h1 class="font-medium py-5 dark:text-grey-0">Guess The Build Solver</h1>
  <h3 class="font-light text-lg">
    Guess the build is a game on the Hypixel network wherein players compete to match the
    cooresponding answer to a player's build. At the 90 second mark or when a player guesses
    correct, hints show up revealing the length of the word and a few letters. This website checks
    these hints against the wordlist to narrow down the number of matches to help you guess correct!
    I do not reccomend you use this on Hypixel; it is against the rules and is for testing purposes
    only!
  </h3>
  <div class="pt-5">
    <label for="formInput" class="inline-block mb-2 font-medium text-xl"> Enter guess here:</label>
    <input
      type="text"
      class="
            block
            w-full
            sm:w-1/2
            py-1
            px-2
            text-xl
            font-normal
            mono
            text-zinc-600 dark:text-zinc-300
            bg-inherit bg-clip-padding
            border border-solid border-zinc-300 dark:border-zinc-600
            rounded
            transition
            ease-in-out
            m-0
            focus:text-zinc-700 dark:focus:text-zinc-200 focus:border-primary focus:outline-none
          "
      id="formInput"
      placeholder="Start typing..."
      bind:value={input}
    />
    <h4 class="px-3 pt-1 text-sm font-light text-zinc-500">
      {numresults}
      {numresults === 1 ? "result" : "results"}
    </h4>
  </div>
  <ul class="mono text-lg pt-4">
    {#each guesses as guess}
      <li
        class="mono even:bg-white dark:even:bg-inherit dark:odd:bg-zinc-800 px-2 text-xl odd:bg-zinc-50"
      >
        {guess}
      </li>
    {/each}
  </ul>

  {#if !numresults}
    <div class="h-40" />
  {:else}
    <div class="h-20" />
  {/if}
</div>

<style>
  .mono {
    font-family: "Roboto Mono", monospace;
  }
</style>
