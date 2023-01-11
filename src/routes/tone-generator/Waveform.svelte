<script lang="ts">
  import { onMount } from "svelte";

  let c: HTMLCanvasElement;

  // const drawSineWave = (ctx, amplitude, freq, phase) => {

  // }

  class WaveCanvas {
    c: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor(c: HTMLCanvasElement) {
      this.c = c;
      this.ctx = c.getContext("2d")!;

      this.ctx.fillStyle = "#111111";
      this.ctx.fillRect(0, 0, c.width, c.height);

      this.ctx.fillStyle = "#808080";
      this.ctx.fillRect(0, c.height / 2 - 1, c.width, 2);

      this.drawSineWave();
    }

    drawSineWave = () => {
      this.ctx.beginPath;
      this.ctx.moveTo(0, this.c.height / 2);
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "#ffffff";
      // this.ctx.fillStyle = "rgba(1,0,1,0.1)";
      this.ctx.fillStyle = "#fafafa";

      for (let x = 0; x < this.c.width; x++) {
        const y = Math.sin((x / this.c.width) * 2 * Math.PI);
        this.ctx.lineTo(x, y + (this.c.height / 2) * (y + 1));

        // shaded area under curve
        if (y > 0) {
          this.ctx.fillRect(x, (this.c.height / 2) * (y + 1), 1, y * (1 - this.c.height / 2));
        } else {
          this.ctx.fillRect(x, this.c.height / 2, 1, (this.c.height / 2) * (y + 1));
        }
      }

      this.ctx.stroke();
    };
  }

  onMount(() => {
    const w = new WaveCanvas(c);
  });
</script>

<div class="h-full w-32 border-3 bg-zinc-500 rounded-sm">
  <canvas class="h-full w-full p-0.5 rounded-sm" bind:this={c} />
</div>
