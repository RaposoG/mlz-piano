# Concerns — MLZ Piano

## God Component (`App.tsx`)

**Severity: Medium**
**File:** `src/App.tsx` (~400 lines)

All application state, callbacks, and playback logic lives in a single component. This includes:
- 12+ `useState` hooks
- 10+ `useRef` mirrors
- Playback loop logic (`playbackLoop`)
- MIDI input handlers
- File loading logic
- Navigation/view management

**Impact:** Difficult to maintain, test, or extend. Adding new features requires modifying App.tsx.
**Prevention:** Extract playback logic into a `usePlayback` hook. Consider splitting view state from audio state.

## No Persistent State

**Severity: Low**
All user preferences (volume, speed, learning mode) reset on app restart. No localStorage, no config file, no database.

**Impact:** User must reconfigure settings each session.

## CDN Dependency for Audio Samples

**Severity: Medium**
**File:** `src/hooks/useAudioEngine.ts`

Piano samples loaded from `https://tonejs.github.io/audio/salamander/` at runtime. If CDN is down or user is offline, the piano produces no sound.

**Impact:** App is non-functional offline (no fallback).
**Prevention:** Bundle samples locally or cache after first download.

## Memory Leak Risk in Playback

**Severity: Low**
**File:** `src/App.tsx` (playbackLoop)

`setTimeout` used for note-off scheduling inside the animation loop. If playback is stopped/restarted rapidly, orphaned timeouts may fire and clear notes that belong to a new playback session.

**Impact:** Occasional visual glitches (notes disappearing at wrong times).

## Sidebar Component Appears Unused

**Severity: Low**
**File:** `src/components/Sidebar.tsx`

`Sidebar.tsx` and `Sidebar.css` exist with full implementation but are not imported or rendered anywhere in `App.tsx`. This appears to be dead code from a previous design iteration.

**Impact:** Adds package size and maintenance confusion.

## No Error UI

**Severity: Low**

Errors are only logged to `console.error`. User sees no feedback if:
- MIDI file fails to parse
- MIDI device connection fails
- Audio context fails to start
- Tauri IPC call fails

## CSP Disabled

**Severity: Low (desktop app context)**
**File:** `src-tauri/tauri.conf.json`

Content Security Policy is set to `null` (disabled). Acceptable for a desktop app with no web-facing surface, but worth noting.

## No Input Validation on MIDI Files

**Severity: Low**
Loaded MIDI files are passed directly to `@tonejs/midi` parser. Malformed files could cause uncaught exceptions. Currently mitigated by try/catch in loading functions.

## No Internationalization Framework

**Severity: Low**
All strings are hardcoded in Portuguese. No i18n system in place. Adding multi-language support would require touching every component.
