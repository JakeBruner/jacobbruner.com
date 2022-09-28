<script lang="ts">
  //@ts-ignore
  import init, { greet } from "$rust/game_of_life_bg.wasm";

  import { onMount } from "svelte";

  onMount(async () => {
    await init();
    greet("svelte");
  });
</script>

<h1>hi</h1>
