export type BuiltInWave =
  | "sine"
  | "triangle"
  | "sawtooth"
  | "square"
  | "pulse25"
  | "pulse12"
  | "supersaw"
  | "clarinet"
  | "organ"
  | "twelveString"
  | "fmBright";

export interface PeriodicWaveDefinition {
  id: BuiltInWave;
  label: string;
  description: string;
  // Real/imag arrays include the DC component (index 0) to satisfy the Web Audio API.
  real: Float32Array;
  imag: Float32Array;
}

const asFloat32 = (partials: number[]): Float32Array => {
  const arr = new Float32Array(partials.length + 1);
  partials.forEach((value, index) => {
    arr[index + 1] = value;
  });
  return arr;
};

const zeroReal = (partials: number[]): Float32Array => new Float32Array(partials.length + 1);

const makePulse = (dutyCycle: number, harmonics = 16): number[] => {
  const values: number[] = [];
  for (let n = 1; n <= harmonics; n += 1) {
    values.push((Math.sin(n * Math.PI * dutyCycle) / (n * Math.PI)) * 2);
  }
  return values;
};

const triangleHarmonics = (partials = 8): number[] => {
  const values: number[] = [];
  for (let k = 0; k < partials; k += 1) {
    const harmonic = 2 * k + 1;
    const amp = 1 / (harmonic * harmonic);
    values[harmonic - 1] = (k % 2 === 0 ? 1 : -1) * amp;
  }
  return values.map((value) => value ?? 0);
};

const squareHarmonics = (partials = 8): number[] => {
  const values: number[] = [];
  for (let k = 0; k < partials; k += 1) {
    const harmonic = 2 * k + 1;
    values[harmonic - 1] = 1 / harmonic;
  }
  return values.map((value, index) => (index % 2 === 0 ? value ?? 0 : 0));
};

const sawHarmonics = (partials = 16): number[] => {
  const values: number[] = [];
  for (let n = 1; n <= partials; n += 1) {
    values.push(1 / n);
  }
  return values;
};

const organHarmonics = (): number[] => [1, 0.6, 0.3, 0.18, 0.12, 0.08, 0.05];

const clarinetHarmonics = (): number[] => [0.8, 0, 0.6, 0, 0.4, 0, 0.2];

const twelveStringHarmonics = (): number[] => [1, 0.5, 0.75, 0.25, 0.4, 0.2, 0.18];

const fmBrightHarmonics = (): number[] => [1, 0.9, 0.2, 0.6, 0.1, 0.4, 0.05, 0.25];

export const periodicWaveLibrary: Record<BuiltInWave, PeriodicWaveDefinition> = {
  sine: {
    id: "sine",
    label: "Sine",
    description: "Pure fundamental for the cleanest tone.",
    real: zeroReal([1]),
    imag: asFloat32([1])
  },
  triangle: {
    id: "triangle",
    label: "Triangle",
    description: "Odd harmonics only, amplitude drops off quadratically.",
    real: zeroReal(triangleHarmonics()),
    imag: asFloat32(triangleHarmonics())
  },
  sawtooth: {
    id: "sawtooth",
    label: "Saw",
    description: "All harmonics with 1/n amplitude for a bright buzz.",
    real: zeroReal(sawHarmonics()),
    imag: asFloat32(sawHarmonics())
  },
  square: {
    id: "square",
    label: "Square",
    description: "Odd harmonics with 1/n amplitude for a hollow tone.",
    real: zeroReal(squareHarmonics()),
    imag: asFloat32(squareHarmonics())
  },
  pulse25: {
    id: "pulse25",
    label: "Pulse (25%)",
    description: "Narrow pulse for nasal, chiptune-like timbre.",
    real: zeroReal(makePulse(0.25)),
    imag: asFloat32(makePulse(0.25))
  },
  pulse12: {
    id: "pulse12",
    label: "Pulse (12%)",
    description: "Very narrow pulse for harsh metallic textures.",
    real: zeroReal(makePulse(0.12)),
    imag: asFloat32(makePulse(0.12))
  },
  supersaw: {
    id: "supersaw",
    label: "Super Saw",
    description: "Weighted even/odd partial mix inspired by classic EDM stacks.",
    real: zeroReal([1, 0.4, 0.6, 0.28, 0.5, 0.2, 0.35, 0.15]),
    imag: asFloat32([1, 0.35, 0.55, 0.25, 0.45, 0.18, 0.3, 0.12])
  },
  clarinet: {
    id: "clarinet",
    label: "Clarinet",
    description: "Emphasizes odd partials similar to a clarinet tone.",
    real: zeroReal(clarinetHarmonics()),
    imag: asFloat32(clarinetHarmonics())
  },
  organ: {
    id: "organ",
    label: "Organ",
    description: "Harmonic drawbar-like mix for organ pads.",
    real: zeroReal(organHarmonics()),
    imag: asFloat32(organHarmonics())
  },
  twelveString: {
    id: "twelveString",
    label: "12-String",
    description: "Simulates doubled strings with inharmonic overtones.",
    real: zeroReal(twelveStringHarmonics()),
    imag: asFloat32(twelveStringHarmonics())
  },
  fmBright: {
    id: "fmBright",
    label: "FM Bright",
    description: "Bright FM-inspired spectrum for bells and plucks.",
    real: zeroReal(fmBrightHarmonics()),
    imag: asFloat32(fmBrightHarmonics())
  }
};

export const periodicWaveOptions = Object.values(periodicWaveLibrary);

const periodicWaveCache = new WeakMap<
  BaseAudioContext,
  Partial<Record<BuiltInWave, PeriodicWave>>
>();

export const getPeriodicWave = (ctx: BaseAudioContext, waveId: BuiltInWave): PeriodicWave => {
  let wavesForCtx = periodicWaveCache.get(ctx);
  if (!wavesForCtx) {
    wavesForCtx = {};
    periodicWaveCache.set(ctx, wavesForCtx);
  }

  let periodicWave = wavesForCtx[waveId];
  if (!periodicWave) {
    const { real, imag } = periodicWaveLibrary[waveId];
    periodicWave = ctx.createPeriodicWave(real, imag, { disableNormalization: true });
    wavesForCtx[waveId] = periodicWave;
  }

  return periodicWave;
};

export const applyPeriodicWave = (osc: OscillatorNode, waveId: BuiltInWave) => {
  osc.setPeriodicWave(getPeriodicWave(osc.context, waveId));
};

export const defaultWave: BuiltInWave = "sine";

export interface Tone {
  id: number;
  oscNode: OscillatorNode;
  gainNode: GainNode;
  panNode: StereoPannerNode;
  isOrphan: boolean;
  wave: BuiltInWave;
}
