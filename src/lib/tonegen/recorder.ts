import { audioBufferToWav } from "./wav.ts";

export type RecordingStatus = "recording" | "encoding" | "stopped";
type EncodeType = "ogg" | "mp3" | "flac" | "webm" | "mp4";

export default class ToneRecorder {
  private ctx: AudioContext;
  private source: AudioNode;
  private outputNode: MediaStreamAudioDestinationNode;
  private mediaRecorder: MediaRecorder;
  private onStatusChange: (status: RecordingStatus) => void;
  private recording: Promise<Blob> | null = null;
  private rejectRecording: ((reason: Error) => void) | null = null;
  private disposed = false;
  public status: RecordingStatus = "stopped";

  constructor(
    audioctx: AudioContext,
    source: AudioNode,
    encodetype: EncodeType = "ogg",
    onStatusChange: (status: RecordingStatus) => void = () => {}
  ) {
    if (typeof MediaRecorder === "undefined") throw new Error("Recording is not supported by this browser.");
    this.ctx = audioctx;
    this.source = source;
    this.onStatusChange = onStatusChange;
    this.outputNode = this.ctx.createMediaStreamDestination();
    const mimeType = [`audio/${encodetype}`, "audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4"]
      .find((type) => MediaRecorder.isTypeSupported(type));
    try {
      this.mediaRecorder = new MediaRecorder(this.outputNode.stream, mimeType ? { mimeType } : undefined);
    } catch (error) {
      this.outputNode.stream.getTracks().forEach((track) => track.stop());
      throw error;
    }
    // Record the same mix that is audible, including gain, stereo pan, and tones added later.
    this.source.connect(this.outputNode);
  }

  private setStatus(status: RecordingStatus) {
    this.status = status;
    this.onStatusChange(status);
  }

  public startRecording() {
    if (this.disposed || this.status !== "stopped") return;
    const chunks: Blob[] = [];
    this.recording = new Promise((resolve, reject) => {
      this.rejectRecording = reject;
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      this.mediaRecorder.onstop = () => {
        this.rejectRecording = null;
        resolve(new Blob(chunks, { type: this.mediaRecorder.mimeType }));
      };
      this.mediaRecorder.onerror = () => {
        this.setStatus("stopped");
        reject(new Error("The browser could not record the audio."));
      };
    });
    // The save method surfaces errors, even when an error arrives before it subscribes.
    void this.recording.catch(() => {});
    try {
      this.mediaRecorder.start();
      this.setStatus("recording");
    } catch (error) {
      this.rejectRecording?.(error as Error);
      this.setStatus("stopped");
      throw error;
    }
  }

  public stopRecording() {
    if (this.disposed || this.mediaRecorder.state !== "recording") return;
    this.setStatus("encoding");
    this.mediaRecorder.stop();
  }

  private download(blob: Blob, filename: string) {
    if (this.disposed) return;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  public async saveRecording(filename: string) {
    if (!this.recording) return;
    try {
      const blob = await this.recording;
      const extension = blob.type.split("/")[1]?.split(";")[0] || "webm";
      this.download(blob, `${filename}.${extension}`);
    } finally {
      if (!this.disposed) this.setStatus("stopped");
    }
  }

  public async saveRecordingAsWav(filename: string) {
    if (!this.recording) return;
    try {
      const blob = await this.recording;
      if (this.disposed) return;
      const buffer = await this.ctx.decodeAudioData(await blob.arrayBuffer());
      const wav = audioBufferToWav(buffer, { isFloat: false });
      this.download(wav, filename.endsWith(".wav") ? filename : `${filename}.wav`);
    } finally {
      if (!this.disposed) this.setStatus("stopped");
    }
  }

  public dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.mediaRecorder.ondataavailable = null;
    this.mediaRecorder.onstop = null;
    this.mediaRecorder.onerror = null;
    if (this.mediaRecorder.state !== "inactive") this.mediaRecorder.stop();
    this.rejectRecording?.(new Error("Recording canceled."));
    this.source.disconnect(this.outputNode);
    this.outputNode.stream.getTracks().forEach((track) => track.stop());
    this.status = "stopped";
  }
}
