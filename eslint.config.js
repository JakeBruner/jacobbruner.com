import js from "@eslint/js";
import ts from "typescript-eslint";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default ts.config(
  { ignores: [".svelte-kit/**", ".vercel/**", "node_modules/**", "game-of-life/pkg/**", "game-of-life/target/**", "docs/reference/**", "test-results/**", "playwright-report/**"] },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs["flat/recommended"],
  prettier,
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  { files: ["**/*.svelte"], languageOptions: { parserOptions: { parser: ts.parser } } },
  { files: ["**/*.cjs"], rules: { "@typescript-eslint/no-require-imports": "off" } },
  { rules: {
    // This site is deployed at the domain root; its content also contains external URLs.
    "svelte/no-navigation-without-resolve": "off",
    // Existing mathematical/prototype code is typed separately by svelte-check.
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn"
  } }
);
