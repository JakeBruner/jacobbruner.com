export type Harmony =
  | "min7"
  | "min9"
  | "min11"
  // | "min7sharp9"
  // | "maj9"
  | "maj9sharp11"
  | "maj7sharp11";
// | "dom7flat9sharp11"

const harmonicsMap: Record<Harmony, number[]> = {
  min7: [1, -2, -11, -21, -27],
  min9: [1, -2, -4, -7, -8, -11, -14, -21, -27],
  min11: [1, -2, -3, -4, -6, -7, -8, -9, -11, -12 - 14, -21, -27],
  maj7sharp11: [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 15],
  maj9sharp11: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15] // 1 = -1, with the - being the undertone series
};

export interface GenerateOptions {
  inputBaseFrequency?: number;
  inputHarmonics?: Harmony;
}

export const generateFrequencies = ({ inputBaseFrequency, inputHarmonics }: GenerateOptions) => {
  // const baseFrequency = rand ? Math.floor(Math.random() * 300 + 150) : baseFrequency;
  const baseFrequency = inputBaseFrequency || Math.floor(Math.random() * 300 + 150);

  const harmonics = inputHarmonics || (Math.random() > 0.9 ? "min7" : "min9");

  const overtoneArray = harmonicsMap[harmonics];

  let frequencyList = [baseFrequency];

  frequencyList = frequencyList.concat(
    overtoneArray.map((o) =>
      o > 0
        ? // ? baseFrequency * o // correcting for octave
          baseFrequency * o
        : baseFrequency / Math.abs(o)
    )
  );

  // algorithm to get the frequencies as close to the base frequency as possible minimizing square error while being constrained to only multiply/divide values by 2

  const minSquareError = Math.sqrt(
    frequencyList.reduce((acc, cur, i) => {
      if (i === 0) {
        return acc;
      } else {
        return acc + Math.pow(cur - frequencyList[i - 1], 2);
      }
    }, 0)
  );

  const maxIterations = 1000;

  for (let i = 0; i < maxIterations; i++) {
    const randomIndex = Math.floor(Math.random() * frequencyList.length);
    const randomValue = frequencyList[randomIndex];
    const randomMultiplier = Math.random() > 0.5 ? 2 : 0.5;
    const newFrequencyList = frequencyList.map((f, i) => {
      if (i === randomIndex) {
        return randomValue * randomMultiplier;
      } else {
        return f;
      }
    });
    const newSquareError = Math.sqrt(
      newFrequencyList.reduce((acc, cur, i) => {
        if (i === 0) {
          return acc;
        } else {
          return acc + Math.pow(cur - newFrequencyList[i - 1], 2);
        }
      }, 0)
    );
    if (newSquareError < minSquareError) {
      frequencyList = newFrequencyList;
    }
  }

  return frequencyList;
};
