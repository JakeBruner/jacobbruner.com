export type Harmony =
  | "min7"
  | "min9"
  | "min11"
  | "min7sharp9"
  | "maj9"
  | "maj7"
  | "maj9"
  | "maj9sharp11"
  | "maj7sharp11"
  | "dom7"
  | "dom7flat9aug4"
  | "dom7sharp9_1"
  | "dom7sharp9_2"
  | "halfdim7"
  | "halfdim7add11"
  | "halfdim11";

const harmonicsMap: Record<Harmony, number[]> = {
  // please note the position in array detemines, stochastically, the number of octaves above the base frequency
  // 1 = -1, with the - being the undertone series
  min7: [1, -21, -27, -9],
  min7sharp9: [1, -21, -27, -9, -15],
  min9: [1, -21, -27, -9, -7],
  min11: [1, -21, -27, -3, -7, -11],
  maj7: [1, 3, 5, 15],
  maj7sharp11: [1, 3, 5, 11, 15],
  maj9: [1, 3, 5, 9, 15],
  maj9sharp11: [1, 3, 5, 9, 11, 15],
  dom7: [1, 3, 5, 7],
  dom7flat9aug4: [1, 3, 5, 7, 17, 11],
  dom7sharp9_1: [1, 5, 3, 12, 19],
  dom7sharp9_2: [1, -13, -21, -15, -3],
  halfdim7: [1, -27, -11, -9],
  halfdim7add11: [1, -27, -11, -3],
  halfdim11: [1, -27, -11, -7, -3]
};

export interface GenerateOptions {
  inputBaseFrequency?: number;
  inputHarmonics?: Harmony;
}

export const generateFrequencies = ({ inputBaseFrequency, inputHarmonics }: GenerateOptions) => {
  const baseFrequency = inputBaseFrequency || Math.random() * 350 + 75;
  const harmonics =
    inputHarmonics ||
    (Object.keys(harmonicsMap) as Harmony[])[
      Math.floor(Math.random() * Object.keys(harmonicsMap).length)
    ];
  console.log("chord:", harmonics);
  const overtoneArray = harmonicsMap[harmonics];

  let frequencyList = [baseFrequency];

  frequencyList = frequencyList.concat(
    overtoneArray.map((o) => (o > 0 ? baseFrequency * o : baseFrequency / Math.abs(o)))
  );

  // ensure frequencies are as close as possible to the base frequency
  frequencyList = frequencyList.map((frequency) => {
    while (frequency > 2.5 * baseFrequency) {
      frequency /= 2;
    }

    while (frequency < baseFrequency) {
      frequency *= 2;
    }

    return frequency;
  });

  // randomly move frequencies up by a random (or 0) number of octaves, progressively more likely to be higher octaves as the array index increases
  // sigmoid from 0 octaves (no change) to A ocvates (max change) with a LOT of random noise. so random noise can overpower the sigmoid, sometimes, but rarely, leading to crazy chords and slash harmonies

  const A = 3;
  const randomNoise = 0.5;

  const octaveShifts = frequencyList.map((f, i) => {
    const sigmoid = 1 / (1 + Math.pow(Math.E, -((i - 2) / A)));
    const noise = Math.random() * randomNoise * (Math.random() > 0.5 ? 1 : -1);
    return Math.round(sigmoid + noise);
  });

  frequencyList = frequencyList.map((frequency, i) => {
    return frequency * Math.pow(2, octaveShifts[i]);
  });

  return frequencyList;
};
