<script lang="ts">
  import { onMount } from "svelte";

  let numbers: bigint[] = [];

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let pre: HTMLPreElement;
  let width = 1000;
  let height = 1000;

  const baseTwoExp = (n: bigint): bigint => {
    if (n === 0n) {
      return 1n;
    }
    if (n === 1n) {
      return 2n;
    }
    if (n % 2n === 0n) {
      const half = baseTwoExp(n / 2n);
      return half * half;
    }
    return 2n * baseTwoExp(n - 1n);
  };

  // let num = 0n;
  // for (let i = 0; i < 100; i++) {
  //   num += baseTwoExp(100n - BigInt(i));
  //   numbers.push(num);
  // }

  // for (let i = 0; i < 100; i++) {
  //   numbers.push(2n ** BigInt(i));
  // }

  let num = 0n;
  for (let i = 0; i < 100; i++) {
    num += baseTwoExp(100n - BigInt(i));
    numbers.push(num);

    // 2 ^ (10 ^ i)
  }

  const base = 10;

  onMount(() => {
    // pre.innerHTML = numbers.join("\n");

    ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    numbers.forEach((n, idx) => {
      // fill a pixel with a given color based on the digit in each decimal place with each being flush left

      const str = n.toString(base);
      pre.innerHTML += str + " (" + idx + ")" + "\n";
      const len = str.length;
      for (let i = 0; i < len; i++) {
        const digit = +str[i];
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
