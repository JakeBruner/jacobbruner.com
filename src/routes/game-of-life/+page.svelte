<script lang="ts">
  import init, { greet } from "game-of-life";

  import { onMount } from "svelte";

  onMount(async () => {
    await init();
  });
</script>

<h1>Press the big red button to run some precompiled webassembly code :)</h1>
<button class="h-10 w-10 bg-red-800" on:click={greet} />
