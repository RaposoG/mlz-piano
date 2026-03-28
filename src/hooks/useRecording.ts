import { useRef, useState, useCallback } from 'react';
import { Midi } from '@tonejs/midi';
import type { RecordedNote } from '../types/midi';

export function useRecording() {
	const [isRecording, setIsRecording] = useState(false);
	const [recordingDuration, setRecordingDuration] = useState(0);
	const startTimeRef = useRef(0);
	const notesRef = useRef<RecordedNote[]>([]);
	const activeRef = useRef<Map<number, { start: number; velocity: number }>>(new Map());
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const startRecording = useCallback(() => {
		notesRef.current = [];
		activeRef.current.clear();
		startTimeRef.current = performance.now();
		setRecordingDuration(0);
		setIsRecording(true);

		intervalRef.current = setInterval(() => {
			setRecordingDuration((performance.now() - startTimeRef.current) / 1000);
		}, 100);
	}, []);

	const stopRecording = useCallback(() => {
		setIsRecording(false);
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		// Finish any notes still held
		const now = (performance.now() - startTimeRef.current) / 1000;
		for (const [midi, info] of activeRef.current) {
			notesRef.current.push({
				midi,
				velocity: info.velocity,
				time: info.start,
				duration: now - info.start,
			});
		}
		activeRef.current.clear();
		setRecordingDuration(now);
	}, []);

	const recordNoteOn = useCallback(
		(midi: number, velocity: number) => {
			if (!isRecording) return;
			const time = (performance.now() - startTimeRef.current) / 1000;
			activeRef.current.set(midi, { start: time, velocity });
		},
		[isRecording],
	);

	const recordNoteOff = useCallback(
		(midi: number) => {
			if (!isRecording) return;
			const info = activeRef.current.get(midi);
			if (!info) return;
			const time = (performance.now() - startTimeRef.current) / 1000;
			notesRef.current.push({
				midi,
				velocity: info.velocity,
				time: info.start,
				duration: time - info.start,
			});
			activeRef.current.delete(midi);
		},
		[isRecording],
	);

	const exportMidi = useCallback(() => {
		const notes = notesRef.current;
		if (notes.length === 0) return;

		const midi = new Midi();
		const track = midi.addTrack();
		track.name = 'Recording';

		for (const note of notes) {
			track.addNote({
				midi: note.midi,
				time: note.time,
				duration: note.duration,
				velocity: note.velocity,
			});
		}

		const arr = midi.toArray();
		const blob = new Blob([new Uint8Array(arr)], { type: 'audio/midi' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		const date = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
		a.href = url;
		a.download = `recording-${date}.mid`;
		a.click();
		URL.revokeObjectURL(url);
	}, []);

	return {
		isRecording,
		recordingDuration,
		startRecording,
		stopRecording,
		recordNoteOn,
		recordNoteOff,
		exportMidi,
		recordedNotes: notesRef.current,
	};
}
