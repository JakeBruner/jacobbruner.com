<script lang="ts">
  import { onMount, tick } from "svelte";
  import { initShaderProgram, initBuffers, draw, type ProgramInfo } from "./shaderUtils";
  import { vertexSource, fragmentSource } from "./shaders";

  export let w: number;
  export let h: number;

  let canvas: HTMLCanvasElement;
  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;
  onMount(async () => {
    const gl = canvas.getContext("webgl");
    if (gl === null) {
      alert("webgl not enabled");
      return;
    }

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    const programInfo: ProgramInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
        vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor")
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix")
      }
    };

    const buff = initBuffers(gl);

    draw(gl, programInfo, buff);
  });
</script>

<canvas bind:this={canvas} class="z-0" width={w} height={h} />
