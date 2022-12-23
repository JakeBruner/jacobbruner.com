<script lang="ts">
  let c: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  import { onMount } from "svelte";

  import { initE8 } from "$lib/math/E8";
  onMount(() => {
    ctx = c.getContext("2d")!;
    initE8(ctx);
  });
</script>

<!-- <h1>Canvas Animation</h1> -->
<canvas width="1000px" height="1100px" bind:this={c} />
