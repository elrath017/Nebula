import React, { useState, useRef } from 'react';
import { usePlayerStore } from '../state/playerStore';
import { AudioVisualizer } from './AudioVisualizer';
import { SubtitleOverlay } from './SubtitleOverlay';
import { UploadCloud, Play, FolderSearch, FileVideo, Atom, Sparkles } from 'lucide-react';
import { scanDroppedDirectoryItems, filterAndProcessMediaFiles } from '../services/fileLoader';
import { createMediaItemFromFile } from '../services/metadataParser';

interface VideoViewportProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  analyserNode: AnalyserNode | null;
  togglePlay: () => void;
  handleLoadedMetadata: () => void;
  handleTimeUpdate: () => void;
  handleEnded: () => void;
  isControlsVisible: boolean;
  onMouseMove: () => void;
}

export const VideoViewport: React.FC<VideoViewportProps> = ({
  videoRef,
  containerRef,
  analyserNode,
  togglePlay,
  handleLoadedMetadata,
  handleTimeUpdate,
  handleEnded,
  onMouseMove,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const homeFileInputRef = useRef<HTMLInputElement>(null);
  const homeFolderInputRef = useRef<HTMLInputElement>(null);

  const {
    currentTrack,
    playbackStatus,
    aspectRatio,
    currentTime,
    subtitleDelayMs,
    activeSubtitleTrack,
    subtitleStyles,
    visualizerMode,
    toastMessage,
    setPlaylist,
    showToast,
    isFullscreen,
    setIsFullscreen,
  } = usePlayerStore();

  const handleOpenHomeFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const mediaItems = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const item = await createMediaItemFromFile(file);
      mediaItems.push(item);
    }
    setPlaylist(mediaItems);
    showToast(`Loaded ${mediaItems.length} media file(s)`);
  };

  const handleOpenHomeFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    let mediaItems: import('../types/media').MediaItem[] = [];
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      mediaItems = await scanDroppedDirectoryItems(e.dataTransfer.items);
    } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      mediaItems = await filterAndProcessMediaFiles(e.dataTransfer.files);
    }

    if (mediaItems.length === 0) {
      showToast('No video or music files found in dropped selection');
      return;
    }

    setPlaylist(mediaItems);
    showToast(`Loaded ${mediaItems.length} video & music track(s) from folder`);
  };

  // Double click full screen toggle
  const handleDoubleClick = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current) {
        containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  // Compute CSS aspect ratio classes or object-fit inline styles based on aspectRatio state
  const getAspectRatioStyle = (): React.CSSProperties => {
    switch (aspectRatio) {
      case '16:9':
        return { aspectRatio: '16 / 9', objectFit: 'contain' };
      case '4:3':
        return { aspectRatio: '4 / 3', objectFit: 'contain' };
      case '21:9':
        return { aspectRatio: '21 / 9', objectFit: 'contain' };
      case '1:1':
        return { aspectRatio: '1 / 1', objectFit: 'contain' };
      case 'Fill':
        return { width: '100%', height: '100%', objectFit: 'cover' };
      case 'Fit':
        return { width: '100%', height: '100%', objectFit: 'contain' };
      case 'Auto':
      default:
        return { width: '100%', height: '100%', objectFit: 'contain' };
    }
  };

  const isAudioTrack = currentTrack?.type === 'audio';

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex-1 bg-black flex items-center justify-center overflow-hidden select-none ${
        isFullscreen ? 'w-screen h-screen' : 'w-full h-full'
      }`}
    >
      {/* Hidden File & Folder Inputs for Home Screen */}
      <input
        type="file"
        ref={homeFileInputRef}
        onChange={handleOpenHomeFiles}
        multiple
        accept="video/*,audio/*,.mp4,.mkv,.avi,.mov,.mp3,.flac,.wav,.aac,.ogg"
        className="hidden"
      />
      <input
        type="file"
        ref={homeFolderInputRef}
        onChange={handleOpenHomeFolder}
        // @ts-expect-error webkitdirectory is non-standard but supported in all modern browsers
        webkitdirectory="true"
        directory=""
        multiple
        className="hidden"
      />

      {/* Toast Notification Overlay */}
      {toastMessage && (
        <div className="absolute top-6 right-6 z-50 bg-[#101226]/95 backdrop-blur-md border border-[#E62B70]/60 text-slate-100 font-semibold px-4 py-2 rounded-xl shadow-glow-red animate-bounce text-sm flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Drag & Drop Visual Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-[#090A16]/95 backdrop-blur-md border-4 border-dashed border-[#E62B70] flex flex-col items-center justify-center text-[#38BDF8] space-y-4">
          <UploadCloud className="w-20 h-20 text-[#E62B70] animate-bounce" />
          <h2 className="text-2xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#E62B70] via-[#8B5CF6] to-[#38BDF8]">
            Drop Folder or Media Files Here
          </h2>
          <p className="text-slate-400 text-sm">Extracts videos & music into Nebula playlist queue</p>
        </div>
      )}

      {/* No Track Selected -> Orion Nebula Visual Home Screen Viewport */}
      {!currentTrack ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#230C2D] via-[#0F0D24] to-[#04050A] text-slate-100 relative overflow-hidden">
          {/* Orion Nebula Cosmic Gas Dust Clouds */}
          <div className="absolute -top-24 -left-24 w-[30rem] h-[30rem] rounded-full bg-[#E62B70]/20 blur-[130px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[25rem] h-[25rem] rounded-full bg-[#8B5CF6]/20 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] rounded-full bg-[#38BDF8]/20 blur-[140px] pointer-events-none" />

          <div className="max-w-md w-full bg-[#101226]/85 border border-[#282C4F] rounded-3xl p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-200 relative z-10">
            {/* Orion Core Orb Icon */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#E62B70] via-[#8B5CF6] to-[#38BDF8] p-0.5 shadow-glow-red flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#090A16] rounded-full flex items-center justify-center">
                <Atom className="w-14 h-14 text-[#38BDF8] animate-spin-slow" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#E62B70]" />
                <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#E62B70] via-[#C084FC] to-[#38BDF8]">
                  Nebula Media Player
                </h1>
                <Sparkles className="w-4 h-4 text-[#38BDF8]" />
              </div>
              <p className="text-xs text-slate-400">
                Orion Cosmic High-Fidelity Audio & Video Engine
              </p>
            </div>

            {/* Action Buttons: Open Folder & Open File */}
            <div className="w-full flex flex-col space-y-3 pt-2">
              <button
                onClick={() => homeFolderInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#E62B70] via-[#9333EA] to-[#6366F1] hover:from-[#F43F5E] hover:to-[#38BDF8] text-white font-bold shadow-glow-red flex items-center justify-center space-x-2.5 transition-all active:scale-[0.98] text-xs uppercase tracking-wider"
              >
                <FolderSearch className="w-4 h-4 stroke-[2.5]" />
                <span>Open Folder (Videos & Music)</span>
              </button>

              <button
                onClick={() => homeFileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl bg-[#101226]/90 hover:bg-[#191C36] text-[#38BDF8] font-semibold border border-[#38BDF8]/40 shadow-glow-blue flex items-center justify-center space-x-2.5 transition-all active:scale-[0.98] text-xs"
              >
                <FileVideo className="w-4 h-4 text-[#38BDF8]" />
                <span>Open File(s)...</span>
              </button>
            </div>

            {/* Drag & Drop Hint Box */}
            <div className="w-full p-3 rounded-xl border border-dashed border-[#282C4F] bg-[#090A16]/60 text-[11px] text-slate-400 flex items-center justify-center space-x-2">
              <UploadCloud className="w-4 h-4 text-[#E62B70]" />
              <span>Or drag & drop any folder or media files anywhere</span>
            </div>
          </div>
        </div>
      ) : isAudioTrack ? (
        /* Audio Visualizer Canvas Viewport */
        <AudioVisualizer
          analyserNode={analyserNode}
          mode={visualizerMode}
          isPlaying={playbackStatus === 'Playing'}
          trackTitle={currentTrack.title}
          artistName={currentTrack.artist}
        />
      ) : (
        /* Video Viewport Container */
        <div
          onClick={togglePlay}
          onDoubleClick={handleDoubleClick}
          className="relative w-full h-full flex items-center justify-center cursor-pointer group"
        >
          <video
            ref={videoRef}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            style={getAspectRatioStyle()}
            className="max-w-full max-h-full transition-all duration-200"
            playsInline
          />

          {/* Subtitle Overlay */}
          <SubtitleOverlay
            activeTrack={activeSubtitleTrack}
            currentTime={currentTime}
            delayMs={subtitleDelayMs}
            styles={subtitleStyles}
          />

          {/* Big Play Pause Overlay Indicator when paused */}
          {playbackStatus === 'Paused' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none transition-opacity">
              <div className="w-20 h-20 rounded-full bg-[#101226]/90 border border-[#E62B70]/60 flex items-center justify-center text-[#E62B70] shadow-glow-red">
                <Play className="w-10 h-10 ml-1 fill-[#E62B70]" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
