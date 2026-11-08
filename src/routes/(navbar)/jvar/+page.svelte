<script lang="ts">
  import { onMount, tick } from "svelte";
  import fragmentSource from "./j-invar.glsl?raw";
  import { invariantColor } from "./j-invariant";

  let canvas: HTMLCanvasElement;
  let colorHue = 0;
  let useWebGL = true;
  let mounted = false;
  let drawFrame: number | null = null;
  let generation = 0;
  let draw: (() => void) | undefined;
  let disposeRenderer: (() => void) | undefined;
  let renderError = "";

  function scheduleDraw(_hue?: number) {
    if (!mounted) return;
    if (drawFrame !== null) cancelAnimationFrame(drawFrame);
    drawFrame = requestAnimationFrame(() => {
      drawFrame = null;
      draw?.();
    });
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    scheduleDraw();
  }

  function initWebGL() {
    const gl = canvas.getContext("webgl");
    if (!gl) return false;
    const shaders: WebGLShader[] = [];
    const program = gl.createProgram()!;
    const buffer = gl.createBuffer();
    disposeRenderer = () => {
      shaders.forEach((shader) => gl.deleteShader(shader));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "Unable to compile the visualization.");
      gl.attachShader(program, shader);
    };
    try {
      compile(gl.VERTEX_SHADER, "attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }");
      compile(gl.FRAGMENT_SHADER, fragmentSource);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "Unable to link the visualization.");
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, "position");
      const resolution = gl.getUniformLocation(program, "resolution");
      const hue = gl.getUniformLocation(program, "colorHue");
      draw = () => {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(resolution, canvas.width, canvas.height);
        gl.uniform1f(hue, colorHue);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };
      return true;
    } catch {
      disposeRenderer();
      disposeRenderer = undefined;
      return false;
    }
  }

  async function configure() {
    const version = ++generation;
    draw = undefined;
    disposeRenderer?.();
    disposeRenderer = undefined;
    await tick();
    if (!mounted || version !== generation) return;
    if (useWebGL && !initWebGL()) {
      useWebGL = false;
      await tick(); // A new canvas is required when changing its rendering context type.
      if (!mounted || version !== generation) return;
    }
    if (!useWebGL) {
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        renderError = "Unable to initialize the visualization.";
        return;
      }
      draw = () => {
        const { width, height } = canvas;
        const data = ctx.createImageData(width, height);
        const scale = Math.min(width, height);
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const real = ((x + 0.5 - width / 2) / scale) * 4;
            const imaginary = Math.max(0.05, 1 - ((height / 2 - y - 0.5) / scale) * 2);
            const color = invariantColor(real, imaginary, colorHue);
            const offset = (y * width + x) * 4;
            for (let c = 0; c < 3; c++) data.data[offset + c] = color[c] * 255;
            data.data[offset + 3] = 255;
          }
        }
        ctx.putImageData(data, 0, 0);
      };
    }
    renderError = "";
    resize();
  }

  $: if (mounted) scheduleDraw(colorHue);

  onMount(() => {
    mounted = true;
    void configure();
    window.addEventListener("resize", resize);
    return () => {
      mounted = false;
      generation++;
      if (drawFrame !== null) cancelAnimationFrame(drawFrame);
      window.removeEventListener("resize", resize);
      disposeRenderer?.();
    };
  });
</script>

{#key useWebGL}
  <canvas bind:this={canvas} class="w-full h-full" aria-label="Klein j-invariant visualization" ></canvas>
{/key}
<div class="absolute top-20 left-4 bg-white bg-opacity-50 p-4 rounded-sm">
  <label class="block">
    Color Hue:
    <input type="range" bind:value={colorHue} min="0" max="1" step="0.01" class="w-full" />
  </label>
  <label class="block mt-2">
    Use WebGL:
    <input type="checkbox" bind:checked={useWebGL} on:change={configure} />
  </label>
  {#if renderError}<p role="alert">{renderError}</p>{/if}
</div>
