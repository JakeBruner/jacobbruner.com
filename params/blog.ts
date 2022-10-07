/** @type {import('@sveltejs/kit').ParamMatcher} */
export function match(param): boolean {
  return ["Computer-Science", "Math", "Music", "Writing"].includes(param);
}
