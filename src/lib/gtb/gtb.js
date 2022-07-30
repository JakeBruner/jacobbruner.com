import wordList from './words.json'

// search
export const search = input => {
	const cleanInput = input.replace(/_/g, '.')

	let answers = [];
	try {
		const expression = new RegExp(cleanInput, "ig");
		// console.log(expression);

		answers = wordList.filter(elem => (expression.test(elem) && input.length === elem.length))



	} catch (e) {
		return [""]
		// regex error
	}
	return answers;

}

// export const test = () => {
// 	wordList.forEach(element => {
// 		let word = '_' + element.slice(1, element.length)
// 		const answer = search(word)
// 		if (answer[0] !== element) {
// 			console.log(`${answer[0]}, ${element}`)
// 		}
// 	});
// }