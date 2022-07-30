<script>
  import { search } from "$lib/gtb/gtb.js";
  export let input = "";
  $: guesses = search(input);
  $: results = guesses.length;
</script>

<head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300&display=swap"
    rel="stylesheet"
  />
</head>

<div class="px-40 pt-20">
  <h1 class="font-medium py-5">Guess The Build Solver</h1>
  <h3 class="font-light text-lg">
    Guess the build is a game on the Hypixel network wherein players compete to
    match the cooresponding answer to a player's build. At the 90 second mark or
    when a player guesses correct, hints show up revealing the length of the
    word and a few letters. This website checks these hints against the wordlist
    to narrow down the number of matches to help you guess correct! I do not
    reccomend you use this on Hypixel; it is against the rules and is for
    testing purposes only!
  </h3>
  <div class="pt-5 xl:w-96 px-3">
    <label
      for="formInput"
      class="form-label inline-block mb-2 px-2 font-medium text-gray-700 text-xl"
    >
      Enter guess here:</label
    >
    <input
      type="text"
      class="
            form-control
            block
            w-full
            sm:w-1/2
            py-1
            px-2
            text-xl
            font-normal
            mono
            text-gray-700
            bg-white bg-clip-padding
            border border-solid border-gray-300
            rounded
            transition
            ease-in-out
            m-0
            focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
          "
      id="formInput"
      placeholder="Start typing..."
      bind:value="{input}"
    />
    <h4 class="px-3 pt-1 text-sm font-light text-gray-500">
      {results}
      {results === 1 ? "result" : "results"}
    </h4>
  </div>

  <ul class="mono text-lg mx-5 pt-4">
    {#each guesses as guess}
      <li class="mono">{guess}</li>
    {/each}
  </ul>
</div>

<style>
  .mono {
    font-family: "Roboto Mono", monospace;
  }
</style>
