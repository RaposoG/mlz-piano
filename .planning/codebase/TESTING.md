# Testing — MLZ Piano

## Current State

**No tests exist.** No test framework is configured.

## Details

- No `test` script in `package.json`
- No test files in the codebase
- No test dependencies in `devDependencies`
- No Rust tests in `src-tauri/src/lib.rs` or `main.rs`
- No CI test pipeline detected

## Implications

- All validation is manual (run the app, interact with it)
- Audio engine, MIDI input, recording, and playback are untested
- Refactoring carries risk without test coverage
- MIDI parsing relies entirely on `@tonejs/midi` library correctness

## Recommendations (for future phases)

- **Unit tests:** Vitest for TypeScript utilities (`midiParser.ts`, `midi.ts` utility functions)
- **Component tests:** React Testing Library for component rendering
- **E2E tests:** Playwright or WebdriverIO for Tauri app testing
- **Rust tests:** Standard Rust `#[cfg(test)]` module for `scan_midi_files` logic
