import { useState, useEffect, memo, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { ScannedMidiFile } from '../types/midi';
import './MidiLibrary.css';

interface MidiLibraryProps {
	onSelectFile: (path: string) => void;
	onBack: () => void;
}

const MidiLibrary = memo(function MidiLibrary({ onSelectFile, onBack }: MidiLibraryProps) {
	const [files, setFiles] = useState<ScannedMidiFile[]>([]);
	const [scanning, setScanning] = useState(true);
	const [search, setSearch] = useState('');

	useEffect(() => {
		(async () => {
			try {
				const result = await invoke<ScannedMidiFile[]>('scan_midi_files');
				setFiles(result);
			} catch (err) {
				console.error('Failed to scan MIDI files:', err);
			} finally {
				setScanning(false);
			}
		})();
	}, []);

	const filtered = useMemo(() => {
		if (!search) return files;
		const q = search.toLowerCase();
		return files.filter((f) => f.name.toLowerCase().includes(q) || f.folder.toLowerCase().includes(q));
	}, [files, search]);

	const grouped = useMemo(() => {
		const map: Record<string, ScannedMidiFile[]> = {};
		for (const f of filtered) {
			if (!map[f.folder]) map[f.folder] = [];
			map[f.folder].push(f);
		}
		return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
	}, [filtered]);

	const formatSize = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	return (
		<div className="library-view">
			<div className="library-header">
				<button className="back-btn" onClick={onBack}>
					<svg width="20" height="20" viewBox="0 0 20 20">
						<path d="M13 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
					Voltar
				</button>
				<h2 className="library-title">📚 Biblioteca MIDI</h2>
			</div>

			<div className="library-search-bar">
				<svg className="search-icon" width="16" height="16" viewBox="0 0 16 16">
					<circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
					<path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
				</svg>
				<input type="text" className="search-input" placeholder="Buscar arquivos MIDI..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
				{search && (
					<button className="search-clear" onClick={() => setSearch('')}>
						✕
					</button>
				)}
			</div>

			<div className="library-body">
				{scanning ? (
					<div className="library-status">
						<div className="scan-spinner" />
						<p>Escaneando seus arquivos...</p>
					</div>
				) : filtered.length === 0 ? (
					<div className="library-status">
						<p className="status-icon">🔍</p>
						<p>{files.length === 0 ? 'Nenhum arquivo MIDI encontrado' : 'Nenhum resultado para a busca'}</p>
						<p className="status-hint">Arquivos .mid são buscados em Downloads, Música, Documentos e Desktop</p>
					</div>
				) : (
					<>
						<div className="library-count">
							{filtered.length} arquivo{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
						</div>
						{grouped.map(([folder, folderFiles]) => (
							<div key={folder} className="library-group">
								<div className="group-header">
									<svg width="14" height="14" viewBox="0 0 14 14">
										<path d="M1 3.5C1 2.67 1.67 2 2.5 2h3l1.5 1.5h4.5c.83 0 1.5.67 1.5 1.5v6c0 .83-.67 1.5-1.5 1.5h-9C1.67 12.5 1 11.83 1 11V3.5z" stroke="currentColor" strokeWidth="1.2" fill="none" />
									</svg>
									<span className="group-name">{folder}</span>
									<span className="group-count">{folderFiles.length}</span>
								</div>
								{folderFiles.map((file) => (
									<button key={file.path} className="file-item" onClick={() => onSelectFile(file.path)}>
										<span className="file-icon">🎵</span>
										<span className="file-name">{file.name}</span>
										<span className="file-size">{formatSize(file.size)}</span>
									</button>
								))}
							</div>
						))}
					</>
				)}
			</div>
		</div>
	);
});

export default MidiLibrary;
