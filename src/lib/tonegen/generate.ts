export const harmonyOptions = [
  { name: "min7", notes: "1, b3, 5, b7" },
  { name: "min7add2", notes: "1, 2, b3, 5, b7" },
  { name: "min9", notes: "1, b3, 5, b7, 9" },
  { name: "min11", notes: "1, b3, 5, b7, 9, 11" },
  { name: "min7sharp9", notes: "1, b3, 5, b7, #9" },
  { name: "maj7", notes: "1, 3, 5, 7" },
  { name: "maj9", notes: "1, 3, 5, 7, 9" },
  { name: "maj9sharp11", notes: "1, 3, 5, 7, 9, #11" },
  { name: "maj7sharp11", notes: "1, 3, 5, 7, #11" },
  { name: "dom7", notes: "1, 3, 5, b7" },
  { name: "dom7flat9aug4", notes: "1, 3, #4, b7, b9" },
  { name: "dom7sharp9_1", notes: "1, 3, #9, b7" },
  { name: "dom7sharp9_2", notes: "1, 3, b7, #9" },
  { name: "halfdim7", notes: "1, b3, b5, b7" },
  { name: "halfdim7add11", notes: "1, b3, b5, b7, 11" },
  { name: "halfdim11", notes: "1, b3, b5, b7, 9, 11" }
] as const;

export type Harmony = (typeof harmonyOptions)[number]["name"];

export function assertIsSupportedGenerationType(str: string): asserts str is Harmony | "Random" {
  if (str !== "Random" && !harmonyOptions.some((harmony) => harmony.name === str)) {
    throw new Error(`${str} is not a valid Harmony and is not "Random"`);
  }
}

export const generateOptions = [{ name: "Random", notes: "" }, ...harmonyOptions] as {
  name: string;
  notes: string;
}[];

export type GenerateOptions = typeof generateOptions;

const harmonicsMap: Record<Harmony, number[]> = {
  // please note the position in array detemines, with some random variation, its proximity in number of octaves above the base frequency

  // positive values coorespond to the overtone series, obtained by f*n for integer n
  // negative values coorespond to the undertone series, obtained by f/n for integer n

  // a value of 1 is identical to -1
  min7: [1, -21, -27, -9],
  min7add2: [1, -7, -21, -27, -9],
  min7sharp9: [1, -21, -27, -9, -15],
  min9: [1, -21, -27, -9, -7],
  min11: [1, -21, -27, -7, -11, -3],
  maj7: [1, 3, 5, 15],
  maj7sharp11: [1, 3, 5, 11, 15],
  maj9: [1, 3, 5, 9, 15],
  maj9sharp11: [1, 3, 5, 9, 11, 15],
  dom7: [1, 3, 5, 7],
  dom7flat9aug4: [1, 3, 5, 7, 17, 11],
  dom7sharp9_1: [1, 5, 3, 12, 19],
  dom7sharp9_2: [1, -13, -21, -15, -3],
  halfdim7: [1, -27, -11, -9],
  halfdim7add11: [1, -27, -11, -9, -3],
  halfdim11: [1, -27, -7, -11, -9, -3]

  // each harmony is NOT AT ALL in 12TET. Some are closer-sounding than others, just know that the harmonic serieses match up closely—but not perfectly—with normal 12TET intervals.
};

export const getHarmonicsFromChord = (chord: string): number[] => harmonicsMap[chord];

export interface GenerationSettings {
  baseFrequency: number;
  harmony: Harmony | "Random";
}

const randomHarmony = () => {
  const harmony = (Object.keys(harmonicsMap) as Harmony[])[
    Math.floor(Math.random() * Object.keys(harmonicsMap).length)
  ];
  const msg = "Generated " + ("aeiou".includes(harmony[0]) ? "an " : "a ") + harmony + " chord!";
  console.log(msg);
  return harmony;
};

// This function generates the frequencies for a given ARRAY of harmonics.
// This is called in /tone-generator which uses the object above to compute the relavant array
export const generateFrequencies = ({ baseFrequency, harmony }: GenerationSettings) => {
  assertIsSupportedGenerationType(harmony);

  // const harmonics =
  // harmony === "Random" ? getHarmonicsFromChord(randomHarmony()) : getHarmonicsFromChord(harmony);

  const harmonySetting: Harmony = harmony === "Random" ? randomHarmony() : harmony;

  const harmonics = getHarmonicsFromChord(harmonySetting);

  // we love list monads
  let frequencies = harmonics.map((o) => (o > 0 ? baseFrequency * o : baseFrequency / Math.abs(o)));

  // ensure frequencies are as close as possible to the base frequency
  frequencies = frequencies.map((f) => {
    while (f > 2.5 * baseFrequency) {
      f /= 2;
    }

    while (f < baseFrequency) {
      f *= 2;
    }

    return f;
  });

  // randomly move frequencies up by a random (or 0) number of octaves, progressively more likely to be higher octaves as the array index increases
  // sigmoid from 0 octaves (no change) to MAX_SHIFT ocvates (max change) with a LOT of random noise. so random noise can overpower the sigmoid, sometimes, but rarely, leading to crazy chords and slash harmonies

  const MAX_SHIFT = 3;
  const RANDOM_NOISE = 0.5;

  const octaveShifts = frequencies.map((f, i) => {
    const sigmoid = 1 / (1 + Math.pow(Math.E, -((i - 2) / MAX_SHIFT)));
    const noise = Math.random() * RANDOM_NOISE * (Math.random() > 0.5 ? 1 : -1);
    return Math.round(sigmoid + noise);
  });

  frequencies = frequencies.map((frequency, i) => {
    return frequency * Math.pow(2, octaveShifts[i]);
  });

  return { frequencies, harmonySetting };
};
