export interface MidiNote {
	midi: number;
	name: string;
	time: number; // em segundos
	duration: number; // em segundos
	velocity: number; // 0-1
	track: number;
}

export interface MidiTrack {
	name: string;
	notes: MidiNote[];
	instrument: string;
}

export interface MidiFile {
	name: string;
	duration: number;
	bpm: number;
	tracks: MidiTrack[];
	allNotes: MidiNote[];
}

export interface ActiveNote {
	midi: number;
	velocity: number;
	source: 'midi-input' | 'file' | 'mouse';
}

export interface PianoKey {
	midi: number;
	note: string;
	octave: number;
	isBlack: boolean;
}

export interface ScannedMidiFile {
	path: string;
	name: string;
	folder: string;
	size: number;
}

export interface RecordedNote {
	midi: number;
	velocity: number;
	time: number;
	duration: number;
}

export type LearningMode = 'off' | 'wait' | 'practice';

// Piano range: A0 (21) to C8 (108) - 88 keys
export const PIANO_START = 21;
export const PIANO_END = 108;
export const TOTAL_KEYS = PIANO_END - PIANO_START + 1;

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_NOTES = new Set([1, 3, 6, 8, 10]); // semitone indices of black keys

export function midiToNoteName(midi: number): string {
	const octave = Math.floor(midi / 12) - 1;
	const noteIndex = midi % 12;
	return `${NOTE_NAMES[noteIndex]}${octave}`;
}

export function isBlackKey(midi: number): boolean {
	return BLACK_NOTES.has(midi % 12);
}

export function generatePianoKeys(): PianoKey[] {
	const keys: PianoKey[] = [];
	for (let midi = PIANO_START; midi <= PIANO_END; midi++) {
		const noteIndex = midi % 12;
		const octave = Math.floor(midi / 12) - 1;
		keys.push({
			midi,
			note: NOTE_NAMES[noteIndex],
			octave,
			isBlack: BLACK_NOTES.has(noteIndex),
		});
	}
	return keys;
}
