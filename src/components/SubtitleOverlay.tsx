import React from 'react';
import { SubtitleTrack } from '../types/media';
import { SubtitleStyleSettings } from '../state/playerStore';

interface SubtitleOverlayProps {
  activeTrack: SubtitleTrack | null;
  currentTime: number; // in seconds
  delayMs: number; // in ms
  styles: SubtitleStyleSettings;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  activeTrack,
  currentTime,
  delayMs,
  styles,
}) => {
  if (!activeTrack || !activeTrack.cues || activeTrack.cues.length === 0) {
    return null;
  }

  // Adjust current video time with subtitle delay offset
  const effectiveTime = currentTime - delayMs / 1000;

  // Find active cue
  const activeCue = activeTrack.cues.find(
    (cue) => effectiveTime >= cue.startTime && effectiveTime <= cue.endTime
  );

  if (!activeCue) return null;

  return (
    <div
      className="absolute left-0 right-0 z-30 flex justify-center pointer-events-none px-6 transition-all duration-150"
      style={{ bottom: `${styles.positionBottom}%` }}
    >
      <div
        className="subtitle-box rounded px-4 py-1.5 max-w-4xl text-center leading-normal font-semibold tracking-wide backdrop-blur-sm transition-all"
        style={{
          fontSize: `${styles.fontSize}px`,
          color: styles.textColor,
          backgroundColor: styles.bgColor,
        }}
      >
        {activeCue.text.split('\n').map((line, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <br />}
            {line}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
