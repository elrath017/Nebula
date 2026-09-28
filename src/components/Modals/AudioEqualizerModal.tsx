import React from 'react';
import { X, Sliders, RotateCcw, Volume2 } from 'lucide-react';
import { usePlayerStore } from '../../state/playerStore';
import { EQ_FREQUENCIES, EQ_PRESETS } from '../../hooks/useAudioEngine';

interface EqualizerModalProps {
  eqGains: number[];
  setBandGain: (bandIndex: number, gainDb: number) => void;
  selectedPreset: string;
  applyPreset: (presetName: string) => void;
}

export const AudioEqualizerModal: React.FC<EqualizerModalProps> = ({
  eqGains,
  setBandGain,
  selectedPreset,
  applyPreset,
}) => {
  const { setActiveModal, volume } = usePlayerStore();

  const formatFreqLabel = (freq: number) => {
    return freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-nebula-panel border border-nebula-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-nebula-border flex items-center justify-between bg-nebula-dark/70">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-nebula-red" />
            <h3 className="font-bold text-sm tracking-wide text-slate-100">Nebula 10-Band Audio Equalizer</h3>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 text-xs">
          {/* Preset Selector & Reset */}
          <div className="flex items-center justify-between bg-nebula-dark/70 p-3 rounded-xl border border-nebula-border">
            <div className="flex items-center space-x-3">
              <label className="text-slate-400 font-semibold text-xs">EQ Preset:</label>
              <select
                value={selectedPreset}
                onChange={(e) => applyPreset(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-nebula-red font-bold rounded-lg px-3 py-1 text-xs focus:outline-none focus:border-nebula-red cursor-pointer"
              >
                {Object.keys(EQ_PRESETS).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => applyPreset('Flat')}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-nebula-red transition-colors flex items-center space-x-1.5 font-semibold text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Flat</span>
            </button>
          </div>

          {/* 10 Band Sliders Grid */}
          <div className="grid grid-cols-10 gap-2 bg-nebula-dark p-4 rounded-2xl border border-nebula-border/80 items-end h-64">
            {EQ_FREQUENCIES.map((freq, index) => {
              const gain = eqGains[index] || 0;
              return (
                <div key={freq} className="flex flex-col items-center h-full justify-between">
                  {/* Gain Value Label */}
                  <span className="font-mono text-[10px] text-nebula-red font-bold">
                    {gain > 0 ? `+${gain.toFixed(0)}` : gain.toFixed(0)}dB
                  </span>

                  {/* Vertical Slider */}
                  <div className="relative flex-1 flex items-center justify-center my-2">
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value={gain}
                      onChange={(e) => setBandGain(index, Number(e.target.value))}
                      className="w-40 -rotate-90 transform origin-center cursor-pointer accent-nebula-red"
                    />
                  </div>

                  {/* Frequency Label */}
                  <span className="font-mono text-[11px] text-nebula-blue font-semibold mt-1">
                    {formatFreqLabel(freq)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Soft Limiter & Volume Boost Status Banner */}
          <div className="p-3 bg-nebula-red/10 border border-nebula-red/30 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-nebula-red font-semibold">
              <Volume2 className="w-4 h-4" />
              <span>Web Audio Soft Limiter: Active</span>
            </div>
            <span className="text-slate-400 font-mono">
              Current Boost: <strong className="text-nebula-blue font-bold">{volume}%</strong> (Max 200%)
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-nebula-border bg-nebula-dark/70 flex justify-end">
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-nebula-red to-rose-600 text-white font-bold hover:from-rose-600 hover:to-nebula-red transition-colors text-xs shadow-glow-red"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
