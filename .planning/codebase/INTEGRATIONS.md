# Integrations — MLZ Piano

## External Services

### Salamander Grand Piano Samples (CDN)
- **URL:** `https://tonejs.github.io/audio/salamander/`
- **Used in:** `src/hooks/useAudioEngine.ts`
- **Protocol:** HTTPS fetch on demand
- **Notes:** Loads ~30 piano samples (A0-C8 range) at app initialization. No auth required. If CDN is unreachable, audio won't work.

## Browser APIs

### Web MIDI API
- **Used in:** `src/hooks/useMidiInput.ts`
- **Purpose:** Connect to physical MIDI keyboards/controllers
- **Access:** `navigator.requestMIDIAccess({ sysex: false })`
- **Features used:**
  - `MIDIAccess.inputs` — enumerate and connect devices
  - `MIDIInput.onmidimessage` — receive Note On (0x90), Note Off (0x80), CC (0xB0) messages
  - `onstatechange` — detect device hotplug
- **Notes:** Auto-connects all devices on startup. No sysex required.

### Web Audio API (via Tone.js)
- **Used in:** `src/hooks/useAudioEngine.ts`
- **Purpose:** Piano sound synthesis and playback
- **Notes:** Requires user gesture to start (`Tone.start()` called on first interaction)

### Canvas 2D API
- **Used in:** `src/components/FallingNotes.tsx`
- **Purpose:** Render falling note visualization (Synthesia-style)
- **Features:** `requestAnimationFrame` loop, `roundRect`, shadow/glow effects, devicePixelRatio scaling

### File API
- **Used in:** `src/App.tsx` (handleLoadFile)
- **Purpose:** File picker for loading MIDI files from disk via `<input type="file">`

## Tauri IPC Commands

### `scan_midi_files`
- **Defined in:** `src-tauri/src/lib.rs`
- **Called from:** `src/components/MidiLibrary.tsx`, `src/components/Sidebar.tsx`
- **Purpose:** Scan system directories (Downloads, Music, Documents, Desktop) for `.mid`/`.midi` files
- **Returns:** `Vec<MidiFileEntry>` with path, name, folder, size
- **Notes:** Uses `walkdir` with `max_depth(5)`, follows no symlinks

## Tauri Plugins

### `tauri-plugin-fs`
- **Permissions:** Read-only access to `$DOWNLOAD`, `$AUDIO`, `$DOCUMENT`, `$DESKTOP` (see `src-tauri/capabilities/default.json`)
- **Used for:** Reading MIDI file contents from scanned paths via `readFile()`

### `tauri-plugin-opener`
- **Permissions:** Default
- **Used for:** OS-level open operations (currently minimal usage)

## Databases
None — no persistent storage. All state is in-memory (React state).

## Authentication
None — standalone desktop application.
