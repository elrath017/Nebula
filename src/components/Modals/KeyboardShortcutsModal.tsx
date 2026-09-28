import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';
import { usePlayerStore } from '../../state/playerStore';
import { VLC_KEYBINDINGS } from '../../services/keybindingManager';

export const KeyboardShortcutsModal: React.FC = () => {
  const { setActiveModal } = usePlayerStore();

  const categories = ['Playback', 'Audio & Video', 'Subtitles', 'Navigation'] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-vlc-panel border border-vlc-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-vlc-border flex items-center justify-between bg-vlc-dark/50">
          <div className="flex items-center space-x-2">
            <Keyboard className="w-5 h-5 text-vlc-orange" />
            <h3 className="font-bold text-sm tracking-wide">VLC Keyboard Shortcuts Reference</h3>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {categories.map((cat) => {
            const bindings = VLC_KEYBINDINGS.filter((b) => b.category === cat);
            return (
              <div key={cat} className="space-y-2">
                <h4 className="font-bold text-vlc-orange uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1 flex items-center space-x-1.5">
                  <Command className="w-3.5 h-3.5" />
                  <span>{cat} Controls</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {bindings.map((b) => (
                    <div
                      key={b.key + b.actionName}
                      className="flex items-center justify-between p-2 rounded-lg bg-vlc-dark/60 border border-slate-800/80"
                    >
                      <span className="text-slate-300 font-medium">{b.description}</span>
                      <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-vlc-orange font-mono text-[11px] font-bold shadow">
                        {b.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-vlc-border bg-vlc-dark/50 flex justify-end">
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 rounded-lg bg-vlc-orange text-slate-950 font-bold hover:bg-vlc-orange-hover transition-colors text-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
