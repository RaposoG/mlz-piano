# Stack — MLZ Piano

## Languages & Runtimes

| Language | Version | Usage |
|----------|---------|-------|
| TypeScript | ~5.8.3 | Frontend (React components, hooks, utilities) |
| Rust | 2021 edition | Backend (Tauri commands, file scanning) |
| HTML/CSS | — | UI layout and styling |

## Frameworks & Core Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| React | ^19.1.0 | UI component framework |
| React DOM | ^19.1.0 | DOM rendering |
| Tauri | 2.x | Desktop app shell (Rust backend + webview frontend) |
| Vite | ^7.0.4 | Build tool and dev server |
| Tone.js | ^15.1.22 | Audio synthesis engine (piano sampler with Salamander samples) |
| @tonejs/midi | ^2.0.28 | MIDI file parsing |
| @tauri-apps/api | ^2 | Tauri JS API (invoke, events) |
| @tauri-apps/plugin-fs | ^2.4.5 | File system access from frontend |
| @tauri-apps/plugin-opener | ^2 | OS-level open operations |

## Rust Dependencies

| Crate | Version | Purpose |
|-------|---------|---------|
| tauri | 2 | Desktop framework core |
| tauri-plugin-opener | 2 | OS opener plugin |
| tauri-plugin-fs | 2.4.5 | FS plugin |
| serde / serde_json | 1 | Serialization |
| walkdir | 2.5.0 | Recursive directory walking (MIDI file scanning) |
| glob | 0.3.3 | Glob pattern matching |
| dirs | 6.0.0 | System directory resolution (Downloads, Music, etc.) |

## Build & Dev Tools

| Tool | Purpose |
|------|---------|
| Bun | Package manager (`bun install`, `bun run`) |
| Vite 7 | Dev server (port 1420) + production bundler |
| TypeScript | Type checking with strict mode |
| Tauri CLI | Desktop app build and dev commands |
| release-please | Automated release management (see `release-please-config.json`) |

## TypeScript Configuration

- Target: ES2020
- Module: ESNext with bundler resolution
- JSX: react-jsx
- Strict mode enabled (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`)
- Separate `tsconfig.node.json` for Vite config

## Audio Pipeline

- Sampled piano using Tone.js `Sampler` with Salamander Grand Piano samples
- Samples loaded from CDN: `https://tonejs.github.io/audio/salamander/`
- Volume control via `Tone.Volume` node
- Sustain pedal support (CC#64) with held-note tracking

## Package Manager

**Bun** — configured in `tauri.conf.json` as `beforeDevCommand: "bun run dev"` and `beforeBuildCommand: "bun run build"`.
