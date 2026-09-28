import React, { useState, useRef, useEffect } from 'react';
import { 
  FolderOpen, 
  FolderSearch,
  ListMusic, 
  Sliders, 
  Subtitles as SubIcon, 
  Info, 
  HelpCircle, 
  FileCode,
  Sparkles
} from 'lucide-react';
import { usePlayerStore } from '../state/playerStore';
import { createMediaItemFromFile } from '../services/metadataParser';
import { filterAndProcessMediaFiles, pickDirectoryWithFileSystemAPI } from '../services/fileLoader';
import { parseSubtitleContent } from '../hooks/useSubtitleParser';
import { exportM3U } from '../services/m3uParser';
import { NebulaAppIcon } from './NebulaAppIcon';

export const Header: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);

  const {
    playlist,
    addMediaItems,
    setPlaylist,
    setActiveSubtitleTrack,
    currentTrack,
    setActiveModal,
    toggleSidebar,
    isSidebarOpen,
    setAspectRatio,
    aspectRatio,
    showToast,
  } = usePlayerStore();

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const item = await createMediaItemFromFile(file);
      newItems.push(item);
    }
    addMediaItems(newItems, true);
    setActiveMenu(null);
  };

  const handleOpenFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const mediaItems = await filterAndProcessMediaFiles(files);
    if (mediaItems.length === 0) {
      showToast('No video or music files found in selected folder');
    } else {
      setPlaylist(mediaItems);
      showToast(`Loaded ${mediaItems.length} media file(s) from folder`);
    }
    setActiveMenu(null);
  };

  const handleTriggerFolder = async () => {
    setActiveMenu(null);
    const result = await pickDirectoryWithFileSystemAPI();
    if (result.status === 'success') {
      if (result.items.length === 0) {
        showToast('No video or music files found in selected folder');
      } else {
        setPlaylist(result.items);
        showToast(`Loaded ${result.items.length} media file(s) from folder`);
      }
    } else if (result.status === 'unsupported') {
      folderInputRef.current?.click();
    }
  };

  const handleOpenSubtitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const subTrack = parseSubtitleContent(content, file.name);
        setActiveSubtitleTrack(subTrack);
        showToast(`Loaded Subtitle: ${file.name}`);
      }
    };
    reader.readAsText(file);
    setActiveMenu(null);
  };

  const handleExportPlaylist = () => {
    if (playlist.length === 0) {
      showToast('Playlist is empty');
      return;
    }
    const m3uText = exportM3U(playlist);
    const blob = new Blob([m3uText], { type: 'audio/x-mpegurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nebula_playlist.m3u';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported playlist to M3U file');
    setActiveMenu(null);
  };

  return (
    <header className="bg-nebula-dark/95 backdrop-blur border-b border-nebula-border h-10 flex items-center justify-between px-3 z-40 select-none text-xs">
      {/* Hidden File & Folder Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleOpenFiles}
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
        ref={subtitleInputRef}
        onChange={handleOpenSubtitle}
        accept=".srt,.vtt,.ass,.ssa"
        className="hidden"
      />

      {/* Brand & Menu Bar */}
      <div className="flex items-center space-x-1" ref={menuRef}>
        {/* Nebula Logo */}
        <div className="flex items-center space-x-2 mr-3 pr-3 border-r border-nebula-border">
          <NebulaAppIcon className="w-5 h-5 drop-shadow-md" />
          <span className="font-extrabold text-slate-100 tracking-wide text-sm hidden sm:inline">
            Nebula<span className="text-[#00E5FF]">.js</span>
          </span>
        </div>

        {/* Dropdown Menus */}
        {/* 1. Media */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'media' ? null : 'media')}
            className={`px-2.5 py-1 rounded transition-colors hover:bg-slate-800 ${
              activeMenu === 'media' ? 'bg-slate-800 text-nebula-red' : 'text-slate-300'
            }`}
          >
            Media
          </button>
          {activeMenu === 'media' && (
            <div className="absolute top-full left-0 mt-1 w-60 bg-nebula-panel border border-nebula-border rounded-lg shadow-2xl py-1 z-50 text-slate-200">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-left px-3 py-1.5 flex items-center space-x-2.5 hover:bg-nebula-red/20 hover:text-nebula-red"
              >
                <FolderOpen className="w-4 h-4 text-nebula-blue" />
                <span className="flex-1">Open File(s)...</span>
                <span className="text-[10px] text-slate-500 font-mono">Ctrl+O</span>
              </button>
              <button
                onClick={handleTriggerFolder}
                className="w-full text-left px-3 py-1.5 flex items-center space-x-2.5 hover:bg-nebula-red/20 hover:text-nebula-red"
              >
                <FolderSearch className="w-4 h-4 text-nebula-red" />
                <span className="flex-1">Open Folder (Videos & Music)...</span>
                <span className="text-[10px] text-slate-500 font-mono">Ctrl+F</span>
              </button>
              <button
                onClick={() => handleExportPlaylist()}
                className="w-full text-left px-3 py-1.5 flex items-center space-x-2.5 hover:bg-nebula-red/20 hover:text-nebula-red"
              >
                <FileCode className="w-4 h-4 text-purple-400" />
                <span className="flex-1">Save Playlist to File...</span>
              </button>
              <div className="my-1 border-t border-nebula-border" />
              <button
                onClick={() => setActiveModal('mediaInfo')}
                disabled={!currentTrack}
                className="w-full text-left px-3 py-1.5 flex items-center space-x-2.5 hover:bg-nebula-red/20 hover:text-nebula-red disabled:opacity-40"
              >
                <Info className="w-4 h-4 text-nebula-blue" />
                <span className="flex-1">Media Information...</span>
                <span className="text-[10px] text-slate-500 font-mono">Ctrl+I</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Audio */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'audio' ? null : 'audio')}
            className={`px-2.5 py-1 rounded transition-colors hover:bg-slate-800 ${
              activeMenu === 'audio' ? 'bg-slate-800 text-nebula-red' : 'text-slate-300'
            }`}
          >
            Audio
          </button>
          {activeMenu === 'audio' && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-nebula-panel border border-nebula-border rounded-lg shadow-2xl py-1 z-50 text-slate-200">
              <button
                onClick={() => {
                  setActiveModal('equalizer');
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 flex items-center space-x-2.5 hover:bg-nebula-red/20 hover:text-nebula-red"
              >
                <Sliders className="w-4 h-4 text-nebula-red" />
                <span>Audio Equalizer (10 Band)</span>
              </button>
              <div className="my-1 border-t border-nebula-border" />
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Audio Boost Limit
              </div>
              <div className="px-3 py-1 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Soft Limiter Compression</span>
                <span className="text-nebula-blue font-mono">ACTIVE (200%)</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Video */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'video' ? null : 'video')}
            className={`px-2.5 py-1 rounded transition-colors hover:bg-slate-800 ${
              activeMenu === 'video' ? 'bg-slate-800 text-nebula-red' : 'text-slate-300'
            }`}
          >
            Video
          </button>
          {activeMenu === 'video' && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-nebula-panel border border-nebula-border rounded-lg shadow-2xl py-1 z-50 text-slate-200">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Aspect Ratio
              </div>
              {(['Auto', '16:9', '4:3', '21:9', '1:1', 'Fill', 'Fit'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => {
                    setAspectRatio(ratio);
                    setActiveMenu(null);
                  }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-nebula-red/20 hover:text-nebula-red ${
                    aspectRatio === ratio ? 'text-nebula-red font-semibold' : ''
                  }`}
                >
                  <span>{ratio}</span>
                  {aspectRatio === ratio && <Sparkles className="w-3 h-3 text-nebula-blue" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4. Subtitle */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'sub' ? null : 'sub')}
            className={`px-2.5 py-1 rounded transition-colors hover:bg-slate-800 ${
              activeMenu === 'sub' ? 'bg-slate-800 text-nebula-red' : 'text-slate-300'
            }`}
          >
            Subtitle
          </button>
          {activeMenu === 'sub' && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-nebula-panel border border-nebula-border rounded-lg shadow-2xl py-1 z-50 text-slate-200">
              <button
                onClick={() => subtitleInputRef.current?.click()}
                className="w-full text-left px-3 py-1.5 flex items-center space-x-2.5 hover:bg-nebula-red/20 hover:text-nebula-red"
              >
                <SubIcon className="w-4 h-4 text-nebula-blue" />
                <span>Add Subtitle File (.srt, .vtt, .ass)...</span>
              </button>
              <button
                onClick={() => {
                  setActiveModal('subtitles');
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 flex items-center space-x-2.5 hover:bg-nebula-red/20 hover:text-nebula-red"
              >
                <Sliders className="w-4 h-4 text-nebula-red" />
                <span>Subtitle Style & Sync...</span>
              </button>
            </div>
          )}
        </div>

        {/* 5. View & Help */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
            className={`px-2.5 py-1 rounded transition-colors hover:bg-slate-800 ${
              activeMenu === 'help' ? 'bg-slate-800 text-nebula-red' : 'text-slate-300'
            }`}
          >
            Help
          </button>
          {activeMenu === 'help' && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-nebula-panel border border-nebula-border rounded-lg shadow-2xl py-1 z-50 text-slate-200">
              <button
                onClick={() => {
                  setActiveModal('shortcuts');
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 flex items-center space-x-2.5 hover:bg-nebula-red/20 hover:text-nebula-red"
              >
                <HelpCircle className="w-4 h-4 text-nebula-blue" />
                <span className="flex-1">Keyboard Shortcuts</span>
                <span className="text-[10px] text-slate-500 font-mono">F1</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 text-slate-400">
        <button
          onClick={toggleSidebar}
          title="Toggle Playlist Sidebar (Ctrl+L)"
          className={`p-1 rounded hover:bg-slate-800 transition-colors ${
            isSidebarOpen ? 'text-nebula-red bg-slate-800/60' : 'text-slate-400'
          }`}
        >
          <ListMusic className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
