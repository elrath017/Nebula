import { useEffect, useRef, useState, useCallback } from 'react';

export const EQ_FREQUENCIES = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

export const EQ_PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [8, 6, 4, 2, 0, 0, 0, 0, 0, 0],
  Rock: [5, 3, -1, -2, 0, 2, 4, 5, 5, 5],
  Pop: [-1, 2, 4, 5, 3, -1, -2, -2, -1, -1],
  Classical: [4, 3, 2, 2, -1, -1, 0, 2, 3, 4],
  Vocal: [-2, -1, 1, 3, 4, 4, 3, 1, 0, -2],
  Custom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

export function useAudioEngine(mediaElement: HTMLMediaElement | null) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const eqFiltersRef = useRef<BiquadFilterNode[]>([]);
  
  const [eqGains, setEqGains] = useState<number[]>(EQ_PRESETS.Flat);
  const [selectedPreset, setSelectedPreset] = useState<string>('Flat');
  const [isAudioEngineReady, setIsAudioEngineReady] = useState<boolean>(false);

  // Initialize Web Audio API nodes
  useEffect(() => {
    if (!mediaElement) return;

    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }

      const ctx = audioCtxRef.current;

      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        const resumeCtx = () => {
          ctx.resume();
          window.removeEventListener('click', resumeCtx);
          window.removeEventListener('keydown', resumeCtx);
        };
        window.addEventListener('click', resumeCtx);
        window.addEventListener('keydown', resumeCtx);
      }

      if (!sourceNodeRef.current) {
        sourceNodeRef.current = ctx.createMediaElementSource(mediaElement);
      }

      // Create Delay Node (for Audio Sync adjustment)
      if (!delayNodeRef.current) {
        delayNodeRef.current = ctx.createDelay(5.0); // max 5 seconds delay
        delayNodeRef.current.delayTime.value = 0;
      }

      // Create 10 Equalizer BiquadFilterNodes
      if (eqFiltersRef.current.length === 0) {
        eqFiltersRef.current = EQ_FREQUENCIES.map((freq) => {
          const filter = ctx.createBiquadFilter();
          filter.type = freq <= 310 ? 'lowshelf' : freq >= 12000 ? 'highshelf' : 'peaking';
          filter.frequency.value = freq;
          filter.gain.value = 0;
          filter.Q.value = 1.0;
          return filter;
        });
      }

      // Create Gain Node (for 0% to 200% volume boost)
      if (!gainNodeRef.current) {
        gainNodeRef.current = ctx.createGain();
        gainNodeRef.current.gain.value = 1.0;
      }

      // Create Soft Limiter DynamicsCompressorNode
      if (!compressorRef.current) {
        compressorRef.current = ctx.createDynamicsCompressor();
        compressorRef.current.threshold.value = -3.0; // dB
        compressorRef.current.knee.value = 12.0; // dB
        compressorRef.current.ratio.value = 20.0; // compression ratio when volume exceeds threshold
        compressorRef.current.attack.value = 0.003; // 3ms
        compressorRef.current.release.value = 0.25; // 250ms
      }

      // Create AnalyserNode (for Audio Spectrum Visualizer)
      if (!analyserRef.current) {
        analyserRef.current = ctx.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.8;
      }

      // Connect pipeline:
      // Source -> Delay -> EQ filters in series -> Gain -> Soft Limiter Compressor -> Analyser -> Destination
      let currentNode: AudioNode = sourceNodeRef.current;
      
      currentNode.connect(delayNodeRef.current);
      currentNode = delayNodeRef.current;

      eqFiltersRef.current.forEach((filter) => {
        currentNode.connect(filter);
        currentNode = filter;
      });

      currentNode.connect(gainNodeRef.current);
      gainNodeRef.current.connect(compressorRef.current);
      compressorRef.current.connect(analyserRef.current);
      analyserRef.current.connect(ctx.destination);

      setIsAudioEngineReady(true);
    } catch (err) {
      console.warn('Web Audio API initialization warning (source may already be connected):', err);
    }
  }, [mediaElement]);

  // Volume boost setter (0.0 to 2.0 = 0% to 200%)
  const setVolumeBoost = useCallback((volumeFactor: number) => {
    if (gainNodeRef.current && audioCtxRef.current) {
      // Clamp volume between 0 and 2.0 (200%)
      const clampedVol = Math.max(0, Math.min(2.0, volumeFactor));
      gainNodeRef.current.gain.setTargetAtTime(clampedVol, audioCtxRef.current.currentTime, 0.01);
    }
  }, []);

  // Audio delay offset setter (in seconds, convert from ms)
  const setAudioDelayMs = useCallback((delayMs: number) => {
    if (delayNodeRef.current && audioCtxRef.current) {
      const delaySec = Math.max(0, Math.min(5.0, delayMs / 1000));
      delayNodeRef.current.delayTime.setTargetAtTime(delaySec, audioCtxRef.current.currentTime, 0.01);
    }
  }, []);

  // Equalizer gain setter for band index
  const setBandGain = useCallback((bandIndex: number, gainDb: number) => {
    if (eqFiltersRef.current[bandIndex] && audioCtxRef.current) {
      const clampedGain = Math.max(-12, Math.min(12, gainDb));
      eqFiltersRef.current[bandIndex].gain.setTargetAtTime(clampedGain, audioCtxRef.current.currentTime, 0.01);
      
      setEqGains((prev) => {
        const next = [...prev];
        next[bandIndex] = clampedGain;
        return next;
      });
      setSelectedPreset('Custom');
    }
  }, []);

  // Apply EQ Preset
  const applyPreset = useCallback((presetName: string) => {
    const presetGains = EQ_PRESETS[presetName];
    if (!presetGains) return;

    presetGains.forEach((gainDb, index) => {
      if (eqFiltersRef.current[index] && audioCtxRef.current) {
        eqFiltersRef.current[index].gain.setTargetAtTime(gainDb, audioCtxRef.current.currentTime, 0.01);
      }
    });

    setEqGains(presetGains);
    setSelectedPreset(presetName);
  }, []);

  return {
    analyserNode: analyserRef.current,
    isAudioEngineReady,
    setVolumeBoost,
    setAudioDelayMs,
    eqGains,
    setBandGain,
    selectedPreset,
    applyPreset,
  };
}
