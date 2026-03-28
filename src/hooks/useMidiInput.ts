import { useEffect, useRef, useState, useCallback } from 'react';

export interface MidiInputDevice {
	id: string;
	name: string;
}

interface UseMidiInputOptions {
	onNoteOn: (midi: number, velocity: number) => void;
	onNoteOff: (midi: number) => void;
}

export function useMidiInput({ onNoteOn, onNoteOff }: UseMidiInputOptions) {
	const [devices, setDevices] = useState<MidiInputDevice[]>([]);
	const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
	const [connected, setConnected] = useState(false);
	const midiAccessRef = useRef<MIDIAccess | null>(null);
	const callbacksRef = useRef({ onNoteOn, onNoteOff });

	callbacksRef.current = { onNoteOn, onNoteOff };

	const handleMidiMessage = useCallback((event: MIDIMessageEvent) => {
		const data = event.data;
		if (!data || data.length < 3) return;

		const status = data[0] & 0xf0;
		const note = data[1];
		const velocity = data[2];

		if (status === 0x90 && velocity > 0) {
			callbacksRef.current.onNoteOn(note, velocity / 127);
		} else if (status === 0x80 || (status === 0x90 && velocity === 0)) {
			callbacksRef.current.onNoteOff(note);
		}
	}, []);

	const refreshDevices = useCallback(async () => {
		if (!navigator.requestMIDIAccess) return;

		try {
			const access = await navigator.requestMIDIAccess({ sysex: false });
			midiAccessRef.current = access;

			const inputDevices: MidiInputDevice[] = [];
			access.inputs.forEach((input) => {
				inputDevices.push({ id: input.id, name: input.name || 'Unknown MIDI Device' });
			});
			setDevices(inputDevices);

			access.onstatechange = () => {
				const updated: MidiInputDevice[] = [];
				access.inputs.forEach((input) => {
					updated.push({ id: input.id, name: input.name || 'Unknown MIDI Device' });
				});
				setDevices(updated);
			};
		} catch (err) {
			console.error('MIDI access denied:', err);
		}
	}, []);

	const connectDevice = useCallback(
		(deviceId: string) => {
			const access = midiAccessRef.current;
			if (!access) return;

			// disconnect previous
			access.inputs.forEach((input) => {
				input.onmidimessage = null;
			});

			const input = access.inputs.get(deviceId);
			if (input) {
				input.onmidimessage = handleMidiMessage;
				setSelectedDevice(deviceId);
				setConnected(true);
			}
		},
		[handleMidiMessage],
	);

	const connectAll = useCallback(() => {
		const access = midiAccessRef.current;
		if (!access) return;

		access.inputs.forEach((input) => {
			input.onmidimessage = handleMidiMessage;
		});
		setSelectedDevice('all');
		setConnected(true);
	}, [handleMidiMessage]);

	useEffect(() => {
		refreshDevices();

		return () => {
			if (midiAccessRef.current) {
				midiAccessRef.current.inputs.forEach((input) => {
					input.onmidimessage = null;
				});
			}
		};
	}, [refreshDevices]);

	// Auto-connect all devices on startup
	useEffect(() => {
		if (devices.length > 0 && !connected) {
			connectAll();
		}
	}, [devices, connected, connectAll]);

	return { devices, selectedDevice, connected, connectDevice, connectAll, refreshDevices };
}
