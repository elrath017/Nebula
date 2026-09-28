export type PlaybackStatus = 'Idle' | 'Loading' | 'Playing' | 'Paused' | 'Stopped' | 'Error';

export type AspectRatioMode = 'Auto' | '16:9' | '4:3' | '21:9' | '1:1' | 'Fill' | 'Fit';

export type VisualizerMode = 'bars' | 'wave' | 'circle' | 'off';

export interface SubtitleCue {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  text: string;
}

export interface SubtitleTrack {
  id: string;
  name: string;
  language?: string;
  isExternal: boolean;
  cues: SubtitleCue[];
}

export interface MediaItem {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  url: string;
  type: 'video' | 'audio';
  format: string; // e.g., MP4, MKV, MP3, FLAC
  duration: number; // in seconds
  fileSize?: number; // bytes
  resolution?: string; // e.g. 1920x1080
  bitrate?: string; // e.g. 320 kbps
  codec?: string; // e.g. H.264 / AAC
  sampleRate?: string; // e.g. 44.1 kHz
  channels?: string; // e.g. Stereo / 5.1
  subtitles?: SubtitleTrack[];
}

export interface EqualizerPreset {
  name: string;
  gains: number[]; // 10 bands gains in dB (-12 to +12)
}

export interface KeyBinding {
  key: string;
  description: string;
  category: 'Playback' | 'Audio & Video' | 'Subtitles' | 'Navigation';
  actionName: string;
}

export type ModalType = 'mediaInfo' | 'equalizer' | 'subtitles' | 'shortcuts' | null;
