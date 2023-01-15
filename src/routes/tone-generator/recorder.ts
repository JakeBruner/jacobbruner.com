import type { Tone } from "./type";

const EncodeTypes = ["ogg", "mp3", "flac", "webm"] as const;

type EncodeType = typeof EncodeTypes[number];

export default class ToneRecorder {
  private ctx: AudioContext;
  private outputNode: MediaStreamAudioDestinationNode;
  private mediaRecorder: MediaRecorder;
  private encodetype: EncodeType;
  tones: Tone[];

  constructor(audioctx: AudioContext, tones: Tone[], encodetype: EncodeType) {
    this.ctx = audioctx;
    this.tones = tones;
    this.outputNode = this.ctx.createMediaStreamDestination();
    // this.mediaRecorder = new MediaRecorder(this.outputNode.stream, {
    //   mimeType: "audio/ogg;"
    // });

    //check supported encodes
    const supportedEncodes: EncodeType[] = [];
    EncodeTypes.forEach((e) => {
      if (MediaRecorder.isTypeSupported(`audio/${e};`)) {
        supportedEncodes.push(e);
      }
    });

    console.log("supported encodes: ", supportedEncodes);

    if (supportedEncodes.length === 0) {
      throw new Error("no supported encodes");
    }

    if (!supportedEncodes.includes(encodetype)) {
      console.error(
        `invalid encode type, defaulting to ${
          supportedEncodes[0]
        }. supported encodes: ${supportedEncodes.join(",")}`
      );
      encodetype = supportedEncodes[0];
    }

    this.encodetype = encodetype;
    this.mediaRecorder = new MediaRecorder(this.outputNode.stream, {
      mimeType: `audio/${encodetype};`
    });
  }

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

        let blob: Blob;

        if (this.encodetype === "ogg") {
          blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
        } else if (this.encodetype === "mp3") {
          blob = new Blob(chunks, { type: "audio/mp3; codecs=mp3" });
        } else if (this.encodetype === "flac") {
          blob = new Blob(chunks, { type: "audio/flac; codecs=flac" });
        } else if (this.encodetype === "webm") {
          blob = new Blob(chunks, { type: "audio/webm; codecs=opus" });
        } else {
          throw new Error(`unsupported encode type: ${this.encodetype}`);
        }
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

  public async saveRecordingAsWav(filename: string) {
    console.log("saving recording as wav");
    const chunks: Blob[] = [];
    this.mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

    return new Promise((resolve) => {
      console.log("waiting for stop");
      this.mediaRecorder.onstop = async (e) => {
        console.log("stopped");

        const blob = new Blob(chunks, { type: "audio/ogg;" });

        const arrayBuffer = await blob.arrayBuffer();

        const audioBuffer = this.ctx.decodeAudioData(
          arrayBuffer,
          () => {
            console.log("decoded");
          },
          (e) => {
            console.error("decode error", e);
          }
        );

        const blob2 = audioBufferToWav(await audioBuffer);

        const url = window.URL.createObjectURL(blob2);
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

const audioBufferToWav = (buffer: AudioBuffer) => {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitDepth = 32;
  const samples = buffer.getChannelData(0);
  const bufferLength = samples.byteLength;

  const wavData = new Float32Array(44 + bufferLength);
  const view = new DataView(wavData.buffer);

  // write the wav header
  // 0x46464952 = 1380533830 = "RIFF"
  view.setUint32(0, 1380533830, false); // "RIFF"
  view.setUint32(4, 36 + bufferLength, true); // file length - 8
  // 0x45564157 = 1163280727 = "WAVE"
  view.setUint32(8, 1163280727, false); // "WAVE"

  // fmt sub-chunk
  // 0x20746d66 = 544501094 = "fmt "
  view.setUint32(12, 544501094, false); // "fmt "
  view.setUint32(16, 16, true); // sub-chunk size
  view.setUint16(20, 1, true); // audio format (1 = PCM)
  view.setUint16(22, numChannels, true); // number of channels
  view.setUint32(24, sampleRate, true); // sample rate
  view.setUint32(28, (sampleRate * numChannels * bitDepth) / 8, true); // byte rate
  view.setUint16(32, (numChannels * bitDepth) / 8, true); // block align
  view.setUint16(34, bitDepth, true); // bits per sample

  // data sub-chunk
  // 0x61746164 = 1635017060 = "data"
  view.setUint32(36, 1635017060, false); // "data"
  view.setUint32(40, bufferLength, true); // sub-chunk size

  // write the PCM samples
  wavData.set(samples, 44);

  return new Blob([view], { type: "audio/wav" });
};
