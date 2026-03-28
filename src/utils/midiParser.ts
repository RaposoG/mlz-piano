import { Midi } from '@tonejs/midi';
import type { MidiFile, MidiNote } from '../types/midi';

export async function parseMidiFile(file: File): Promise<MidiFile> {
	const arrayBuffer = await file.arrayBuffer();
	const midi = new Midi(arrayBuffer);

	const tracks = midi.tracks.map((track, index) => {
		const notes: MidiNote[] = track.notes.map((note) => ({
			midi: note.midi,
			name: note.name,
			time: note.time,
			duration: note.duration,
			velocity: note.velocity,
			track: index,
		}));

		return {
			name: track.name || `Track ${index + 1}`,
			notes,
			instrument: track.instrument?.name || 'Piano',
		};
	});

	const allNotes = tracks.flatMap((t) => t.notes).sort((a, b) => a.time - b.time);

	return {
		name: file.name.replace(/\.mid[i]?$/i, ''),
		duration: midi.duration,
		bpm: midi.header.tempos[0]?.bpm ?? 120,
		tracks,
		allNotes,
	};
}
