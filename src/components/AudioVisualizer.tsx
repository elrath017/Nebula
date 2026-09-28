import React, { useEffect, useRef } from 'react';
import { VisualizerMode } from '../types/media';
import { Atom } from 'lucide-react';

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

      // Cosmic background radial glow
      const bgGradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        10,
        width / 2,
        height / 2,
        width / 1.4
      );
      bgGradient.addColorStop(0, 'rgba(255, 23, 68, 0.12)');
      bgGradient.addColorStop(0.5, 'rgba(0, 240, 255, 0.08)');
      bgGradient.addColorStop(1, 'rgba(11, 13, 25, 0.98)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      if (mode === 'bars') {
        analyserNode.getByteFrequencyData(dataArray);
        const barWidth = (width / bufferLength) * 2.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * (height * 0.7);

          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, '#FF1744'); // Crimson Red
          gradient.addColorStop(0.5, '#A855F7'); // Purple
          gradient.addColorStop(1, '#00F0FF'); // Electric Cyan

          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

          x += barWidth;
        }
      } else if (mode === 'wave') {
        analyserNode.getByteTimeDomainData(dataArray);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#FF1744';
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
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.lineWidth = 3;
        ctx.stroke();

        const bars = 64;
        const step = (Math.PI * 2) / bars;

        for (let i = 0; i < bars; i++) {
          const value = dataArray[i * 2] || 0;
          const barHeight = (value / 255) * (radius * 0.85);
          const angle = i * step;

          const x1 = centerX + Math.cos(angle) * radius;
          const y1 = centerY + Math.sin(angle) * radius;
          const x2 = centerX + Math.cos(angle) * (radius + barHeight);
          const y2 = centerY + Math.sin(angle) * (radius + barHeight);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = i % 2 === 0 ? '#FF1744' : '#00F0FF';
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
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-nebula-dark overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Track Overlay Info in middle of visualizer */}
      <div className="relative z-10 text-center px-6 pointer-events-none">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-tr from-nebula-red via-purple-600 to-nebula-blue flex items-center justify-center shadow-glow-red animate-pulse-subtle p-0.5">
          <div className="w-full h-full bg-nebula-dark rounded-full flex items-center justify-center">
            <Atom className="w-12 h-12 text-nebula-blue animate-spin-slow" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-100 tracking-wide mb-1 drop-shadow-md">
          {trackTitle || 'Audio Track'}
        </h2>
        <p className="text-sm text-nebula-red font-semibold drop-shadow">
          {artistName || 'Nebula Audio Engine'}
        </p>
      </div>
    </div>
  );
};
