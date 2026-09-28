import React, { useState, useRef } from 'react';
import { 
  Search, 
  Trash2, 
  Plus, 
  FolderSearch,
  FileUp, 
  FileDown, 
  Music, 
  Film, 
  Play, 
  ArrowUp, 
  ArrowDown, 
  X, 
  Info
} from 'lucide-react';
import { usePlayerStore } from '../state/playerStore';
import { formatTime } from '../services/metadataParser';
import { filterAndProcessMediaFiles } from '../services/fileLoader';
import { exportM3U, parseM3U } from '../services/m3uParser';

export const PlaylistSidebar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const m3uInputRef = useRef<HTMLInputElement>(null);

  const {
    playlist,
    currentIndex,
    selectTrack,
    removeMediaItem,
    reorderPlaylist,
    clearPlaylist,
    addMediaItems,
    setPlaylist,
    setActiveModal,
    showToast,
  } = usePlayerStore();

  const handleAddFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const mediaItems = await filterAndProcessMediaFiles(files);
    if (mediaItems.length === 0) {
      showToast('No video or music files found in selection');
    } else {
      addMediaItems(mediaItems, true);
    }
  };

  const handleOpenFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const mediaItems = await filterAndProcessMediaFiles(files);
    if (mediaItems.length === 0) {
      showToast('No video or music files found in selected folder');
    } else {
      setPlaylist(mediaItems);
      showToast(`Loaded ${mediaItems.length} video & music track(s) from folder`);
    }
  };

  const handleImportM3U = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        const parsed = parseM3U(text);
        if (parsed.length > 0) {
          const fullItems = parsed.map((p) => ({
            id: p.id || 'm3u-' + Math.random().toString(36).substring(2, 7),
            title: p.title || 'Unknown Title',
            artist: p.artist || 'Unknown Artist',
            url: p.url || '',
            type: p.type || 'video',
            format: p.format || 'MP4',
            duration: p.duration || 0,
          }));
          addMediaItems(fullItems, true);
          showToast(`Imported ${fullItems.length} track(s) from M3U`);
        }
      }
    };
    reader.readAsText(files[0]);
  };

  const handleExportM3U = () => {
    if (playlist.length === 0) return;
    const m3uText = exportM3U(playlist);
    const blob = new Blob([m3uText], { type: 'audio/x-mpegurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nebula_playlist.m3u';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Saved M3U playlist file');
  };

  const filteredPlaylist = playlist.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.artist && item.artist.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <aside className="w-80 bg-nebula-panel border-l border-nebula-border flex flex-col h-full z-20 select-none">
      {/* Hidden File & Folder Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAddFiles}
        multiple
        accept="video/*,audio/*,.mp4,.mkv,.avi,.mov,.mp3,.flac,.wav,.aac,.ogg"
        className="hidden"
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleOpenFolder}
        // @ts-expect-error webkitdirectory is non-standard but supported in all modern browsers
        webkitdirectory="true"
        directory=""
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={m3uInputRef}
        onChange={handleImportM3U}
        accept=".m3u,.m3u8"
        className="hidden"
      />

      {/* Header Bar */}
      <div className="p-3 border-b border-nebula-border flex items-center justify-between bg-nebula-dark/60">
        <h3 className="font-bold text-slate-200 text-xs tracking-wider uppercase flex items-center space-x-2">
          <span>Nebula Queue</span>
          <span className="bg-nebula-red/20 text-nebula-red px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border border-nebula-red/30">
            {playlist.length}
          </span>
        </h3>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Add Media Files"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-nebula-blue transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => folderInputRef.current?.click()}
            title="Open Folder (Select Video & Music Folder)"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-nebula-red transition-colors"
          >
            <FolderSearch className="w-4 h-4" />
          </button>
          <button
            onClick={() => m3uInputRef.current?.click()}
            title="Import M3U Playlist"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-nebula-blue transition-colors"
          >
            <FileUp className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportM3U}
            disabled={playlist.length === 0}
            title="Export M3U Playlist"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-nebula-blue transition-colors disabled:opacity-30"
          >
            <FileDown className="w-4 h-4" />
          </button>
          <button
            onClick={clearPlaylist}
            disabled={playlist.length === 0}
            title="Clear Playlist"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-red-400 transition-colors disabled:opacity-30"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-2 border-b border-nebula-border/80 bg-nebula-dark/40">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search title, artist, or format..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-7 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-nebula-red transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Playlist Items Scroll List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
        {filteredPlaylist.length === 0 ? (
          <div className="p-6 text-center text-slate-500 space-y-3">
            <p className="text-xs">No media in playlist queue</p>
            <button
              onClick={() => folderInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-nebula-red/20 to-nebula-blue/20 border border-nebula-red/40 text-nebula-red hover:text-white hover:bg-nebula-red transition-all text-xs font-semibold inline-flex items-center space-x-2 shadow-glow-red"
            >
              <FolderSearch className="w-4 h-4 text-nebula-red" />
              <span>Open Folder (Videos & Music)</span>
            </button>
          </div>
        ) : (
          filteredPlaylist.map((item) => {
            const originalIndex = playlist.findIndex((p) => p.id === item.id);
            const isCurrent = originalIndex === currentIndex;

            return (
              <div
                key={item.id}
                onClick={() => selectTrack(originalIndex)}
                className={`group px-3 py-2 flex items-center justify-between cursor-pointer transition-colors text-xs ${
                  isCurrent
                    ? 'bg-nebula-red/15 border-l-2 border-nebula-red text-slate-100 font-medium'
                    : 'hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                {/* Media Icon & Title */}
                <div className="flex items-center space-x-2.5 overflow-hidden flex-1 mr-2">
                  <div className="flex-shrink-0">
                    {isCurrent ? (
                      <div className="w-5 h-5 rounded bg-gradient-to-tr from-nebula-red to-rose-500 flex items-center justify-center text-white shadow-glow-red">
                        <Play className="w-3 h-3 fill-white" />
                      </div>
                    ) : item.type === 'video' ? (
                      <Film className="w-4 h-4 text-nebula-blue group-hover:text-nebula-red transition-colors" />
                    ) : (
                      <Music className="w-4 h-4 text-purple-400 group-hover:text-nebula-red transition-colors" />
                    )}
                  </div>

                  <div className="overflow-hidden flex-1">
                    <p className={`truncate ${isCurrent ? 'text-nebula-red font-bold' : 'text-slate-200'}`}>
                      {item.title}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                      <span className="bg-slate-900 border border-slate-800 px-1 rounded font-mono text-[9px] text-nebula-blue font-semibold">
                        {item.format}
                      </span>
                      {item.artist && <span className="truncate">{item.artist}</span>}
                    </div>
                  </div>
                </div>

                {/* Duration & Actions */}
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <span className="font-mono text-[10px] text-slate-400 mr-1">
                    {formatTime(item.duration)}
                  </span>

                  {/* Reorder Buttons */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (originalIndex > 0) reorderPlaylist(originalIndex, originalIndex - 1);
                    }}
                    disabled={originalIndex === 0}
                    title="Move Up"
                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-nebula-red text-slate-400 disabled:opacity-0"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (originalIndex < playlist.length - 1) reorderPlaylist(originalIndex, originalIndex + 1);
                    }}
                    disabled={originalIndex === playlist.length - 1}
                    title="Move Down"
                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-nebula-red text-slate-400 disabled:opacity-0"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>

                  {/* Remove Item */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMediaItem(item.id);
                    }}
                    title="Remove Track"
                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-400 text-slate-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info Box */}
      <div className="p-3 border-t border-nebula-border bg-nebula-dark/60 text-[11px] text-slate-400 flex items-center justify-between">
        <button
          onClick={() => setActiveModal('mediaInfo')}
          disabled={!playlist[currentIndex]}
          className="hover:text-nebula-red transition-colors flex items-center space-x-1.5 disabled:opacity-40"
        >
          <Info className="w-3.5 h-3.5 text-nebula-red" />
          <span>Media Codec Info</span>
        </button>
        <span className="font-mono text-[10px] text-nebula-blue font-bold">Nebula Engine</span>
      </div>
    </aside>
  );
};
