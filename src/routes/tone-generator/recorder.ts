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

type DecodeOptions = {
  sampleRate: number;
  numChannels: number;
  numFrames: number;
  isFloat: boolean;
};

const audioBufferToWav = (buffer: AudioBuffer): Blob => {
  const [left, right] = [buffer.getChannelData(0), buffer.getChannelData(1)];

  // interleave left and right channels
  const interleaved = new Float32Array(left.length + right.length);
  for (let i = 0; i < left.length; i++) {
    interleaved[i * 2] = left[i];
    interleaved[i * 2 + 1] = right[i];
  }

  const wavBytes = getWavBytes(interleaved.buffer, {
    isFloat: true,
    numChannels: 2,
    sampleRate: buffer.sampleRate
  });

  return new Blob([wavBytes], { type: "audio/wav" });
};

const writeWavHeader = (options: DecodeOptions) => {
  const { sampleRate, numChannels, numFrames, isFloat } = options;

  const bytesPerSample = isFloat ? 4 : 2;
  const format = isFloat ? 3 : 1; // https://i.stack.imgur.com/BuSmb.png

  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;

  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  let p = 0;

  function writestring(s: string) {
    for (let i = 0; i < s.length; i++) {
      view.setUint8(p, s.charCodeAt(i));
      p++;
    }
  }
  function writeUint32(d: number) {
    view.setUint32(p, d, true);
    p += 4;
  }
  function writeUint16(d: number) {
    view.setUint16(p, d, true);
    p += 2;
  }

  writestring("RIFF"); // ChunkID
  writeUint32(36 + dataSize); // ChunkSize
  writestring("WAVE"); // Format
  writestring("fmt "); // Subchunk1ID
  writeUint32(16); // Subchunk1Size
  writeUint16(format); // AudioFormat
  writeUint16(numChannels); // NumChannels
  writeUint32(sampleRate); // SampleRate
  writeUint32(byteRate); // ByteRate
  writeUint16(blockAlign); // BlockAlign
  writeUint16(bytesPerSample * 8); // BitsPerSample
  writestring("data"); // Subchunk2ID
  writeUint32(dataSize); // Subchunk2Size

  return new Uint8Array(buffer);
};

/**
 * @returns {Uint8Array} wav bytes
 */
const getWavBytes = (
  buffer: ArrayBufferLike,
  options: Omit<DecodeOptions, "numFrames"> = {
    sampleRate: 44100,
    numChannels: 2,
    isFloat: false
  }
) => {
  const type = options.isFloat ? Float32Array : Uint16Array;
  const numFrames = buffer.byteLength / type.BYTES_PER_ELEMENT;

  const headerBytes = writeWavHeader({
    ...options,
    numFrames
  });
  const wavBytes = new Uint8Array(headerBytes.length + buffer.byteLength);

  wavBytes.set(headerBytes, 0);
  wavBytes.set(new Uint8Array(buffer), headerBytes.length);

  return wavBytes;
};
