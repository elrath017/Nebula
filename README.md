# 🌌 Nebula Media Player (`Nebula.js`)

> **Celestial High-Fidelity Audio & Video Engine** — A modern, feature-rich web media player inspired by VLC, built with React 18, TypeScript, Tailwind CSS, and Web Audio API. Designed with an immersive cosmic Orion Nebula glassmorphism theme, native local folder scanning without upload prompts, automatic timestamp playback resumption, 10-band equalizer, 200% volume boost, and borderless full-screen viewing.

---

## ✨ Features

- 🌌 **Celestial Orion/Carina Nebula Theme**: Crafted with Electric Aqua-Cyan (`#00E5FF`), Amber (`#FF8C00`), and Crimson (`#E11D48`) glow aesthetics.
- 📁 **Native Directory Folder Picker**: Open local media folders seamlessly using FileSystem Access API — zero browser upload warning popups.
- ⏱️ **Automated Playback Resumption**: Remembers your exact timestamp per video and automatically resumes playback where you left off.
- 🔀 **Subtitles & Dual Audio Track Switching**:
  - Press `V` to cycle subtitle tracks (`.srt`, `.vtt`, `.ass`) or toggle subtitles on/off.
  - Press `B` to switch dual audio streams (Multi-track audio / Left & Right channels).
- 🎚️ **Web Audio 10-Band Equalizer & 200% Boost**:
  - Live 10-band EQ with presets (Bass Boost, Rock, Pop, Classical, Vocal).
  - Soft-limiter dynamics compressor allowing up to **200% volume boost** without audio clipping.
- 🖥️ **Borderless Fullscreen Experience**: Floating player controls and mouse cursor auto-hide after 3 seconds of mouse stillness.
- 🎵 **Interactive Audio Spectrum Visualizer**: Animated canvas visualizer supporting Frequency Bars, Waveform Oscilloscope, and Circular Radial modes.
- 📜 **Queue & Playlist Management**: Natural folder sorting (`Ep 1`, `Ep 2` ... `Ep 10`), full filename hover tooltips, drag & drop reordering, and M3U playlist import/export.

---

## ⌨️ Keyboard Shortcuts Reference

| Key | Action | Category |
|---|---|---|
| `Space` | Toggle Play / Pause | Playback |
| `S` | Stop Playback | Playback |
| `E` | Advance Video Frame-by-Frame (1/25s) | Playback |
| `[` / `]` | Decrease / Increase Speed (0.25x step) | Playback |
| `=` | Reset Speed to Normal (1.0x) | Playback |
| `F` | Toggle Fullscreen Mode | View |
| `M` | Mute / Unmute Audio | Audio |
| `ArrowUp` / `ArrowDown` | Volume Up / Down (+5% / -5%) | Audio |
| `ArrowLeft` / `ArrowRight` | Seek Backward / Forward (-5s / +5s) | Navigation |
| `Shift + Left/Right` | Fast Seek (-10s / +10s) | Navigation |
| `N` / `P` | Next / Previous Track in Queue | Navigation |
| `V` | Switch / Cycle Subtitle Track | Subtitles |
| `J` / `K` | Subtitle Delay (-50 ms / +50 ms) | Subtitles |
| `B` | Switch / Cycle Audio Track & Dual Audio | Audio |
| `G` / `H` | Audio Delay (-50 ms / +50 ms) | Audio |
| `A` | Cycle Aspect Ratio (Auto, 16:9, 4:3, 21:9, Fill, Fit) | Video |
| `F1` | Open Keyboard Shortcuts Reference Modal | Help |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- `npm` or `yarn`

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/nebula-media-player.git
   cd nebula-media-player
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

4. **Build Production Bundle**
   ```bash
   npm run build
   ```

---

## 🛠️ Technology Stack

- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide Icons, Glassmorphism CSS
- **Audio Engine**: Web Audio API (`AudioContext`, `BiquadFilterNode`, `DynamicsCompressorNode`, `AnalyserNode`, `DelayNode`)
- **State Management**: Zustand
- **Media Support**: Native HTML5 Video/Audio APIs, FileSystem Access API, Web File API

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
