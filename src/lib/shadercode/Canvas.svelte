<script lang="ts">
  import { onMount } from "svelte";
  import {} from "./shaderUtils";

  export let w: number;
  export let h: number;

  var squareRotation = 0.0;

  let canvas: HTMLCanvasElement;
  let gl: WebGL2RenderingContext;

  onMount(() => {
    gl = canvas.getContext("webgl2");
    if (gl === null) {
      alert("webgl not enabled");
      return;
    }

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);
  });

  const vsSource = `
    attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;

  const fsSource = `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `;
</script>

<canvas bind:this={canvas} class="z-0" width={w} height={h} />
