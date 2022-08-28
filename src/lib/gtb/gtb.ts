import wordList from "./words.json" assert { type: "json" };

// search
export const search = (input: string) => {
  const cleanInput = input.replace(/_/g, ".");
  // console.log("____");
  // console.log(cleanInput);

  let answers = [];
  try {
    const expression = new RegExp(cleanInput, "ig");
    // console.log(expression);
    // console.log(expression);

    answers = wordList.filter((elem) => input.length === elem.length && expression.test(elem));
    // console.log(answers);
  } catch (e) {
    console.log(e);
    return [""];
    // regex error
  }
  return answers;
};

// export const test = () => {
// 	wordList.forEach(element => {
// 		let word = '_' + element.slice(1, element.length)
// 		const answer = search(word)
// 		if (answer[0] !== element) {
// 			console.log(`${answer[0]}, ${element}`)
// 		}
// 	});
// }
