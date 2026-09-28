import React, { useEffect, useRef } from 'react';
import { VisualizerMode } from '../types/media';

interface VisualizerProps {
  analyserNode: AnalyserNode | null;
  mode: VisualizerMode;
  isPlaying: boolean;
  trackTitle?: string;
  artistName?: string;
}

export const AudioVisualizer: React.FC<VisualizerProps> = ({
  analyserNode,
  mode,
  isPlaying,
  trackTitle,
  artistName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!analyserNode || mode === 'off') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animFrameIdRef.current = requestAnimationFrame(render);

      // Handle high DPI display
      const width = canvas.parentElement?.clientWidth || canvas.width;
      const height = canvas.parentElement?.clientHeight || canvas.height;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // Draw background glow
      const bgGradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        10,
        width / 2,
        height / 2,
        width / 1.5
      );
      bgGradient.addColorStop(0, 'rgba(255, 136, 0, 0.08)');
      bgGradient.addColorStop(1, 'rgba(18, 19, 22, 0.95)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      if (mode === 'bars') {
        analyserNode.getByteFrequencyData(dataArray);
        const barWidth = (width / bufferLength) * 2.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * (height * 0.7);

          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, '#FF8800');
          gradient.addColorStop(0.6, '#FFA033');
          gradient.addColorStop(1, '#007ACC');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

          x += barWidth;
        }
      } else if (mode === 'wave') {
        analyserNode.getByteTimeDomainData(dataArray);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#FF8800';
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
      } else if (mode === 'circle') {
        analyserNode.getByteFrequencyData(dataArray);
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.22;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 136, 0, 0.4)';
        ctx.lineWidth = 3;
        ctx.stroke();

        const bars = 64;
        const step = (Math.PI * 2) / bars;

        for (let i = 0; i < bars; i++) {
          const value = dataArray[i * 2] || 0;
          const barHeight = (value / 255) * (radius * 0.8);
          const angle = i * step;

          const x1 = centerX + Math.cos(angle) * radius;
          const y1 = centerY + Math.sin(angle) * radius;
          const x2 = centerX + Math.cos(angle) * (radius + barHeight);
          const y2 = centerY + Math.sin(angle) * (radius + barHeight);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `hsl(${(i * 360) / bars}, 100%, 50%)`;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [analyserNode, mode, isPlaying]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-vlc-dark overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Track Overlay Info in middle of visualizer */}
      <div className="relative z-10 text-center px-6 pointer-events-none">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-tr from-vlc-orange to-yellow-500 flex items-center justify-center shadow-glow-orange animate-pulse-subtle">
          <svg className="w-12 h-12 text-slate-950" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-100 tracking-wide mb-1 drop-shadow-md">
          {trackTitle || 'Audio Track'}
        </h2>
        <p className="text-sm text-vlc-orange font-medium drop-shadow">
          {artistName || 'VLC Audio Engine'}
        </p>
      </div>
    </div>
  );
};
