export default class Recorder {
  private ctx: AudioContext;
  private outputNode: MediaStreamAudioDestinationNode;
  private mediaRecorder: MediaRecorder;
  private gainNode: GainNode;

  constructor() {
    this.ctx = new AudioContext();
    this.outputNode = this.ctx.createMediaStreamDestination();
    this.gainNode = this.ctx.createGain();
    this.mediaRecorder = new MediaRecorder(this.outputNode.stream);
    this.gainNode.connect(this.outputNode);
  }

  public connectStream(stream: MediaStream) {
    const inputNode = this.ctx.createMediaStreamSource(stream);
    inputNode.connect(this.gainNode);
  }

  public startRecording() {
    this.mediaRecorder.start();
  }

  public stopRecording() {
    this.mediaRecorder.stop();
  }

  public connectOscillator(osc: OscillatorNode) {
    osc.connect(this.gainNode);
  }

  // save to file
  public async saveRecording(filename: string) {
    const chunks: Blob[] = [];
    this.mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    return new Promise((resolve) => {
      this.mediaRecorder.onstop = (e: Event) => {
        const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        resolve(e);
      };
    });
  }
}
