type DecodeOptions = {
  sampleRate: number;
  numChannels: number;
  numFrames: number;
  isFloat: boolean;
};

export const audioBufferToWav = (buffer: AudioBuffer, options: { isFloat: boolean }): Blob => {
  normalizeAudioBuffer(buffer);

  const [left, right] = [buffer.getChannelData(0), buffer.getChannelData(1)];

  // case 1: float32array

  if (options.isFloat) {
    const interleaved = new Float32Array(left.length + right.length);
    for (let src = 0, dst = 0; src < left.length; src++, dst += 2) {
      interleaved[dst] = left[src];
      interleaved[dst + 1] = right[src];
    }

    const wavBytes = getWavBytes(interleaved.buffer, {
      isFloat: true,
      numChannels: 2,
      sampleRate: buffer.sampleRate
    });

    return new Blob([wavBytes], { type: "audio/wav" });
  }
  // case 2: uint16array

  const interleaved = new Uint16Array(left.length + right.length);
  for (let src = 0, dst = 0; src < left.length; src++, dst += 2) {
    interleaved[dst] = left[src] * 0x7fff;
    interleaved[dst + 1] = right[src] * 0x7fff;
  }

  const wavBytes = getWavBytes(interleaved.buffer, {
    isFloat: false,
    numChannels: 2,
    sampleRate: buffer.sampleRate
  });

  return new Blob([wavBytes], { type: "audio/wav" });
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

const writeWavHeader = (options: DecodeOptions) => {
  const { sampleRate, numChannels, numFrames, isFloat } = options;

  const bytesPerSample = isFloat ? 4 : 2;
  const format = 1; // PCM

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

const normalizeAudioBuffer = (buffer: AudioBuffer) => {
  const [left, right] = [buffer.getChannelData(0), buffer.getChannelData(1)];

  const max = Math.max(...left, ...right);

  const desiredMax = 0.7;

  const scale = desiredMax / max;

  for (let i = 0; i < left.length; i++) {
    left[i] *= scale;
    right[i] *= scale;
  }
};
