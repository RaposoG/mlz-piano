# Conventions — MLZ Piano

## Code Style

### TypeScript/React
- **Functional components only** — no class components
- **`memo()` wrapper** on all exported components for performance
- **`useCallback`** extensively used to stabilize callbacks (critical for animation loop)
- **`useRef`** for values needed in animation frames (avoids stale closures)
- **Tabs for indentation** (visible in source)
- **Single quotes** for strings
- **No semicolons** at statement ends (inferred from source)
- **Trailing commas** in function parameters

### Rust
- Standard Rust conventions (snake_case, PascalCase structs)
- `#[tauri::command]` attribute for IPC-exposed functions
- `serde::Serialize` derive for return types

## Component Patterns

### State Management
- **All state in `App.tsx`** — no context providers, no external stores
- Props drilled to child components
- `useRef` mirrors for values accessed in `requestAnimationFrame` loops:
  ```typescript
  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime; // sync on every render
  ```

### Event Handling
- Callbacks defined in `App.tsx` with `useCallback`
- Passed to components as props
- Components are pure — they render based on props, no internal fetch/side effects (except `MidiLibrary` and `Sidebar` which invoke Tauri)

### CSS
- Component-colocated CSS files (not CSS modules, not CSS-in-JS)
- Global styles in `App.css`
- Dark theme hardcoded (`#0a0a1a` background, light text)
- CSS custom properties used sparingly (`--card-color` in MainMenu)
- No CSS preprocessor

## Error Handling

- `try/catch` around async operations (file loading, MIDI access, Tauri invoke)
- Errors logged to `console.error` with descriptive messages
- No user-facing error toasts/modals
- No error boundary components

## Patterns of Note

### Playback Loop
- Uses `requestAnimationFrame` continuously (not `setInterval`)
- Active notes tracked via `Set<string>` with composite keys: `"${track}-${midi}-${time.toFixed(4)}"`
- Note-off scheduled via `setTimeout` based on remaining duration

### Learning "Wait" Mode
- Maintains `waitingForNotesRef` set of MIDI numbers user must play
- Playback pauses when waiting notes are present
- Resumes automatically when all waiting notes are played

### Live Note Trail (Free Mode)
- `LiveNote[]` array tracks user-played notes with `performance.now()` timestamps
- Notes auto-expire after 10 seconds
- Duration 0 = still held, >0 = completed

## Import Patterns

```typescript
// React hooks
import { useState, useCallback, useRef, useEffect } from 'react';
// Tauri APIs
import { readFile } from '@tauri-apps/plugin-fs';
import { invoke } from '@tauri-apps/api/core';
// Libraries
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';
// Local
import type { MidiFile, MidiNote } from '../types/midi';
```

- Type-only imports use `import type { ... }`
- Relative paths with `../` (no path aliases configured)
