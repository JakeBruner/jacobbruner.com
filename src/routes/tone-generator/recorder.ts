import type { Tone } from "./type";

export default class ToneRecorder {
  private ctx: AudioContext;
  private outputNode: MediaStreamAudioDestinationNode;
  private mediaRecorder: MediaRecorder;
  tones: Tone[];

  constructor(audioctx: AudioContext, tones: Tone[]) {
    this.ctx = audioctx;
    this.tones = tones;
    this.outputNode = this.ctx.createMediaStreamDestination();
    this.mediaRecorder = new MediaRecorder(this.outputNode.stream, {
      mimeType: "audio/ogg;"
    });
  }

  // public connectStream(stream: MediaStream) {
  //   this.outputNode.connect(this.ctx.destination);
  // }

  public startRecording() {
    this.tones.forEach((t) => {
      // t.oscNode.disconnect(t.panNode);
      // t.oscNode.disconnect(t.gainNode);
      // t.oscNode.disconnect(this.ctx.destination);
      t.oscNode.connect(this.outputNode);
    });
    this.mediaRecorder.start();
  }

  public stopRecording() {
    this.mediaRecorder.stop();
    this.tones.forEach((t) => {
      t.oscNode.disconnect(this.outputNode);
      // t.oscNode.connect(this.ctx.destination);
    });
  }

  // save to file
  public async saveRecording(filename: string) {
    console.log("saving recording");
    const chunks: Blob[] = [];
    this.mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    return new Promise((resolve) => {
      console.log("waiting for stop");
      this.mediaRecorder.onstop = (e: Event) => {
        console.log("stopped");
        const blob = new Blob(chunks, { type: "audio/ogg;" });
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
