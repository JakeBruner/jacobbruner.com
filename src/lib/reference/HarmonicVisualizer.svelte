<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { solveAcoustics } from './fem';
  import { setupWebGL, initWebGLContext, createShader, createProgram } from './webgl';
  import { calculateHarmonics } from './harmonics';
  import * as tf from '@tensorflow/tfjs';

  let container: HTMLDivElement;
  let drawingCanvas: HTMLCanvasElement;
  let canvas: HTMLCanvasElement;
  let isDrawing = false;
  let points: number[][] = [];
  let harmonics: { frequency: number; amplitude: number; nodes: { r: number; z: number }[]; mode: number[] }[] = [];
  let isComputing = false;
  let currentMode = 0;
  let gl: WebGLRenderingContext | null = null;
  let program: WebGLProgram | null = null;

  // Vertex shader for mode visualization
  const vertexShaderSource = `
    attribute vec2 position;
    attribute float value;
    uniform float aspect;
    uniform float time;
    uniform float frequency;
    varying float v_value;
    varying vec2 v_position;

    void main() {
      // Animate the displacement
      float displacement = value * sin(2.0 * 3.14159 * frequency * time);
      vec2 pos = position + vec2(displacement * 0.05, 0.0);
      gl_Position = vec4(pos.x * aspect, pos.y, 0.0, 1.0);
      v_value = displacement;
      v_position = position;
    }
  `;

  // Fragment shader for mode visualization
  const fragmentShaderSource = `
    precision mediump float;
    varying float v_value;
    varying vec2 v_position;
    uniform float time;
    uniform float frequency;

    vec3 pressureColor(float pressure) {
      // Red for compression (positive pressure)
      // Blue for rarefaction (negative pressure)
      // White for neutral
      if (pressure > 0.0) {
        return mix(vec3(1.0), vec3(1.0, 0.0, 0.0), pressure);
      } else {
        return mix(vec3(1.0), vec3(0.0, 0.0, 1.0), -pressure);
      }
    }

    vec3 displacementColor(float displacement) {
      // Yellow for outward displacement
      // Green for inward displacement
      if (displacement > 0.0) {
        return mix(vec3(1.0), vec3(1.0, 1.0, 0.0), displacement);
      } else {
        return mix(vec3(1.0), vec3(0.0, 1.0, 0.0), -displacement);
      }
    }

    void main() {
      float pressure = v_value;
      float displacement = v_value * cos(2.0 * 3.14159 * frequency * time);
      
      // Split screen: pressure on left, displacement on right
      vec3 color;
      if (v_position.x < 0.0) {
        color = pressureColor(pressure);
      } else {
        color = displacementColor(displacement);
      }
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  onMount(() => {
    if (!browser) return;

    const ctx = drawingCanvas.getContext('2d')!;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;

    // Set up WebGL canvas
    gl = setupWebGL(canvas);
    if (!gl) {
      console.error('Failed to initialize WebGL');
      return;
    }

    const success = initWebGLContext(gl);
    if (!success) {
      console.error('Failed to initialize WebGL context');
      return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (vertexShader && fragmentShader) {
      program = createProgram(gl, vertexShader, fragmentShader);
    }

    // Set canvas size
    const resizeCanvas = () => {
      if (!gl) return;
      
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      drawingCanvas.width = rect.width * dpr;
      drawingCanvas.height = rect.height * dpr;
      
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  });

  function startDrawing(e: MouseEvent) {
    if (!browser) return;
    isDrawing = true;
    const rect = drawingCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 2 - 1;
    const y = 1 - (e.clientY - rect.top) / rect.height * 2;
    points = [[x, y]];
    const ctx = drawingCanvas.getContext('2d')!;
    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    ctx.beginPath();
    ctx.moveTo(
      (x + 1) * drawingCanvas.width / 2,
      (1 - y) * drawingCanvas.height / 2
    );
  }

  function draw(e: MouseEvent) {
    if (!browser || !isDrawing) return;
    
    const rect = drawingCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 2 - 1;
    const y = 1 - (e.clientY - rect.top) / rect.height * 2;
    points.push([x, y]);
    
    const ctx = drawingCanvas.getContext('2d')!;
    ctx.lineTo(
      (x + 1) * drawingCanvas.width / 2,
      (1 - y) * drawingCanvas.height / 2
    );
    ctx.stroke();
  }

  async function endDrawing() {
    if (!browser || !isDrawing || !gl) return;
    isDrawing = false;
    
    if (points.length < 2) return;
    
    isComputing = true;
    try {
      const result = await solveAcoustics(points);
      harmonics = result.frequencies.map((freq, i) => ({
        frequency: freq,
        amplitude: 1.0 / (i + 1),
        nodes: result.nodes,
        mode: result.modes[i]
      }));
      
      if (gl && program) {
        startAnimation();
      }
    } finally {
      isComputing = false;
    }
  }

  let animationFrame: number;
  let startTime = performance.now();

  function startAnimation() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    startTime = performance.now();
    animate();
  }

  function animate() {
    if (!gl || !program) return;
    
    const time = (performance.now() - startTime) / 1000;
    
    // Update time uniform
    const timeLoc = gl.getUniformLocation(program, 'time');
    gl.uniform1f(timeLoc, time);
    
    // Draw each harmonic
    harmonics.forEach((harmonic, i) => {
      const yOffset = -0.8 + (i * 0.2); // Stack modes vertically
      visualizeMode(harmonic.nodes, harmonic.mode, harmonic.frequency, yOffset);
    });
    
    animationFrame = requestAnimationFrame(animate);
  }

  function visualizeMode(
    nodes: { r: number; z: number }[],
    modeShape: number[],
    frequency: number,
    yOffset: number = 0
  ) {
    if (!gl || !program) return;

    // Create vertices for visualization
    const vertices: number[] = [];
    const values: number[] = [];
    
    // Create triangles for each element
    for (let i = 0; i < nodes.length - 1; i++) {
      const n1 = nodes[i];
      const n2 = nodes[i + 1];
      const v1 = modeShape[i];
      const v2 = modeShape[i + 1];

      // Adjust y coordinates for vertical stacking
      const z1 = n1.z * 0.15 + yOffset;
      const z2 = n2.z * 0.15 + yOffset;

      // Left side (pressure)
      vertices.push(-n1.r, z1, -n2.r, z2);
      values.push(v1, v2);

      // Right side (displacement)
      vertices.push(n1.r, z1, n2.r, z2);
      values.push(v1, v2);
    }

    // Create buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const valueBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, valueBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(values), gl.STATIC_DRAW);

    // Set up attributes
    const positionLoc = gl.getAttribLocation(program, 'position');
    const valueLoc = gl.getAttribLocation(program, 'value');

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, valueBuffer);
    gl.enableVertexAttribArray(valueLoc);
    gl.vertexAttribPointer(valueLoc, 1, gl.FLOAT, false, 0, 0);

    // Set uniforms
    const aspectLoc = gl.getUniformLocation(program, 'aspect');
    gl.uniform1f(aspectLoc, canvas.height / canvas.width);

    const freqLoc = gl.getUniformLocation(program, 'frequency');
    gl.uniform1f(freqLoc, frequency);

    // Draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length / 2);
  }

  onDestroy(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });
</script>

<div class="flex flex-col gap-4 w-full h-full min-h-screen bg-slate-900 p-4">
  <div 
    class="relative flex-1 bg-slate-800 rounded-lg overflow-hidden"
    bind:this={container}
    on:mousedown={startDrawing}
    on:mousemove={draw}
    on:mouseup={endDrawing}
    on:mouseleave={endDrawing}
  >
    <canvas
      bind:this={drawingCanvas}
      class="absolute inset-0 w-full h-full cursor-crosshair z-10"
    />
    <canvas 
      bind:this={canvas} 
      class="absolute inset-0 w-full h-full" 
    />
    
    {#if harmonics.length > 0}
      <div class="absolute bottom-0 left-0 right-0 p-4 z-20">
        <div class="flex flex-col gap-2 bg-slate-800/70 backdrop-blur-sm rounded-lg p-4">
          {#each harmonics as harmonic, i}
            <div class="flex items-center gap-2">
              <div class="text-slate-200 font-mono text-xs min-w-[80px]">
                {(harmonic.frequency * 10).toFixed(1)} Hz
              </div>
              <div class="flex-1 h-4 bg-slate-700/50 rounded-sm overflow-hidden">
                <div
                  class="h-full bg-sky-500/70 transition-all duration-300 ease-in-out"
                  style="width: {harmonic.amplitude * 100}%"
                />
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
    
    {#if isComputing}
      <div class="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
        <div class="text-slate-200">Computing harmonics...</div>
      </div>
    {/if}
  </div>
</div>

<style>
  /* Base styles */
  :global(body) {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    background-color: #0f172a; /* slate-900 */
  }

  /* Layout */
  .flex {
    display: flex;
  }

  .flex-col {
    flex-direction: column;
  }

  .flex-1 {
    flex: 1 1 0%;
  }

  .gap-4 {
    gap: 1rem;
  }

  .gap-2 {
    gap: 0.5rem;
  }

  /* Dimensions */
  .w-full {
    width: 100%;
  }

  .h-full {
    height: 100%;
  }

  .min-h-screen {
    min-height: 100vh;
  }

  .h-4 {
    height: 1rem;
  }

  .min-w-\[80px\] {
    min-width: 80px;
  }

  /* Positioning */
  .relative {
    position: relative;
  }

  .absolute {
    position: absolute;
  }

  .inset-0 {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  /* Colors */
  .bg-slate-900 {
    background-color: #0f172a;
  }

  .bg-slate-800 {
    background-color: #1e293b;
  }

  .bg-slate-800\/70 {
    background-color: rgba(30, 41, 59, 0.7);
  }

  .bg-slate-700\/50 {
    background-color: rgba(51, 65, 85, 0.5);
  }

  .bg-sky-500\/70 {
    background-color: rgba(14, 165, 233, 0.7);
  }

  .bg-black\/50 {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .text-slate-200 {
    color: #e2e8f0;
  }

  /* Typography */
  .font-mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  }

  .text-xs {
    font-size: 0.75rem;
    line-height: 1rem;
  }

  /* Effects */
  .backdrop-blur-sm {
    backdrop-filter: blur(4px);
  }

  .rounded-lg {
    border-radius: 0.5rem;
  }

  .rounded-sm {
    border-radius: 0.25rem;
  }

  .overflow-hidden {
    overflow: hidden;
  }

  .cursor-crosshair {
    cursor: crosshair;
  }

  /* Z-index */
  .z-10 {
    z-index: 10;
  }

  .z-20 {
    z-index: 20;
  }

  .z-30 {
    z-index: 30;
  }

  /* Spacing */
  .p-4 {
    padding: 1rem;
  }

  /* Transitions */
  .transition-all {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }

  .duration-300 {
    transition-duration: 300ms;
  }

  .ease-in-out {
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>
