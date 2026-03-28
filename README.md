<div align="center">

# 🎹 MLZ Piano

**Um piano digital open-source com visualização estilo Synthesia, suporte a MIDI e modo de aprendizado.**

[![Release](https://img.shields.io/github/v/release/RaposoG/mlz-piano?style=flat-square)](https://github.com/RaposoG/mlz-piano/releases)
[![License](https://img.shields.io/github/license/RaposoG/mlz-piano?style=flat-square)](LICENSE)
[![Stars](https://img.shields.io/github/stars/RaposoG/mlz-piano?style=flat-square)](https://github.com/RaposoG/mlz-piano/stargazers)

[Download](#download) · [Features](#features) · [Contribuir](#contribuindo) · [Roadmap](#roadmap)

</div>

---

## Download

Baixe a versão mais recente para seu sistema operacional na página de [Releases](https://github.com/RaposoG/mlz-piano/releases):

| Plataforma            | Formato              |
| --------------------- | -------------------- |
| Windows               | `.msi` / `.exe`      |
| macOS (Apple Silicon) | `.dmg`               |
| macOS (Intel)         | `.dmg`               |
| Linux                 | `.deb` / `.AppImage` |

## Features

### 🎹 Piano de 88 Teclas

- Piano completo de A0 a C8 com samples reais (Salamander Grand Piano)
- Toque com mouse ou com qualquer teclado/piano MIDI conectado via USB
- Suporte a velocity (intensidade da tecla) e pedal de sustain (CC#64)

### 🎵 Reprodução de Arquivos MIDI

- Carregue arquivos `.mid` / `.midi` do seu computador
- Visualização de notas caindo (estilo Synthesia) com cores por trilha
- Controles de transporte: play, pause, stop, rewind, seek
- Controle de velocidade: de 0.25x a 2.0x
- Gerenciamento de trilhas: ative/desative trilhas individualmente

### 📚 Biblioteca MIDI

- Escaneia automaticamente Downloads, Música, Documentos e Desktop
- Busca em tempo real por nome ou pasta
- Agrupamento por diretório com contagem de arquivos

### 🎓 Modo Aprendizado

- **Esperar**: A reprodução pausa até você tocar a nota correta no seu piano MIDI
- Ideal para praticar músicas no seu próprio ritmo

### ⏺ Gravação

- Grave tudo o que você toca (MIDI input ou mouse)
- Exporte como arquivo `.mid` com um clique
- Indicador visual "REC" com duração em tempo real

### 🔌 Suporte MIDI Completo

- Detecção automática de dispositivos MIDI conectados
- Reconexão e atualização de dispositivos em tempo real
- Suporte a Note On, Note Off, Control Change (sustain pedal)

## Tech Stack

| Camada          | Tecnologia                                     |
| --------------- | ---------------------------------------------- |
| Desktop         | [Tauri 2](https://tauri.app/) (Rust)           |
| Frontend        | [React 19](https://react.dev/) + TypeScript    |
| Build           | [Vite 7](https://vite.dev/)                    |
| Áudio           | [Tone.js 15](https://tonejs.github.io/)        |
| MIDI Parser     | [@tonejs/midi](https://github.com/Tonejs/Midi) |
| Package Manager | [Bun](https://bun.sh/)                         |

## Desenvolvimento

### Pré-requisitos

- [Rust](https://rustup.rs/)
- [Bun](https://bun.sh/)
- [Tauri CLI prerequisites](https://v2.tauri.app/start/prerequisites/)

### Rodando localmente

```bash
# Instalar dependências
bun install

# Iniciar em modo de desenvolvimento
bun run tauri dev

# Build de produção
bun run tauri build
```

## Contribuindo

Contribuições são bem-vindas! Este é um projeto open-source e qualquer pessoa pode colaborar.

1. Faça um fork do repositório
2. Crie sua branch (`git checkout -b feat/minha-feature`)
3. Use [Conventional Commits](https://www.conventionalcommits.org/) nas mensagens:
   - `feat: nova funcionalidade` → bump minor (0.1.0 → 0.2.0)
   - `fix: correção de bug` → bump patch (0.1.0 → 0.1.1)
4. Abra um Pull Request

> As releases são geradas automaticamente com base nos commits via [release-please](https://github.com/googleapis/release-please).

## Roadmap

### Implementado

- [x] Piano de 88 teclas com samples reais
- [x] Entrada MIDI com detecção automática de dispositivos
- [x] Pedal de sustain (CC#64)
- [x] Reprodução de arquivos MIDI com notas caindo
- [x] Controles de transporte e velocidade
- [x] Biblioteca MIDI com scan automático
- [x] Modo aprendizado (esperar nota correta)
- [x] Gravação e exportação MIDI
- [x] Gerenciamento de trilhas
- [x] CI/CD com releases automáticas (Windows, macOS, Linux)

### Futuro

- [ ] Modo prática (sem pausa, feedback visual de acertos/erros)
- [ ] Teclado do computador como entrada (QWERTY → notas)
- [ ] Estatísticas de prática (precisão, tempo, progresso)
- [ ] Temas visuais customizáveis
- [ ] Suporte a SoundFonts customizados
- [ ] Integração com catálogos online de MIDI
- [ ] Modo split-screen (mão esquerda / mão direita)
- [ ] Efeitos de áudio adicionais (reverb, chorus)
- [ ] Metrônomo integrado
- [ ] Detecção de acordes em tempo real

## Licença

Este projeto é open-source. Veja o arquivo [LICENSE](LICENSE) para detalhes.
