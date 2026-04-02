# Structure — MLZ Piano

## Directory Layout

```
mlz-piano/
├── index.html                  # Vite HTML entry point
├── package.json                # Bun/npm dependencies and scripts
├── vite.config.ts              # Vite config (Tauri dev integration)
├── tsconfig.json               # TypeScript config (strict, ES2020)
├── tsconfig.node.json          # TypeScript config for Vite
├── release-please-config.json  # Automated release config
├── CHANGELOG.md                # Auto-generated changelog
├── README.md                   # Project documentation (Portuguese)
│
├── public/                     # Static assets served by Vite
│
├── src/                        # Frontend source
│   ├── main.tsx                # React DOM entry point
│   ├── App.tsx                 # Main app component (central orchestrator, ~400 lines)
│   ├── App.css                 # Global styles + app layout
│   ├── vite-env.d.ts           # Vite type declarations
│   │
│   ├── components/             # UI components
│   │   ├── Piano.tsx           # 88-key piano keyboard (mouse input)
│   │   ├── Piano.css
│   │   ├── FallingNotes.tsx    # Canvas-based falling note visualization
│   │   ├── MainMenu.tsx        # Landing screen with navigation cards
│   │   ├── MainMenu.css
│   │   ├── MidiLibrary.tsx     # MIDI file browser (Tauri IPC scan)
│   │   ├── MidiLibrary.css
│   │   ├── Settings.tsx        # Settings panel (audio, learning, MIDI, recording)
│   │   ├── Settings.css
│   │   ├── Toolbar.tsx         # Transport controls + file info bar
│   │   ├── Toolbar.css
│   │   ├── Sidebar.tsx         # Collapsible sidebar (appears unused in current views)
│   │   └── Sidebar.css
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAudioEngine.ts   # Tone.js sampler, noteOn/Off, sustain
│   │   ├── useMidiInput.ts     # Web MIDI API device management
│   │   └── useRecording.ts     # Note recording + MIDI export
│   │
│   ├── types/                  # TypeScript types
│   │   └── midi.ts             # All types, constants, utility functions
│   │
│   ├── utils/                  # Utility functions
│   │   └── midiParser.ts       # File → MidiFile parser using @tonejs/midi
│   │
│   └── assets/                 # (empty or minimal static assets)
│
└── src-tauri/                  # Tauri/Rust backend
    ├── Cargo.toml              # Rust dependencies
    ├── tauri.conf.json         # Tauri app config (window, build, bundle)
    ├── build.rs                # Tauri build script
    ├── capabilities/
    │   └── default.json        # App permissions (FS read scopes)
    ├── icons/                  # App icons for all platforms
    └── src/
        ├── main.rs             # Rust entry point
        └── lib.rs              # Tauri commands (scan_midi_files)
```

## Key Locations

| What | Where |
|------|-------|
| All app state | `src/App.tsx` |
| Piano keyboard UI | `src/components/Piano.tsx` |
| Note visualization (canvas) | `src/components/FallingNotes.tsx` |
| Audio engine | `src/hooks/useAudioEngine.ts` |
| MIDI hardware input | `src/hooks/useMidiInput.ts` |
| Type definitions | `src/types/midi.ts` |
| Tauri commands | `src-tauri/src/lib.rs` |
| App permissions | `src-tauri/capabilities/default.json` |
| Window config | `src-tauri/tauri.conf.json` |

## Naming Conventions

- **Components:** PascalCase files (`Piano.tsx`, `FallingNotes.tsx`)
- **Hooks:** camelCase with `use` prefix (`useAudioEngine.ts`)
- **CSS:** Component-colocated (same name, `.css` extension)
- **Types:** Single file (`midi.ts`) with all shared types
- **Rust:** snake_case functions, PascalCase structs

## UI Language

All user-facing strings are in **Portuguese (Brazilian)** — menus, labels, tooltips.
