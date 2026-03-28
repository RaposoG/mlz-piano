import { memo } from 'react';
import type { MidiFile } from '../types/midi';
import './Toolbar.css';

interface ToolbarProps {
	midiFile: MidiFile | null;
	isPlaying: boolean;
	currentTime: number;
	onPlay: () => void;
	onPause: () => void;
	onStop: () => void;
	onSeek: (time: number) => void;
	onRewind: () => void;
	isRecording: boolean;
}

const Toolbar = memo(function Toolbar({ midiFile, isPlaying, currentTime, onPlay, onPause, onStop, onSeek, onRewind, isRecording }: ToolbarProps) {
	const formatTime = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m}:${s.toString().padStart(2, '0')}`;
	};

	return (
		<div className="toolbar">
			{/* Left spacer for sidebar toggle */}
			<div className="toolbar-spacer" />

			{midiFile ? (
				<div className="toolbar-center">
					<div className="transport-controls">
						<button className="transport-btn" onClick={onStop} title="Parar">
							<svg width="14" height="14" viewBox="0 0 14 14">
								<rect x="2" y="2" width="10" height="10" fill="currentColor" rx="1" />
							</svg>
						</button>
						<button className="transport-btn" onClick={onRewind} title="Rebobinar">
							<svg width="14" height="14" viewBox="0 0 14 14">
								<path d="M7 2L1 7l6 5V2zM13 2L7 7l6 5V2z" fill="currentColor" />
							</svg>
						</button>
						<button className="transport-btn play" onClick={isPlaying ? onPause : onPlay}>
							{isPlaying ? (
								<svg width="16" height="16" viewBox="0 0 16 16">
									<rect x="3" y="2" width="4" height="12" rx="1" fill="currentColor" />
									<rect x="9" y="2" width="4" height="12" rx="1" fill="currentColor" />
								</svg>
							) : (
								<svg width="16" height="16" viewBox="0 0 16 16">
									<path d="M4 2l10 6-10 6V2z" fill="currentColor" />
								</svg>
							)}
						</button>
					</div>

					<div className="seek-section">
						<span className="time-label">{formatTime(currentTime)}</span>
						<input type="range" className="seek-bar" min={0} max={midiFile.duration} step={0.1} value={currentTime} onChange={(e) => onSeek(parseFloat(e.target.value))} />
						<span className="time-label">{formatTime(midiFile.duration)}</span>
					</div>

					<div className="song-info">
						<span className="song-name">{midiFile.name}</span>
						<span className="song-bpm">{Math.round(midiFile.bpm)} BPM</span>
					</div>
				</div>
			) : (
				<div className="toolbar-center">
					<span className="no-file-hint">Abra um arquivo MIDI no menu lateral</span>
				</div>
			)}

			{isRecording && (
				<div className="rec-badge">
					<span className="rec-badge-dot" />
					REC
				</div>
			)}
		</div>
	);
});

export default Toolbar;
