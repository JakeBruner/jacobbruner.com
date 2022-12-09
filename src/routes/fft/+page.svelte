<script lang="ts">
  // audio-fft.ts
  import { onMount } from 'svelte';
  import { error } from '@sveltejs/kit'
  import FFT from './util'

  class AudioFFT {
    private audioContext?: AudioContext;
    private analyser: AnalyserNode = this.audioContext.createAnalyser();
    private fft?: FFT;
    private bufferLength?: number;
    private dataArray?: Uint8Array;
    private canvas?: HTMLCanvasElement;
    private canvasContext?: CanvasRenderingContext2D | null;

    constructor() {
      this.setupAudio();
      this.setupCanvas();
      this.setupFFT();
      this.renderFFT();
    }

    private setupAudio() {
      // Create an AudioContext
      this.audioContext = new AudioContext();

      // Request access to the microphone
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(stream => {
          // Create an AudioNode from the stream
          const audioSource = this.audioContext.createMediaStreamSource(stream);

          // Create an AnalyserNode
          this.analyser = this.audioContext.createAnalyser();
          audioSource.connect(this.analyser);
        })
        .catch(err => {
          console.error('Failed to get microphone input:', err);
        });
    }

    private setupCanvas() {
      // Create a canvas element
      this.canvas = document.createElement('canvas');

      // Set the dimensions of the canvas
      this.canvas.width = 1024;
      this.canvas.height = 512;

      // Append the canvas to the document
      document.body.appendChild(this.canvas);

      // Get the 2D rendering context for the canvas
      if (!this.canvas) {
        throw error(400,'Canvas is null');
      }
      this.canvasContext = this.canvas.getContext('2d');
    }

    private setupFFT() {
      // Create a new instance of the FFT object
      this.fft = new FFT(this.analyser.fftSize);

      // Get the buffer length and create a new array to hold the data
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
    }

    private renderFFT() {
      // assert all are not undefined
      if (!this.fft || !this.bufferLength || !this.dataArray || !this.canvas || !this.canvasContext) {
        throw error(400,'FFT is null');
      }

      const loop = () => {
        // Render the FFT at a rate of 60 frames per second
        requestAnimationFrame(() => this.renderFFT());

        // Get the current frequency data from the analyser

        //@ts-ignore
        this.analyser.getByteFrequencyData(this.dataArray);

        // Clear the canvas
        //@ts-ignore
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw the frequency data on the canvas
        //@ts-ignore
        for (let i = 0; i < this.bufferLength; i++) {
          //@ts-ignore
          const barHeight = this.dataArray[i];
          //@ts-ignore
          const x = i * (this.canvas.width / this.bufferLength);
          //@ts-ignore
          const y = (this.canvas.height / 2) - barHeight / 2;
          //@ts-ignore
          this.canvasContext.fillRect(x, y, 2, barHeight);
        }

      }
      requestAnimationFrame(loop);
    }
  }

  onMount(() => {
    const audioFFT = new AudioFFT();
  });

</script>

<svelte:head>
  <title>Real-time Audio FFT</title>
</svelte:head>

<h1>Real-time Audio FFT</h1>
<p>
  This page uses the Svelte framework and Typescript to display a real-time fast fourier transform
  of microphone input.
</p>
