import { MediaItem } from '../types/media';
import { createMediaItemFromFile } from './metadataParser';

export const SUPPORTED_VIDEO_EXTENSIONS = ['mp4', 'mkv', 'avi', 'mov', 'webm', 'm4v', '3gp', 'ts', 'ogv'];
export const SUPPORTED_AUDIO_EXTENSIONS = ['mp3', 'flac', 'wav', 'aac', 'ogg', 'm4a', 'wma', 'opus'];

export const ALL_SUPPORTED_MEDIA_EXTENSIONS = [
  ...SUPPORTED_VIDEO_EXTENSIONS,
  ...SUPPORTED_AUDIO_EXTENSIONS,
];

/**
 * Checks if a file is a supported video or audio file based on extension or mime type.
 */
export function isMediaFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (ALL_SUPPORTED_MEDIA_EXTENSIONS.includes(ext)) return true;
  if (file.type.startsWith('video/') || file.type.startsWith('audio/')) return true;
  return false;
}

/**
 * Filters a list of files to keep ONLY supported video and music tracks,
 * then sorts them in natural alphanumeric order (e.g. Ep 1, Ep 2, Ep 10)
 * and generates MediaItems for each media file found in the selected folder/files.
 */
export async function filterAndProcessMediaFiles(files: FileList | File[]): Promise<MediaItem[]> {
  const fileArray = Array.from(files);
  const mediaFiles = fileArray.filter((file) => isMediaFile(file));

  // Natural alphanumeric sort matching OS folder order (1, 2, ... 10)
  mediaFiles.sort((a, b) => {
    const pathA = a.webkitRelativePath || a.name;
    const pathB = b.webkitRelativePath || b.name;
    return pathA.localeCompare(pathB, undefined, { numeric: true, sensitivity: 'base' });
  });

  const items: MediaItem[] = [];
  for (const file of mediaFiles) {
    const item = await createMediaItemFromFile(file);
    items.push(item);
  }
  return items;
}

export type PickDirectoryResult = 
  | { status: 'success'; items: MediaItem[] }
  | { status: 'cancelled' }
  | { status: 'unsupported' };

/**
 * Uses modern FileSystem Access API (showDirectoryPicker) if available
 * to select a directory locally without triggering any browser upload prompt dialog.
 */
export async function pickDirectoryWithFileSystemAPI(): Promise<PickDirectoryResult> {
  if ('showDirectoryPicker' in window) {
    try {
      // @ts-expect-error showDirectoryPicker is standard in Chrome/Edge/Opera
      const dirHandle = await window.showDirectoryPicker();
      const files: File[] = [];

      // Recursive scanner helper with natural sorting
      const scanDir = async (handle: FileSystemDirectoryHandle) => {
        const entries: FileSystemHandle[] = [];
        // @ts-expect-error values iterator
        for await (const entry of handle.values()) {
          entries.push(entry);
        }

        // Sort handles in natural order before scanning
        entries.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

        for (const entry of entries) {
          if (entry.kind === 'file') {
            // @ts-expect-error FileSystemFileHandle getFile
            const file = await entry.getFile();
            if (isMediaFile(file)) {
              files.push(file);
            }
          } else if (entry.kind === 'directory') {
            // @ts-expect-error FileSystemDirectoryHandle
            await scanDir(entry);
          }
        }
      };

      await scanDir(dirHandle);
      const items = await filterAndProcessMediaFiles(files);
      return { status: 'success', items };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return { status: 'cancelled' };
      }
      console.warn('showDirectoryPicker failed, falling back to input ref', err);
      return { status: 'unsupported' };
    }
  }
  return { status: 'unsupported' };
}

/**
 * Recursively scans directory entries from Drag & Drop DataTransferItems
 * to extract only video and music media files from dropped folders.
 */
export async function scanDroppedDirectoryItems(items: DataTransferItemList): Promise<MediaItem[]> {
  const fileEntries: File[] = [];

  const readEntry = async (entry: FileSystemEntry): Promise<void> => {
    if (entry.isFile) {
      const fileEntry = entry as FileSystemFileEntry;
      return new Promise((resolve) => {
        fileEntry.file((file) => {
          if (isMediaFile(file)) {
            fileEntries.push(file);
          }
          resolve();
        }, () => resolve());
      });
    } else if (entry.isDirectory) {
      const dirEntry = entry as FileSystemDirectoryEntry;
      const dirReader = dirEntry.createReader();
      return new Promise((resolve) => {
        const readEntries = () => {
          dirReader.readEntries(async (entries) => {
            if (entries.length === 0) {
              resolve();
            } else {
              for (const childEntry of entries) {
                await readEntry(childEntry);
              }
              readEntries();
            }
          }, () => resolve());
        };
        readEntries();
      });
    }
  };

  const promises: Promise<void>[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === 'file') {
      const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
      if (entry) {
        promises.push(readEntry(entry));
      } else {
        const file = item.getAsFile();
        if (file && isMediaFile(file)) {
          fileEntries.push(file);
        }
      }
    }
  }

  await Promise.all(promises);
  return filterAndProcessMediaFiles(fileEntries);
}

export const INITIAL_SAMPLE_PLAYLIST: MediaItem[] = [
  {
    id: 'sample-1',
    title: 'Big Buck Bunny (1080p 60fps)',
    artist: 'Blender Foundation',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'video',
    format: 'MP4',
    duration: 596,
    resolution: '1920x1080',
    bitrate: '4500 kbps',
    codec: 'H.264 / AAC',
    channels: '5.1 Surround',
    sampleRate: '48.0 kHz',
    subtitles: [
      {
        id: 'sub-sample-en',
        name: 'English [SRT]',
        language: 'en',
        isExternal: false,
        cues: [
          { id: '1', startTime: 1, endTime: 6, text: 'Welcome to VLC Media Player - Ultimate Edition' },
          { id: '2', startTime: 7, endTime: 12, text: 'Use Space to Pause, Arrow keys to Seek & Adjust Volume' },
          { id: '3', startTime: 13, endTime: 18, text: 'Supports up to 200% volume boost with soft limiter' },
          { id: '4', startTime: 19, endTime: 25, text: 'Load custom SRT / VTT / ASS subtitles anytime!' },
        ]
      }
    ]
  },
  {
    id: 'sample-2',
    title: 'Tears of Steel (4K Sci-Fi Trailer)',
    artist: 'Mango Open Movie Project',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    type: 'video',
    format: 'MKV',
    duration: 734,
    resolution: '3840x2160',
    bitrate: '8200 kbps',
    codec: 'HEVC / AC3',
    channels: 'Stereo',
    sampleRate: '48.0 kHz',
  },
  {
    id: 'sample-3',
    title: 'For Bigger Blazes (Action Clip)',
    artist: 'Google Sample Media',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    type: 'video',
    format: 'MOV',
    duration: 15,
    resolution: '1280x720',
    bitrate: '2400 kbps',
    codec: 'H.264 / AAC',
  },
  {
    id: 'sample-4',
    title: 'Sintel (3D Animated Fantasy Short)',
    artist: 'Durian Open Movie Project',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    type: 'video',
    format: 'MP4',
    duration: 888,
    resolution: '1920x1080',
    bitrate: '3800 kbps',
    codec: 'H.264 / MP3',
  },
  {
    id: 'sample-5',
    title: 'Synthesizer Retro Cyberpunk Audio Track',
    artist: 'VLC Audio Engine Demo',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    type: 'audio',
    format: 'MP3',
    duration: 372,
    bitrate: '320 kbps',
    codec: 'MPEG Audio Layer 3',
    channels: 'Stereo (2.0)',
    sampleRate: '44.1 kHz',
  }
];
