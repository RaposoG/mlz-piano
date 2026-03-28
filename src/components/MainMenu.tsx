import { memo } from 'react';
import type { AppView } from '../types/midi';
import './MainMenu.css';

interface MainMenuProps {
	onNavigate: (view: AppView) => void;
	midiConnected: boolean;
}

const menuItems: { view: AppView; icon: string; title: string; subtitle: string; color: string }[] = [
	{ view: 'free', icon: '🎹', title: 'Modo Livre', subtitle: 'Toque livremente seu piano', color: '#3a7afe' },
	{ view: 'learning', icon: '🎓', title: 'Aprender', subtitle: 'Aprenda com arquivos MIDI', color: '#7c3aed' },
	{ view: 'library', icon: '📚', title: 'Biblioteca', subtitle: 'Navegue seus arquivos MIDI', color: '#0ea5e9' },
	{ view: 'settings', icon: '⚙️', title: 'Configurações', subtitle: 'Volume, velocidade e MIDI', color: '#64748b' },
];

const MainMenu = memo(function MainMenu({ onNavigate, midiConnected }: MainMenuProps) {
	return (
		<div className="main-menu">
			<div className="menu-bg">
				<div className="menu-glow glow-1" />
				<div className="menu-glow glow-2" />
				<div className="menu-glow glow-3" />
			</div>

			<div className="menu-content">
				<div className="menu-header">
					<h1 className="menu-title">
						<span className="menu-logo">🎹</span>
						MLZ Piano
					</h1>
					<p className="menu-subtitle">Seu estúdio de piano digital</p>
					{midiConnected && (
						<div className="menu-midi-badge">
							<span className="midi-dot" />
							MIDI Conectado
						</div>
					)}
				</div>

				<div className="menu-grid">
					{menuItems.map((item) => (
						<button key={item.view} className="menu-card" onClick={() => onNavigate(item.view)} style={{ '--card-color': item.color } as React.CSSProperties}>
							<div className="card-icon">{item.icon}</div>
							<div className="card-text">
								<span className="card-title">{item.title}</span>
								<span className="card-subtitle">{item.subtitle}</span>
							</div>
							<svg className="card-arrow" width="20" height="20" viewBox="0 0 20 20">
								<path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</button>
					))}
				</div>

				<div className="menu-footer">
					<span className="footer-hint">Pressione qualquer tecla no seu piano para começar</span>
				</div>
			</div>
		</div>
	);
});

export default MainMenu;
