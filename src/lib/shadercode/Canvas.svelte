<script lang="ts">
  import { onMount } from "svelte";
  import { initShaderProgram, initBuffers, draw } from "./shaderUtils";
  import { vertexSource, fragmentSource } from "./shaders";
  import { translate43 } from "./matrixUtils";

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

    const shaderProgram = initShaderProgram(gl, vertexSource, fragmentSource);
    console.log(shaderProgram);

    const programInfo = {
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
