<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';

  import glsl from "./j-invar.glsl?raw";

  let canvas: HTMLCanvasElement;
  let colorHue = 0;
  let useWebGL = true;

  const fragmentShader = glsl;

  function initWebGL() {
    const gl = canvas.getContext('webgl');
    if (!gl) {
      useWebGL = false;
      return;
    }
    if (gl === null) {
      throw new Error('Unable to initialize WebGL. Your browser may not support it.');
    }

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `);
    gl.compileShader(vertexShader);

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragShader, fragmentShader);
    gl.compileShader(fragShader);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, 'resolution');
    const colorHueLocation = gl.getUniformLocation(program, 'colorHue');

    function render() {
      gl!.viewport(0, 0, canvas.width, canvas.height);
      gl!.useProgram(program);
      gl!.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl!.uniform1f(colorHueLocation, colorHue);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(render);
    }

    render();
  }

  function renderFallback() {
    console.log("_________Rendering fallback");
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.createImageData(canvas.width, canvas.height);

    function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
      const i = Math.floor(h * 6);
      const f = h * 6 - i;
      const p = v * (1 - s);
      const q = v * (1 - f * s);
      const t = v * (1 - (1 - f) * s);
      switch (i % 6) {
        case 0: return [v, t, p];
        case 1: return [q, v, p];
        case 2: return [p, v, t];
        case 3: return [p, q, v];
        case 4: return [t, p, v];
        case 5: return [v, p, q];
      }
      return [0, 0, 0];
    }

    function cmul(a: [number, number], b: [number, number]): [number, number] {
      return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
    }

    function cdiv(a: [number, number], b: [number, number]): [number, number] {
      const denom = b[0] * b[0] + b[1] * b[1];
      return [(a[0] * b[0] + a[1] * b[1]) / denom, (a[1] * b[0] - a[0] * b[1]) / denom];
    }

    function jInvariant(z: [number, number]): [number, number] {
      let j: [number, number] = [0, 0];
      for (let i = 0; i < 100; i++) {
        j = cmul(j, j);
        j = cdiv(j, z);
        j[0] += 1;
        if (Math.hypot(j[0], j[1]) > 1e10) break;
      }
      return j;
    }

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const u = (x - canvas.width / 2) / (canvas.width / 8);
        const v = (y - canvas.height / 2) / (canvas.height / 8);
        const j = jInvariant([u, v]);
        const arg = Math.atan2(j[1], j[0]);
        const mag = Math.hypot(j[0], j[1]);
        const [r, g, b] = hsvToRgb((arg / (2 * Math.PI) + colorHue) % 1, 1, Math.min(Math.log(mag) / 10, 1));
        const index = (y * canvas.width + x) * 4;
        imageData.data[index] = r * 255;
        imageData.data[index + 1] = g * 255;
        imageData.data[index + 2] = b * 255;
        imageData.data[index + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(renderFallback);
  }

  afterUpdate(() => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    if (useWebGL) {
      initWebGL();
    } else {
      renderFallback();
    }

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  });
</script>

<canvas bind:this={canvas} class="w-full h-full" />

<div class="absolute top-4 left-4 bg-white bg-opacity-50 p-4 rounded">
  <label class="block">
    Color Hue:
    <input type="range" bind:value={colorHue} min="0" max="1" step="0.01" class="w-full" />
  </label>
  <label class="block mt-2">
    Use WebGL:
    <input type="checkbox" bind:checked={useWebGL} on:change={() => location.reload()} />
  </label>
</div>