import type { Tone } from "./type";

const EncodeTypes = ["ogg", "mp3", "flac", "webm"] as const;

type EncodeType = typeof EncodeTypes[number];

import { audioBufferToWav } from "./wav";

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

        // arbitrary encoding: whatever is native to the browser
        const blob = new Blob(chunks, { type: `audio/${this.encodetype};` });
        console.log("converting to audio buffer using intermediary format", this.encodetype);

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

        const blob2 = audioBufferToWav(await audioBuffer, { isFloat: false });

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
