import FFT from "./fft";
// import { error } from "@sveltejs/kit";

export default class AudioFFT {
  // private audioContext: AudioContext;
  private analyser!: AnalyserNode;
  private fft!: FFT;
  private bufferLength!: number;
  private dataArray!: Uint8Array;
  private canvas: HTMLCanvasElement;
  private canvasContext: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, analyser: AnalyserNode) {
    this.canvas = canvas;
    this.canvasContext = canvas.getContext("2d") as CanvasRenderingContext2D;

    // this.audioContext = ctx;
    this.analyser = analyser;

    this.setupFFT();
    this.renderFFT();
  }

  private setupFFT() {
    // Create a new instance of the FFT object
    this.fft = new FFT(this.analyser.fftSize);

    // Get the buffer length and create a new array to hold the data
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
  }

  public renderFFT() {
    requestAnimationFrame(this.renderFFT);

    // Render the FFT at a rate of 60 frames per second
    requestAnimationFrame(() => this.renderFFT());

    // Get the current frequency data from the analyser

    this.analyser.getByteFrequencyData(this.dataArray);

    // Clear the canvas

    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw the frequency data on the canvas

    for (let i = 0; i < this.bufferLength; i++) {
      const barHeight = this.dataArray[i];

      const x = i * (this.canvas.width / this.bufferLength);

      const y = this.canvas.height / 2 - barHeight / 2;

      this.canvasContext.fillRect(x, y, 2, barHeight);
    }
  }
}
