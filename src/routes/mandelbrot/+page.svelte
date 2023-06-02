<script lang="ts">
  import { onMount } from "svelte";

  import { GPUComposer, GPULayer, GPUProgram, renderAmplitudeProgram } from "gpu-io";
  //! due to an issue in node_modules, the types entrypoint must be modified from "dist/types/index.d.ts" to "dist/gpu-io.d.ts" to reflect the actual location of the types file

  // using raymarching to render a projection of the mandelbrot set evaluated on the quaternions and projected into 3D space

  let canvas: HTMLCanvasElement;
  let composer: GPUComposer;

  onMount(() => {
    composer = new GPUComposer({ canvas, verboseLogging: false });

    const raymarchingProgram = new GPUProgram(composer, {
      name: "raymarch",
      fragmentShader: `
        in vec2 v_uv;
        uniform vec3 cameraPosition;
        uniform float time;
        const int MAX_ITERATIONS = 256;
        const float HIT_THRESHOLD = 0.001;
        const int MAX_STEPS = 256;

        // Function to compute the distance to the fractal surface
        float mandelbulb(vec3 position) {
          vec3 z = position;
          float dr = 1.0;
          float r = 0.0;
          for (int i = 0; i < MAX_ITERATIONS; i++) {
            r = length(z);
            if (r > 2.0) break;
            // Compute the new position and derivative
            float theta = acos(z.z / r);
            float phi = atan(z.y, z.x);
            dr = pow(r, 7.0) * 8.0 * dr + 1.0;
            float zr = pow(r, 8.0);
            theta = theta * 8.0;
            phi = phi * 8.0;
            z = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta)) + position;
          }
          return 0.5 * log(r) * r / dr;
        }

        out vec4 fragColor;

        void main() {
          vec3 rayOrigin = cameraPosition;
          rayOrigin.x += cos(time); // Rotate the camera on the x-axis
          rayOrigin.y += sin(time); // Rotate the camera on the y-axis
          vec3 rayDirection = normalize(vec3(v_uv * 2.0 - 1.0, 1.0));
          
          float t = 0.0;
          for (int i = 0; i < MAX_STEPS; i++) {
            vec3 position = rayOrigin + rayDirection * t;
            float distance = mandelbulb(position);
            if (distance < HIT_THRESHOLD) {
              // Compute the color based on the hit
              fragColor = vec4(vec3(distance), 1.0);
              // fragColor = vec4(vec3(1.0), 1.0);
              return;
            }
            t += distance;
          }
          fragColor = vec4(1.0,1.0,1.0,1.0); // Background color
        }`,
      uniforms: [
        {
          name: "time",
          value: 0.0,
          type: "FLOAT"
        },
        {
          name: "cameraPosition",
          value: [0, 0, -5],
          type: "FLOAT"
        }
      ]
    });

    const animate = () => {
      const time = performance.now() / 10000; // Time in seconds
      raymarchingProgram.setUniform("time", time, "FLOAT");
      // raymarchingProgram.uniforms.cameraPosition = [Math.cos(time) * 5, 0, Math.sin(time) * 5 - 5];
      raymarchingProgram.setUniform(
        "cameraPosition",
        [Math.cos(time) * 5, 0, Math.sin(time) * 5 - 5],
        "FLOAT"
      );

      composer.step({
        program: raymarchingProgram
      });

      requestAnimationFrame(animate);
    };

    animate();
  });
</script>

<div class="w-full h-screen">
  <canvas bind:this={canvas} class="w-full h-full" />
</div>
