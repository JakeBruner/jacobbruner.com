# Unfinished harmonic visualizer reference

These files preserve the original contents of `src/lib/reference/` as documentation.
The `.txt` suffix distinguishes the archived source from application modules.
No current route imports these files; `/test` continues to display “Visualizer
coming soon.”

The prototype was introduced in commit
`6aed47aaaf5522f8240ec48f0c0b7c3e282ace67` on September 22, 2025. Its imports of
`./fem` and `./types` were already unresolved in that commit. Neither solver nor
type definitions are present in the repository's available history. The old
`/test` route referenced a different, also missing
`$lib/helmholtz/AcousticVisualizer.svelte`; commit
`f7ec1250a658f54dc69f0e8963391f81515e08b2` replaced that route with the current
placeholder on October 15, 2025.

The preserved files are:

- `HarmonicVisualizer.svelte.txt`, originally `src/lib/reference/HarmonicVisualizer.svelte`
- `harmonics.ts.txt`, originally `src/lib/reference/harmonics.ts`
- `webgl.ts.txt`, originally `src/lib/reference/webgl.ts`

This is incomplete experimental source, not a working acoustics feature. Restoring
it requires a verified solver and solution types, a consistent WebGL shader and
program setup, resource cleanup, and numerical validation against known acoustic
solutions. The archive deliberately leaves those missing pieces unresolved rather
than inventing scientific behavior during website maintenance.
