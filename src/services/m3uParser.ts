import { MediaItem } from '../types/media';

/**
 * Parses M3U or M3U8 content string into MediaItem array.
 */
export function parseM3U(m3uContent: string): Partial<MediaItem>[] {
  const lines = m3uContent.split(/\r?\n/);
  const items: Partial<MediaItem>[] = [];
  let currentTitle = '';
  let currentArtist = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      // Format: #EXTINF:123,Artist - Title
      const commaIndex = line.indexOf(',');
      if (commaIndex !== -1) {
        const info = line.substring(commaIndex + 1);
        if (info.includes(' - ')) {
          const parts = info.split(' - ');
          currentArtist = parts[0].trim();
          currentTitle = parts.slice(1).join(' - ').trim();
        } else {
          currentTitle = info.trim();
        }
      }
    } else if (!line.startsWith('#')) {
      // It's a URL or file path
      const ext = line.split('.').pop()?.toLowerCase() || '';
      const isAudio = ['mp3', 'flac', 'wav', 'aac', 'ogg', 'm4a'].includes(ext);
      
      const fileName = line.split('/').pop()?.split('\\').pop() || line;

      items.push({
        id: 'm3u-' + Math.random().toString(36).substr(2, 9),
        title: currentTitle || fileName,
        artist: currentArtist || 'Unknown Artist',
        url: line,
        type: isAudio ? 'audio' : 'video',
        format: ext.toUpperCase() || (isAudio ? 'MP3' : 'MP4'),
        duration: 0,
      });

      currentTitle = '';
      currentArtist = '';
    }
  }

  return items;
}

/**
 * Exports a list of MediaItems into M3U format string.
 */
export function exportM3U(playlist: MediaItem[]): string {
  let content = '#EXTM3U\n';

  for (const item of playlist) {
    const durationSec = Math.round(item.duration || 0);
    const artist = item.artist ? `${item.artist} - ` : '';
    content += `#EXTINF:${durationSec},${artist}${item.title}\n`;
    content += `${item.url}\n`;
  }

  return content;
}
