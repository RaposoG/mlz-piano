# MLZ Piano

## What This Is

Um piano digital open-source desktop (Tauri 2 + React 19) com visualização estilo Synthesia, suporte completo a MIDI hardware, modos de aprendizado e gravação. Voltado para iniciantes aprendendo piano e músicos praticando, com foco igual em ambos os públicos.

## Core Value

Ser a ferramenta de prática de piano mais completa e acessível em desktop — combinar visualização intuitiva de notas, feedback inteligente de prática, e qualidade sonora customizável em uma experiência integrada.

## Requirements

### Validated

- ✓ Piano de 88 teclas com samples reais (Salamander) — v0.1
- ✓ Entrada MIDI com detecção automática de dispositivos — v0.1
- ✓ Pedal de sustain (CC#64) — v0.3
- ✓ Reprodução de arquivos MIDI com notas caindo (Synthesia) — v0.1
- ✓ Controles de transporte e velocidade (0.25x–2.0x) — v0.1
- ✓ Biblioteca MIDI com scan automático de diretórios — v0.3
- ✓ Modo aprendizado "esperar" (pausa até nota correta) — v0.3
- ✓ Gravação e exportação MIDI — v0.3
- ✓ Gerenciamento de trilhas (ativar/desativar) — v0.3
- ✓ Live note trail no modo livre — v0.4
- ✓ CI/CD com releases automáticas (Windows, macOS, Linux) — v0.2

### Active

- [ ] Detecção de acordes em tempo real (detectar o que o usuário toca e mostrar nome do acorde)
- [ ] Integração com catálogos online de MIDI (buscar/baixar MIDIs + compartilhar gravações entre usuários)
- [ ] Modo prática (sem pausa, feedback visual de acertos/erros em tempo real)
- [ ] Teclado do computador como entrada (QWERTY → notas)
- [ ] Estatísticas de prática (sumário pós-sessão + histórico persistente com gráficos de evolução)
- [ ] Temas visuais customizáveis (cores, paleta, tamanho de teclas, layout do teclado, tudo configurável)
- [ ] Suporte a SoundFonts customizados (múltiplos formatos: .sf2, SFZ, WAV packs)
- [ ] Modo split-screen mão esquerda/direita (duas áreas visuais separadas com cores diferentes)
- [ ] Efeitos de áudio avançados (reverb, chorus, delay, EQ, compressor — cadeia de efeitos configurável)
- [ ] Metrônomo integrado

### Out of Scope

- Streaming/performance online — foco é prática local
- Notação musical (partitura) — foco é visualização de notas caindo
- Aulas/tutoriais integrados — foco é ferramenta, não plataforma de ensino
- Mobile/tablet — desktop only via Tauri

## Context

- Projeto já em v0.4.0 com features core implementadas
- Stack: Tauri 2 (Rust) + React 19 + Vite 7 + Tone.js 15 + @tonejs/midi
- Bun como package manager
- Toda UI em português (pt-BR)
- Sem testes automatizados — toda validação é manual
- Sem persistência local — preferências resetam a cada sessão
- Sem framework de estado — tudo em useState/useRef no App.tsx (~400 linhas)
- Sem i18n — strings hardcoded em português
- Audio samples carregados de CDN (Salamander) — sem fallback offline
- Componente Sidebar.tsx existe mas não é usado (dead code)

## Constraints

- **Stack**: Manter Tauri 2 + React 19 + Tone.js — não migrar para outra stack
- **Package Manager**: Bun (não npm/yarn)
- **Idioma UI**: Português (pt-BR)
- **Desktop only**: Tauri 2, sem versão web ou mobile
- **Open-source**: Projeto público no GitHub, contribuições welcome
- **Releases**: Automatizadas via release-please + GitHub Actions

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Dividir em múltiplos milestones | 10 features é muito para um milestone — entrega incremental | — Pending |
| Detecção de acordes só do input do usuário | Simplifica escopo — análise de arquivos MIDI fica para futuro | — Pending |
| Catálogos online + comunidade | Buscar/baixar MIDIs E compartilhar gravações entre usuários | — Pending |
| SoundFonts multi-formato | Suportar .sf2, SFZ e WAV packs — máxima flexibilidade | — Pending |
| Split-screen visual | Duas áreas de notas caindo com cores diferentes por mão | — Pending |
| Cadeia de efeitos avançada | Reverb + chorus + delay + EQ + compressor configurável | — Pending |
| Temas completos | Cores, paleta, layout, tamanho de teclas — tudo customizável | — Pending |
| Estatísticas com histórico | Sumário pós-sessão + persistência + gráficos de evolução | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-01 after initialization*
