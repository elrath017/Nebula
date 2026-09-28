import { useEffect } from 'react';
import { usePlayerStore } from '../state/playerStore';
import { AspectRatioMode } from '../types/media';

interface ShortcutsProps {
  togglePlay: () => void;
  stopPlayback: () => void;
  jumpRelative: (sec: number) => void;
  stepFrame: () => void;
}

export function useKeyboardShortcuts({
  togglePlay,
  stopPlayback,
  jumpRelative,
  stepFrame,
}: ShortcutsProps) {
  const {
    volume,
    setVolume,
    toggleMute,
    playbackSpeed,
    setPlaybackSpeed,
    nextTrack,
    previousTrack,
    adjustSubtitleDelayMs,
    adjustAudioDelayMs,
    aspectRatio,
    setAspectRatio,
    isFullscreen,
    setIsFullscreen,
    activeModal,
    setActiveModal,
  } = usePlayerStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger hotkeys when typing in input fields or textareas
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Close modal on Escape
      if (e.key === 'Escape') {
        if (activeModal) {
          setActiveModal(null);
          return;
        }
        if (isFullscreen) {
          if (document.exitFullscreen) document.exitFullscreen();
          setIsFullscreen(false);
          return;
        }
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;

        case 'KeyS':
          e.preventDefault();
          stopPlayback();
          break;

        case 'KeyE':
          e.preventDefault();
          stepFrame();
          break;

        case 'KeyF':
          e.preventDefault();
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
          } else {
            if (document.exitFullscreen) document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
          }
          break;

        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;

        case 'ArrowUp':
          e.preventDefault();
          setVolume(volume + 5);
          break;

        case 'ArrowDown':
          e.preventDefault();
          setVolume(volume - 5);
          break;

        case 'ArrowLeft':
          e.preventDefault();
          jumpRelative(e.shiftKey ? -10 : -5);
          break;

        case 'ArrowRight':
          e.preventDefault();
          jumpRelative(e.shiftKey ? 10 : 5);
          break;

        case 'BracketLeft':
          e.preventDefault();
          setPlaybackSpeed(Math.max(0.25, playbackSpeed - 0.25));
          break;

        case 'BracketRight':
          e.preventDefault();
          setPlaybackSpeed(Math.min(2.0, playbackSpeed + 0.25));
          break;

        case 'Equal':
          e.preventDefault();
          setPlaybackSpeed(1.0);
          break;

        case 'KeyJ':
          e.preventDefault();
          adjustSubtitleDelayMs(-50);
          break;

        case 'KeyK':
          e.preventDefault();
          adjustSubtitleDelayMs(50);
          break;

        case 'KeyG':
          e.preventDefault();
          adjustAudioDelayMs(-50);
          break;

        case 'KeyH':
          e.preventDefault();
          adjustAudioDelayMs(50);
          break;

        case 'KeyN':
          e.preventDefault();
          nextTrack();
          break;

        case 'KeyP':
          e.preventDefault();
          previousTrack();
          break;

        case 'KeyA': {
          e.preventDefault();
          const aspectRatios: AspectRatioMode[] = ['Auto', '16:9', '4:3', '21:9', '1:1', 'Fill', 'Fit'];
          const nextIndex = (aspectRatios.indexOf(aspectRatio) + 1) % aspectRatios.length;
          setAspectRatio(aspectRatios[nextIndex]);
          break;
        }

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    stopPlayback,
    jumpRelative,
    stepFrame,
    volume,
    setVolume,
    toggleMute,
    playbackSpeed,
    setPlaybackSpeed,
    nextTrack,
    previousTrack,
    adjustSubtitleDelayMs,
    adjustAudioDelayMs,
    aspectRatio,
    setAspectRatio,
    isFullscreen,
    setIsFullscreen,
    activeModal,
    setActiveModal,
  ]);
}
