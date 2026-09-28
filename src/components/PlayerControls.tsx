import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Volume1, 
  Maximize, 
  Minimize, 
  PictureInPicture, 
  Sliders, 
  ListMusic, 
  ChevronRight, 
  Repeat, 
  Shuffle, 
  Sparkles,
  Gauge
} from 'lucide-react';
import { usePlayerStore } from '../state/playerStore';
import { formatTime } from '../services/metadataParser';
import { AspectRatioMode } from '../types/media';

interface PlayerControlsProps {
  togglePlay: () => void;
  stopPlayback: () => void;
  seekTo: (sec: number) => void;
  jumpRelative: (sec: number) => void;
  stepFrame: () => void;
  togglePiP: () => void;
  isControlsVisible: boolean;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  togglePlay,
  stopPlayback,
  seekTo,
  jumpRelative,
  stepFrame,
  togglePiP,
  isControlsVisible,
}) => {
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);

  const {
    currentTrack,
    playbackStatus,
    currentTime,
    duration,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    playbackSpeed,
    setPlaybackSpeed,
    nextTrack,
    previousTrack,
    isLooping,
    toggleLoop,
    isShuffle,
    toggleShuffle,
    aspectRatio,
    setAspectRatio,
    isFullscreen,
    setIsFullscreen,
    isSidebarOpen,
    toggleSidebar,
    setActiveModal,
  } = usePlayerStore();

  const handleScrubberMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(pos * duration);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-4 h-4 text-red-400" />;
    if (volume > 100) return <Volume2 className="w-4 h-4 text-[#E62B70] animate-pulse" />;
    if (volume < 50) return <Volume1 className="w-4 h-4 text-slate-300" />;
    return <Volume2 className="w-4 h-4 text-[#38BDF8]" />;
  };

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#090A16]/95 via-[#090A16]/85 to-transparent backdrop-blur-md border-t border-[#282C4F]/60 px-4 py-3 flex flex-col justify-between transition-all duration-300 z-30 select-none ${
        isControlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
      }`}
    >
      {/* 1. Timeline Scrubber Bar with Orion Time Tooltip */}
      <div className="relative mb-2 group cursor-pointer" onMouseMove={handleScrubberMouseMove} onMouseLeave={() => setHoverTime(null)}>
        {/* Hover Time Tooltip */}
        {hoverTime !== null && (
          <div
            className="absolute -top-8 bg-[#101226] text-[#38BDF8] font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-glow-blue border border-[#282C4F] -translate-x-1/2 pointer-events-none z-50"
            style={{ left: `${hoverPosition}%` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}

        {/* Custom Progress Track */}
        <div
          onClick={handleScrubberClick}
          className="relative w-full h-2 bg-slate-900 rounded-full overflow-hidden transition-all group-hover:h-2.5 border border-slate-800"
        >
          {/* Progress Fill (Orion Magenta-to-Purple-to-Cyan Gradient) */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#E62B70] via-[#8B5CF6] to-[#38BDF8] transition-all rounded-full shadow-glow-red"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Control Toolbar */}
      <div className="flex items-center justify-between text-xs">
        {/* Left Section: Playback Controls */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            disabled={!currentTrack}
            title="Play / Pause (Space)"
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E62B70] via-[#9333EA] to-[#38BDF8] hover:from-[#F43F5E] hover:to-[#38BDF8] text-white flex items-center justify-center transition-all shadow-glow-red active:scale-95 disabled:opacity-40"
          >
            {playbackStatus === 'Playing' ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 ml-0.5 fill-white" />
            )}
          </button>

          {/* Stop */}
          <button
            onClick={stopPlayback}
            disabled={!currentTrack}
            title="Stop Playback (S)"
            className="p-2 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>

          {/* Previous Track */}
          <button
            onClick={previousTrack}
            disabled={!currentTrack}
            title="Previous Track (P)"
            className="p-2 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          {/* Jump -5s */}
          <button
            onClick={() => jumpRelative(-5)}
            disabled={!currentTrack}
            title="Jump Backward 5s (Left Arrow)"
            className="px-1.5 py-1 rounded text-slate-400 hover:text-[#38BDF8] hover:bg-slate-800 transition-colors font-mono text-[10px] disabled:opacity-40"
          >
            -5s
          </button>

          {/* Jump +5s */}
          <button
            onClick={() => jumpRelative(5)}
            disabled={!currentTrack}
            title="Jump Forward 5s (Right Arrow)"
            className="px-1.5 py-1 rounded text-slate-400 hover:text-[#38BDF8] hover:bg-slate-800 transition-colors font-mono text-[10px] disabled:opacity-40"
          >
            +5s
          </button>

          {/* Next Track */}
          <button
            onClick={nextTrack}
            disabled={!currentTrack}
            title="Next Track (N)"
            className="p-2 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          {/* Frame Advance Button */}
          <button
            onClick={stepFrame}
            disabled={!currentTrack}
            title="Frame-by-Frame Advance (E)"
            className="px-2 py-1 rounded bg-slate-800/90 text-slate-300 hover:text-[#E62B70] hover:bg-slate-700 transition-colors font-mono text-[10px] flex items-center space-x-1 disabled:opacity-40"
          >
            <span>+1 Frame</span>
            <ChevronRight className="w-3 h-3" />
          </button>

          {/* Loop & Shuffle */}
          <button
            onClick={toggleLoop}
            title={`Loop Mode: ${isLooping}`}
            className={`p-1.5 rounded transition-colors ${
              isLooping !== 'off' ? 'text-[#E62B70] bg-[#E62B70]/15 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Repeat className="w-4 h-4" />
          </button>

          <button
            onClick={toggleShuffle}
            title={`Shuffle: ${isShuffle ? 'On' : 'Off'}`}
            className={`p-1.5 rounded transition-colors ${
              isShuffle ? 'text-[#E62B70] bg-[#E62B70]/15 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Time Display */}
          <div className="font-mono text-slate-300 text-[11px] ml-2 hidden md:inline">
            <span className="text-[#E62B70] font-semibold">{formatTime(currentTime)}</span>
            <span className="text-slate-500 mx-1">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Section: Audio Boost, Speed, Aspect Ratio, Modals & Window Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Volume Control Slider with 200% Boost Indicator */}
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-[#282C4F]/60 px-2.5 py-1 rounded-lg">
            <button onClick={toggleMute} title="Mute / Unmute (M)">
              {getVolumeIcon()}
            </button>
            <input
              type="range"
              min="0"
              max="200"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-16 sm:w-24 accent-[#E62B70]"
            />
            <span
              className={`font-mono text-[11px] min-w-[38px] text-right font-semibold ${
                volume > 100 ? 'text-[#E62B70] font-bold' : 'text-slate-400'
              }`}
            >
              {isMuted ? '0%' : `${volume}%`}
            </span>
          </div>

          {/* Speed Selector */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-[#38BDF8] transition-colors flex items-center space-x-1 text-[11px] font-mono"
              title="Playback Speed ([ and ])"
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>{playbackSpeed}x</span>
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-28 bg-[#101226] border border-[#282C4F] rounded-lg shadow-2xl py-1 z-50">
                {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setPlaybackSpeed(s);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1 text-[11px] hover:bg-[#E62B70]/20 hover:text-[#E62B70] font-mono flex items-center justify-between ${
                      playbackSpeed === s ? 'text-[#E62B70] font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span>{s}x</span>
                    {playbackSpeed === s && <Sparkles className="w-3 h-3 text-[#38BDF8]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Aspect Ratio Quick Toggle */}
          <button
            onClick={() => {
              const ratios: AspectRatioMode[] = ['Auto', '16:9', '4:3', '21:9', 'Fill', 'Fit'];
              const nextIdx = (ratios.indexOf(aspectRatio) + 1) % ratios.length;
              setAspectRatio(ratios[nextIdx]);
            }}
            title="Aspect Ratio (A)"
            className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-[#38BDF8] transition-colors text-[11px] font-semibold hidden lg:inline"
          >
            {aspectRatio}
          </button>

          {/* Picture in Picture */}
          <button
            onClick={togglePiP}
            title="Picture in Picture Mode"
            className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <PictureInPicture className="w-4 h-4" />
          </button>

          {/* Audio Equalizer Modal Trigger */}
          <button
            onClick={() => setActiveModal('equalizer')}
            title="10-Band Equalizer"
            className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Sidebar Playlist Toggle */}
          <button
            onClick={toggleSidebar}
            title="Playlist Sidebar (Ctrl+L)"
            className={`p-1.5 rounded transition-colors ${
              isSidebarOpen ? 'text-[#E62B70] bg-slate-800' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
              } else {
                if (document.exitFullscreen) document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
              }
            }}
            title="Toggle Fullscreen (F)"
            className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
