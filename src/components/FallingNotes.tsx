import { useRef, useEffect, memo } from 'react';
import type { MidiNote, LiveNote } from '../types/midi';
import { PIANO_START, PIANO_END, isBlackKey } from '../types/midi';

interface FallingNotesProps {
	notes: MidiNote[];
	currentTime: number;
	isPlaying: boolean;
	pixelsPerSecond?: number;
	visibleSeconds?: number;
	liveNotes?: LiveNote[];
}

const TRACK_COLORS = ['#4a9eff', '#ff6b6b', '#51cf66', '#ffd43b', '#cc5de8', '#ff922b', '#22b8cf', '#ff6b9d'];

const OCTAVE_COLORS = ['#ff6b9d', '#cc5de8', '#7c3aed', '#4a9eff', '#22b8cf', '#51cf66', '#ffd43b', '#ff922b', '#ff6b6b'];

function getLiveNoteColor(midi: number): string {
	const octave = Math.floor(midi / 12) - 1;
	return OCTAVE_COLORS[Math.max(0, Math.min(octave, OCTAVE_COLORS.length - 1))];
}

function getNoteColor(track: number, _isBlack: boolean): string {
	return TRACK_COLORS[track % TRACK_COLORS.length];
}

const FallingNotes = memo(function FallingNotes({ notes, currentTime, isPlaying: _isPlaying, pixelsPerSecond = 200, visibleSeconds = 4, liveNotes }: FallingNotesProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animFrameRef = useRef<number>(0);
	const notesRef = useRef(notes);
	const timeRef = useRef(currentTime);
	const liveNotesRef = useRef(liveNotes);

	notesRef.current = notes;
	timeRef.current = currentTime;
	liveNotesRef.current = liveNotes;

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const draw = () => {
			const rect = canvas.getBoundingClientRect();
			canvas.width = rect.width * window.devicePixelRatio;
			canvas.height = rect.height * window.devicePixelRatio;
			ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

			const width = rect.width;
			const height = rect.height;
			const ct = timeRef.current;

			ctx.clearRect(0, 0, width, height);

			// Background gradient
			ctx.fillStyle = '#0a0a1a';
			ctx.fillRect(0, 0, width, height);

			// Draw guide lines for C notes
			// We count white keys for positioning
			let whiteKeyIndex = 0;
			const whiteKeyPositions = new Map<number, number>();
			const totalWhiteKeys = countWhiteKeys(PIANO_START, PIANO_END);
			const whiteKeyWidth = width / totalWhiteKeys;

			for (let midi = PIANO_START; midi <= PIANO_END; midi++) {
				if (!isBlackKey(midi)) {
					whiteKeyPositions.set(midi, whiteKeyIndex);
					whiteKeyIndex++;
				}
			}

			// Draw subtle grid lines at each C
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
			ctx.lineWidth = 1;
			for (let oct = 1; oct <= 8; oct++) {
				const cMidi = 12 * (oct + 1); // C of that octave
				const pos = whiteKeyPositions.get(cMidi);
				if (pos !== undefined) {
					const x = pos * whiteKeyWidth;
					ctx.beginPath();
					ctx.moveTo(x, 0);
					ctx.lineTo(x, height);
					ctx.stroke();
				}
			}

			// Draw playhead line at bottom
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(0, height);
			ctx.lineTo(width, height);
			ctx.stroke();

			// Draw visible notes
			const visStart = ct - 0.1;
			const visEnd = ct + visibleSeconds;

			for (const note of notesRef.current) {
				const noteEnd = note.time + note.duration;
				if (noteEnd < visStart || note.time > visEnd) continue;

				const x = getNoteX(note.midi, whiteKeyPositions, whiteKeyWidth);
				const noteWidth = getNoteWidth(note.midi, whiteKeyWidth);

				// Y: bottom = current time, top = future
				const yBottom = height - (note.time - ct) * pixelsPerSecond;
				const yTop = height - (noteEnd - ct) * pixelsPerSecond;
				const noteHeight = Math.max(yBottom - yTop, 4);

				const color = getNoteColor(note.track, isBlackKey(note.midi));
				const isActive = note.time <= ct && noteEnd > ct;

				// Glow for active notes
				if (isActive) {
					ctx.shadowColor = color;
					ctx.shadowBlur = 15;
				}

				// Note rectangle with rounded corners
				const radius = 3;
				ctx.fillStyle = isActive ? color : adjustAlpha(color, 0.8);
				ctx.beginPath();
				ctx.roundRect(x + 1, yTop, noteWidth - 2, noteHeight, radius);
				ctx.fill();

				// Border
				ctx.strokeStyle = isActive ? '#fff' : adjustAlpha(color, 0.4);
				ctx.lineWidth = isActive ? 2 : 1;
				ctx.stroke();

				ctx.shadowColor = 'transparent';
				ctx.shadowBlur = 0;
			}

			// Draw live notes (upward trail from piano)
			const currentLiveNotes = liveNotesRef.current;
			if (currentLiveNotes && currentLiveNotes.length > 0) {
				const now = performance.now() / 1000;
				const maxAge = height / pixelsPerSecond;

				for (const note of currentLiveNotes) {
					const noteEndTime = note.duration > 0 ? note.startTime + note.duration : now;
					const ageStart = now - note.startTime;
					const ageEnd = now - noteEndTime;

					if (ageStart > maxAge + 1) continue;

					const lx = getNoteX(note.midi, whiteKeyPositions, whiteKeyWidth);
					const lnoteWidth = getNoteWidth(note.midi, whiteKeyWidth);

					const lyTop = height - ageStart * pixelsPerSecond;
					const lyBottom = height - ageEnd * pixelsPerSecond;
					const lnoteHeight = Math.max(lyBottom - lyTop, 4);

					if (lyBottom < 0) continue;

					const lcolor = getLiveNoteColor(note.midi);
					const lActive = note.duration === 0;

					if (lActive) {
						ctx.shadowColor = lcolor;
						ctx.shadowBlur = 15;
					}

					const lradius = 3;
					ctx.fillStyle = lActive ? lcolor : adjustAlpha(lcolor, 0.7);
					ctx.beginPath();
					ctx.roundRect(lx + 1, lyTop, lnoteWidth - 2, lnoteHeight, lradius);
					ctx.fill();

					ctx.strokeStyle = lActive ? '#fff' : adjustAlpha(lcolor, 0.3);
					ctx.lineWidth = lActive ? 2 : 1;
					ctx.stroke();

					ctx.shadowColor = 'transparent';
					ctx.shadowBlur = 0;
				}
			}

			animFrameRef.current = requestAnimationFrame(draw);
		};

		animFrameRef.current = requestAnimationFrame(draw);

		return () => {
			cancelAnimationFrame(animFrameRef.current);
		};
	}, [pixelsPerSecond, visibleSeconds]);

	return <canvas ref={canvasRef} className="falling-notes-canvas" style={{ width: '100%', height: '100%', display: 'block' }} />;
});

function countWhiteKeys(start: number, end: number): number {
	let count = 0;
	for (let m = start; m <= end; m++) {
		if (!isBlackKey(m)) count++;
	}
	return count;
}

function getNoteX(midi: number, whiteKeyPositions: Map<number, number>, whiteKeyWidth: number): number {
	if (!isBlackKey(midi)) {
		const pos = whiteKeyPositions.get(midi) ?? 0;
		return pos * whiteKeyWidth;
	}
	// Black key: center between adjacent white keys
	const leftWhite = midi - 1;
	const rightWhite = midi + 1;
	const leftPos = whiteKeyPositions.get(leftWhite);
	const rightPos = whiteKeyPositions.get(rightWhite);
	if (leftPos !== undefined && rightPos !== undefined) {
		return ((leftPos + rightPos) / 2) * whiteKeyWidth + whiteKeyWidth * 0.15;
	}
	if (leftPos !== undefined) {
		return (leftPos + 0.5) * whiteKeyWidth + whiteKeyWidth * 0.15;
	}
	return 0;
}

function getNoteWidth(midi: number, whiteKeyWidth: number): number {
	return isBlackKey(midi) ? whiteKeyWidth * 0.7 : whiteKeyWidth;
}

function adjustAlpha(hex: string, alpha: number): string {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default FallingNotes;
