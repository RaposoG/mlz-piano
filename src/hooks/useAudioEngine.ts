import { useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';

const SAMPLER_URLS: Record<string, string> = {
	A0: 'A0.mp3',
	C1: 'C1.mp3',
	'D#1': 'Ds1.mp3',
	'F#1': 'Fs1.mp3',
	A1: 'A1.mp3',
	C2: 'C2.mp3',
	'D#2': 'Ds2.mp3',
	'F#2': 'Fs2.mp3',
	A2: 'A2.mp3',
	C3: 'C3.mp3',
	'D#3': 'Ds3.mp3',
	'F#3': 'Fs3.mp3',
	A3: 'A3.mp3',
	C4: 'C4.mp3',
	'D#4': 'Ds4.mp3',
	'F#4': 'Fs4.mp3',
	A4: 'A4.mp3',
	C5: 'C5.mp3',
	'D#5': 'Ds5.mp3',
	'F#5': 'Fs5.mp3',
	A5: 'A5.mp3',
	C6: 'C6.mp3',
	'D#6': 'Ds6.mp3',
	'F#6': 'Fs6.mp3',
	A6: 'A6.mp3',
	C7: 'C7.mp3',
	'D#7': 'Ds7.mp3',
	'F#7': 'Fs7.mp3',
	A7: 'A7.mp3',
	C8: 'C8.mp3',
};

const SAMPLE_BASE_URL = 'https://tonejs.github.io/audio/salamander/';

export function useAudioEngine() {
	const samplerRef = useRef<Tone.Sampler | null>(null);
	const volumeRef = useRef<Tone.Volume | null>(null);
	const loadedRef = useRef(false);
	const activeNotesRef = useRef<Map<number, string>>(new Map());

	useEffect(() => {
		const vol = new Tone.Volume(0).toDestination();
		const sampler = new Tone.Sampler({
			urls: SAMPLER_URLS,
			baseUrl: SAMPLE_BASE_URL,
			release: 1,
			onload: () => {
				loadedRef.current = true;
			},
		}).connect(vol);

		samplerRef.current = sampler;
		volumeRef.current = vol;

		return () => {
			sampler.dispose();
			vol.dispose();
			samplerRef.current = null;
			volumeRef.current = null;
			loadedRef.current = false;
		};
	}, []);

	const setVolume = useCallback((value: number) => {
		// value: 0.0 to 1.0
		if (volumeRef.current) {
			const db = value === 0 ? -Infinity : 20 * Math.log10(value);
			volumeRef.current.volume.value = db;
		}
	}, []);

	const ensureContext = useCallback(async () => {
		if (Tone.getContext().state !== 'running') {
			await Tone.start();
		}
	}, []);

	const noteOn = useCallback(
		async (midi: number, velocity = 0.8) => {
			await ensureContext();
			if (!samplerRef.current || !loadedRef.current) return;

			const noteName = Tone.Frequency(midi, 'midi').toNote();
			activeNotesRef.current.set(midi, noteName);
			samplerRef.current.triggerAttack(noteName, Tone.now(), velocity);
		},
		[ensureContext],
	);

	const noteOff = useCallback((midi: number) => {
		if (!samplerRef.current || !loadedRef.current) return;

		const noteName = activeNotesRef.current.get(midi);
		if (noteName) {
			samplerRef.current.triggerRelease(noteName, Tone.now());
			activeNotesRef.current.delete(midi);
		}
	}, []);

	const playNote = useCallback(
		async (midi: number, duration: number, velocity = 0.8) => {
			await ensureContext();
			if (!samplerRef.current || !loadedRef.current) return;

			const noteName = Tone.Frequency(midi, 'midi').toNote();
			samplerRef.current.triggerAttackRelease(noteName, duration, Tone.now(), velocity);
		},
		[ensureContext],
	);

	return { noteOn, noteOff, playNote, setVolume, isLoaded: () => loadedRef.current };
}
