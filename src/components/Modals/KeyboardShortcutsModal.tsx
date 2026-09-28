import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';
import { usePlayerStore } from '../../state/playerStore';
import { VLC_KEYBINDINGS } from '../../services/keybindingManager';

export const KeyboardShortcutsModal: React.FC = () => {
  const { setActiveModal } = usePlayerStore();

  const categories = ['Playback', 'Audio & Video', 'Subtitles', 'Navigation'] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-nebula-panel border border-nebula-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-nebula-border flex items-center justify-between bg-nebula-dark/70">
          <div className="flex items-center space-x-2">
            <Keyboard className="w-5 h-5 text-nebula-red" />
            <h3 className="font-bold text-sm tracking-wide text-slate-100">Nebula Keyboard Shortcuts Reference</h3>
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
                <h4 className="font-bold text-nebula-red uppercase tracking-wider text-[11px] border-b border-nebula-border pb-1 flex items-center space-x-1.5">
                  <Command className="w-3.5 h-3.5 text-nebula-blue" />
                  <span>{cat} Controls</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {bindings.map((b) => (
                    <div
                      key={b.key + b.actionName}
                      className="flex items-center justify-between p-2 rounded-xl bg-nebula-dark/80 border border-nebula-border/80"
                    >
                      <span className="text-slate-300 font-medium">{b.description}</span>
                      <kbd className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-nebula-blue font-mono text-[11px] font-bold shadow-glow-blue">
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
        <div className="px-5 py-3.5 border-t border-nebula-border bg-nebula-dark/70 flex justify-end">
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-nebula-red to-rose-600 text-white font-bold hover:from-rose-600 hover:to-nebula-red transition-colors text-xs shadow-glow-red"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
