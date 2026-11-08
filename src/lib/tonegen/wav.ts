/** Encode interleaved WAV samples without modifying the source AudioBuffer. */
export const audioBufferToWav = (buffer: AudioBuffer, options: { isFloat: boolean }): Blob => {
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) =>
    buffer.getChannelData(index)
  );
  const frames = buffer.length;
  const bytesPerSample = options.isFloat ? 4 : 2;
  const blockAlign = channels.length * bytesPerSample;
  const dataSize = frames * blockAlign;
  const bytes = new ArrayBuffer(44 + dataSize);
  const view = new DataView(bytes);
  const writeText = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };

  writeText(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, options.isFloat ? 3 : 1, true);
  view.setUint16(22, channels.length, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeText(36, "data");
  view.setUint32(40, dataSize, true);

  // A loop supports long recordings without the argument limit of Math.max(...samples).
  let peak = 0;
  for (const channel of channels) {
    for (const sample of channel) {
      if (Number.isFinite(sample)) peak = Math.max(peak, Math.abs(sample));
    }
  }
  const scale = peak > 0 ? 0.7 / peak : 0;
  let offset = 44;
  for (let frame = 0; frame < frames; frame++) {
    for (const channel of channels) {
      const raw = channel[frame];
      const sample = Number.isFinite(raw) ? Math.max(-1, Math.min(1, raw * scale)) : 0;
      if (options.isFloat) view.setFloat32(offset, sample, true);
      else view.setInt16(offset, Math.round(sample * (sample < 0 ? 0x8000 : 0x7fff)), true);
      offset += bytesPerSample;
    }
  }
  return new Blob([bytes], { type: "audio/wav" });
};
