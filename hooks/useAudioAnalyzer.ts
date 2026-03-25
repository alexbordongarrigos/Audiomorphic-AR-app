import { useEffect, useRef, useState, useCallback } from 'react';

export const useAudioAnalyzer = () => {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const startAudio = async (sourceType: 'microphone' | 'system' = 'microphone') => {
    try {
      setError(null);
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Resume context if suspended (browser policy)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      let stream: MediaStream;
      if (sourceType === 'system') {
        stream = await navigator.mediaDevices.getDisplayMedia({ 
          audio: true, 
          video: true 
        });
        // Stop video tracks so we only capture audio
        stream.getVideoTracks().forEach(track => track.stop());
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048; // Standard resolution
      analyserRef.current.smoothingTimeConstant = 0.85;

      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      setIsActive(true);
    } catch (err: any) {
      // Removemos el console.error para evitar que el entorno lo reporte como un crash no manejado
      // console.warn("Audio source access issue:", err?.message || err);
      let errorMessage = "No se pudo acceder al audio.";
      if (err?.message?.includes('display-capture') || err?.name === 'NotAllowedError' && sourceType === 'system') {
        errorMessage = "La captura de audio del sistema no está permitida en este entorno. Por favor, usa el micrófono.";
      } else if (err?.message?.includes('Requested device not found') || err?.name === 'NotFoundError') {
        errorMessage = "No se encontró ningún micrófono o dispositivo de audio.";
      } else if (err?.name === 'NotAllowedError') {
        errorMessage = "Permiso denegado para acceder al micrófono.";
      }
      setError(errorMessage);
      setIsActive(false);
      setTimeout(() => setError(null), 5000);
    }
  };

  const stopAudio = () => {
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    setIsActive(false);
  };

  const getAudioMetrics = useCallback((sensitivity: number, freqRange: number): { volume: number, frequency: number } => {
    if (!analyserRef.current || !dataArrayRef.current || !isActive) {
      return { volume: 0, frequency: 0 };
    }

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);

    // Limit range to relevant frequencies (mostly bass/mids for visuals)
    const rangeLimit = Math.floor(dataArrayRef.current.length * freqRange);
    
    let totalMagnitude = 0;
    let weightedFrequencySum = 0;
    
    for (let i = 0; i < rangeLimit; i++) {
      const val = dataArrayRef.current[i];
      // Noise gate
      if (val > 25) { 
        totalMagnitude += val;
        weightedFrequencySum += i * val;
      }
    }

    const average = rangeLimit > 0 ? totalMagnitude / rangeLimit : 0;
    const volume = Math.min((average / 50) * sensitivity, 1.0); 

    let frequency = 0;
    if (totalMagnitude > 0) {
      const centroidBin = weightedFrequencySum / totalMagnitude;
      frequency = centroidBin / rangeLimit;
    }

    return { volume, frequency };
  }, [isActive]);

  return {
    isActive,
    error,
    startAudio,
    stopAudio,
    getAudioMetrics
  };
};