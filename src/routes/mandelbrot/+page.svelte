<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  import fragmentSource from "./raymarch.glsl?raw";

  import { GPUComposer, GPUProgram } from "gpu-io";
  //! due to an issue in node_modules, the types entrypoint must be modified from "dist/types/index.d.ts" to "dist/gpu-io.d.ts" to reflect the actual location of the types file

  // using raymarching to render a projection of the mandelbrot set evaluated on the quaternions and projected into 3D space

  let canvas: HTMLCanvasElement;
  let composer: GPUComposer | null;
  let running = false;
  let animationFrame: number | null = null;
  let raymarchingProgram: GPUProgram | undefined;

  onMount(() => {
    composer = new GPUComposer({ canvas, verboseLogging: false });

    raymarchingProgram = new GPUProgram(composer, {
      name: "raymarch",
      fragmentShader: fragmentSource,
      uniforms: [
        { name: "time", value: 0, type: "FLOAT" },
        // {
        //   name: "time",
        //   value: 0.0,
        //   type: "FLOAT"
        // },
        {
          name: "cameraPosition",
          value: [0, 0, -1],
          type: "FLOAT"
        },
        {
          name: "cameraTarget",
          value: [0, 0, 0],
          type: "FLOAT"
        },
        {
          name: "u_resolution",
          value: [canvas.width, canvas.height],
          type: "FLOAT"
        },
        {
          name: "u_fov",
          value: Math.PI / 4, // 45 degrees FOV
          type: "FLOAT"
        }
      ]
    });

    running = true;
    const animate = () => {
      if (!running || !composer || !raymarchingProgram) return;
      const time = performance.now() / 1000;

      raymarchingProgram.setUniform("time", time, "FLOAT");

      // const cameraPosition = [Math.sin(time) * r, 0, Math.cos(time) * r];
      // raymarchingProgram.setUniform("cameraPosition", cameraPosition, "FLOAT");

      composer.step({
        program: raymarchingProgram
      });

      // running && setTimeout(animate, 100);
      animationFrame = requestAnimationFrame(animate);
    };

    animate();
  });

  onDestroy(() => {
    running = false;
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    raymarchingProgram?.dispose();
    composer?.dispose();
    composer = null;
  });
</script>

<div class="w-full h-screen">
  <canvas bind:this={canvas} class="w-full h-full" ></canvas>
</div>
