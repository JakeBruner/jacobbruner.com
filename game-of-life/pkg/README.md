# Game of Life WebAssembly module

This crate powers the website’s interactive Game of Life. It retains the empty,
random, arithmetic, glider, and glider-gun starting patterns and wraps neighbors
and inserted gliders across the grid edges.

## Build

Use Rust 1.85 or newer, the `wasm32-unknown-unknown` target, and
`wasm-pack` 0.15.1. The current generated package was built with Rust 1.99.1.
Run these commands from the repository root:

```sh
rustup target add wasm32-unknown-unknown
wasm-pack build game-of-life --target web --release --no-gitignore -- --locked
python3 scripts/fixwasm.py
```

Keep `Cargo.lock` and the generated files in `pkg/` together with source changes.
The dependency versions for `wasm-bindgen`, `js-sys`, and `wasm-bindgen-test`
are coordinated; update them together and rebuild the package.
`fixwasm.py` supplies the package’s ES module exports after each build.

## Test

```sh
cargo test --manifest-path game-of-life/Cargo.toml --locked
wasm-pack test --node game-of-life --locked
node --test game-of-life/tests/pkg.mjs
```

The Rust suite checks Conway’s rules, glider movement, toroidal edges, small
grids, text rendering, and invalid input. The Wasm suite also checks the random
seed boundaries. The JavaScript suite exercises the generated release package,
including its packed cells and memory-growth behavior.

With `cargo-audit` installed, inspect all locked dependencies with:

```sh
cargo audit --file game-of-life/Cargo.lock --deny warnings
```

## JavaScript interface

Initialize the module once, then call `Universe.new(width, height, mode, density)`.
Dimensions must be positive and their product must fit in a `u32`; mode is 0–4
and density must be finite in the inclusive range 0–1. Call `free()` when replacing
or discarding a universe.

`cells()` returns a pointer into the exported `WebAssembly.Memory`. Its bitset
contains one bit per cell in row-major order, least-significant bit first.
Construct a fresh view from `memory.buffer` and `universe.cells()` after a tick
or an allocation, with a length of `Math.ceil(width * height / 8)`. Both the
pointer and buffer can change; retained buffers become detached when memory grows.

## License

Licensed under either Apache License 2.0 ([LICENSE-APACHE](LICENSE-APACHE)) or
MIT ([LICENSE-MIT](LICENSE-MIT)), at your option.
