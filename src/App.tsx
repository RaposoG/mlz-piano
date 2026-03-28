import { useState, useCallback, useRef, useEffect } from 'react';
import { readFile } from '@tauri-apps/plugin-fs';
import { Midi } from '@tonejs/midi';
import Piano from './components/Piano';
import FallingNotes from './components/FallingNotes';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useMidiInput } from './hooks/useMidiInput';
import { useRecording } from './hooks/useRecording';
import { parseMidiFile } from './utils/midiParser';
import type { MidiFile, MidiNote, ActiveNote, LearningMode } from './types/midi';
import './App.css';

function App() {
	const [activeNotes, setActiveNotes] = useState<Map<number, ActiveNote>>(new Map());
	const [midiFile, setMidiFile] = useState<MidiFile | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [volume, setVolume] = useState(0.8);
	const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
	const [learningMode, setLearningMode] = useState<LearningMode>('off');
	const [trackStates, setTrackStates] = useState<{ name: string; enabled: boolean }[]>([]);

	const { noteOn, noteOff, playNote, setVolume: setAudioVolume } = useAudioEngine();
	const { isRecording, recordingDuration, startRecording, stopRecording, recordNoteOn, recordNoteOff, exportMidi } = useRecording();

	const playbackRef = useRef<{
		animFrame: number;
		startWallTime: number;
		startMidiTime: number;
		activeFileNotes: Set<string>;
	}>({ animFrame: 0, startWallTime: 0, startMidiTime: 0, activeFileNotes: new Set() });

	const currentTimeRef = useRef(0);
	const isPlayingRef = useRef(false);
	const midiFileRef = useRef<MidiFile | null>(null);
	const playbackSpeedRef = useRef(1.0);
	const learningModeRef = useRef<LearningMode>('off');
	const enabledTracksRef = useRef<Set<number>>(new Set());

	// Learning mode: track next expected notes
	const waitingForNotesRef = useRef<Set<number>>(new Set());

	currentTimeRef.current = currentTime;
	isPlayingRef.current = isPlaying;
	midiFileRef.current = midiFile;
	playbackSpeedRef.current = playbackSpeed;
	learningModeRef.current = learningMode;

	// Update enabled tracks ref
	useEffect(() => {
		const enabled = new Set<number>();
		trackStates.forEach((t, i) => {
			if (t.enabled) enabled.add(i);
		});
		enabledTracksRef.current = enabled;
	}, [trackStates]);

	// Volume change
	useEffect(() => {
		setAudioVolume(volume);
	}, [volume, setAudioVolume]);

	// Get filtered notes
	const getFilteredNotes = useCallback((): MidiNote[] => {
		if (!midiFile) return [];
		if (trackStates.length === 0) return midiFile.allNotes;
		return midiFile.allNotes.filter((n) => enabledTracksRef.current.has(n.track));
	}, [midiFile, trackStates]);

	// MIDI input handlers
	const handleMidiNoteOn = useCallback(
		(midi: number, velocity: number) => {
			noteOn(midi, velocity);
			recordNoteOn(midi, velocity);
			setActiveNotes((prev) => {
				const next = new Map(prev);
				next.set(midi, { midi, velocity, source: 'midi-input' });
				return next;
			});

			// Learning mode: check if this note was expected
			if (learningModeRef.current === 'wait' && waitingForNotesRef.current.size > 0) {
				waitingForNotesRef.current.delete(midi);
				// If all expected notes played, resume
				if (waitingForNotesRef.current.size === 0 && !isPlayingRef.current) {
					// Resume playback
					const pb = playbackRef.current;
					pb.startWallTime = performance.now();
					pb.startMidiTime = currentTimeRef.current;
					setIsPlaying(true);
				}
			}
		},
		[noteOn, recordNoteOn],
	);

	const handleMidiNoteOff = useCallback(
		(midi: number) => {
			noteOff(midi);
			recordNoteOff(midi);
			setActiveNotes((prev) => {
				const next = new Map(prev);
				if (next.get(midi)?.source === 'midi-input') {
					next.delete(midi);
				}
				return next;
			});
		},
		[noteOff, recordNoteOff],
	);

	const { devices, connected, connectAll, refreshDevices } = useMidiInput({
		onNoteOn: handleMidiNoteOn,
		onNoteOff: handleMidiNoteOff,
	});

	// Mouse piano handlers
	const handlePianoNoteOn = useCallback(
		(midi: number) => {
			noteOn(midi, 0.7);
			recordNoteOn(midi, 0.7);
			setActiveNotes((prev) => {
				const next = new Map(prev);
				next.set(midi, { midi, velocity: 0.7, source: 'mouse' });
				return next;
			});
		},
		[noteOn, recordNoteOn],
	);

	const handlePianoNoteOff = useCallback(
		(midi: number) => {
			noteOff(midi);
			recordNoteOff(midi);
			setActiveNotes((prev) => {
				const next = new Map(prev);
				if (next.get(midi)?.source === 'mouse') {
					next.delete(midi);
				}
				return next;
			});
		},
		[noteOff, recordNoteOff],
	);

	// Load file from file picker
	const handleLoadFile = useCallback(() => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.mid,.midi';
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;
			try {
				const parsed = await parseMidiFile(file);
				setMidiFile(parsed);
				setCurrentTime(0);
				setIsPlaying(false);
				cancelAnimationFrame(playbackRef.current.animFrame);
				setTrackStates(parsed.tracks.map((t) => ({ name: t.name, enabled: true })));
			} catch (err) {
				console.error('Failed to parse MIDI file:', err);
			}
		};
		input.click();
	}, []);

	// Load file from scanned path (via Tauri fs)
	const handleSelectFile = useCallback(async (path: string) => {
		try {
			const data = await readFile(path);
			const midi = new Midi(data.buffer);
			const tracks = midi.tracks.map((track, index) => {
				const notes: MidiNote[] = track.notes.map((note) => ({
					midi: note.midi,
					name: note.name,
					time: note.time,
					duration: note.duration,
					velocity: note.velocity,
					track: index,
				}));
				return { name: track.name || `Track ${index + 1}`, notes, instrument: track.instrument?.name || 'Piano' };
			});
			const allNotes = tracks.flatMap((t) => t.notes).sort((a, b) => a.time - b.time);
			const name =
				path
					.split(/[\\/]/)
					.pop()
					?.replace(/\.mid[i]?$/i, '') || 'Unknown';
			const parsed: MidiFile = {
				name,
				duration: midi.duration,
				bpm: midi.header.tempos[0]?.bpm ?? 120,
				tracks,
				allNotes,
			};
			setMidiFile(parsed);
			setCurrentTime(0);
			setIsPlaying(false);
			cancelAnimationFrame(playbackRef.current.animFrame);
			setTrackStates(parsed.tracks.map((t) => ({ name: t.name, enabled: true })));
			setSidebarOpen(false);
		} catch (err) {
			console.error('Failed to load MIDI from path:', err);
		}
	}, []);

	// Playback loop
	const playbackLoop = useCallback(() => {
		if (!isPlayingRef.current || !midiFileRef.current) return;

		const pb = playbackRef.current;
		const elapsed = ((performance.now() - pb.startWallTime) / 1000) * playbackSpeedRef.current;
		const ct = pb.startMidiTime + elapsed;

		if (ct >= midiFileRef.current.duration) {
			setIsPlaying(false);
			setCurrentTime(midiFileRef.current.duration);
			setActiveNotes((prev) => {
				const next = new Map(prev);
				for (const [, note] of next) {
					if (note.source === 'file') next.delete(note.midi);
				}
				return next;
			});
			return;
		}

		setCurrentTime(ct);

		const enabled = enabledTracksRef.current;
		const notes = midiFileRef.current.allNotes;

		// Learning "wait" mode: find next notes and pause
		if (learningModeRef.current === 'wait') {
			for (const note of notes) {
				if (!enabled.has(note.track)) continue;
				if (note.time > ct && note.time <= ct + 0.05) {
					// Upcoming notes: pause and wait for user to play them
					waitingForNotesRef.current.add(note.midi);
				}
			}
			if (waitingForNotesRef.current.size > 0) {
				setIsPlaying(false);
				cancelAnimationFrame(pb.animFrame);
				return;
			}
		}

		for (const note of notes) {
			if (!enabled.has(note.track)) continue;

			const noteKey = `${note.track}-${note.midi}-${note.time.toFixed(4)}`;
			const noteEnd = note.time + note.duration;

			if (note.time <= ct && noteEnd > ct && !pb.activeFileNotes.has(noteKey)) {
				pb.activeFileNotes.add(noteKey);
				playNote(note.midi, note.duration / playbackSpeedRef.current, note.velocity);
				setActiveNotes((prev) => {
					const next = new Map(prev);
					next.set(note.midi, { midi: note.midi, velocity: note.velocity, source: 'file' });
					return next;
				});

				const remainingMs = ((noteEnd - ct) / playbackSpeedRef.current) * 1000;
				setTimeout(() => {
					setActiveNotes((prev) => {
						const next = new Map(prev);
						if (next.get(note.midi)?.source === 'file') {
							next.delete(note.midi);
						}
						return next;
					});
				}, remainingMs);
			}
		}

		pb.animFrame = requestAnimationFrame(playbackLoop);
	}, [playNote]);

	const handlePlay = useCallback(() => {
		if (!midiFile) return;
		const pb = playbackRef.current;
		pb.startWallTime = performance.now();
		pb.startMidiTime = currentTimeRef.current;
		pb.activeFileNotes = new Set();
		waitingForNotesRef.current.clear();
		setIsPlaying(true);
	}, [midiFile]);

	const handlePause = useCallback(() => {
		setIsPlaying(false);
		cancelAnimationFrame(playbackRef.current.animFrame);
	}, []);

	const handleStop = useCallback(() => {
		setIsPlaying(false);
		setCurrentTime(0);
		cancelAnimationFrame(playbackRef.current.animFrame);
		playbackRef.current.activeFileNotes = new Set();
		waitingForNotesRef.current.clear();
		setActiveNotes((prev) => {
			const next = new Map(prev);
			for (const [, note] of next) {
				if (note.source === 'file') next.delete(note.midi);
			}
			return next;
		});
	}, []);

	const handleRewind = useCallback(() => {
		const newTime = Math.max(0, currentTimeRef.current - 5);
		setCurrentTime(newTime);
		playbackRef.current.activeFileNotes = new Set();
		waitingForNotesRef.current.clear();
		if (isPlayingRef.current) {
			playbackRef.current.startWallTime = performance.now();
			playbackRef.current.startMidiTime = newTime;
		}
	}, []);

	const handleSeek = useCallback((time: number) => {
		setCurrentTime(time);
		playbackRef.current.activeFileNotes = new Set();
		waitingForNotesRef.current.clear();
		if (isPlayingRef.current) {
			playbackRef.current.startWallTime = performance.now();
			playbackRef.current.startMidiTime = time;
		}
	}, []);

	const handleToggleTrack = useCallback((index: number) => {
		setTrackStates((prev) => prev.map((t, i) => (i === index ? { ...t, enabled: !t.enabled } : t)));
	}, []);

	// Start/stop playback loop
	useEffect(() => {
		if (isPlaying) {
			playbackRef.current.animFrame = requestAnimationFrame(playbackLoop);
		} else {
			cancelAnimationFrame(playbackRef.current.animFrame);
		}
		return () => {
			cancelAnimationFrame(playbackRef.current.animFrame);
		};
	}, [isPlaying, playbackLoop]);

	const filteredNotes = getFilteredNotes();

	return (
		<div className="app">
			<Sidebar
				isOpen={sidebarOpen}
				onToggle={() => setSidebarOpen(!sidebarOpen)}
				onSelectFile={handleSelectFile}
				onLoadFile={handleLoadFile}
				midiFile={midiFile}
				midiDevices={devices}
				midiConnected={connected}
				onConnectAll={connectAll}
				onRefreshDevices={refreshDevices}
				volume={volume}
				onVolumeChange={setVolume}
				playbackSpeed={playbackSpeed}
				onSpeedChange={setPlaybackSpeed}
				isRecording={isRecording}
				onToggleRecording={isRecording ? stopRecording : startRecording}
				onExportRecording={exportMidi}
				recordingDuration={recordingDuration}
				learningMode={learningMode}
				onLearningModeChange={setLearningMode}
				tracks={trackStates}
				onToggleTrack={handleToggleTrack}
			/>
			<Toolbar midiFile={midiFile} isPlaying={isPlaying} currentTime={currentTime} onPlay={handlePlay} onPause={handlePause} onStop={handleStop} onSeek={handleSeek} onRewind={handleRewind} isRecording={isRecording} />
			<div className="falling-notes-area">
				{midiFile ? (
					<FallingNotes notes={filteredNotes} currentTime={currentTime} isPlaying={isPlaying} />
				) : (
					<div className="empty-state">
						<p>🎹 MLZ Piano</p>
						<p className="subtitle">Conecte seu teclado MIDI ou abra um arquivo .mid para começar</p>
					</div>
				)}
			</div>
			<Piano activeNotes={activeNotes} onNoteOn={handlePianoNoteOn} onNoteOff={handlePianoNoteOff} />
		</div>
	);
}

export default App;
