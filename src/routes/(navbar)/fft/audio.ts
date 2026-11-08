export default class AudioFFT {
  private analyser: AnalyserNode;
  private canvas: HTMLCanvasElement;
  private canvasContext: CanvasRenderingContext2D;
  private dataArray: Uint8Array<ArrayBuffer>;
  private animationFrame: number | null = null;
  private disposed = false;

  constructor(canvas: HTMLCanvasElement, analyser: AnalyserNode) {
    this.canvas = canvas;
    this.canvasContext = canvas.getContext("2d")!;
    this.analyser = analyser;
    this.dataArray = new Uint8Array(analyser.frequencyBinCount);
    this.renderFFT();
  }

  public renderFFT = () => {
    if (this.disposed) return;
    this.analyser.getByteFrequencyData(this.dataArray);
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < this.dataArray.length; i++) {
      const barHeight = this.dataArray[i];
      const x = i * (this.canvas.width / this.dataArray.length);
      const y = this.canvas.height / 2 - barHeight / 2;
      this.canvasContext.fillRect(x, y, 2, barHeight);
    }
    this.animationFrame = requestAnimationFrame(this.renderFFT);
  };

  public dispose() {
    this.disposed = true;
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
  }
}
