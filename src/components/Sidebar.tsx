import { useState, useEffect, memo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { ScannedMidiFile, MidiFile, LearningMode } from '../types/midi';
import type { MidiInputDevice } from '../hooks/useMidiInput';
import './Sidebar.css';

interface SidebarProps {
	isOpen: boolean;
	onToggle: () => void;
	onSelectFile: (path: string) => void;
	onLoadFile: () => void;
	midiFile: MidiFile | null;
	// MIDI devices
	midiDevices: MidiInputDevice[];
	midiConnected: boolean;
	onConnectAll: () => void;
	onRefreshDevices: () => void;
	// Controls
	volume: number;
	onVolumeChange: (v: number) => void;
	playbackSpeed: number;
	onSpeedChange: (s: number) => void;
	// Recording
	isRecording: boolean;
	onToggleRecording: () => void;
	onExportRecording: () => void;
	recordingDuration: number;
	// Learning
	learningMode: LearningMode;
	onLearningModeChange: (mode: LearningMode) => void;
	// Tracks
	tracks: { name: string; enabled: boolean }[];
	onToggleTrack: (index: number) => void;
}

const Sidebar = memo(function Sidebar({ isOpen, onToggle, onSelectFile, onLoadFile, midiFile, midiDevices, midiConnected, onConnectAll, onRefreshDevices, volume, onVolumeChange, playbackSpeed, onSpeedChange, isRecording, onToggleRecording, onExportRecording, recordingDuration, learningMode, onLearningModeChange, tracks, onToggleTrack }: SidebarProps) {
	const [scannedFiles, setScannedFiles] = useState<ScannedMidiFile[]>([]);
	const [scanning, setScanning] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [activeSection, setActiveSection] = useState<string>('library');

	useEffect(() => {
		scanFiles();
	}, []);

	const scanFiles = async () => {
		setScanning(true);
		try {
			const files = await invoke<ScannedMidiFile[]>('scan_midi_files');
			setScannedFiles(files);
		} catch (err) {
			console.error('Failed to scan MIDI files:', err);
		} finally {
			setScanning(false);
		}
	};

	const filteredFiles = scannedFiles.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.folder.toLowerCase().includes(searchQuery.toLowerCase()));

	const groupedFiles = filteredFiles.reduce(
		(acc, file) => {
			if (!acc[file.folder]) acc[file.folder] = [];
			acc[file.folder].push(file);
			return acc;
		},
		{} as Record<string, ScannedMidiFile[]>,
	);

	const formatSize = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	const formatRecTime = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m}:${s.toString().padStart(2, '0')}`;
	};

	return (
		<>
			<button className={`sidebar-toggle ${isOpen ? 'open' : ''}`} onClick={onToggle}>
				{isOpen ? '✕' : '☰'}
			</button>

			<div className={`sidebar ${isOpen ? 'open' : ''}`}>
				<div className="sidebar-header">
					<h2>🎹 MLZ Piano</h2>
				</div>

				{/* Nav tabs */}
				<div className="sidebar-nav">
					{[
						{ id: 'library', icon: '📚', label: 'Biblioteca' },
						{ id: 'controls', icon: '🎛️', label: 'Controles' },
						{ id: 'record', icon: '⏺', label: 'Gravar' },
						{ id: 'learn', icon: '🎓', label: 'Aprender' },
						{ id: 'midi', icon: '🔌', label: 'MIDI' },
					].map((tab) => (
						<button key={tab.id} className={`nav-tab ${activeSection === tab.id ? 'active' : ''}`} onClick={() => setActiveSection(tab.id)}>
							<span className="nav-icon">{tab.icon}</span>
							<span className="nav-label">{tab.label}</span>
						</button>
					))}
				</div>

				<div className="sidebar-content">
					{/* ====== LIBRARY ====== */}
					{activeSection === 'library' && (
						<div className="section">
							<div className="section-actions">
								<button className="action-btn primary" onClick={onLoadFile}>
									📂 Abrir Arquivo
								</button>
								<button className="action-btn" onClick={scanFiles} disabled={scanning}>
									{scanning ? '⏳' : '🔄'} Reescanear
								</button>
							</div>

							<div className="search-box">
								<input type="text" placeholder="Buscar MIDI..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
							</div>

							{scannedFiles.length === 0 && !scanning && (
								<div className="empty-list">
									<p>Nenhum arquivo MIDI encontrado</p>
									<p className="hint">Coloque arquivos .mid nas pastas Downloads, Música, Documentos ou Desktop</p>
								</div>
							)}

							{scanning && (
								<div className="scanning-indicator">
									<div className="spinner" />
									<span>Buscando arquivos MIDI...</span>
								</div>
							)}

							<div className="file-list">
								{Object.entries(groupedFiles).map(([folder, files]) => (
									<div key={folder} className="folder-group">
										<div className="folder-header">
											<span className="folder-icon">📁</span>
											<span className="folder-name">{folder}</span>
											<span className="folder-count">{files.length}</span>
										</div>
										{files.map((file) => (
											<button key={file.path} className={`file-item ${midiFile?.name === file.name ? 'active' : ''}`} onClick={() => onSelectFile(file.path)} title={file.path}>
												<span className="file-icon">🎵</span>
												<div className="file-info">
													<span className="file-name">{file.name}</span>
													<span className="file-size">{formatSize(file.size)}</span>
												</div>
											</button>
										))}
									</div>
								))}
							</div>
						</div>
					)}

					{/* ====== CONTROLS ====== */}
					{activeSection === 'controls' && (
						<div className="section">
							<h3 className="section-title">Volume</h3>
							<div className="control-row">
								<span className="control-icon">🔈</span>
								<input type="range" className="slider" min={0} max={1} step={0.01} value={volume} onChange={(e) => onVolumeChange(parseFloat(e.target.value))} />
								<span className="control-value">{Math.round(volume * 100)}%</span>
							</div>

							<h3 className="section-title">Velocidade</h3>
							<div className="control-row">
								<span className="control-icon">⏩</span>
								<input type="range" className="slider" min={0.25} max={2} step={0.05} value={playbackSpeed} onChange={(e) => onSpeedChange(parseFloat(e.target.value))} />
								<span className="control-value">{playbackSpeed.toFixed(2)}x</span>
							</div>
							<div className="speed-presets">
								{[0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
									<button key={s} className={`preset-btn ${playbackSpeed === s ? 'active' : ''}`} onClick={() => onSpeedChange(s)}>
										{s}x
									</button>
								))}
							</div>

							{midiFile && tracks.length > 0 && (
								<>
									<h3 className="section-title">Tracks</h3>
									<div className="track-list">
										{tracks.map((track, i) => (
											<label key={i} className="track-item">
												<input type="checkbox" checked={track.enabled} onChange={() => onToggleTrack(i)} />
												<span className="track-color" style={{ background: TRACK_COLORS[i % TRACK_COLORS.length] }} />
												<span className="track-name">{track.name || `Track ${i + 1}`}</span>
											</label>
										))}
									</div>
								</>
							)}
						</div>
					)}

					{/* ====== RECORDING ====== */}
					{activeSection === 'record' && (
						<div className="section">
							<div className="record-status">
								<div className={`record-indicator ${isRecording ? 'recording' : ''}`}>
									<span className="rec-dot" />
									<span>{isRecording ? 'Gravando...' : 'Pronto para gravar'}</span>
								</div>
								{isRecording && <span className="rec-time">{formatRecTime(recordingDuration)}</span>}
							</div>

							<div className="record-actions">
								<button className={`action-btn ${isRecording ? 'danger' : 'record'}`} onClick={onToggleRecording}>
									{isRecording ? '⏹ Parar' : '⏺ Gravar'}
								</button>
								{!isRecording && (
									<button className="action-btn" onClick={onExportRecording}>
										💾 Exportar MIDI
									</button>
								)}
							</div>

							<div className="record-hint">
								<p>
									Pressione <strong>Gravar</strong> e toque no seu piano MIDI.
								</p>
								<p>As notas serão capturadas e você pode exportar como arquivo .mid</p>
							</div>
						</div>
					)}

					{/* ====== LEARN ====== */}
					{activeSection === 'learn' && (
						<div className="section">
							{!midiFile ? (
								<div className="empty-list">
									<p>Carregue um arquivo MIDI para usar o modo aprendizado</p>
								</div>
							) : (
								<>
									<h3 className="section-title">Modo de Aprendizado</h3>
									<div className="learn-modes">
										<button className={`learn-mode-btn ${learningMode === 'off' ? 'active' : ''}`} onClick={() => onLearningModeChange('off')}>
											<span className="mode-icon">▶</span>
											<div className="mode-info">
												<strong>Normal</strong>
												<span>Reproduz sem pausas</span>
											</div>
										</button>
										<button className={`learn-mode-btn ${learningMode === 'wait' ? 'active' : ''}`} onClick={() => onLearningModeChange('wait')}>
											<span className="mode-icon">⏸</span>
											<div className="mode-info">
												<strong>Esperar</strong>
												<span>Pausa até você tocar a nota certa</span>
											</div>
										</button>
										<button className={`learn-mode-btn ${learningMode === 'practice' ? 'active' : ''}`} onClick={() => onLearningModeChange('practice')}>
											<span className="mode-icon">🎯</span>
											<div className="mode-info">
												<strong>Praticar</strong>
												<span>Mostra notas erradas e marca acertos</span>
											</div>
										</button>
									</div>
								</>
							)}
						</div>
					)}

					{/* ====== MIDI DEVICES ====== */}
					{activeSection === 'midi' && (
						<div className="section">
							<div className="midi-header">
								<div className={`midi-status-big ${midiConnected ? 'connected' : ''}`}>
									<span className="status-dot-big" />
									<span>{midiConnected ? 'Conectado' : 'Desconectado'}</span>
								</div>
								<button className="action-btn" onClick={onRefreshDevices}>
									🔄 Atualizar
								</button>
							</div>

							{midiDevices.length === 0 ? (
								<div className="empty-list">
									<p>Nenhum dispositivo MIDI encontrado</p>
									<p className="hint">Conecte seu teclado/piano MIDI via USB e clique atualizar</p>
								</div>
							) : (
								<div className="device-list">
									{midiDevices.map((d) => (
										<div key={d.id} className="device-item">
											<span className="device-icon">🎹</span>
											<span className="device-name">{d.name}</span>
										</div>
									))}
									{!midiConnected && (
										<button className="action-btn primary" onClick={onConnectAll}>
											Conectar Todos
										</button>
									)}
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			{isOpen && <div className="sidebar-overlay" onClick={onToggle} />}
		</>
	);
});

const TRACK_COLORS = ['#4a9eff', '#ff6b6b', '#51cf66', '#ffd43b', '#cc5de8', '#ff922b', '#22b8cf', '#ff6b9d'];

export default Sidebar;
