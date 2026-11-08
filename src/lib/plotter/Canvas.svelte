<script lang="ts">
  import { onMount } from "svelte";
  import { initShaderProgram, initBuffers, draw, type ProgramInfo } from "./shaderUtils";

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
  onMount(() => {
    const gl = canvas.getContext("webgl");
    if (gl === null) {
      alert("webgl not enabled");
      return;
    }

    let shaderProgram: WebGLProgram | null = null;
    let buffers: ReturnType<typeof initBuffers> | null = null;
    const cleanup = () => {
      if (buffers !== null) {
        gl.deleteBuffer(buffers.position);
        gl.deleteBuffer(buffers.color);
        buffers = null;
      }
      if (shaderProgram !== null) {
        gl.deleteProgram(shaderProgram);
        shaderProgram = null;
      }
    };

    try {
      shaderProgram = initShaderProgram(gl, vsSource, fsSource);
      const vertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
      const vertexColor = gl.getAttribLocation(shaderProgram, "aVertexColor");
      const projectionMatrix = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
      const modelViewMatrix = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
      if (vertexPosition < 0 || vertexColor < 0 || projectionMatrix === null || modelViewMatrix === null) {
        throw new Error("Unable to find the plotter shader attributes or uniforms");
      }

      const programInfo: ProgramInfo = {
        program: shaderProgram,
        attribLocations: { vertexPosition, vertexColor },
        uniformLocations: { projectionMatrix, modelViewMatrix }
      };

      buffers = initBuffers(gl);
      draw(gl, programInfo, buffers);
    } catch (error) {
      cleanup();
      alert(error instanceof Error ? error.message : "Unable to initialize the plotter");
    }

    return cleanup;
  });
</script>

<canvas bind:this={canvas} class="z-0" width={w} height={h}></canvas>
