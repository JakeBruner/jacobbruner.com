export type Interval = {
  name: string;
  unicode: string;
  semitones: number;
  just: number;
  pyth: number;
  equal: number;
};
export type Tuning = "just" | "pyth" | "equal";

/** 12-tone equal temperment */
const et12 = (semitones: number) => {
  return Math.pow(2, semitones / 12);
};

// prettier-ignore
export const Intervals: Readonly<Interval[]> = [
  { name: "unison", unicode: "1̂", semitones: 0, just: 1, pyth: 1, equal: 1 },
  { name: "minor second", unicode: "♭2̂", semitones: 1, just: 16 / 15, pyth: 253 / 243, equal: et12(1) },
  { name: "major second", unicode: "2̂", semitones: 2, just: 9 / 8, pyth: 9 / 8, equal: et12(2) },
  { name: "minor third", unicode: "♭3̂", semitones: 3, just: 6 / 5, pyth: 32 / 27, equal: et12(3) },
  { name: "major third", unicode: "3̂", semitones: 4, just: 5 / 4, pyth: 81 / 64, equal: et12(4) },
  { name: "perfect fourth", unicode: "4̂", semitones: 5, just: 4 / 3, pyth: 4 / 3, equal: et12(5) },
  { name: "augmented fourth", unicode: "♯4̂", semitones: 6, just: 45 / 32, pyth: 729 / 512, equal: et12(6) },
  { name: "diminished fifth", unicode: "♭5̂", semitones: 6, just: 7 / 5, pyth: 1024 / 512, equal: et12(6)},
  { name: "perfect fifth", unicode: "5̂", semitones: 7, just: 3 / 2, pyth: 3 / 2, equal: et12(7) },
  { name: "minor sixth", unicode: "♭6̂", semitones: 8, just: 8 / 5, pyth: 128 / 81, equal: et12(8) },
  { name: "major sixth", unicode: "6̂", semitones: 9, just: 5 / 3, pyth: 27 / 16, equal: et12(9) },
  { name: "minor seventh", unicode: "♭7̂", semitones: 10, just: 7 / 4, pyth: 16 / 9, equal: et12(10) },
  { name: "major seventh", unicode: "7̂", semitones: 11, just: 15 / 8, pyth: 243 / 128, equal: et12(11) },
  { name: "octave", unicode: "8̂", semitones: 12, just: 2, pyth: 2, equal: 2 },
] as const;
