import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { VideoViewport } from './components/VideoViewport';
import { PlayerControls } from './components/PlayerControls';
import { PlaylistSidebar } from './components/PlaylistSidebar';
import { MediaInfoModal } from './components/Modals/MediaInfoModal';
import { AudioEqualizerModal } from './components/Modals/AudioEqualizerModal';
import { SubtitleSettingsModal } from './components/Modals/SubtitleSettingsModal';
import { KeyboardShortcutsModal } from './components/Modals/KeyboardShortcutsModal';
import { useMediaPlayer } from './hooks/useMediaPlayer';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAudioEngine } from './hooks/useAudioEngine';
import { usePlayerStore } from './state/playerStore';

export const App: React.FC = () => {
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const hideControlsTimerRef = useRef<number | null>(null);

  const {
    isSidebarOpen,
    activeModal,
    playbackStatus,
    isFullscreen,
  } = usePlayerStore();

  // Media Player Engine Hook
  const {
    videoRef,
    containerRef,
    analyserNode,
    togglePlay,
    stopPlayback,
    seekTo,
    jumpRelative,
    stepFrame,
    togglePiP,
    cycleSubtitleTrack,
    cycleAudioTrack,
    handleLoadedMetadata,
    handleTimeUpdate,
    handleEnded,
  } = useMediaPlayer();

  // Audio Engine Hook (for EQ modal props)
  const { eqGains, setBandGain, selectedPreset, applyPreset } = useAudioEngine(videoRef.current);

  // Keyboard Shortcuts Hook
  useKeyboardShortcuts({
    togglePlay,
    stopPlayback,
    jumpRelative,
    stepFrame,
    cycleSubtitleTrack,
    cycleAudioTrack,
  });

  // Auto-hide player controls during video playback after 3 seconds of mouse stillness
  const handleMouseMove = () => {
    setIsControlsVisible(true);
    if (hideControlsTimerRef.current) {
      window.clearTimeout(hideControlsTimerRef.current);
    }
    if (playbackStatus === 'Playing') {
      hideControlsTimerRef.current = window.setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
    }
  };

  useEffect(() => {
    if (playbackStatus !== 'Playing') {
      setIsControlsVisible(true);
      if (hideControlsTimerRef.current) window.clearTimeout(hideControlsTimerRef.current);
    }
  }, [playbackStatus]);

  return (
    <div className="flex flex-col h-screen w-screen bg-vlc-dark overflow-hidden font-sans text-slate-100 select-none">
      {/* Top Navigation Menu Bar */}
      {!isFullscreen && <Header />}

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left/Center Main Viewport Area */}
        <div className="flex-1 flex flex-col relative h-full bg-black overflow-hidden">
          <VideoViewport
            videoRef={videoRef}
            containerRef={containerRef}
            analyserNode={analyserNode}
            togglePlay={togglePlay}
            handleLoadedMetadata={handleLoadedMetadata}
            handleTimeUpdate={handleTimeUpdate}
            handleEnded={handleEnded}
            isControlsVisible={isControlsVisible}
            onMouseMove={handleMouseMove}
          />

          {/* Bottom Player Controls */}
          <PlayerControls
            togglePlay={togglePlay}
            stopPlayback={stopPlayback}
            seekTo={seekTo}
            jumpRelative={jumpRelative}
            stepFrame={stepFrame}
            togglePiP={togglePiP}
            isControlsVisible={isControlsVisible}
          />
        </div>

        {/* Collapsible Playlist Queue Sidebar */}
        {isSidebarOpen && !isFullscreen && <PlaylistSidebar />}
      </div>

      {/* Active Modal Overlays */}
      {activeModal === 'mediaInfo' && <MediaInfoModal />}
      {activeModal === 'equalizer' && (
        <AudioEqualizerModal
          eqGains={eqGains}
          setBandGain={setBandGain}
          selectedPreset={selectedPreset}
          applyPreset={applyPreset}
        />
      )}
      {activeModal === 'subtitles' && <SubtitleSettingsModal />}
      {activeModal === 'shortcuts' && <KeyboardShortcutsModal />}
    </div>
  );
};

export default App;
