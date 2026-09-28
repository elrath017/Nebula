import React from 'react';
import { X, Info, Film, Music } from 'lucide-react';
import { usePlayerStore } from '../../state/playerStore';
import { formatTime, formatBytes } from '../../services/metadataParser';

export const MediaInfoModal: React.FC = () => {
  const { currentTrack, setActiveModal } = usePlayerStore();

  if (!currentTrack) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-vlc-panel border border-vlc-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-vlc-border flex items-center justify-between bg-vlc-dark/50">
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-vlc-orange" />
            <h3 className="font-bold text-sm tracking-wide">Media Information</h3>
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
          <div className="p-3 rounded-lg bg-vlc-dark border border-slate-800 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-vlc-orange/20 border border-vlc-orange/40 flex items-center justify-center text-vlc-orange flex-shrink-0">
              {currentTrack.type === 'video' ? <Film className="w-5 h-5" /> : <Music className="w-5 h-5" />}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-slate-100 text-sm truncate">{currentTrack.title}</h4>
              <p className="text-slate-400 font-mono text-[11px] truncate">{currentTrack.url}</p>
            </div>
          </div>

          {/* Technical Specifications Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold mb-1">
                Format / Container
              </span>
              <span className="text-vlc-orange font-bold text-xs">{currentTrack.format}</span>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold mb-1">
                Duration
              </span>
              <span className="text-slate-200 font-bold text-xs">{formatTime(currentTrack.duration)}</span>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold mb-1">
                Codec Profile
              </span>
              <span className="text-slate-200 font-bold text-xs">{currentTrack.codec || 'H.264 / AAC'}</span>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold mb-1">
                Video Resolution
              </span>
              <span className="text-slate-200 font-bold text-xs">
                {currentTrack.resolution || '1920x1080 (HD)'}
              </span>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold mb-1">
                Estimated Bitrate
              </span>
              <span className="text-slate-200 font-bold text-xs">{currentTrack.bitrate || '3500 kbps'}</span>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold mb-1">
                Audio Channels
              </span>
              <span className="text-slate-200 font-bold text-xs">{currentTrack.channels || 'Stereo (2.0)'}</span>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold mb-1">
                Sample Rate
              </span>
              <span className="text-slate-200 font-bold text-xs">{currentTrack.sampleRate || '48.0 kHz'}</span>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold mb-1">
                File Size
              </span>
              <span className="text-slate-200 font-bold text-xs">{formatBytes(currentTrack.fileSize)}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-vlc-border bg-vlc-dark/50 flex justify-end">
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 rounded-lg bg-vlc-orange text-slate-950 font-bold hover:bg-vlc-orange-hover transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
