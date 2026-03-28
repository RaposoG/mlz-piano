import { memo } from 'react';
import type { MidiFile, LearningMode, AppView } from '../types/midi';
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
	onBack: () => void;
	onLoadFile: () => void;
	currentView: AppView;
	learningMode: LearningMode;
}

const Toolbar = memo(function Toolbar({ midiFile, isPlaying, currentTime, onPlay, onPause, onStop, onSeek, onRewind, isRecording, onBack, onLoadFile, currentView, learningMode }: ToolbarProps) {
	const formatTime = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m}:${s.toString().padStart(2, '0')}`;
	};

	return (
		<div className="toolbar">
			<button className="toolbar-back" onClick={onBack} title="Menu">
				<svg width="18" height="18" viewBox="0 0 18 18">
					<path d="M12 3L5 9l7 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</button>

			<div className="toolbar-mode-badge" data-mode={currentView}>
				{currentView === 'learning' ? '🎓' : '🎹'}
				<span>{currentView === 'learning' ? 'Aprendizado' : 'Livre'}</span>
				{learningMode === 'wait' && currentView === 'learning' && <span className="mode-wait-tag">Esperar</span>}
			</div>

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
			) : currentView === 'free' ? (
				<div className="toolbar-center">
					<span className="free-mode-label">Toque livremente</span>
				</div>
			) : (
				<div className="toolbar-center">
					<button className="open-file-btn" onClick={onLoadFile}>
						<svg width="16" height="16" viewBox="0 0 16 16">
							<path d="M2 4.5C2 3.67 2.67 3 3.5 3h3l1.5 1.5h5c.83 0 1.5.67 1.5 1.5V12c0 .83-.67 1.5-1.5 1.5h-10C2.67 13.5 2 12.83 2 12V4.5z" stroke="currentColor" strokeWidth="1.3" fill="none" />
						</svg>
						Abrir MIDI
					</button>
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
