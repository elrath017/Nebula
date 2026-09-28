import React from 'react';
import { X, Info, Film, Music } from 'lucide-react';
import { usePlayerStore } from '../../state/playerStore';
import { formatTime, formatBytes } from '../../services/metadataParser';

export const MediaInfoModal: React.FC = () => {
  const { currentTrack, setActiveModal } = usePlayerStore();

  if (!currentTrack) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-nebula-panel border border-nebula-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-nebula-border flex items-center justify-between bg-nebula-dark/70">
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-nebula-red" />
            <h3 className="font-bold text-sm tracking-wide text-slate-100">Nebula Media Inspector</h3>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* File Title Card */}
          <div className="p-3.5 rounded-xl bg-nebula-dark border border-nebula-border flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-nebula-red/20 to-nebula-blue/20 border border-nebula-red/40 flex items-center justify-center text-nebula-red flex-shrink-0">
              {currentTrack.type === 'video' ? <Film className="w-5 h-5 text-nebula-blue" /> : <Music className="w-5 h-5 text-nebula-red" />}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-slate-100 text-sm truncate">{currentTrack.title}</h4>
              <p className="text-slate-400 font-mono text-[11px] truncate">{currentTrack.url}</p>
            </div>
          </div>

          {/* Technical Specifications Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold mb-1">
                Format / Container
              </span>
              <span className="text-nebula-red font-bold text-xs">{currentTrack.format}</span>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold mb-1">
                Duration
              </span>
              <span className="text-nebula-blue font-bold text-xs">{formatTime(currentTrack.duration)}</span>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold mb-1">
                Codec Profile
              </span>
              <span className="text-slate-200 font-bold text-xs">{currentTrack.codec || 'H.264 / AAC'}</span>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold mb-1">
                Video Resolution
              </span>
              <span className="text-slate-200 font-bold text-xs">
                {currentTrack.resolution || '1920x1080 (HD)'}
              </span>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold mb-1">
                Estimated Bitrate
              </span>
              <span className="text-slate-200 font-bold text-xs">{currentTrack.bitrate || '3500 kbps'}</span>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold mb-1">
                Audio Channels
              </span>
              <span className="text-slate-200 font-bold text-xs">{currentTrack.channels || 'Stereo (2.0)'}</span>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold mb-1">
                Sample Rate
              </span>
              <span className="text-slate-200 font-bold text-xs">{currentTrack.sampleRate || '48.0 kHz'}</span>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold mb-1">
                File Size
              </span>
              <span className="text-slate-200 font-bold text-xs">{formatBytes(currentTrack.fileSize)}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-nebula-border bg-nebula-dark/70 flex justify-end">
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-nebula-red to-rose-600 text-white font-bold hover:from-rose-600 hover:to-nebula-red transition-colors text-xs shadow-glow-red"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
