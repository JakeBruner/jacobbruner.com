<script lang="ts">
  import { onMount } from "svelte";

  import { calcLast50Digits } from "./padic";

  let n: string[] = [];

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let pre: HTMLPreElement;
  let width = 1000;
  let height = 1000;

  const base = 10;

  onMount(() => {
    ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0n; i < 5n; i++) {
      const ah = 10n ** i;
      // console.log(ah);
      n.push(calcLast50Digits(ah));
    }

    ctx.fillStyle = "white";
    n.forEach((num, idx) => {
      // fill a pixel with a given color based on the digit in each decimal place with each being flush left

      pre.innerHTML += num + " (" + idx + ")" + "\n";
      const len = num.length;
      for (let i = 0; i < len; i++) {
        const digit = +num[i];
        // ctx.fillStyle = `hsl(${digit * 36}, 100%, 50%)`;
        ctx.fillStyle = `hsl(${digit * (360 / base)}, 80%, 50%)`;

        // ctx.fillRect(i * 3, idx, 3, 1); make it right align
        ctx.fillRect(width - (i + 1) * 5, 5 * idx, 5, 5);
      }
    });
  });
</script>

<canvas bind:this={canvas} width="1000" height="1000" />
<pre bind:this={pre} class="w-full pr-10 text-right font-mono" />
