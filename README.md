# JACOBBRUNER.com

[![Powered By Sveltekit](https://img.shields.io/badge/powered%20by-svelte-FF3C02.svg?style=flat&logo=svelte)](https://kit.svelte.dev/) [![Language: TypeScript](https://img.shields.io/badge/language-typescript-blue.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/) [![Tailwindcss](https://img.shields.io/badge/Tailwindcss-CSS--Framework-%2338B2AC?logo=tailwindcss)](https://tailwindcss.com) [![License: MIT](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat&logo=license)](https://github.com/navneetsharmaui/sveltekit-starter/blob/main/LICENSE)

This portfolio website is built primarily with svelte/sveltekit and typescript, although some rust, bash, glsl, and python is littered throughout for various animations, interactive endpoints, etc. 

I would highly reccomend svelte for anyone willing to take a stab at a pretty young framework. Support for libraries and common practices can take some getting used to, since there's often a "svelte" way to do things. I actually think, now that I'm quite familiar with React and NextJS, that sveltekit is a good way to introduce someone to the tsx, component-based frame of mind, since svelte makes it quicker to *make* components and functionality, whereas I might prefer React/TSX for making more *reliable/solid* components. Especially for something like a portfolio site, svelte is amazing to just design without worrying about whether a refactored component should be memoized or if a useEffect call could be optimized. Perhaps, what I want to try for my next project in the future is Solid, which might be the best of both worlds in terms of performance out-of-the-box and the more-explicit syntax and behavior I like about React.

## Local development and verification

Use Node 24 and pnpm 12.18.0 (pinned in package.json). Install with
`npx --yes pnpm@12.18.0 install --frozen-lockfile`, then `pnpm dev`.

Before accepting changes, run:

```sh
pnpm check
pnpm lint
pnpm test:unit
pnpm build
pnpm test:posts
pnpm exec playwright install chromium firefox webkit
pnpm test:e2e
```

The browser suite starts a local production preview. It covers all posts and the
hidden audio, mathematical and graphics pages as well as the visible navigation.
See `tests/e2e/README.md` for coverage and external-media limitations.

The checked-in Game of Life package lets ordinary website builds run without Rust.
When changing it, follow `game-of-life/README.md`, rebuild with `pnpm build:wasm`,
run `pnpm test:wasm`, and refresh the local dependency with `pnpm install` before
building the site. Commit Cargo.lock and the regenerated package together.

Framework configuration lives in `vite.config.ts`. Use `#lib/*` and `#components/*`
imports with explicit file extensions. The dependency versions are pinned for
reproducibility; update Kit, Svelte, Vite and the Svelte plugin together and rerun
these checks. TypeScript 6 matches the current Kit and lint-tool peer ranges.

The original Inter font is retained under `static/fonts/inter` to preserve the
site's appearance. Its license is included. Archived, incomplete harmonic
visualizer experiments live in `docs/reference` and are not application code.

Vercel uses the pinned pnpm install/build commands in `vercel.json` and Node 24.
A local `pnpm build` produces `.vercel/output`; it does not deploy anything.
