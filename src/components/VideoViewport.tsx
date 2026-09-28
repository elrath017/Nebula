import React, { useState, useRef } from 'react';
import { usePlayerStore } from '../state/playerStore';
import { AudioVisualizer } from './AudioVisualizer';
import { SubtitleOverlay } from './SubtitleOverlay';
import { UploadCloud, Play, FolderSearch, FileVideo } from 'lucide-react';
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
        <div className="absolute top-6 right-6 z-50 bg-vlc-panel/90 backdrop-blur border border-vlc-orange/50 text-vlc-orange font-semibold px-4 py-2 rounded-lg shadow-glow-orange animate-bounce text-sm flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-vlc-orange animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Drag & Drop Visual Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-vlc-dark/90 backdrop-blur-md border-4 border-dashed border-vlc-orange flex flex-col items-center justify-center text-vlc-orange space-y-4">
          <UploadCloud className="w-20 h-20 animate-bounce" />
          <h2 className="text-2xl font-bold tracking-wide">Drop Folder or Media Files Here</h2>
          <p className="text-slate-400 text-sm">Extracts videos & music and populates playlist queue</p>
        </div>
      )}

      {/* No Track Selected -> High-End Home Screen Viewport */}
      {!currentTrack ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-vlc-dark via-vlc-dark/95 to-slate-950 text-slate-100 relative">
          <div className="max-w-md w-full bg-vlc-panel/80 border border-vlc-border rounded-2xl p-8 shadow-2xl backdrop-blur flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Cone Icon */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-vlc-orange to-yellow-400 p-0.5 shadow-glow-orange flex items-center justify-center transform hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-vlc-dark rounded-full flex items-center justify-center">
                <svg className="w-14 h-14 text-vlc-orange" viewBox="0 0 100 100">
                  <path d="M50 5 L90 85 L10 85 Z" fill="currentColor" />
                  <path d="M50 25 L78 75 L22 75 Z" fill="#1A1C23" />
                  <path d="M50 40 L68 70 L32 70 Z" fill="currentColor" />
                </svg>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 mb-1">
                VLC Media Player
              </h1>
              <p className="text-xs text-slate-400">
                Cross-platform media player for video streams and high-fidelity audio
              </p>
            </div>

            {/* Action Buttons: Open Folder & Open File */}
            <div className="w-full flex flex-col space-y-3 pt-2">
              <button
                onClick={() => homeFolderInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl bg-vlc-orange hover:bg-vlc-orange-hover text-slate-950 font-bold shadow-glow-orange flex items-center justify-center space-x-2.5 transition-all active:scale-[0.98] text-xs uppercase tracking-wider"
              >
                <FolderSearch className="w-4 h-4 stroke-[2.5]" />
                <span>Open Folder (Videos & Music)</span>
              </button>

              <button
                onClick={() => homeFileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 flex items-center justify-center space-x-2.5 transition-all active:scale-[0.98] text-xs"
              >
                <FileVideo className="w-4 h-4 text-vlc-orange" />
                <span>Open File(s)...</span>
              </button>
            </div>

            {/* Drag & Drop Hint Box */}
            <div className="w-full p-3 rounded-xl border border-dashed border-slate-700 bg-vlc-dark/50 text-[11px] text-slate-400 flex items-center justify-center space-x-2">
              <UploadCloud className="w-4 h-4 text-slate-500" />
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
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none transition-opacity">
              <div className="w-20 h-20 rounded-full bg-vlc-panel/80 border border-vlc-orange/50 flex items-center justify-center text-vlc-orange shadow-glow-orange">
                <Play className="w-10 h-10 ml-1 fill-vlc-orange" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
