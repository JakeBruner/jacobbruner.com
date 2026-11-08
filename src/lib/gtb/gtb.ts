import wordList from "./words.json" with { type: "json" };

/** Match a complete hint, with an underscore (or dot) for each unknown letter. */
export const search = (input: string): string[] => {
  const hint = input.toLowerCase();
  return wordList.filter((word) => {
    if (word.length !== hint.length) return false;
    const candidate = word.toLowerCase();
    return [...hint].every((letter, index) =>
      letter === "_" || letter === "." || letter === candidate[index]
    );
  });
};
