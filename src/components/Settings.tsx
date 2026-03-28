import { memo } from 'react';
import type { MidiInputDevice } from '../hooks/useMidiInput';
import type { LearningMode } from '../types/midi';
import './Settings.css';

interface SettingsProps {
	onBack: () => void;
	volume: number;
	onVolumeChange: (v: number) => void;
	playbackSpeed: number;
	onSpeedChange: (s: number) => void;
	learningMode: LearningMode;
	onLearningModeChange: (m: LearningMode) => void;
	midiDevices: MidiInputDevice[];
	midiConnected: boolean;
	onConnectAll: () => void;
	onRefreshDevices: () => void;
	tracks: { name: string; enabled: boolean }[];
	onToggleTrack: (index: number) => void;
	isRecording: boolean;
	onToggleRecording: () => void;
	onExportRecording: () => void;
	recordingDuration: number;
}

const speedPresets = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

const Settings = memo(function Settings({ onBack, volume, onVolumeChange, playbackSpeed, onSpeedChange, learningMode, onLearningModeChange, midiDevices, midiConnected, onConnectAll, onRefreshDevices, tracks, onToggleTrack, isRecording, onToggleRecording, onExportRecording, recordingDuration }: SettingsProps) {
	const formatRecTime = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m}:${s.toString().padStart(2, '0')}`;
	};

	return (
		<div className="settings-view">
			<div className="settings-header">
				<button className="back-btn" onClick={onBack}>
					<svg width="20" height="20" viewBox="0 0 20 20">
						<path d="M13 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
					Voltar
				</button>
				<h2 className="settings-title">⚙️ Configurações</h2>
			</div>

			<div className="settings-body">
				{/* Audio section */}
				<section className="settings-section">
					<h3 className="section-title">🔊 Áudio</h3>
					<div className="setting-row">
						<label className="setting-label">Volume</label>
						<div className="setting-control">
							<input type="range" className="range-slider" min={0} max={1} step={0.01} value={volume} onChange={(e) => onVolumeChange(parseFloat(e.target.value))} />
							<span className="range-value">{Math.round(volume * 100)}%</span>
						</div>
					</div>
					<div className="setting-row">
						<label className="setting-label">Velocidade</label>
						<div className="speed-presets">
							{speedPresets.map((s) => (
								<button key={s} className={`speed-btn ${playbackSpeed === s ? 'active' : ''}`} onClick={() => onSpeedChange(s)}>
									{s}x
								</button>
							))}
						</div>
					</div>
				</section>

				{/* Learning section */}
				<section className="settings-section">
					<h3 className="section-title">🎓 Aprendizado</h3>
					<div className="setting-row">
						<label className="setting-label">Modo</label>
						<div className="mode-options">
							{[
								{ mode: 'off' as const, label: 'Desligado', desc: 'Reprodução normal' },
								{ mode: 'wait' as const, label: 'Esperar', desc: 'Pausa até você tocar a nota certa' },
								{ mode: 'practice' as const, label: 'Prática', desc: 'Toque no seu ritmo' },
							].map((opt) => (
								<button key={opt.mode} className={`mode-btn ${learningMode === opt.mode ? 'active' : ''}`} onClick={() => onLearningModeChange(opt.mode)}>
									<span className="mode-label">{opt.label}</span>
									<span className="mode-desc">{opt.desc}</span>
								</button>
							))}
						</div>
					</div>
				</section>

				{/* Recording section */}
				<section className="settings-section">
					<h3 className="section-title">⏺ Gravação</h3>
					<div className="setting-row">
						<div className="rec-controls">
							<button className={`rec-btn ${isRecording ? 'recording' : ''}`} onClick={onToggleRecording}>
								{isRecording ? (
									<>
										<span className="rec-dot" />
										Parar ({formatRecTime(recordingDuration)})
									</>
								) : (
									'Iniciar Gravação'
								)}
							</button>
							{!isRecording && recordingDuration > 0 && (
								<button className="export-btn" onClick={onExportRecording}>
									Exportar .mid
								</button>
							)}
						</div>
					</div>
				</section>

				{/* Tracks section */}
				{tracks.length > 0 && (
					<section className="settings-section">
						<h3 className="section-title">🎼 Faixas</h3>
						<div className="tracks-list">
							{tracks.map((track, i) => (
								<label key={i} className="track-row">
									<input type="checkbox" checked={track.enabled} onChange={() => onToggleTrack(i)} className="track-checkbox" />
									<span className="track-name">{track.name || `Faixa ${i + 1}`}</span>
								</label>
							))}
						</div>
					</section>
				)}

				{/* MIDI section */}
				<section className="settings-section">
					<h3 className="section-title">🔌 Dispositivos MIDI</h3>
					<div className="midi-status">
						<span className={`midi-indicator ${midiConnected ? 'connected' : ''}`} />
						<span>{midiConnected ? 'Conectado' : 'Desconectado'}</span>
					</div>
					{midiDevices.length > 0 ? (
						<div className="midi-devices">
							{midiDevices.map((d) => (
								<div key={d.id} className="midi-device">
									<span className="device-name">{d.name}</span>
								</div>
							))}
						</div>
					) : (
						<p className="midi-hint">Nenhum dispositivo MIDI detectado</p>
					)}
					<div className="midi-actions">
						<button className="action-btn" onClick={onConnectAll}>
							Reconectar
						</button>
						<button className="action-btn" onClick={onRefreshDevices}>
							Atualizar
						</button>
					</div>
				</section>
			</div>
		</div>
	);
});

export default Settings;
