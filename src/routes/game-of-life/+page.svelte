<script lang="ts">
  //@ts-ignore
  import init, { greet } from "./game_of_life_bg.wasm";

  init().then(() => {
    console.log(greet("Svelte"));
  });
</script>

<h1>hi</h1>
