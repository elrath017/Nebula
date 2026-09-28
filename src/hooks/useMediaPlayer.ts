import { useRef, useEffect, useCallback } from 'react';
import { usePlayerStore } from '../state/playerStore';
import { useAudioEngine } from './useAudioEngine';
import { saveResumePosition, getResumePosition } from '../services/playbackResume';
import { formatTime } from '../services/metadataParser';

export function useMediaPlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastSaveTimeRef = useRef<number>(0);

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
      media.volume = Math.min(1.0, volume / 100);
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

  // Save playback position on unmount / track change
  useEffect(() => {
    return () => {
      if (videoRef.current && currentTrack) {
        saveResumePosition(currentTrack.title, videoRef.current.currentTime);
      }
    };
  }, [currentTrack]);

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
      saveResumePosition(currentTrack.title, video.currentTime);
      setPlaybackStatus('Paused');
    }
  }, [currentTrack, setPlaybackStatus, showToast]);

  // Stop playback
  const stopPlayback = useCallback(() => {
    if (videoRef.current && currentTrack) {
      saveResumePosition(currentTrack.title, videoRef.current.currentTime);
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setCurrentTime(0);
    setPlaybackStatus('Stopped');
    showToast('Playback Stopped');
  }, [currentTrack, setCurrentTime, setPlaybackStatus, showToast]);

  // Seek scrubber
  const seekTo = useCallback((targetTimeSec: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = targetTimeSec;
      setCurrentTime(targetTimeSec);
      if (currentTrack) {
        saveResumePosition(currentTrack.title, targetTimeSec);
      }
    }
  }, [currentTrack, setCurrentTime]);

  // Jump relative seconds (e.g. +5s, -5s)
  const jumpRelative = useCallback((deltaSec: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + deltaSec));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      showToast(`${deltaSec > 0 ? '+' : ''}${deltaSec}s`);
      if (currentTrack) {
        saveResumePosition(currentTrack.title, newTime);
      }
    }
  }, [currentTrack, setCurrentTime, showToast]);

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
    if (!videoRef.current || !currentTrack) return;
    const video = videoRef.current;
    const durationSec = video.duration || 0;
    setDuration(durationSec);
    video.playbackRate = playbackSpeed;

    // Check for saved resume position
    const savedPos = getResumePosition(currentTrack.title);
    if (savedPos > 3 && savedPos < durationSec - 5) {
      video.currentTime = savedPos;
      setCurrentTime(savedPos);
      showToast(`Resumed from ${formatTime(savedPos)}`);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || !currentTrack) return;
    const nowSec = videoRef.current.currentTime;
    setCurrentTime(nowSec);

    // Save resume timestamp every 3 seconds
    if (Math.abs(nowSec - lastSaveTimeRef.current) >= 3) {
      lastSaveTimeRef.current = nowSec;
      saveResumePosition(currentTrack.title, nowSec);
    }
  };

  const handleEnded = () => {
    if (currentTrack) {
      saveResumePosition(currentTrack.title, 0); // Reset position on completion
    }

    if (isLooping === 'item') {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    } else {
      nextTrack();
    }
  };

  // Cycle Subtitle Track (Shortcut: V)
  const cycleSubtitleTrack = useCallback(() => {
    const { activeSubtitleTrack, setActiveSubtitleTrack } = usePlayerStore.getState();
    if (!currentTrack) {
      showToast('No active media playing');
      return;
    }
    const subs = currentTrack.subtitles || [];
    if (subs.length === 0) {
      if (activeSubtitleTrack) {
        setActiveSubtitleTrack(null);
        showToast('Subtitles Disabled');
      } else {
        showToast('No subtitles found. Add .srt/.vtt file via Subtitle menu');
      }
      return;
    }

    if (activeSubtitleTrack === null) {
      setActiveSubtitleTrack(subs[0]);
    } else {
      const idx = subs.findIndex((s) => s.id === activeSubtitleTrack.id);
      if (idx >= 0 && idx < subs.length - 1) {
        setActiveSubtitleTrack(subs[idx + 1]);
      } else {
        setActiveSubtitleTrack(null);
      }
    }
  }, [currentTrack, showToast]);

  // Cycle Audio Track / Dual Audio (Shortcut: B)
  const cycleAudioTrack = useCallback(() => {
    if (!currentTrack || !videoRef.current) {
      showToast('No active media playing');
      return;
    }

    const video = videoRef.current;
    // Check for native browser AudioTrackList API
    const nativeAudioTracks = (video as unknown as { audioTracks?: Array<{ enabled: boolean; label?: string; language?: string }> }).audioTracks;
    if (nativeAudioTracks && nativeAudioTracks.length > 1) {
      let activeIdx = 0;
      for (let i = 0; i < nativeAudioTracks.length; i++) {
        if (nativeAudioTracks[i].enabled) {
          activeIdx = i;
          break;
        }
      }
      const nextIdx = (activeIdx + 1) % nativeAudioTracks.length;
      for (let i = 0; i < nativeAudioTracks.length; i++) {
        nativeAudioTracks[i].enabled = (i === nextIdx);
      }
      const trackName = nativeAudioTracks[nextIdx].label || nativeAudioTracks[nextIdx].language || `Stream ${nextIdx + 1}`;
      showToast(`Audio Track ${nextIdx + 1}: ${trackName}`);
      return;
    }

    // Dual Audio channel switcher fallback (Stereo -> Track 1 / Left -> Track 2 / Right)
    const store = usePlayerStore.getState();
    const currentMode = (store as unknown as { _audioChannelMode?: string })._audioChannelMode || 'stereo';
    const modes: Array<'stereo' | 'left' | 'right'> = ['stereo', 'left', 'right'];
    const nextMode = modes[(modes.indexOf(currentMode as 'stereo') + 1) % modes.length];
    
    usePlayerStore.setState({ _audioChannelMode: nextMode } as unknown as Record<string, unknown>);

    const labels: Record<string, string> = {
      stereo: 'Audio Track: Primary Stereo (Default)',
      left: 'Audio Track 1: Dual Audio Stream 1 (Left)',
      right: 'Audio Track 2: Dual Audio Stream 2 (Right)',
    };
    showToast(labels[nextMode]);
  }, [currentTrack, showToast]);

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
    cycleSubtitleTrack,
    cycleAudioTrack,
    handleLoadedMetadata,
    handleTimeUpdate,
    handleEnded,
  };
}
