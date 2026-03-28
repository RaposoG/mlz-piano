import { memo, useCallback } from 'react';
import { generatePianoKeys, type ActiveNote, PIANO_START, PIANO_END } from '../types/midi';
import './Piano.css';

const pianoKeys = generatePianoKeys();
const whiteKeys = pianoKeys.filter((k) => !k.isBlack);
const WHITE_KEY_COUNT = whiteKeys.length;

interface PianoProps {
	activeNotes: Map<number, ActiveNote>;
	onNoteOn: (midi: number) => void;
	onNoteOff: (midi: number) => void;
}

const Piano = memo(function Piano({ activeNotes, onNoteOn, onNoteOff }: PianoProps) {
	const handleMouseDown = useCallback(
		(midi: number) => {
			onNoteOn(midi);
		},
		[onNoteOn],
	);

	const handleMouseUp = useCallback(
		(midi: number) => {
			onNoteOff(midi);
		},
		[onNoteOff],
	);

	// Calculate black key position based on white key index
	const getBlackKeyOffset = (midi: number): number => {
		// Count white keys before this note from PIANO_START
		let whiteCount = 0;
		for (let m = PIANO_START; m < midi; m++) {
			const noteInOctave = m % 12;
			if (![1, 3, 6, 8, 10].includes(noteInOctave)) {
				whiteCount++;
			}
		}

		const noteInOctave = midi % 12;
		// Offset adjustments for black keys to look realistic
		const offsets: Record<number, number> = {
			1: -0.35, // C#
			3: -0.15, // D#
			6: -0.35, // F#
			8: -0.25, // G#
			10: -0.1, // A#
		};
		const offset = offsets[noteInOctave] ?? -0.25;
		return ((whiteCount + 0.5 + offset) / WHITE_KEY_COUNT) * 100;
	};

	return (
		<div className="piano-container">
			<div className="piano">
				{/* White keys */}
				{pianoKeys
					.filter((k) => !k.isBlack)
					.map((k) => {
						const active = activeNotes.has(k.midi);
						const source = activeNotes.get(k.midi)?.source;
						return (
							<div
								key={k.midi}
								className={`piano-key white ${active ? `active ${source}` : ''}`}
								data-note={k.note}
								data-midi={k.midi}
								onMouseDown={() => handleMouseDown(k.midi)}
								onMouseUp={() => handleMouseUp(k.midi)}
								onMouseLeave={() => {
									if (activeNotes.get(k.midi)?.source === 'mouse') handleMouseUp(k.midi);
								}}
							>
								{k.note === 'C' && (
									<span className="key-label">
										{k.note}
										{k.octave}
									</span>
								)}
							</div>
						);
					})}
				{/* Black keys */}
				{pianoKeys
					.filter((k) => k.isBlack)
					.map((k) => {
						const active = activeNotes.has(k.midi);
						const source = activeNotes.get(k.midi)?.source;
						const left = getBlackKeyOffset(k.midi);
						return (
							<div
								key={k.midi}
								className={`piano-key black ${active ? `active ${source}` : ''}`}
								style={{ left: `${left}%` }}
								data-midi={k.midi}
								onMouseDown={() => handleMouseDown(k.midi)}
								onMouseUp={() => handleMouseUp(k.midi)}
								onMouseLeave={() => {
									if (activeNotes.get(k.midi)?.source === 'mouse') handleMouseUp(k.midi);
								}}
							/>
						);
					})}
			</div>
		</div>
	);
});

export default Piano;
export { PIANO_START, PIANO_END, WHITE_KEY_COUNT, whiteKeys };
