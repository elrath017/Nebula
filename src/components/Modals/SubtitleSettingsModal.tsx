import React from 'react';
import { X, Subtitles, Clock, Type } from 'lucide-react';
import { usePlayerStore } from '../../state/playerStore';

export const SubtitleSettingsModal: React.FC = () => {
  const {
    currentTrack,
    activeSubtitleTrack,
    setActiveSubtitleTrack,
    subtitleDelayMs,
    setSubtitleDelayMs,
    adjustSubtitleDelayMs,
    subtitleStyles,
    setSubtitleStyles,
    setActiveModal,
  } = usePlayerStore();

  const colorOptions = [
    { label: 'White', value: '#FFFFFF' },
    { label: 'Yellow', value: '#FFFF00' },
    { label: 'Cyan', value: '#00FFFF' },
    { label: 'Green', value: '#00FF00' },
  ];

  const bgOptions = [
    { label: 'Dark Semi-transparent', value: 'rgba(0, 0, 0, 0.75)' },
    { label: 'Solid Black', value: 'rgba(0, 0, 0, 1)' },
    { label: 'Light Box', value: 'rgba(30, 41, 59, 0.85)' },
    { label: 'Transparent Text Shadow Only', value: 'transparent' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-vlc-panel border border-vlc-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-vlc-border flex items-center justify-between bg-vlc-dark/50">
          <div className="flex items-center space-x-2">
            <Subtitles className="w-5 h-5 text-vlc-orange" />
            <h3 className="font-bold text-sm tracking-wide">Subtitle Settings & Synchronization</h3>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-5 text-xs">
          {/* Subtitle Track Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center space-x-2">
              <Subtitles className="w-4 h-4 text-vlc-orange" />
              <span>Active Subtitle Stream:</span>
            </label>
            <select
              value={activeSubtitleTrack?.id || ''}
              onChange={(e) => {
                const track = currentTrack?.subtitles?.find((s) => s.id === e.target.value) || null;
                setActiveSubtitleTrack(track);
              }}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-vlc-orange cursor-pointer"
            >
              <option value="">Disabled / Off</option>
              {currentTrack?.subtitles?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.cues.length} cues)
                </option>
              ))}
            </select>
          </div>

          {/* Subtitle Timing Sync Delay */}
          <div className="p-3 bg-vlc-dark rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold flex items-center space-x-2">
                <Clock className="w-4 h-4 text-vlc-orange" />
                <span>Subtitle Sync / Delay Adjustment:</span>
              </span>
              <span className="font-mono text-vlc-orange font-bold text-xs">
                {subtitleDelayMs > 0 ? `+${subtitleDelayMs}` : subtitleDelayMs} ms
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => adjustSubtitleDelayMs(-50)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 font-mono text-xs font-semibold"
              >
                -50ms (J)
              </button>
              <input
                type="range"
                min="-5000"
                max="5000"
                step="50"
                value={subtitleDelayMs}
                onChange={(e) => setSubtitleDelayMs(Number(e.target.value))}
                className="flex-1 accent-vlc-orange"
              />
              <button
                onClick={() => adjustSubtitleDelayMs(50)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 font-mono text-xs font-semibold"
              >
                +50ms (K)
              </button>
            </div>
          </div>

          {/* Subtitle Styling Controls */}
          <div className="space-y-3 p-3 bg-vlc-dark rounded-xl border border-slate-800">
            <h4 className="font-bold text-slate-300 flex items-center space-x-2 text-xs">
              <Type className="w-4 h-4 text-vlc-orange" />
              <span>Appearance & Styling</span>
            </h4>

            {/* Font Size */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-400 font-mono">
                <span>Font Size:</span>
                <span className="text-vlc-orange font-bold">{subtitleStyles.fontSize}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="44"
                value={subtitleStyles.fontSize}
                onChange={(e) => setSubtitleStyles({ fontSize: Number(e.target.value) })}
                className="w-full accent-vlc-orange"
              />
            </div>

            {/* Position Bottom */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-400 font-mono">
                <span>Vertical Position (Bottom Margin):</span>
                <span className="text-vlc-orange font-bold">{subtitleStyles.positionBottom}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={subtitleStyles.positionBottom}
                onChange={(e) => setSubtitleStyles({ positionBottom: Number(e.target.value) })}
                className="w-full accent-vlc-orange"
              />
            </div>

            {/* Text Color Options */}
            <div className="space-y-1.5">
              <span className="text-slate-400 font-semibold block">Text Color:</span>
              <div className="flex space-x-2">
                {colorOptions.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setSubtitleStyles({ textColor: c.value })}
                    className={`px-3 py-1 rounded border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                      subtitleStyles.textColor === c.value
                        ? 'border-vlc-orange bg-vlc-orange/20 text-vlc-orange'
                        : 'border-slate-700 bg-slate-900 text-slate-300'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border border-slate-500" style={{ backgroundColor: c.value }} />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Style */}
            <div className="space-y-1.5">
              <span className="text-slate-400 font-semibold block">Background Box Contrast:</span>
              <select
                value={subtitleStyles.bgColor}
                onChange={(e) => setSubtitleStyles({ bgColor: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-vlc-orange cursor-pointer"
              >
                {bgOptions.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-vlc-border bg-vlc-dark/50 flex justify-end">
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 rounded-lg bg-vlc-orange text-slate-950 font-bold hover:bg-vlc-orange-hover transition-colors text-xs"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
