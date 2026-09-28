import { SubtitleCue, SubtitleTrack } from '../types/media';

/**
 * Parses timestamp string "00:01:23,456" or "00:01:23.456" into seconds float.
 */
export function parseTimestamp(timestamp: string): number {
  if (!timestamp) return 0;
  const cleanStr = timestamp.trim().replace(',', '.');
  const parts = cleanStr.split(':');
  
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (parts.length === 3) {
    hours = parseFloat(parts[0]);
    minutes = parseFloat(parts[1]);
    seconds = parseFloat(parts[2]);
  } else if (parts.length === 2) {
    minutes = parseFloat(parts[0]);
    seconds = parseFloat(parts[1]);
  }

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Parses raw text content of SRT, VTT, or ASS files into SubtitleCue array.
 */
export function parseSubtitleContent(content: string, fileName: string): SubtitleTrack {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const cues: SubtitleCue[] = [];

  if (ext === 'vtt' || content.includes('WEBVTT')) {
    // VTT Parsing
    const blocks = content.replace(/\r\n/g, '\n').split('\n\n');
    let cueIndex = 1;
    for (const block of blocks) {
      const lines = block.trim().split('\n');
      const timeLineIndex = lines.findIndex(line => line.includes('-->'));
      if (timeLineIndex !== -1) {
        const [startStr, endStr] = lines[timeLineIndex].split('-->').map(s => s.trim().split(' ')[0]);
        const text = lines.slice(timeLineIndex + 1).join('\n').replace(/<[^>]*>/g, ''); // strip VTT tags
        if (startStr && endStr && text) {
          cues.push({
            id: `vtt-${cueIndex++}`,
            startTime: parseTimestamp(startStr),
            endTime: parseTimestamp(endStr),
            text: text.trim(),
          });
        }
      }
    }
  } else if (ext === 'ass' || ext === 'ssa' || content.includes('[Events]')) {
    // ASS / SSA Parsing
    const lines = content.split(/\r?\n/);
    let inEventsSection = false;
    let cueIndex = 1;

    for (const line of lines) {
      if (line.trim().startsWith('[Events]')) {
        inEventsSection = true;
        continue;
      }

      if (inEventsSection && line.startsWith('Dialogue:')) {
        const parts = line.substring(9).split(',');
        if (parts.length >= 10) {
          const startStr = parts[1];
          const endStr = parts[2];
          // Text is everything from column 9 onwards (can contain commas)
          let text = parts.slice(9).join(',').trim();
          text = text.replace(/\{[^}]*\}/g, '').replace(/\\N/g, '\n'); // Strip ASS format codes like {\b1} or \N
          if (startStr && endStr && text) {
            cues.push({
              id: `ass-${cueIndex++}`,
              startTime: parseTimestamp(startStr),
              endTime: parseTimestamp(endStr),
              text: text.trim(),
            });
          }
        }
      }
    }
  } else {
    // Default SRT Parsing
    const blocks = content.replace(/\r\n/g, '\n').split('\n\n');
    let cueIndex = 1;

    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length >= 2) {
        let timeLineIndex = lines.findIndex(line => line.includes('-->'));
        if (timeLineIndex !== -1) {
          const [startStr, endStr] = lines[timeLineIndex].split('-->').map(s => s.trim());
          const text = lines.slice(timeLineIndex + 1).join('\n').replace(/<[^>]*>/g, '');
          if (startStr && endStr && text) {
            cues.push({
              id: `srt-${cueIndex++}`,
              startTime: parseTimestamp(startStr),
              endTime: parseTimestamp(endStr),
              text: text.trim(),
            });
          }
        }
      }
    }
  }

  return {
    id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    name: fileName,
    isExternal: true,
    cues,
  };
}
