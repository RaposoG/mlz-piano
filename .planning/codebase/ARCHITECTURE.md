# Architecture — MLZ Piano

## Pattern

**Single-page React app inside a Tauri desktop shell.**

- Frontend: React 19 SPA with component-based architecture
- Backend: Minimal Rust commands (only MIDI file scanning)
- No routing library — view switching via `AppView` state in `App.tsx`
- No state management library — all state lives in `App.tsx` with React hooks

## Layers

```
┌─────────────────────────────────────────────────┐
│  Views (MainMenu, Piano+FallingNotes, Library,  │
│         Settings, Sidebar)                       │
├─────────────────────────────────────────────────┤
│  App.tsx — Central orchestrator                  │
│  (state, callbacks, playback loop, navigation)   │
├─────────────────────────────────────────────────┤
│  Hooks Layer                                     │
│  useAudioEngine │ useMidiInput │ useRecording    │
├─────────────────────────────────────────────────┤
│  Utils (midiParser) │ Types (midi.ts)            │
├─────────────────────────────────────────────────┤
│  Tauri IPC Bridge                                │
│  @tauri-apps/api │ @tauri-apps/plugin-fs         │
├─────────────────────────────────────────────────┤
│  Rust Backend (lib.rs)                           │
│  scan_midi_files command                         │
└─────────────────────────────────────────────────┘
```

## Data Flow

### MIDI Input → Sound
1. Physical MIDI device sends raw bytes (Note On/Off, CC)
2. `useMidiInput` hook processes `MIDIMessageEvent`, normalizes velocity (0-127 → 0-1)
3. `App.tsx` callbacks (`handleMidiNoteOn/Off`) orchestrate:
   - Audio: `useAudioEngine.noteOn()` triggers Tone.js sampler
   - Visual: Updates `activeNotes` Map (key highlighting)
   - Recording: `useRecording.recordNoteOn()` captures timing
   - Live trail: `addLiveNote()` for free mode visualization

### MIDI File Playback
1. User loads file via file picker or library
2. `parseMidiFile()` or `@tonejs/midi` parses binary → `MidiFile` structure
3. `playbackLoop()` in `App.tsx` runs via `requestAnimationFrame`
4. Loop checks notes against `currentTime`, triggers `playNote()` for each
5. `FallingNotes` canvas renders notes based on `currentTime` position
6. Learning "wait" mode pauses playback until user plays correct notes

### Views
- `AppView` type: `'menu' | 'free' | 'learning' | 'library' | 'settings'`
- View switching via `setCurrentView()` — clears all playback state on navigation

## Key Abstractions

### `App.tsx` — God Component
Central orchestrator holding ALL application state:
- Playback state (isPlaying, currentTime, midiFile, trackStates)
- Active notes map (what keys are currently pressed)
- Learning mode and waiting-for-notes tracking
- Multiple `useRef` for performance (avoid re-renders in animation loop)

### Custom Hooks
| Hook | Responsibility |
|------|---------------|
| `useAudioEngine` | Tone.js sampler lifecycle, noteOn/Off/playNote, volume, sustain |
| `useMidiInput` | Web MIDI API connection, device management, message parsing |
| `useRecording` | Note capture timing, MIDI export via `@tonejs/midi` |

### Types (`src/types/midi.ts`)
Central type definitions + utility functions (`generatePianoKeys`, `isBlackKey`, `midiToNoteName`).
Constants: `PIANO_START=21` (A0), `PIANO_END=108` (C8).

## Entry Points

| Entry | File | Purpose |
|-------|------|---------|
| Frontend | `src/main.tsx` | React root render |
| Backend | `src-tauri/src/main.rs` | Calls `mlz_piano_lib::run()` |
| Rust lib | `src-tauri/src/lib.rs` | Tauri builder with plugins and commands |
| HTML | `index.html` | Vite entry with `<div id="root">` |
