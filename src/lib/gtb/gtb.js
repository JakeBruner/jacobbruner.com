import wordList from './words.json'

// search
export const search = input => {
	const cleanInput = input.replace(/_/g, '.')

	let answers = [];
	try {
		const expression = new RegExp(cleanInput, "ig");
		console.log(expression);

		answers = wordList.filter(elem => (expression.test(elem) && elem.length === input.length))



	} catch (e) {
		return [""]
		// regex error
	}
	return answers;

}