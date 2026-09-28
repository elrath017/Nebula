import { MediaItem } from '../types/media';

/**
 * Extracts metadata from a File object and creates a MediaItem instance.
 */
export async function createMediaItemFromFile(file: File): Promise<MediaItem> {
  const objectUrl = URL.createObjectURL(file);
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  
  const isAudioOnly = ['mp3', 'flac', 'wav', 'aac', 'ogg', 'm4a', 'wma'].includes(ext);
  const mediaType: 'video' | 'audio' = isAudioOnly ? 'audio' : 'video';

  return new Promise((resolve) => {
    let duration = 0;
    let resolution = '1920x1080 (Estimated)';
    let channels = 'Stereo (2.0)';

    if (mediaType === 'video') {
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = objectUrl;

      tempVideo.onloadedmetadata = () => {
        duration = tempVideo.duration || 0;
        resolution = `${tempVideo.videoWidth}x${tempVideo.videoHeight}`;
        
        // Calculate estimated bitrate
        const bitrateKbps = duration > 0 ? Math.round((file.size * 8) / duration / 1000) : 0;
        
        resolve({
          id: 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Local Media',
          url: objectUrl,
          type: 'video',
          format: ext.toUpperCase(),
          duration,
          fileSize: file.size,
          resolution,
          bitrate: bitrateKbps > 0 ? `${bitrateKbps} kbps` : 'Variable',
          codec: `H.264 / AAC (${ext.toUpperCase()})`,
          channels,
          sampleRate: '48.0 kHz',
          subtitles: []
        });
      };

      tempVideo.onerror = () => {
        resolve(fallbackItem(file, objectUrl, mediaType, ext));
      };
    } else {
      const tempAudio = document.createElement('audio');
      tempAudio.preload = 'metadata';
      tempAudio.src = objectUrl;

      tempAudio.onloadedmetadata = () => {
        duration = tempAudio.duration || 0;
        const bitrateKbps = duration > 0 ? Math.round((file.size * 8) / duration / 1000) : 320;

        resolve({
          id: 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Local Audio Track',
          url: objectUrl,
          type: 'audio',
          format: ext.toUpperCase(),
          duration,
          fileSize: file.size,
          bitrate: `${bitrateKbps} kbps`,
          codec: `${ext.toUpperCase()} Audio`,
          channels,
          sampleRate: '44.1 kHz',
        });
      };

      tempAudio.onerror = () => {
        resolve(fallbackItem(file, objectUrl, mediaType, ext));
      };
    }
  });
}

function fallbackItem(file: File, objectUrl: string, mediaType: 'video' | 'audio', ext: string): MediaItem {
  return {
    id: 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    title: file.name,
    artist: 'Local File',
    url: objectUrl,
    type: mediaType,
    format: ext.toUpperCase(),
    duration: 0,
    fileSize: file.size,
    codec: ext.toUpperCase(),
  };
}

/**
 * Formats time in seconds to HH:MM:SS or MM:SS format.
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const formattedM = m < 10 ? `0${m}` : `${m}`;
  const formattedS = s < 10 ? `0${s}` : `${s}`;

  if (h > 0) {
    const formattedH = h < 10 ? `0${h}` : `${h}`;
    return `${formattedH}:${formattedM}:${formattedS}`;
  }
  return `${formattedM}:${formattedS}`;
}

/**
 * Formats bytes to human-readable string (MB/GB).
 */
export function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return 'Unknown';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
