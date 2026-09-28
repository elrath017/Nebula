import { create } from 'zustand';
import { AspectRatioMode, MediaItem, ModalType, PlaybackStatus, SubtitleTrack, VisualizerMode } from '../types/media';

export interface SubtitleStyleSettings {
  fontSize: number; // in pixels (e.g. 24)
  positionBottom: number; // in percentage (e.g. 10%)
  textColor: string; // hex code (e.g. #FFFFFF)
  bgColor: string; // rgba string
}

interface PlayerState {
  // Playlist & Track
  playlist: MediaItem[];
  currentIndex: number;
  currentTrack: MediaItem | null;

  // Playback Control
  playbackStatus: PlaybackStatus;
  currentTime: number;
  duration: number;
  volume: number; // 0 to 200 (%)
  isMuted: boolean;
  playbackSpeed: number; // 0.25, 0.5, 1, 1.25, 1.5, 2
  isLooping: 'off' | 'item' | 'all';
  isShuffle: boolean;

  // Video & Subtitle Settings
  aspectRatio: AspectRatioMode;
  audioDelayMs: number; // in ms (-5000 to +5000)
  subtitleDelayMs: number; // in ms (-5000 to +5000)
  activeSubtitleTrack: SubtitleTrack | null;
  subtitleStyles: SubtitleStyleSettings;
  visualizerMode: VisualizerMode;

  // UI state
  isFullscreen: boolean;
  isSidebarOpen: boolean;
  activeModal: ModalType;
  toastMessage: string | null;
  toastTimeoutId: number | null;

  // Actions
  setPlaylist: (items: MediaItem[]) => void;
  addMediaItems: (items: MediaItem[], playImmediately?: boolean) => void;
  removeMediaItem: (id: string) => void;
  reorderPlaylist: (fromIndex: number, toIndex: number) => void;
  clearPlaylist: () => void;
  selectTrack: (index: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;

  setPlaybackStatus: (status: PlaybackStatus) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackSpeed: (speed: number) => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;

  setAspectRatio: (aspect: AspectRatioMode) => void;
  setAudioDelayMs: (ms: number) => void;
  adjustAudioDelayMs: (deltaMs: number) => void;
  setSubtitleDelayMs: (ms: number) => void;
  adjustSubtitleDelayMs: (deltaMs: number) => void;
  setActiveSubtitleTrack: (track: SubtitleTrack | null) => void;
  setSubtitleStyles: (styles: Partial<SubtitleStyleSettings>) => void;
  setVisualizerMode: (mode: VisualizerMode) => void;

  setIsFullscreen: (full: boolean) => void;
  toggleSidebar: () => void;
  setActiveModal: (modal: ModalType) => void;
  showToast: (msg: string) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  playlist: [],
  currentIndex: -1,
  currentTrack: null,

  playbackStatus: 'Idle',
  currentTime: 0,
  duration: 0,
  volume: 100,
  isMuted: false,
  playbackSpeed: 1.0,
  isLooping: 'off',
  isShuffle: false,

  aspectRatio: 'Auto',
  audioDelayMs: 0,
  subtitleDelayMs: 0,
  activeSubtitleTrack: null,
  subtitleStyles: {
    fontSize: 26,
    positionBottom: 10,
    textColor: '#FFFFFF',
    bgColor: 'rgba(0, 0, 0, 0.75)',
  },
  visualizerMode: 'bars',

  isFullscreen: false,
  isSidebarOpen: true,
  activeModal: null,
  toastMessage: null,
  toastTimeoutId: null,

  setPlaylist: (items) => {
    set({
      playlist: items,
      currentIndex: 0,
      currentTrack: items[0] || null,
      activeSubtitleTrack: items[0]?.subtitles?.[0] || null,
    });
  },

  addMediaItems: (newItems, playImmediately = false) => {
    const { playlist, selectTrack } = get();
    const updated = [...playlist, ...newItems];
    set({ playlist: updated });
    get().showToast(`Added ${newItems.length} item(s) to playlist`);
    if (playImmediately && newItems.length > 0) {
      selectTrack(playlist.length);
    }
  },

  removeMediaItem: (id) => {
    const { playlist, currentIndex, currentTrack } = get();
    const updated = playlist.filter((item) => item.id !== id);
    let nextIndex = currentIndex;
    if (currentTrack?.id === id) {
      nextIndex = Math.min(currentIndex, updated.length - 1);
    }
    set({
      playlist: updated,
      currentIndex: Math.max(0, nextIndex),
      currentTrack: updated[nextIndex] || null,
    });
  },

  reorderPlaylist: (fromIndex, toIndex) => {
    const { playlist, currentIndex } = get();
    const copy = [...playlist];
    const [moved] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, moved);

    let newCurrentIndex = currentIndex;
    if (currentIndex === fromIndex) {
      newCurrentIndex = toIndex;
    } else if (currentIndex > fromIndex && currentIndex <= toIndex) {
      newCurrentIndex = currentIndex - 1;
    } else if (currentIndex < fromIndex && currentIndex >= toIndex) {
      newCurrentIndex = currentIndex + 1;
    }

    set({ playlist: copy, currentIndex: newCurrentIndex });
  },

  clearPlaylist: () => {
    set({
      playlist: [],
      currentIndex: -1,
      currentTrack: null,
      playbackStatus: 'Stopped',
      currentTime: 0,
      duration: 0,
    });
    get().showToast('Playlist cleared');
  },

  selectTrack: (index) => {
    const { playlist } = get();
    if (index >= 0 && index < playlist.length) {
      const track = playlist[index];
      set({
        currentIndex: index,
        currentTrack: track,
        currentTime: 0,
        duration: track.duration || 0,
        activeSubtitleTrack: track.subtitles?.[0] || null,
        playbackStatus: 'Loading',
      });
      get().showToast(`Playing: ${track.title}`);
    }
  },

  nextTrack: () => {
    const { playlist, currentIndex, isShuffle, isLooping, selectTrack } = get();
    if (playlist.length === 0) return;

    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      selectTrack(randomIndex);
      return;
    }

    if (currentIndex < playlist.length - 1) {
      selectTrack(currentIndex + 1);
    } else if (isLooping === 'all') {
      selectTrack(0);
    } else {
      set({ playbackStatus: 'Stopped' });
    }
  },

  previousTrack: () => {
    const { playlist, currentIndex, currentTime, selectTrack } = get();
    if (playlist.length === 0) return;

    // If played more than 3 seconds, restart current track
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    if (currentIndex > 0) {
      selectTrack(currentIndex - 1);
    } else {
      selectTrack(playlist.length - 1);
    }
  },

  setPlaybackStatus: (status) => set({ playbackStatus: status }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration: duration }),

  setVolume: (vol) => {
    const clampedVol = Math.max(0, Math.min(200, Math.round(vol)));
    set({ volume: clampedVol, isMuted: clampedVol === 0 });
    get().showToast(`Volume: ${clampedVol}%`);
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    set({ isMuted: !isMuted });
    get().showToast(!isMuted ? 'Muted' : `Unmuted (${volume}%)`);
  },

  setPlaybackSpeed: (speed) => {
    const roundedSpeed = parseFloat(speed.toFixed(2));
    set({ playbackSpeed: roundedSpeed });
    get().showToast(`Speed: ${roundedSpeed}x`);
  },

  toggleLoop: () => {
    const { isLooping } = get();
    const modes: Array<'off' | 'item' | 'all'> = ['off', 'item', 'all'];
    const nextMode = modes[(modes.indexOf(isLooping) + 1) % modes.length];
    set({ isLooping: nextMode });
    const labels = { off: 'Loop Off', item: 'Loop Single Track', all: 'Loop All Playlist' };
    get().showToast(labels[nextMode]);
  },

  toggleShuffle: () => {
    const { isShuffle } = get();
    set({ isShuffle: !isShuffle });
    get().showToast(!isShuffle ? 'Shuffle On' : 'Shuffle Off');
  },

  setAspectRatio: (aspect) => {
    set({ aspectRatio: aspect });
    get().showToast(`Aspect Ratio: ${aspect}`);
  },

  setAudioDelayMs: (ms) => {
    set({ audioDelayMs: ms });
    get().showToast(`Audio Delay: ${ms > 0 ? '+' : ''}${ms} ms`);
  },

  adjustAudioDelayMs: (deltaMs) => {
    const { audioDelayMs } = get();
    const newDelay = audioDelayMs + deltaMs;
    set({ audioDelayMs: newDelay });
    get().showToast(`Audio Sync: ${newDelay > 0 ? '+' : ''}${newDelay} ms`);
  },

  setSubtitleDelayMs: (ms) => {
    set({ subtitleDelayMs: ms });
    get().showToast(`Subtitle Delay: ${ms > 0 ? '+' : ''}${ms} ms`);
  },

  adjustSubtitleDelayMs: (deltaMs) => {
    const { subtitleDelayMs } = get();
    const newDelay = subtitleDelayMs + deltaMs;
    set({ subtitleDelayMs: newDelay });
    get().showToast(`Sub Sync: ${newDelay > 0 ? '+' : ''}${newDelay} ms`);
  },

  setActiveSubtitleTrack: (track) => {
    set({ activeSubtitleTrack: track });
    get().showToast(track ? `Subtitle: ${track.name}` : 'Subtitles Disabled');
  },

  setSubtitleStyles: (styles) => {
    set((state) => ({
      subtitleStyles: { ...state.subtitleStyles, ...styles },
    }));
  },

  setVisualizerMode: (mode) => set({ visualizerMode: mode }),

  setIsFullscreen: (full) => set({ isFullscreen: full }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setActiveModal: (modal) => set({ activeModal: modal }),

  showToast: (msg) => {
    const { toastTimeoutId } = get();
    if (toastTimeoutId) clearTimeout(toastTimeoutId);

    const newTimeout = window.setTimeout(() => {
      set({ toastMessage: null, toastTimeoutId: null });
    }, 2500);

    set({ toastMessage: msg, toastTimeoutId: newTimeout });
  },
}));
