<script lang="ts">
  import Canvas from "$lib/shadercode/Canvas.svelte";
  import { onMount } from "svelte";

  let h: number;
  let w: number;
</script>

<div class="h-screen w-screen" bind:clientWidth={w} bind:clientHeight={h}>
  <Canvas {h} {w} />
</div>
<h1>testing</h1>
