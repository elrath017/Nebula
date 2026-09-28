import { useRef, useEffect, useCallback } from 'react';
import { usePlayerStore } from '../state/playerStore';
import { useAudioEngine } from './useAudioEngine';

export function useMediaPlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    currentTrack,
    playbackStatus,
    volume,
    isMuted,
    playbackSpeed,
    audioDelayMs,
    isLooping,
    setPlaybackStatus,
    setCurrentTime,
    setDuration,
    nextTrack,
    showToast,
  } = usePlayerStore();

  // Initialize Web Audio Engine hook
  const { analyserNode, setVolumeBoost, setAudioDelayMs } = useAudioEngine(videoRef.current);

  // Sync Volume boost to Web Audio Engine and HTML5 Video Element
  useEffect(() => {
    if (!videoRef.current) return;
    const media = videoRef.current;
    
    if (isMuted) {
      media.volume = 0;
      setVolumeBoost(0);
    } else {
      // Direct media element volume capped at 1.0 (100%)
      media.volume = Math.min(1.0, volume / 100);
      // Web audio gain node handles up to 2.0 (200%)
      setVolumeBoost(volume / 100);
    }
  }, [volume, isMuted, setVolumeBoost]);

  // Sync Playback Speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Sync Audio Delay
  useEffect(() => {
    setAudioDelayMs(audioDelayMs);
  }, [audioDelayMs, setAudioDelayMs]);

  // Play / Pause toggler
  const togglePlay = useCallback(() => {
    if (!videoRef.current || !currentTrack) return;
    const video = videoRef.current;

    if (video.paused) {
      video.play().then(() => {
        setPlaybackStatus('Playing');
      }).catch((err) => {
        console.error('Play error:', err);
        setPlaybackStatus('Error');
        showToast('Playback error: Unable to play media stream');
      });
    } else {
      video.pause();
      setPlaybackStatus('Paused');
    }
  }, [currentTrack, setPlaybackStatus, showToast]);

  // Stop playback
  const stopPlayback = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setCurrentTime(0);
    setPlaybackStatus('Stopped');
    showToast('Playback Stopped');
  }, [setCurrentTime, setPlaybackStatus, showToast]);

  // Seek scrubber
  const seekTo = useCallback((targetTimeSec: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = targetTimeSec;
      setCurrentTime(targetTimeSec);
    }
  }, [setCurrentTime]);

  // Jump relative seconds (e.g. +5s, -5s)
  const jumpRelative = useCallback((deltaSec: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + deltaSec));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      showToast(`${deltaSec > 0 ? '+' : ''}${deltaSec}s`);
    }
  }, [setCurrentTime, showToast]);

  // Frame advance (1/25th of a second step)
  const stepFrame = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setPlaybackStatus('Paused');
      const frameDuration = 1 / 25; // 0.04s for 25 FPS
      const newTime = Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + frameDuration);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      showToast('Frame +1');
    }
  }, [setCurrentTime, setPlaybackStatus, showToast]);

  // Toggle Picture in Picture (PiP)
  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        showToast('Exited Picture-in-Picture');
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
        showToast('Entered Picture-in-Picture');
      }
    } catch (err) {
      console.error('PiP Error:', err);
      showToast('Picture-in-Picture not available for this media');
    }
  }, [showToast]);

  // Track changed handler
  useEffect(() => {
    if (!currentTrack || !videoRef.current) return;
    const video = videoRef.current;
    
    video.src = currentTrack.url;
    video.load();

    if (playbackStatus === 'Playing' || playbackStatus === 'Loading') {
      video.play().then(() => {
        setPlaybackStatus('Playing');
      }).catch((err) => {
        console.warn('Autoplay prevented:', err);
        setPlaybackStatus('Paused');
      });
    }
  }, [currentTrack]);

  // Media element event handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      videoRef.current.playbackRate = playbackSpeed;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    if (isLooping === 'item') {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    } else {
      nextTrack();
    }
  };

  return {
    videoRef,
    containerRef,
    analyserNode,
    togglePlay,
    stopPlayback,
    seekTo,
    jumpRelative,
    stepFrame,
    togglePiP,
    handleLoadedMetadata,
    handleTimeUpdate,
    handleEnded,
  };
}
