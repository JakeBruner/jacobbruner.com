---
title: "John Conway's Game of Life: Cellular Atomaton"
date: 2022-10-10
layout: blog
excerpt: A simulation of Conway's 'Game of Life' implemented using bleeding-edge web technologies, with Rust code compiled to WebAssembly.
thumbnailpath: /thumbnails/gameoflife.png
tags: Interactive, Rust_WASM
---

In this project, I used the Rust guide on Webassembly to get familiar with the language by implementing a common coding challenge in Rust, compiled to webassembly. Rust is a fasciating programming language that combines many of the ergonomics of modern (JIT, garbage-collected) languages like Typescript, with the powerful performance of compiled, systems languages—all while providing robust type-safety! It really is the endgame of coding languages. Although I've tried to work with Haskell and it's functional paradigms, it can be hard to implement in the real-world. When I discovered that Rust enjoys many of Haskell's innovations—a robust algebraic type system and comprehensive enums and pattern matching, immutability by default—I couldn't wait to try it out. If only they had first class support for monads or applicatives.... oh well, can't have everything in life.

<a href="/game-of-life" class="text-primary">Try it out!</a>