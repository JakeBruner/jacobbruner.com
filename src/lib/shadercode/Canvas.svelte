<script lang="ts">
  import { onMount, tick } from "svelte";
  import { initShaderProgram, initBuffers, draw } from "./shaderUtils";
  import { vertexSource, fragmentSource } from "./shaders";

  export let w: number;
  export let h: number;

  let canvas: HTMLCanvasElement;
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
  onMount(() => {
    const gl = canvas.getContext("webgl");
    if (gl === null) {
      alert("webgl not enabled");
      return;
    }

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    const programInfo: WebGLProgram = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition")
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix")
      }
    };

    initBuffers(gl);

    draw(gl, programInfo);
    draw(gl, programInfo);
  });
</script>

<canvas bind:this={canvas} class="z-0" width={w} height={h} />
