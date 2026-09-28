const RESUME_KEY = 'nebula_playback_resume_positions';

interface ResumeData {
  [trackTitle: string]: number; // timestamp in seconds
}

/**
 * Saves current playback position timestamp for a media track by title into localStorage.
 */
export function saveResumePosition(title: string, timeSec: number): void {
  if (!title || isNaN(timeSec) || timeSec <= 3) return;
  try {
    const raw = localStorage.getItem(RESUME_KEY);
    const data: ResumeData = raw ? JSON.parse(raw) : {};
    data[title] = Math.floor(timeSec);
    localStorage.setItem(RESUME_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save resume position to localStorage', err);
  }
}

/**
 * Retrieves saved playback position timestamp for a track by title from localStorage.
 */
export function getResumePosition(title: string): number {
  if (!title) return 0;
  try {
    const raw = localStorage.getItem(RESUME_KEY);
    if (!raw) return 0;
    const data: ResumeData = JSON.parse(raw);
    return data[title] || 0;
  } catch (err) {
    return 0;
  }
}
