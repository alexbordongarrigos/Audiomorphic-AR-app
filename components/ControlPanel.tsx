import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VisualizerParams, SacredGeometryMode, SacredGeometrySettings, DEFAULT_PARAMS, AutoPilotMode, BackgroundMode, GeometryInfo } from '../types';
import { Activity, Zap, Maximize, Minimize, RotateCw, Palette, Target, Music, BrainCircuit, Wind, Droplets, Waves, Shuffle, Sprout, Glasses, Download, X, RotateCcw, Save, Upload, Heart } from 'lucide-react';

interface ControlPanelProps {
  params: VisualizerParams;
  setParams: React.Dispatch<React.SetStateAction<VisualizerParams>>;
  audioActive: boolean;
  toggleAudio: () => void;
  onClose?: () => void;
  getAudioMetrics: (sensitivity: number, freqRange: number) => { volume: number; frequency: number };
}

const SACRED_GEOMETRY_OPTIONS = [
  { id: 'goldenSpiral', label: 'Espiral Áurea' },
  { id: 'flowerOfLife', label: 'Flor de la Vida' },
  { id: 'quantumWave', label: 'Onda Cuántica' },
  { id: 'torus', label: 'Toroide' },
  { id: 'metatron', label: 'Cubo de Metatrón' },
  { id: 'merkaba', label: 'Merkaba' },
  { id: 'platonicSolids', label: 'Sólidos Platónicos' },
  { id: 'sriYantra', label: 'Sri Yantra' },
  { id: 'cymatics', label: 'Cimática' },
  { id: 'vectorEquilibrium', label: 'Equilibrio Vectorial' },
  { id: 'treeOfLife', label: 'Árbol de la Vida' },
  { id: 'yinYang', label: 'Yin Yang' },
  { id: 'mandala1', label: 'Mandala 1 (Externo)' },
  { id: 'mandala2', label: 'Mandala 2 (Interno)' },
  { id: 'mandala3', label: 'Mandala 3 (Secreto)' },
  { id: 'holographicFractal', label: 'Fractal Holográfico' },
  { id: 'chakras', label: 'Chakras' },
  { id: 'om', label: 'Om' },
  { id: 'lotus', label: 'Flor de Loto' },
  { id: 'dharmaChakra', label: 'Dharma Chakra' }
];

const ControlPanel: React.FC<ControlPanelProps> = ({ params, setParams, audioActive, toggleAudio, onClose, getAudioMetrics }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedSgEditMode, setSelectedSgEditMode] = useState<SacredGeometryMode>('flowerOfLife');
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [autoRandomMode, setAutoRandomMode] = useState<'none' | 'random' | 'smart' | 'dj'>('none');
  const [autoRandomInterval, setAutoRandomInterval] = useState<number>(10);
  const [autoRandomOnEmotionChange, setAutoRandomOnEmotionChange] = useState<boolean>(false);
  const [autoEmotionSensitivity, setAutoEmotionSensitivity] = useState<number>(50);
  const [autoStyleFluidity, setAutoStyleFluidity] = useState<number>(50);
  const lastMetricsRef = useRef({ volume: 0, frequency: 0, time: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const paramsRef = useRef(params);
  const tweenAnimRef = useRef<number>(0);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const handleAutoRandomModeChange = (mode: 'none' | 'random' | 'smart' | 'dj') => {
    setAutoRandomMode(mode);
    if (mode !== 'none') {
      setAutoRandomOnEmotionChange(true);
    }
  };

  const tweenParams = useCallback((targetParams: Partial<VisualizerParams>, duration: number = 2000) => {
    if (tweenAnimRef.current) cancelAnimationFrame(tweenAnimRef.current);
    
    const startTime = Date.now();
    const startParams = { ...paramsRef.current };
    
    const animate = () => {
      const now = Date.now();
      let progress = (now - startTime) / duration;
      if (progress > 1) progress = 1;
      
      const easeProgress = -(Math.cos(Math.PI * progress) - 1) / 2;
      
      setParams(prev => {
        const next = { ...prev };
        for (const key in targetParams) {
          const k = key as keyof VisualizerParams;
          const targetVal = targetParams[k];
          const startVal = startParams[k];
          
          if (typeof targetVal === 'number' && typeof startVal === 'number') {
            (next as any)[k] = (startVal as number) + ((targetVal as number) - (startVal as number)) * easeProgress;
          } else if (typeof targetVal === 'string' && targetVal.startsWith('#') && typeof startVal === 'string' && startVal.startsWith('#')) {
            if (progress === 1) {
              (next as any)[k] = targetVal;
            } else {
              const r1 = parseInt(startVal.slice(1, 3), 16);
              const g1 = parseInt(startVal.slice(3, 5), 16);
              const b1 = parseInt(startVal.slice(5, 7), 16);
              const r2 = parseInt(targetVal.slice(1, 3), 16);
              const g2 = parseInt(targetVal.slice(3, 5), 16);
              const b2 = parseInt(targetVal.slice(5, 7), 16);
              
              const r = Math.round(r1 + (r2 - r1) * easeProgress);
              const g = Math.round(g1 + (g2 - g1) * easeProgress);
              const b = Math.round(b1 + (b2 - b1) * easeProgress);
              
              (next as any)[k] = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            }
          } else if (Array.isArray(targetVal) && Array.isArray(startVal)) {
            if (progress === 1) {
              (next as any)[k] = targetVal;
            } else {
              const newArray = [];
              const maxLen = Math.max(targetVal.length, startVal.length);
              for (let i = 0; i < maxLen; i++) {
                const tv = targetVal[i] || targetVal[targetVal.length - 1] || '#000000';
                const sv = startVal[i] || startVal[startVal.length - 1] || '#000000';
                if (typeof tv === 'string' && tv.startsWith('#') && typeof sv === 'string' && sv.startsWith('#')) {
                  const r1 = parseInt(sv.slice(1, 3), 16) || 0;
                  const g1 = parseInt(sv.slice(3, 5), 16) || 0;
                  const b1 = parseInt(sv.slice(5, 7), 16) || 0;
                  const r2 = parseInt(tv.slice(1, 3), 16) || 0;
                  const g2 = parseInt(tv.slice(3, 5), 16) || 0;
                  const b2 = parseInt(tv.slice(5, 7), 16) || 0;
                  const r = Math.round(r1 + (r2 - r1) * easeProgress);
                  const g = Math.round(g1 + (g2 - g1) * easeProgress);
                  const b = Math.round(b1 + (b2 - b1) * easeProgress);
                  newArray.push(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
                } else {
                  newArray.push(tv);
                }
              }
              (next as any)[k] = newArray;
            }
          } else {
            if (progress > 0.5) {
              (next as any)[k] = targetVal;
            }
          }
        }
        return next;
      });
      
      if (progress < 1) {
        tweenAnimRef.current = requestAnimationFrame(animate);
      }
    };
    
    tweenAnimRef.current = requestAnimationFrame(animate);
  }, [setParams]);

  const generateRandomParams = useCallback((mode: 'random' | 'smart' | 'dj', partial: boolean = false) => {
    const prev = paramsRef.current;
    const targetParams: Partial<VisualizerParams> = {};
    
    const metrics = getAudioMetrics(prev.sensitivity, prev.freqRange);
    const hasAudio = audioActive && metrics.volume > 0.01;
    
    let mood = 'balanced';
    if ((mode === 'smart' || mode === 'dj') && hasAudio) {
      if (metrics.frequency < 0.3) mood = 'bass';
      else if (metrics.frequency > 0.6) mood = 'treble';
      else mood = 'mid';
    } else {
      const rand = Math.random();
      if (rand < 0.33) mood = 'bass';
      else if (rand < 0.66) mood = 'treble';
      else mood = 'mid';
    }

    const isDJ = mode === 'dj';

    const genGeometry = () => {
      targetParams.k = 1.0 + Math.random() * 0.03;
      targetParams.psi = Math.random() * Math.PI * 2;
      targetParams.z0_r = (Math.random() - 0.5) * 0.2;
      targetParams.z0_i = (Math.random() - 0.5) * 0.2;
      if (mood === 'bass') {
        targetParams.iter = isDJ ? 2000 + Math.random() * 2000 : 800 + Math.random() * 1000;
        targetParams.zoom = isDJ ? 0.0005 + Math.random() * 0.001 : 0.001 + Math.random() * 0.002;
        targetParams.distanceZoom = 1.0 + Math.random() * 1.5;
        targetParams.spiralThickness = 1.0 + Math.random() * 2.0;
      } else if (mood === 'treble') {
        targetParams.iter = isDJ ? 3000 + Math.random() * 2000 : 1500 + Math.random() * 1500;
        targetParams.zoom = isDJ ? 0.0001 + Math.random() * 0.0005 : 0.0005 + Math.random() * 0.001;
        targetParams.distanceZoom = 0.2 + Math.random() * 0.8;
        targetParams.spiralThickness = 0.1 + Math.random() * 0.5;
      } else {
        targetParams.iter = isDJ ? 2500 + Math.random() * 1500 : 1000 + Math.random() * 1000;
        targetParams.zoom = 0.0008 + Math.random() * 0.0015;
        targetParams.distanceZoom = 0.8 + Math.random() * 0.7;
        targetParams.spiralThickness = 0.6 + Math.random() * 0.8;
      }
    };

    const genColors = () => {
      targetParams.harmonicColor = Math.random() > 0.3;
      if (mood === 'bass') {
        targetParams.baseHue = (Math.random() * 60 + 200) % 360;
        targetParams.hueRange = 60 + Math.random() * 60;
        targetParams.saturation = isDJ ? 80 + Math.random() * 20 : 60 + Math.random() * 40;
        targetParams.brightness = isDJ ? 15 + Math.random() * 20 : 5 + Math.random() * 15;
        targetParams.hueSpeed = isDJ ? 0.5 + Math.random() * 1.0 : 0.05 + Math.random() * 0.15;
        targetParams.trail = isDJ ? 0.9 + Math.random() * 0.09 : 0.8 + Math.random() * 0.15;
      } else if (mood === 'treble') {
        targetParams.baseHue = (Math.random() * 60 + 0) % 360;
        targetParams.hueRange = isDJ ? 270 + Math.random() * 90 : 180 + Math.random() * 180;
        targetParams.saturation = isDJ ? 90 + Math.random() * 10 : 80 + Math.random() * 20;
        targetParams.brightness = isDJ ? 30 + Math.random() * 40 : 20 + Math.random() * 30;
        targetParams.hueSpeed = isDJ ? 1.5 + Math.random() * 1.5 : 0.5 + Math.random() * 1.0;
        targetParams.trail = isDJ ? 0.05 + Math.random() * 0.15 : 0.2 + Math.random() * 0.3;
      } else {
        targetParams.baseHue = Math.random() * 360;
        targetParams.hueRange = 90 + Math.random() * 90;
        targetParams.saturation = 70 + Math.random() * 30;
        targetParams.brightness = 15 + Math.random() * 20;
        targetParams.hueSpeed = 0.2 + Math.random() * 0.4;
        targetParams.trail = 0.5 + Math.random() * 0.3;
      }
    };

    const genSG = () => {
      targetParams.sacredGeometryEnabled = isDJ ? true : Math.random() > 0.2;
      targetParams.sgTheme = mood === 'bass' ? 'dark' : (mood === 'treble' ? 'light' : (Math.random() > 0.5 ? 'light' : 'dark'));
      targetParams.sgAutoHarmonic = Math.random() > 0.3;
      targetParams.sgAutoResonance = Math.random() > 0.3;
      targetParams.sgGlobalOpacity = isDJ ? 0.7 + Math.random() * 0.3 : 0.4 + Math.random() * 0.6;
      targetParams.sgGlobalFlowSpeed = isDJ ? 1.5 + Math.random() * 2.0 : 0.5 + Math.random() * 1.5;
      targetParams.sgGlobalAudioReactivity = isDJ ? 2.0 + Math.random() * 4.0 : 0.5 + Math.random() * 2;
      targetParams.sgGlobalViscosity = Math.random();
      
      const drawModes = ['layers', 'nodes', 'both'] as const;
      targetParams.sgDrawMode = mode === 'smart' ? 'both' : drawModes[Math.floor(Math.random() * drawModes.length)];
      
      targetParams.sgShowNodes = isDJ ? true : Math.random() > 0.3;
      
      const allSgModes = SACRED_GEOMETRY_OPTIONS.map(o => o.id as SacredGeometryMode);
      const numSgModes = isDJ ? 3 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 3);
      const selectedSgModes = [];
      for (let i = 0; i < numSgModes; i++) {
        selectedSgModes.push(allSgModes[Math.floor(Math.random() * allSgModes.length)]);
      }
      targetParams.sacredGeometryModes = [...new Set(selectedSgModes)];
      
      const numSpiralModes = isDJ ? 2 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 2);
      const selectedSpiralModes = [];
      for (let i = 0; i < numSpiralModes; i++) {
        selectedSpiralModes.push(allSgModes[Math.floor(Math.random() * allSgModes.length)]);
      }
      targetParams.spiralResonanceModes = [...new Set(selectedSpiralModes)];
    };

    const genReact = () => {
      targetParams.sensitivity = isDJ ? 6 + Math.random() * 4 : 3 + Math.random() * 5;
      targetParams.freqRange = 0.5 + Math.random() * 1.0;
      targetParams.autoPilot = isDJ ? true : Math.random() > 0.1;
      const apModes: AutoPilotMode[] = ['drift', 'harmonic', 'genesis'];
      targetParams.autoPilotMode = apModes[Math.floor(Math.random() * apModes.length)];
      targetParams.rootNote = Math.floor(Math.random() * 12);
      
      if (mood === 'bass') {
        targetParams.autoSpeed = 0.2 + Math.random() * 0.5;
        targetParams.autoViscosity = 0.8 + Math.random() * 0.2;
      } else if (mood === 'treble') {
        targetParams.autoSpeed = isDJ ? 2.0 + Math.random() * 2.0 : 1.5 + Math.random() * 1.5;
        targetParams.autoViscosity = 0.1 + Math.random() * 0.3;
      } else {
        targetParams.autoSpeed = 0.7 + Math.random() * 0.8;
        targetParams.autoViscosity = 0.4 + Math.random() * 0.4;
      }
    };

    const genBg = () => {
      const bgModes: BackgroundMode[] = ['solid', 'gradient', 'liquid-rainbow', 'crystal-bubbles', 'organic-fade', 'morphing-colors'];
      targetParams.bgMode = bgModes[Math.floor(Math.random() * bgModes.length)];
      
      if (mood === 'bass') {
        targetParams.bgColors = [
          `#${Math.floor(Math.random()*50).toString(16).padStart(2, '0')}00${Math.floor(Math.random()*50 + 50).toString(16).padStart(2, '0')}`,
          `#000000`
        ];
        targetParams.bgSpeed = 0.1 + Math.random() * 0.4;
      } else if (mood === 'treble') {
        targetParams.bgColors = [
          `#${Math.floor(Math.random()*50 + 50).toString(16).padStart(2, '0')}${Math.floor(Math.random()*50).toString(16).padStart(2, '0')}00`,
          `#${Math.floor(Math.random()*30).toString(16).padStart(2, '0')}0000`
        ];
        targetParams.bgSpeed = isDJ ? 2.0 + Math.random() * 2.0 : 1.0 + Math.random() * 1.0;
      } else {
        targetParams.bgColors = [
          `#${Math.floor(Math.random()*40).toString(16).padStart(2, '0')}${Math.floor(Math.random()*40).toString(16).padStart(2, '0')}${Math.floor(Math.random()*40).toString(16).padStart(2, '0')}`,
          `#${Math.floor(Math.random()*20).toString(16).padStart(2, '0')}${Math.floor(Math.random()*20).toString(16).padStart(2, '0')}${Math.floor(Math.random()*20).toString(16).padStart(2, '0')}`
        ];
        targetParams.bgSpeed = 0.4 + Math.random() * 0.6;
      }
      targetParams.bgVignetteIntensity = isDJ ? 0.6 + Math.random() * 0.4 : 0.4 + Math.random() * 0.5;
    };

    if (partial) {
      const categories = [genGeometry, genColors, genSG, genReact, genBg];
      categories.sort(() => Math.random() - 0.5);
      const numToUpdate = isDJ ? (2 + Math.floor(Math.random() * 2)) : (1 + Math.floor(Math.random() * 2));
      for (let i = 0; i < numToUpdate; i++) {
        categories[i]();
      }
    } else {
      genGeometry();
      genColors();
      genSG();
      genReact();
      genBg();
    }

    const fluidityFactor = autoStyleFluidity / 100;
    
    // Base duration depends on partial update and mood
    let baseDuration = partial ? 3000 : 1500;
    if (mood === 'bass') baseDuration *= 1.5; // Slower, heavier transitions for bass
    else if (mood === 'treble') baseDuration *= 0.7; // Faster, snappier transitions for treble
    
    // Calculate final duration using fluidity factor
    // 0% fluidity = very fast (e.g. 100ms)
    // 100% fluidity = very slow (e.g. up to 8000ms)
    const tweenDuration = 100 + (baseDuration * 3 * fluidityFactor);

    tweenParams(targetParams, tweenDuration);
  }, [tweenParams, getAudioMetrics, audioActive, autoStyleFluidity]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (autoRandomMode !== 'none' && !autoRandomOnEmotionChange) {
      intervalId = setInterval(() => {
        generateRandomParams(autoRandomMode as any, true);
      }, autoRandomInterval * 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRandomMode, autoRandomInterval, autoRandomOnEmotionChange, generateRandomParams]);

  useEffect(() => {
    let animationFrameId: number;
    
    const checkEmotion = () => {
      if (autoRandomMode !== 'none' && autoRandomOnEmotionChange && audioActive) {
        const now = Date.now();
        const metrics = getAudioMetrics(params.sensitivity, params.freqRange);
        const last = lastMetricsRef.current;
        
        const deltaV = metrics.volume - last.volume;
        const deltaF = Math.abs(metrics.frequency - last.frequency);
        
        const sensitivityFactor = autoEmotionSensitivity / 100;
        const thresholdV = 0.8 - (0.7 * sensitivityFactor);
        const thresholdF = 0.5 - (0.45 * sensitivityFactor);
        const cooldown = 4000 - (3500 * sensitivityFactor);
        
        if (now - last.time > cooldown) {
          if (deltaV > thresholdV) {
            generateRandomParams(autoRandomMode as any, false);
            lastMetricsRef.current = { ...metrics, time: now };
          } else if (deltaF > thresholdF) {
            generateRandomParams(autoRandomMode as any, true);
            lastMetricsRef.current = { ...metrics, time: now };
          }
        }
        
        lastMetricsRef.current.volume = last.volume * 0.95 + metrics.volume * 0.05;
        lastMetricsRef.current.frequency = last.frequency * 0.95 + metrics.frequency * 0.05;
      }
      
      animationFrameId = requestAnimationFrame(checkEmotion);
    };
    
    checkEmotion();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [autoRandomMode, autoRandomOnEmotionChange, audioActive, params.sensitivity, params.freqRange, generateRandomParams, getAudioMetrics, autoEmotionSensitivity]);

  const handleInstallClick = () => {
    window.open("https://drive.google.com/drive/folders/1bZ8yvbWr7r3eJUdKIQCSSuu-p398mAkn?usp=sharing", "_blank");
  };

  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    const handleFullScreenChange = async () => {
      const isFull = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(isFull);
      
      if (isFull) {
        try {
          if ('wakeLock' in navigator) {
            wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          }
        } catch (err: any) {
          if (err.name !== 'NotAllowedError') {
            console.warn(`Wake Lock error: ${err.message}`);
          }
        }
      } else {
        if (wakeLockRef.current) {
          wakeLockRef.current.release().then(() => {
            wakeLockRef.current = null;
          }).catch((err: any) => console.error(err));
        }
      }
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      if (wakeLockRef.current) {
         wakeLockRef.current.release().catch(() => {});
      }
    };
  }, []);

  const toggleFullScreen = () => {
    const doc = document as any;
    const docEl = document.documentElement as any;

    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch((err: any) => console.error(err));
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      } else {
        alert("Tu navegador no soporta pantalla completa.");
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      }
    }
  };
  
  const handleChange = (key: keyof VisualizerParams, value: number | boolean | string | string[]) => {
    if (typeof value === 'number' && isNaN(value)) return;
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const randomizeSection = (section: string) => {
    switch (section) {
      case 'background':
        const modes: any[] = ['solid', 'gradient', 'liquid-rainbow', 'crystal-bubbles', 'organic-fade', 'morphing-colors'];
        setParams(prev => ({
          ...prev,
          bgMode: modes[Math.floor(Math.random() * modes.length)],
          bgColors: [
            `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
            `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
          ],
          bgSpeed: Math.random() * 2,
          bgVignetteIntensity: Math.random()
        }));
        break;
      case 'baseGeometry':
        setParams(prev => ({
          ...prev,
          k: 0.9 + Math.random() * 0.2,
          iter: Math.floor(500 + Math.random() * 1500),
          zoom: 0.0001 + Math.random() * 0.0099,
          distanceZoom: 0.1 + Math.random() * 4.9,
          spiralThickness: 0.1 + Math.random() * 4.9
        }));
        break;
      case 'transformation':
        setParams(prev => ({
          ...prev,
          psi: Math.random() * Math.PI * 2,
          z0_r: (Math.random() - 0.5) * 2,
          z0_i: (Math.random() - 0.5) * 2
        }));
        break;
      case 'color':
        setParams(prev => ({
          ...prev,
          baseHue: Math.random() * 360,
          hueSpeed: Math.random() * 2,
          hueRange: Math.random() * 720,
          saturation: 50 + Math.random() * 50,
          brightness: Math.random() * 100,
          harmonicSensitivity: Math.random() * 5,
          harmonicDepth: Math.random() * 360
        }));
        break;
      case 'reactivity':
        setParams(prev => ({
          ...prev,
          sensitivity: Math.random() * 5,
          freqRange: 0.1 + Math.random() * 0.9,
          trail: Math.random()
        }));
        break;
      case 'spiralResonance':
        const resModes: SacredGeometryMode[] = ['goldenSpiral', 'flowerOfLife', 'quantumWave', 'torus', 'metatron', 'merkaba', 'platonicSolids', 'sriYantra', 'cymatics', 'vectorEquilibrium', 'treeOfLife', 'yinYang', 'mandala1', 'mandala2', 'mandala3', 'holographicFractal', 'chakras', 'om', 'lotus', 'dharmaChakra'];
        const randomResModes = resModes.filter(() => Math.random() > 0.7);
        setParams(prev => ({
          ...prev,
          spiralResonanceModes: randomResModes.length > 0 ? randomResModes : [resModes[Math.floor(Math.random() * resModes.length)]]
        }));
        break;
      case 'sacredGeometry':
        const sgModes: SacredGeometryMode[] = ['goldenSpiral', 'flowerOfLife', 'quantumWave', 'torus', 'metatron', 'merkaba', 'platonicSolids', 'sriYantra', 'cymatics', 'vectorEquilibrium', 'treeOfLife', 'yinYang', 'mandala1', 'mandala2', 'mandala3', 'holographicFractal', 'chakras', 'om', 'lotus', 'dharmaChakra'];
        const randomSgModes = sgModes.filter(() => Math.random() > 0.7);
        setParams(prev => ({
          ...prev,
          sacredGeometryModes: randomSgModes.length > 0 ? randomSgModes : [sgModes[Math.floor(Math.random() * sgModes.length)]],
          sgGlobalOpacity: Math.random() * 3,
          sgGlobalFlowSpeed: (Math.random() - 0.5) * 6,
          sgGlobalAudioReactivity: Math.random() * 5,
          sgGlobalViscosity: Math.random() * 3,
          sgDrawMode: 'both'
        }));
        break;
      case 'vrAr':
        setParams(prev => ({
          ...prev,
          vrDepth: 1 + Math.random() * 99,
          vrRadius: Math.random() * 20,
          vrThickness: 0.1 + Math.random() * 9.9,
          vrDistance: (Math.random() - 0.5) * 40,
          arIntensity: Math.random(),
          arPortalScale: 0.1 + Math.random() * 19.9,
          arPortalPerspectiveIntensity: Math.random() * 5,
          arPortalVanishingRadius: Math.random() * 10,
          arPortalFade: Math.random() * 5,
          arPortalBending: Math.random()
        }));
        break;
    }
  };

  const centerSpiral = () => setParams(prev => ({ ...prev, z0_r: 0, z0_i: 0 }));

  const [presetCategories, setPresetCategories] = useState({
    baseGeometry: true,
    colors: true,
    sacredGeometry: true,
    vrAr: true,
    reactivity: true
  });

  const handleExportPreset = () => {
    const exportData: Partial<VisualizerParams> = {};
    if (presetCategories.baseGeometry) {
      exportData.k = params.k; exportData.iter = params.iter; exportData.zoom = params.zoom;
      exportData.distanceZoom = params.distanceZoom; exportData.psi = params.psi;
      exportData.z0_r = params.z0_r; exportData.z0_i = params.z0_i; exportData.spiralThickness = params.spiralThickness;
    }
    if (presetCategories.colors) {
      exportData.baseHue = params.baseHue; exportData.hueSpeed = params.hueSpeed;
      exportData.hueRange = params.hueRange; exportData.saturation = params.saturation;
      exportData.brightness = params.brightness; exportData.trail = params.trail;
    }
    if (presetCategories.sacredGeometry) {
      exportData.sacredGeometryEnabled = params.sacredGeometryEnabled; exportData.sgTheme = params.sgTheme;
      exportData.sgAutoHarmonic = params.sgAutoHarmonic; exportData.sgAutoResonance = params.sgAutoResonance;
      exportData.sgGlobalOpacity = params.sgGlobalOpacity; exportData.sgGlobalFlowSpeed = params.sgGlobalFlowSpeed;
      exportData.sgGlobalAudioReactivity = params.sgGlobalAudioReactivity; exportData.sgGlobalViscosity = params.sgGlobalViscosity;
      exportData.sgSettings = params.sgSettings; exportData.spiralResonanceModes = params.spiralResonanceModes;
    }
    if (presetCategories.vrAr) {
      exportData.vrMode = params.vrMode; exportData.vrDepth = params.vrDepth; exportData.vrRadius = params.vrRadius;
      exportData.vrThickness = params.vrThickness; exportData.vrDistance = params.vrDistance;
      exportData.arMode = params.arMode; exportData.arPortalMode = params.arPortalMode;
      exportData.arPortalScale = params.arPortalScale; exportData.arPortalPerspectiveIntensity = params.arPortalPerspectiveIntensity;
      exportData.arPortalVanishingRadius = params.arPortalVanishingRadius; exportData.arPortalFade = params.arPortalFade;
      exportData.arPortalBending = params.arPortalBending;
    }
    if (presetCategories.reactivity) {
      exportData.sensitivity = params.sensitivity; exportData.freqRange = params.freqRange;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "audiomorphic_preset.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setShowPresetModal(false);
  };

  const handleImportPreset = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string) as Partial<VisualizerParams>;
        const importData: Partial<VisualizerParams> = {};
        
        if (presetCategories.baseGeometry) {
          if (json.k !== undefined) importData.k = json.k;
          if (json.iter !== undefined) importData.iter = json.iter;
          if (json.zoom !== undefined) importData.zoom = json.zoom;
          if (json.distanceZoom !== undefined) importData.distanceZoom = json.distanceZoom;
          if (json.psi !== undefined) importData.psi = json.psi;
          if (json.z0_r !== undefined) importData.z0_r = json.z0_r;
          if (json.z0_i !== undefined) importData.z0_i = json.z0_i;
          if (json.spiralThickness !== undefined) importData.spiralThickness = json.spiralThickness;
        }
        if (presetCategories.colors) {
          if (json.baseHue !== undefined) importData.baseHue = json.baseHue;
          if (json.hueSpeed !== undefined) importData.hueSpeed = json.hueSpeed;
          if (json.hueRange !== undefined) importData.hueRange = json.hueRange;
          if (json.saturation !== undefined) importData.saturation = json.saturation;
          if (json.brightness !== undefined) importData.brightness = json.brightness;
          if (json.trail !== undefined) importData.trail = json.trail;
        }
        if (presetCategories.sacredGeometry) {
          if (json.sacredGeometryEnabled !== undefined) importData.sacredGeometryEnabled = json.sacredGeometryEnabled;
          if (json.sgTheme !== undefined) importData.sgTheme = json.sgTheme;
          if (json.sgAutoHarmonic !== undefined) importData.sgAutoHarmonic = json.sgAutoHarmonic;
          if (json.sgAutoResonance !== undefined) importData.sgAutoResonance = json.sgAutoResonance;
          if (json.sgGlobalOpacity !== undefined) importData.sgGlobalOpacity = json.sgGlobalOpacity;
          if (json.sgGlobalFlowSpeed !== undefined) importData.sgGlobalFlowSpeed = json.sgGlobalFlowSpeed;
          if (json.sgGlobalAudioReactivity !== undefined) importData.sgGlobalAudioReactivity = json.sgGlobalAudioReactivity;
          if (json.sgGlobalViscosity !== undefined) importData.sgGlobalViscosity = json.sgGlobalViscosity;
          if (json.sgSettings !== undefined) {
            importData.sgSettings = { ...DEFAULT_PARAMS.sgSettings };
            for (const key in json.sgSettings) {
              const mode = key as SacredGeometryMode;
              if (importData.sgSettings[mode]) {
                importData.sgSettings[mode] = { ...importData.sgSettings[mode], ...json.sgSettings[mode] };
              }
            }
          }
          if (json.spiralResonanceModes !== undefined) importData.spiralResonanceModes = json.spiralResonanceModes;
        }
        if (presetCategories.vrAr) {
          if (json.vrMode !== undefined) importData.vrMode = json.vrMode;
          if (json.vrDepth !== undefined) importData.vrDepth = json.vrDepth;
          if (json.vrRadius !== undefined) importData.vrRadius = json.vrRadius;
          if (json.vrThickness !== undefined) importData.vrThickness = json.vrThickness;
          if (json.vrDistance !== undefined) importData.vrDistance = json.vrDistance;
          if (json.arMode !== undefined) importData.arMode = json.arMode;
          if (json.arPortalMode !== undefined) importData.arPortalMode = json.arPortalMode;
          if (json.arPortalScale !== undefined) importData.arPortalScale = json.arPortalScale;
          if (json.arPortalPerspectiveIntensity !== undefined) importData.arPortalPerspectiveIntensity = json.arPortalPerspectiveIntensity;
          if (json.arPortalVanishingRadius !== undefined) importData.arPortalVanishingRadius = json.arPortalVanishingRadius;
          if (json.arPortalFade !== undefined) importData.arPortalFade = json.arPortalFade;
          if (json.arPortalBending !== undefined) importData.arPortalBending = json.arPortalBending;
        }
        if (presetCategories.reactivity) {
          if (json.sensitivity !== undefined) importData.sensitivity = json.sensitivity;
          if (json.freqRange !== undefined) importData.freqRange = json.freqRange;
        }

        setParams(prev => ({ ...prev, ...importData }));
        setShowPresetModal(false);
      } catch (err) {
        alert("Error al cargar el preset. Archivo inválido.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderControl = (
    label: string, 
    key: keyof VisualizerParams, 
    min: number, 
    max: number, 
    step: number,
    icon?: React.ReactNode,
    disabled: boolean = false
  ) => (
    <div className={`mb-3 transition-all duration-500 ${disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex justify-between items-center mb-1.5 gap-2">
        <label className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-300 flex items-center gap-1 sm:gap-2 font-semibold truncate flex-1">
          {icon && <span className="text-cyan-300 drop-shadow-[0_0_5px_rgba(0,242,254,0.8)] shrink-0">{icon}</span>}
          <span className="truncate">{label}</span>
        </label>
        <input
          type="number"
          step="any"
          value={typeof params[key] === 'number' ? Number(params[key]).toFixed(3) : params[key] as unknown as number}
          onChange={(e) => handleChange(key, parseFloat(e.target.value))}
          disabled={disabled}
          className="font-mono text-xs text-cyan-200 bg-black/30 border border-white/10 rounded-lg px-2 py-1 focus:border-cyan-400 outline-none text-right w-16 sm:w-20 hover:border-white/30 transition-all shadow-inner shrink-0"
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={params[key] as number}
        onChange={(e) => handleChange(key, parseFloat(e.target.value))}
        disabled={disabled}
        className="liquid-slider"
      />
    </div>
  );

  const renderSgControl = (
    label: string, 
    key: keyof SacredGeometrySettings, 
    min: number, 
    max: number, 
    step: number
  ) => {
    const value = params.sgSettings[selectedSgEditMode][key];
    return (
      <div className="mb-3 transition-all duration-500 opacity-100">
        <div className="flex justify-between items-center mb-1.5 gap-2">
          <label className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-300 flex items-center gap-1 sm:gap-2 font-semibold truncate flex-1">
            <span className="truncate">{label}</span>
          </label>
          <input
            type="number"
            step="any"
            value={Number(value).toFixed(3)}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (isNaN(val)) return;
              setParams(prev => ({
                ...prev,
                sgSettings: {
                  ...prev.sgSettings,
                  [selectedSgEditMode]: {
                    ...prev.sgSettings[selectedSgEditMode],
                    [key]: val
                  }
                }
              }));
            }}
            className="font-mono text-xs text-emerald-200 bg-black/30 border border-white/10 rounded-lg px-2 py-1 focus:border-emerald-400 outline-none text-right w-16 sm:w-20 hover:border-white/30 transition-all shadow-inner shrink-0"
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value as number}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setParams(prev => ({
              ...prev,
              sgSettings: {
                ...prev.sgSettings,
                [selectedSgEditMode]: {
                  ...prev.sgSettings[selectedSgEditMode],
                  [key]: val
                }
              }
            }));
          }}
          className="liquid-slider liquid-slider-emerald"
        />
      </div>
    );
  };

  return (
    <>
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="neon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="100%" stopColor="#4facfe" />
          </linearGradient>
          <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ba360" />
            <stop offset="100%" stopColor="#3cba92" />
          </linearGradient>
          <linearGradient id="pink-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff0844" />
            <stop offset="100%" stopColor="#ffb199" />
          </linearGradient>
          <linearGradient id="indigo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
      </svg>
      <style>{`
        .liquid-panel {
          background: rgba(20, 25, 30, calc(${params.menuTransparency} * 0.2));
          backdrop-filter: blur(calc(${params.menuTransparency} * 20px)) saturate(150%) contrast(110%);
          -webkit-backdrop-filter: blur(calc(${params.menuTransparency} * 20px)) saturate(150%) contrast(110%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 
            0 40px 100px rgba(0, 0, 0, 0.6),
            inset 0 2px 4px rgba(255, 255, 255, 0.2),
            inset 0 -10px 40px rgba(255, 255, 255, 0.05),
            inset 0 20px 60px rgba(255, 255, 255, 0.02);
          border-radius: 32px;
          overflow: hidden;
          position: relative;
        }
        @media (min-width: 768px) {
          .liquid-panel {
            border-radius: 48px;
          }
        }

        .liquid-panel::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.1) 100%);
          pointer-events: none;
          z-index: -1;
        }

        .liquid-bubble {
          background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%);
          backdrop-filter: blur(16px) saturate(150%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-top: 1px solid rgba(255, 255, 255, 0.4);
          border-bottom: 1px solid rgba(0, 0, 0, 0.2);
          box-shadow: 
            0 8px 32px 0 rgba(0, 0, 0, 0.3),
            inset 0 2px 4px rgba(255, 255, 255, 0.3),
            inset 0 -2px 4px rgba(0, 0, 0, 0.2);
          border-radius: 9999px;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
          overflow: hidden;
        }

        .liquid-bubble::before {
          content: '';
          position: absolute;
          top: 5%; left: 10%; right: 10%; height: 40%;
          background: linear-gradient(to bottom, rgba(255,255,255,0.6), transparent);
          border-radius: 50%;
          pointer-events: none;
          filter: blur(2px);
        }

        .liquid-bubble:hover {
          transform: translateY(-2px);
          background: linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 
            0 12px 40px 0 rgba(0, 0, 0, 0.4),
            inset 0 2px 4px rgba(255, 255, 255, 0.4),
            inset 0 -2px 4px rgba(0, 0, 0, 0.2);
        }

        .liquid-bubble:active {
          transform: translateY(1px);
          box-shadow: 
            0 4px 16px 0 rgba(0, 0, 0, 0.3),
            inset 0 2px 4px rgba(255, 255, 255, 0.1),
            inset 0 -2px 4px rgba(0, 0, 0, 0.3);
        }

        .icon-neon {
          filter: drop-shadow(0 0 8px rgba(0, 242, 254, 0.8)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.8));
          stroke: url(#neon-gradient);
          stroke-width: 2.5;
        }
        .icon-neon-emerald {
          filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.8)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.8));
          stroke: url(#emerald-gradient);
          stroke-width: 2.5;
        }
        .icon-neon-pink {
          filter: drop-shadow(0 0 8px rgba(255, 8, 68, 0.8)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.8));
          stroke: url(#pink-gradient);
          stroke-width: 2.5;
        }
        .icon-neon-indigo {
          filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.8)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.8));
          stroke: url(#indigo-gradient);
          stroke-width: 2.5;
        }

        .liquid-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 14px;
          border-radius: 14px;
          background: rgba(0, 0, 0, 0.4);
          box-shadow: inset 0 2px 6px rgba(0,0,0,0.6), 0 1px 1px rgba(255,255,255,0.15);
          outline: none;
          position: relative;
        }

        .liquid-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 26px;
          height: 26px;
          border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,1), rgba(100,200,255,0.8));
          box-shadow: 
            0 4px 12px rgba(0,0,0,0.5), 
            inset 0 2px 5px rgba(255,255,255,1),
            inset 0 -2px 5px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1px solid rgba(255,255,255,0.6);
        }

        .liquid-slider::-webkit-slider-thumb:hover {
          transform: scale(1.25);
          border-radius: 50% 50% 40% 60% / 60% 40% 50% 50%;
          box-shadow: 
            0 8px 20px rgba(0,242,254,0.6), 
            inset 0 2px 5px rgba(255,255,255,1);
        }

        .liquid-slider-emerald::-webkit-slider-thumb {
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,1), rgba(16,185,129,0.8));
        }
        .liquid-slider-emerald::-webkit-slider-thumb:hover {
          box-shadow: 0 8px 20px rgba(16,185,129,0.6), inset 0 2px 5px rgba(255,255,255,1);
        }

        .neon-text {
          background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 20px rgba(0, 242, 254, 0.8);
        }

        .neon-text-pink {
          background: linear-gradient(135deg, #ff0844 0%, #ffb199 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 20px rgba(255, 8, 68, 0.8);
        }

        .neon-text-emerald {
          background: linear-gradient(135deg, #0ba360 0%, #3cba92 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 20px rgba(11, 163, 96, 0.8);
        }

        .liquid-switch {
          width: 56px;
          height: 30px;
          border-radius: 30px;
          background: rgba(0,0,0,0.5);
          box-shadow: inset 0 2px 8px rgba(0,0,0,0.7), 0 1px 2px rgba(255,255,255,0.15);
          position: relative;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.15);
          transition: all 0.4s ease;
          overflow: hidden;
        }

        .liquid-switch::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
          pointer-events: none;
        }

        .liquid-switch-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 24px;
          height: 24px;
          border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,1), rgba(200,200,200,0.6));
          box-shadow: 0 2px 6px rgba(0,0,0,0.5), inset 0 2px 3px rgba(255,255,255,1);
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .liquid-switch.active {
          background: rgba(0, 242, 254, 0.25);
          border-color: rgba(0, 242, 254, 0.5);
          box-shadow: inset 0 2px 8px rgba(0,242,254,0.3), 0 0 15px rgba(0,242,254,0.2);
        }

        .liquid-switch.active .liquid-switch-thumb {
          left: 28px;
          border-radius: 50% 50% 40% 60% / 60% 40% 50% 50%;
          background: radial-gradient(circle at 30% 30%, #fff, #00f2fe);
          box-shadow: 0 0 20px #00f2fe, inset 0 2px 3px rgba(255,255,255,1);
        }

        .liquid-switch.active-emerald {
          background: rgba(16, 185, 129, 0.25);
          border-color: rgba(16, 185, 129, 0.5);
          box-shadow: inset 0 2px 8px rgba(16,185,129,0.3), 0 0 15px rgba(16,185,129,0.2);
        }
        .liquid-switch.active-emerald .liquid-switch-thumb {
          left: 28px;
          border-radius: 50% 50% 40% 60% / 60% 40% 50% 50%;
          background: radial-gradient(circle at 30% 30%, #fff, #10b981);
          box-shadow: 0 0 20px #10b981, inset 0 2px 3px rgba(255,255,255,1);
        }

        .liquid-switch.active-purple {
          background: rgba(168, 85, 247, 0.25);
          border-color: rgba(168, 85, 247, 0.5);
          box-shadow: inset 0 2px 8px rgba(168,85,247,0.3), 0 0 15px rgba(168,85,247,0.2);
        }
        .liquid-switch.active-purple .liquid-switch-thumb {
          left: 28px;
          border-radius: 50% 50% 40% 60% / 60% 40% 50% 50%;
          background: radial-gradient(circle at 30% 30%, #fff, #a855f7);
          box-shadow: 0 0 20px #a855f7, inset 0 2px 3px rgba(255,255,255,1);
        }

        .liquid-switch.active-pink {
          background: rgba(236, 72, 153, 0.25);
          border-color: rgba(236, 72, 153, 0.5);
          box-shadow: inset 0 2px 8px rgba(236,72,153,0.3), 0 0 15px rgba(236,72,153,0.2);
        }
        .liquid-switch.active-pink .liquid-switch-thumb {
          left: 28px;
          border-radius: 50% 50% 40% 60% / 60% 40% 50% 50%;
          background: radial-gradient(circle at 30% 30%, #fff, #ec4899);
          box-shadow: 0 0 20px #ec4899, inset 0 2px 3px rgba(255,255,255,1);
        }

        .liquid-section {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-top: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 24px;
          box-shadow: 
            inset 0 0 30px rgba(255, 255, 255, 0.05), 
            0 15px 35px rgba(0,0,0,0.2),
            inset 0 2px 4px rgba(255,255,255,0.1);
          position: relative;
          overflow: hidden;
          padding: 0.75rem;
          margin-bottom: 1rem;
        }
        @media (min-width: 768px) {
          .liquid-section {
            border-radius: 32px;
            padding: 1rem;
          }
        }

        .liquid-section::before {
          content: '';
          position: absolute;
          top: -50%; left: -50%; width: 200%; height: 200%;
          background: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.15), transparent 50%);
          pointer-events: none;
        }

        .neon-metal-text {
          background: linear-gradient(
            270deg,
            #ff007f,
            #7f00ff,
            #00ffff,
            #00ff7f,
            #ffff00,
            #ff007f
          );
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: morphing-colors 8s ease infinite;
          text-shadow: 
            0px 2px 2px rgba(255,255,255,0.5),
            0px 4px 4px rgba(0,0,0,0.5),
            0 0 10px rgba(255,255,255,0.2),
            0 0 20px rgba(0, 255, 255, 0.5);
        }
        @keyframes morphing-colors {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .liquid-scroll::-webkit-scrollbar {
          width: 10px;
        }
        .liquid-scroll::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.3);
          border-radius: 10px;
          margin: 10px 0;
        }
        .liquid-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.25);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .liquid-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.4);
        }
      `}</style>

      <div className="liquid-panel w-full h-full flex-1 flex flex-col relative z-10">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-white/10 flex flex-col md:flex-row justify-between items-center bg-white/5 gap-3 md:gap-0 shrink-0">
          <div className="text-center md:text-left flex flex-col items-center md:items-start w-full md:w-auto">
            <h1 className="text-2xl md:text-3xl font-bold neon-metal-text flex items-center justify-center md:justify-start gap-2 tracking-wider">
              <Activity className="w-6 h-6 md:w-8 md:h-8 icon-neon" />
              AudioMorphic
            </h1>
            <p className="text-[10px] md:text-xs text-cyan-100/70 mt-1 font-medium tracking-wide">Recurrencia Compleja Sonora</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 w-full md:w-auto">
            <button
              onClick={() => setParams(DEFAULT_PARAMS)}
              className="liquid-bubble p-2 md:p-3 text-red-400 hover:text-red-300"
              title="Restaurar Valores por Defecto"
            >
              <RotateCcw size={20} className="icon-neon" />
            </button>
            <button
              onClick={() => setShowPresetModal(true)}
              className="liquid-bubble p-2 md:p-3 text-yellow-300 hover:text-yellow-200"
              title="Guardar/Cargar Ajustes"
            >
              <Save size={20} className="icon-neon" />
            </button>
            <div className="flex bg-black/40 rounded-full p-1 border border-white/10">
              <button
                onClick={() => handleChange('audioSource', 'microphone')}
                className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${params.audioSource === 'microphone' ? 'bg-cyan-500/30 text-cyan-300' : 'text-gray-400'}`}
              >
                Mic
              </button>
              <button
                onClick={() => handleChange('audioSource', 'system')}
                className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${params.audioSource === 'system' ? 'bg-cyan-500/30 text-cyan-300' : 'text-gray-400'}`}
              >
                Sistema
              </button>
            </div>
            <button
              onClick={toggleAudio}
              className={`liquid-bubble px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-bold flex items-center gap-2 ${
                audioActive ? 'text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'text-cyan-300'
              }`}
            >
              <span className="hidden sm:inline">{audioActive ? 'Detener Audio' : 'Iniciar Audio'}</span>
              <span className="sm:hidden">{audioActive ? 'Detener' : 'Iniciar'}</span>
            </button>
            <button
              onClick={toggleFullScreen}
              className="liquid-bubble px-3 py-2 md:py-3 text-sm md:text-base font-bold flex items-center gap-2 text-purple-300"
              title="Pantalla Completa"
            >
              {isFullscreen ? <Minimize className="w-5 h-5 icon-neon" /> : <Maximize className="w-5 h-5 icon-neon" />}
            </button>
            <button
              onClick={handleInstallClick}
              className="liquid-bubble px-3 py-2 md:py-3 text-sm md:text-base font-bold flex items-center gap-2 text-emerald-300"
              title="Instalar"
            >
              <Download className="w-5 h-5 icon-neon" />
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="liquid-bubble px-3 py-2 md:py-3 text-sm md:text-base font-bold flex items-center gap-2 text-red-400 ml-auto"
                title="Cerrar Menú"
              >
                <X className="w-5 h-5 icon-neon" />
              </button>
            )}
          </div>
        </div>

        <div className="p-2 md:p-4 overflow-y-auto flex-1 min-h-0 liquid-scroll">
          <div className="columns-1 lg:columns-2 gap-2 md:gap-4">
            
            {/* Modos de ajustes aleatorios Section */}
            <div className="liquid-section break-inside-avoid">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold neon-text flex items-center gap-2">
                  <Shuffle className="w-5 h-5 icon-neon" /> 
                  Modos de ajustes aleatorios
                </h3>
               </div>
               
               <div className="space-y-6">
                 <div className="grid grid-cols-3 gap-2">
                   <button
                     onClick={() => generateRandomParams('random', false)}
                     className="liquid-bubble py-3 flex flex-col items-center gap-1 text-cyan-300 hover:text-cyan-200"
                   >
                     <Shuffle size={20} />
                     <span className="text-xs font-semibold text-center leading-tight">Aleatorio<br/>Total</span>
                   </button>
                   <button
                     onClick={() => generateRandomParams('smart', false)}
                     className="liquid-bubble py-3 flex flex-col items-center gap-1 text-emerald-300 hover:text-emerald-200"
                   >
                     <BrainCircuit size={20} />
                     <span className="text-xs font-semibold text-center leading-tight">Aleatorio<br/>Inteligente</span>
                   </button>
                   <button
                     onClick={() => generateRandomParams('dj', false)}
                     className="liquid-bubble py-3 flex flex-col items-center gap-1 text-purple-400 hover:text-purple-300"
                   >
                     <Music size={20} />
                     <span className="text-xs font-semibold text-center leading-tight">Modo<br/>DJ</span>
                   </button>
                 </div>

                 <div className="bg-black/30 p-4 rounded-2xl border border-white/10">
                   <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                     <Activity size={16} className="text-purple-400" />
                     Auto-Regeneración
                   </h3>
                   
                   <div className="space-y-4">
                     <div className="flex items-center justify-between">
                       <label className="text-xs text-gray-300">Modo Automático</label>
                       <select
                         value={autoRandomMode}
                         onChange={(e) => handleAutoRandomModeChange(e.target.value as any)}
                         className="bg-black/50 border border-white/10 text-cyan-300 text-xs rounded-lg p-2 outline-none"
                       >
                         <option value="none">Apagado</option>
                         <option value="random">Aleatorio Total</option>
                         <option value="smart">Aleatorio Inteligente</option>
                         <option value="dj">Modo DJ</option>
                       </select>
                     </div>

                     {autoRandomMode !== 'none' && (
                       <>
                         <div className="flex items-center justify-between">
                           <label className="text-xs text-gray-300">Detección de Emoción/Estilo</label>
                           <input
                             type="checkbox"
                             checked={autoRandomOnEmotionChange}
                             onChange={(e) => setAutoRandomOnEmotionChange(e.target.checked)}
                             className="w-4 h-4 accent-cyan-500"
                           />
                         </div>

                         {autoRandomOnEmotionChange && (
                           <div className="space-y-4 mt-4">
                             <div className="flex flex-col items-center">
                               <label className="text-xs text-gray-300 flex justify-between w-full mb-2">
                                 <span>Sensibilidad a Emoción</span>
                                 <span className="text-cyan-400">{autoEmotionSensitivity}%</span>
                               </label>
                               <input
                                 type="range"
                                 min="0"
                                 max="100"
                                 step="1"
                                 value={autoEmotionSensitivity}
                                 onChange={(e) => setAutoEmotionSensitivity(Number(e.target.value))}
                                 className="w-full accent-cyan-500"
                               />
                             </div>
                             
                             <div className="flex flex-col items-center">
                               <label className="text-xs text-gray-300 flex justify-between w-full mb-2">
                                 <span>Fluidez de Estilo</span>
                                 <span className="text-cyan-400">{autoStyleFluidity}%</span>
                               </label>
                               <input
                                 type="range"
                                 min="0"
                                 max="100"
                                 step="1"
                                 value={autoStyleFluidity}
                                 onChange={(e) => setAutoStyleFluidity(Number(e.target.value))}
                                 className="w-full accent-cyan-500"
                               />
                             </div>
                           </div>
                         )}

                         {!autoRandomOnEmotionChange && (
                           <div>
                             <label className="text-xs text-gray-300 flex justify-between mb-2">
                               <span>Intervalo de Tiempo</span>
                               <span className="text-cyan-400">{autoRandomInterval}s</span>
                             </label>
                             <input
                               type="range"
                               min="5"
                               max="60"
                               step="1"
                               value={autoRandomInterval}
                               onChange={(e) => setAutoRandomInterval(Number(e.target.value))}
                               className="w-full accent-cyan-500"
                             />
                           </div>
                         )}
                       </>
                     )}
                   </div>
                 </div>
               </div>
            </div>

            {/* Auto Pilot Section */}
            <div className="liquid-section break-inside-avoid">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold neon-text flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 icon-neon-indigo" /> 
                  Piloto Automático
                </h3>
                <div 
                   onClick={() => handleChange('autoPilot', !params.autoPilot)}
                   className={`liquid-switch shrink-0 ${params.autoPilot ? 'active' : ''}`}
                 >
                   <div className="liquid-switch-thumb"></div>
                 </div>
               </div>
               
               {params.autoPilot && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                      
                      {/* Mode Selector */}
                      <div className="flex flex-col sm:flex-row bg-black/40 p-1.5 rounded-2xl mb-4 border border-white/10 shadow-inner gap-1 sm:gap-0">
                        <button
                          onClick={() => handleChange('autoPilotMode', 'drift')}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs uppercase font-bold rounded-xl transition-all ${
                            params.autoPilotMode === 'drift' 
                              ? 'liquid-bubble text-cyan-300' 
                              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                          }`}
                        >
                          <Shuffle size={14} className="icon-neon" /> Deriva
                        </button>
                        <button
                          onClick={() => handleChange('autoPilotMode', 'harmonic')}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs uppercase font-bold rounded-xl transition-all ${
                            params.autoPilotMode === 'harmonic' 
                              ? 'liquid-bubble text-cyan-300' 
                              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                          }`}
                        >
                          <Waves size={14} className="icon-neon" /> Armónico
                        </button>
                        <button
                          onClick={() => {
                            handleChange('autoPilotMode', 'genesis');
                            handleChange('spiralResonanceModes', ['flowerOfLife', 'torus']);
                            handleChange('sacredGeometryEnabled', true);
                            handleChange('sacredGeometryModes', ['goldenSpiral', 'flowerOfLife', 'quantumWave', 'torus']);
                          }}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs uppercase font-bold rounded-xl transition-all ${
                            params.autoPilotMode === 'genesis' 
                              ? 'liquid-bubble text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                          }`}
                        >
                          <Sprout size={14} className="icon-neon-emerald" /> Génesis
                        </button>
                      </div>

                      {/* Genesis/Math Display Info */}
                      {(params.autoPilotMode === 'genesis' || params.autoPilotMode === 'harmonic') && params.geometryData && (
                         <div className="mb-4 text-center p-3 bg-black/30 rounded-2xl border border-white/10 shadow-inner space-y-2">
                            <div className="border-b border-white/10 pb-2">
                              <span className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Geometría Activa</span>
                              <span className="text-lg font-serif text-white font-bold block drop-shadow-md">{params.geometryData.name}</span>
                              <span className={`text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full inline-block mt-2 shadow-sm ${
                                  params.geometryData.regime === 'primary' 
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                    : params.geometryData.regime === 'reciprocal'
                                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}>
                                  Régimen {params.geometryData.regime === 'primary' ? 'Primario' : params.geometryData.regime === 'reciprocal' ? 'Recíproco' : 'Vacío'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                                <div className="bg-black/40 p-2 rounded-xl border border-white/5">
                                    <div className="text-gray-400 mb-1">α (Estructura)</div>
                                    <div className="text-cyan-300 font-bold text-sm drop-shadow-[0_0_5px_rgba(0,242,254,0.5)]">{params.geometryData.alpha.toFixed(1)}</div>
                                </div>
                                <div className="bg-black/40 p-2 rounded-xl border border-white/5">
                                    <div className="text-gray-400 mb-1">β (Potencial)</div>
                                    <div className="text-pink-300 font-bold text-sm drop-shadow-[0_0_5px_rgba(255,8,68,0.5)]">{params.geometryData.beta.toFixed(2)}</div>
                                </div>
                            </div>
                         </div>
                      )}

                      {renderControl("Viscosidad", "autoViscosity", 0.01, 0.999, 0.001, <Droplets className="w-4 h-4 icon-neon"/>)}
                      {params.autoPilotMode === 'drift' && renderControl("Velocidad Deriva", "autoSpeed", 0.01, 1.0, 0.01, <Wind className="w-4 h-4 icon-neon"/>)}
                      {renderControl("Sensibilidad Emocional", "autoEmotionSensitivity", 0.0, 1.0, 0.01, <Heart className="w-4 h-4 icon-neon"/>)}
                      {renderControl("Fluidez de Estilo", "autoStyleFluidity", 0.0, 1.0, 0.01, <Palette className="w-4 h-4 icon-neon"/>)}
                  </div>
               )}
            </div>

            {/* Perturbación de Espiral Section */}
            <div className="liquid-section break-inside-avoid border-emerald-500/30 shadow-[inset_0_0_30px_rgba(16,185,129,0.05)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold neon-text-emerald flex items-center gap-2">
                  <Waves className="w-5 h-5 icon-neon-emerald" /> Perturbación de Espiral
                </h3>
                <button onClick={() => randomizeSection('spiralResonance')} className="text-emerald-400 hover:text-emerald-300 transition-colors" title="Armonía Aleatoria">
                  <Shuffle size={18} className="icon-neon-emerald" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-emerald-500/20 shadow-inner">
                {SACRED_GEOMETRY_OPTIONS.map(mode => {
                  const isActive = params.spiralResonanceModes?.includes(mode.id as any);
                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        const currentModes = params.spiralResonanceModes || [];
                        let newModes;
                        if (isActive) {
                          newModes = currentModes.filter(m => m !== mode.id);
                        } else {
                          newModes = [...currentModes, mode.id];
                        }
                        handleChange('spiralResonanceModes', newModes);
                      }}
                      className={`py-2.5 px-2 text-xs uppercase font-bold rounded-xl transition-all ${
                        isActive 
                          ? 'liquid-bubble text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                      }`}
                    >
                      {mode.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sacred Geometry Section */}
            <div className={`liquid-section break-inside-avoid border-emerald-500/30 shadow-[inset_0_0_30px_rgba(16,185,129,0.05)] transition-all duration-500`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold neon-text-emerald flex items-center gap-2">
                  <Sprout className="w-5 h-5 icon-neon-emerald" /> Geometría Sagrada
                </h3>
                <div className="flex items-center gap-3">
                  <button onClick={() => randomizeSection('sacredGeometry')} className="text-emerald-400 hover:text-emerald-300 transition-colors" title="Armonía Aleatoria">
                    <Shuffle size={18} className="icon-neon-emerald" />
                  </button>
                  <div 
                     onClick={() => handleChange('sacredGeometryEnabled', !params.sacredGeometryEnabled)}
                     className={`liquid-switch shrink-0 ${params.sacredGeometryEnabled ? 'active' : ''}`}
                   >
                     <div className="liquid-switch-thumb"></div>
                   </div>
                </div>
              </div>

              {params.sacredGeometryEnabled && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                  <div className="mb-4">
                    <label className="text-xs uppercase tracking-wider text-gray-300 flex items-center gap-2 mb-3 font-semibold">
                      Tipos de Geometría
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-emerald-500/20 shadow-inner">
                      {SACRED_GEOMETRY_OPTIONS.map(mode => {
                        const isActive = params.sacredGeometryModes?.includes(mode.id as any);
                        return (
                          <button
                            key={mode.id}
                            onClick={() => {
                              const currentModes = params.sacredGeometryModes || [];
                              let newModes;
                              if (isActive) {
                                newModes = currentModes.filter(m => m !== mode.id);
                                if (newModes.length === 0) newModes = [mode.id];
                              } else {
                                newModes = [...currentModes, mode.id];
                              }
                              handleChange('sacredGeometryModes', newModes);
                            }}
                            className={`py-2.5 px-2 text-xs uppercase font-bold rounded-xl transition-all ${
                              isActive 
                                ? 'liquid-bubble text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                            }`}
                          >
                            {mode.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                <div className="mb-6">
                  <label className="text-xs uppercase tracking-wider text-gray-300 flex items-center gap-2 mb-3 font-semibold">
                    Modo de Dibujo
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-black/40 p-1.5 rounded-2xl border border-emerald-500/20 shadow-inner">
                    <button
                      onClick={() => handleChange('sgDrawMode', 'layers')}
                      className={`py-2.5 px-2 text-xs uppercase font-bold rounded-xl transition-all ${
                        params.sgDrawMode === 'layers' 
                          ? 'liquid-bubble text-emerald-300' 
                          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                      }`}
                    >
                      Capas Infinitas
                    </button>
                    <button
                      onClick={() => handleChange('sgDrawMode', 'both')}
                      className={`py-2.5 px-2 text-xs uppercase font-bold rounded-xl transition-all ${
                        params.sgDrawMode === 'both' 
                          ? 'liquid-bubble text-emerald-300' 
                          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                      }`}
                    >
                      Ambos
                    </button>
                    <button
                      onClick={() => handleChange('sgDrawMode', 'nodes')}
                      className={`py-2.5 px-2 text-xs uppercase font-bold rounded-xl transition-all ${
                        params.sgDrawMode === 'nodes' 
                          ? 'liquid-bubble text-emerald-300' 
                          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                      }`}
                    >
                      Nodos en Espiral
                    </button>
                  </div>
                </div>

                {(params.sgDrawMode === 'nodes' || params.sgDrawMode === 'both') && (
                  <div className="mb-6 flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/5 gap-2">
                     <label className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-300 font-semibold truncate flex-1">
                        Mostrar Nodos Emanantes
                     </label>
                     <div 
                       onClick={() => handleChange('sgShowNodes', !params.sgShowNodes)}
                       className={`liquid-switch shrink-0 ${params.sgShowNodes ? 'active-emerald' : ''}`}
                     >
                       <div className="liquid-switch-thumb"></div>
                     </div>
                  </div>
                )}

                <div className="mb-4 flex justify-between items-center bg-emerald-900/20 p-3 rounded-2xl border border-emerald-500/30 gap-2">
                   <label className="text-[10px] sm:text-xs uppercase tracking-wider text-emerald-300 font-bold drop-shadow-[0_0_5px_rgba(16,185,129,0.5)] truncate flex-1">
                      Armonía Automática Total
                   </label>
                   <div 
                     onClick={() => handleChange('sgAutoHarmonic', !params.sgAutoHarmonic)}
                     className={`liquid-switch shrink-0 ${params.sgAutoHarmonic ? 'active-emerald' : ''}`}
                   >
                     <div className="liquid-switch-thumb"></div>
                   </div>
                </div>

                <div className="mb-6">
                  <label className="text-xs uppercase tracking-wider text-gray-300 flex items-center gap-2 mb-3 font-semibold">
                    Tema de Geometría
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-emerald-500/20 shadow-inner">
                    <button
                      onClick={() => handleChange('sgTheme', 'light')}
                      className={`py-2.5 px-2 text-xs uppercase font-bold rounded-xl transition-all ${
                        params.sgTheme === 'light' 
                          ? 'liquid-bubble text-emerald-300' 
                          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                      }`}
                    >
                      Tonos Claros
                    </button>
                    <button
                      onClick={() => handleChange('sgTheme', 'dark')}
                      className={`py-2.5 px-2 text-xs uppercase font-bold rounded-xl transition-all ${
                        params.sgTheme === 'dark' 
                          ? 'liquid-bubble text-emerald-300' 
                          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                      }`}
                    >
                      Tonos Oscuros
                    </button>
                  </div>
                </div>

                <div className="mb-4 flex justify-between items-center bg-emerald-900/20 p-3 rounded-2xl border border-emerald-500/30 gap-2">
                   <label className="text-[10px] sm:text-xs uppercase tracking-wider text-emerald-300 font-bold drop-shadow-[0_0_5px_rgba(16,185,129,0.5)] truncate flex-1">
                      Resonancia Automática
                   </label>
                   <div 
                     onClick={() => handleChange('sgAutoResonance', !params.sgAutoResonance)}
                     className={`liquid-switch shrink-0 ${params.sgAutoResonance ? 'active-emerald' : ''}`}
                   >
                     <div className="liquid-switch-thumb"></div>
                   </div>
                </div>

                <div className="mb-6 mt-6">
                  <label className="text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-3 font-semibold">
                    Ajustes Globales (Todas las Geometrías)
                  </label>
                  {renderControl("Transparencia Global", "sgGlobalOpacity", 0.0, 3.0, 0.01)}
                  {renderControl("Velocidad de Flujo Global", "sgGlobalFlowSpeed", -3.0, 3.0, 0.01)}
                  {renderControl("Reactividad de Audio Global", "sgGlobalAudioReactivity", 0.0, 5.0, 0.01)}
                  {renderControl("Viscosidad Global", "sgGlobalViscosity", 0.0, 3.0, 0.01)}
                </div>

                {!params.sgAutoResonance ? (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="mb-5 mt-6">
                      <label className="text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-3 font-semibold">
                        Ajustes Independientes
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-emerald-500/20 mb-4 shadow-inner">
                        {SACRED_GEOMETRY_OPTIONS.map(mode => (
                          <button
                            key={`edit-${mode.id}`}
                            onClick={() => setSelectedSgEditMode(mode.id as SacredGeometryMode)}
                            className={`py-2.5 px-2 text-xs uppercase font-bold rounded-xl transition-all ${
                              selectedSgEditMode === mode.id 
                                ? 'liquid-bubble text-emerald-300' 
                                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                            }`}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {renderSgControl("Complejidad (Nodos)", "complexity", 1, 100, 1)}
                    {renderSgControl("Distancia Conexión", "connectionSpan", 1, 100, 1)}
                    {renderSgControl("Escala (Tamaño)", "scale", 0.01, 5.0, 0.01)}
                    {renderSgControl("Opacidad Líneas", "lineOpacity", 0.0, 1.0, 0.01)}
                    {renderSgControl("Opacidad Fondo", "bgOpacity", 0.0, 1.0, 0.01)}
                    {renderSgControl("Grosor de Línea", "thickness", 0.01, 5.0, 0.01)}
                    {renderSgControl("Velocidad Flujo", "flowSpeed", -5.0, 5.0, 0.01)}
                    {renderSgControl("Reactividad Audio", "audioReactivity", 0.0, 10.0, 0.1)}
                    {renderSgControl("Viscosidad", "viscosity", 0.01, 1.0, 0.01)}
                    
                    <div className="mb-3 flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/5 gap-2">
                       <label className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-300 font-semibold truncate flex-1">
                          Con Color
                       </label>
                       <div 
                         onClick={() => {
                           setParams(prev => ({
                             ...prev,
                             sgSettings: {
                               ...prev.sgSettings,
                               [selectedSgEditMode]: {
                                 ...prev.sgSettings[selectedSgEditMode],
                                 colored: !prev.sgSettings[selectedSgEditMode].colored
                               }
                             }
                           }));
                         }}
                         className={`liquid-switch shrink-0 ${params.sgSettings[selectedSgEditMode].colored ? 'active-emerald' : ''}`}
                       >
                         <div className="liquid-switch-thumb"></div>
                       </div>
                    </div>
                    
                    {params.sgSettings[selectedSgEditMode].colored && (
                      <div className="mb-3 transition-all duration-500 opacity-100">
                        <div className="flex justify-between items-center mb-1.5 gap-2">
                          <label className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-300 flex items-center gap-1 sm:gap-2 font-semibold truncate flex-1">
                            <span className="truncate">Tono Personalizado</span>
                          </label>
                          <input
                            type="number"
                            step="1"
                            value={params.sgSettings[selectedSgEditMode].customColor}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (isNaN(val)) return;
                              setParams(prev => ({
                                ...prev,
                                sgSettings: {
                                  ...prev.sgSettings,
                                  [selectedSgEditMode]: {
                                    ...prev.sgSettings[selectedSgEditMode],
                                    customColor: val
                                  }
                                }
                              }));
                            }}
                            className="bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-white w-16 text-right focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          step="1"
                          value={params.sgSettings[selectedSgEditMode].customColor}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setParams(prev => ({
                              ...prev,
                              sgSettings: {
                                ...prev.sgSettings,
                                [selectedSgEditMode]: {
                                  ...prev.sgSettings[selectedSgEditMode],
                                  customColor: val
                                }
                              }
                            }));
                          }}
                          className="w-full liquid-slider"
                          style={{
                            background: `linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)`
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-2xl text-center shadow-inner">
                    <p className="text-sm text-emerald-300 italic font-medium">
                      La Resonancia Automática está controlando inteligentemente todos los parámetros geométricos en armonía con el sonido.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* VR Section */}
            <div className="liquid-section break-inside-avoid border-purple-500/30 shadow-[inset_0_0_30px_rgba(168,85,247,0.05)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold neon-text text-purple-400 flex items-center gap-2" style={{backgroundImage: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)'}}>
                  <Glasses className="w-5 h-5 icon-neon-pink" /> Realidad Virtual
                </h3>
                <button onClick={() => randomizeSection('vrAr')} className="text-purple-400 hover:text-purple-300 transition-colors" title="Armonía Aleatoria">
                  <Shuffle size={18} className="icon-neon-pink" />
                </button>
              </div>
              
              <div className="mb-6 flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/5 gap-2">
                 <label className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-300 font-semibold truncate flex-1">
                    Modo VR 3D
                 </label>
                 <div 
                   onClick={() => {
                     const newVrMode = !params.vrMode;
                     if (newVrMode) {
                       setParams(prev => ({
                         ...prev,
                         vrMode: true,
                         vrSplitScreen: false,
                         vrSymmetric: true,
                         vrDepth: 100,
                         vrRadius: 0,
                         vrThickness: 0.1,
                         vrDistance: 0
                       }));
                     } else {
                       handleChange('vrMode', false);
                     }
                   }}
                   className={`liquid-switch shrink-0 ${params.vrMode ? 'active-purple' : ''}`}
                 >
                   <div className="liquid-switch-thumb"></div>
                 </div>
              </div>

              {params.vrMode && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                  <div className="mb-6 flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/5 gap-2">
                     <label className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-300 font-semibold truncate flex-1">
                        Modo AR (Cámara)
                     </label>
                     <div 
                       onClick={() => handleChange('arMode', !params.arMode)}
                       className={`liquid-switch shrink-0 ${params.arMode ? 'active-emerald' : ''}`}
                     >
                       <div className="liquid-switch-thumb"></div>
                     </div>
                  </div>

                  {params.arMode && (
                    <div className="mb-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                      <label className="text-xs uppercase tracking-wider text-gray-300 flex items-center gap-2 mb-3 font-semibold">
                        Filtro AR
                      </label>
                      <select 
                        value={params.arFilter}
                        onChange={(e) => handleChange('arFilter', e.target.value)}
                        className="w-full bg-black/50 border border-white/10 text-cyan-300 text-sm rounded-xl p-3 outline-none focus:border-cyan-400 shadow-inner appearance-none"
                      >
                        <option value="none">Ninguno</option>
                        <option value="psychedelic">Psicodélico</option>
                        <option value="noir">Noir (Blanco y Negro)</option>
                        <option value="neon">Neón</option>
                        <option value="glitch">Glitch</option>
                        <option value="dream">Sueño</option>
                        <option value="hypnotic">Hipnótico</option>
                      </select>
                      <div className="mt-5">
                        {renderControl("Intensidad Filtro", "arIntensity", 0.0, 1.0, 0.05)}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 mb-4">
                    <div className="flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/5 gap-2">
                       <label className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-300 font-semibold truncate flex-1">Rotación Manual</label>
                       <div onClick={() => handleChange('vrDragRotation', !params.vrDragRotation)} className={`liquid-switch shrink-0 ${params.vrDragRotation ? 'active-purple' : ''}`}><div className="liquid-switch-thumb"></div></div>
                    </div>
                    <div className="flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/5 gap-2">
                       <label className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-300 font-semibold truncate flex-1">Pantalla Dividida</label>
                       <div onClick={() => handleChange('vrSplitScreen', !params.vrSplitScreen)} className={`liquid-switch shrink-0 ${params.vrSplitScreen ? 'active-purple' : ''}`}><div className="liquid-switch-thumb"></div></div>
                    </div>
                    <div className="flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/5 gap-2">
                       <label className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-300 font-semibold truncate flex-1">Portal Infinito</label>
                       <div onClick={() => handleChange('vrSymmetric', !params.vrSymmetric)} className={`liquid-switch shrink-0 ${params.vrSymmetric ? 'active-purple' : ''}`}><div className="liquid-switch-thumb"></div></div>
                    </div>
                  </div>
                  
                  {renderControl("Profundidad Z", "vrDepth", 1, 100, 1)}
                  {renderControl("Radio del Portal", "vrRadius", 0, 20, 0.5)}
                  {renderControl("Grosor de Línea", "vrThickness", 0.1, 10, 0.1)}
                  {renderControl("Desplazamiento Z", "vrDistance", -20, 20, 0.5)}
                </div>
              )}
            </div>

            {/* AR Portal Section */}
            <div className="liquid-section break-inside-avoid border-emerald-500/30 shadow-[inset_0_0_30px_rgba(16,185,129,0.05)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold neon-text text-emerald-400 flex items-center gap-2" style={{backgroundImage: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'}}>
                  <Glasses className="w-5 h-5 icon-neon-pink" /> Portal AR
                </h3>
                <button onClick={() => randomizeSection('vrAr')} className="text-emerald-400 hover:text-emerald-300 transition-colors" title="Armonía Aleatoria">
                  <Shuffle size={18} className="icon-neon-emerald" />
                </button>
              </div>
              
              <div className="mb-6 flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/5 gap-2">
                 <label className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-300 font-semibold truncate flex-1">
                    Modo Portal Inteligente
                 </label>
                 <div 
                   onClick={() => handleChange('arPortalMode', !params.arPortalMode)}
                   className={`liquid-switch shrink-0 ${params.arPortalMode ? 'active-emerald' : ''}`}
                 >
                   <div className="liquid-switch-thumb"></div>
                 </div>
              </div>

              {params.arPortalMode && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                  {renderControl("Escala del Portal", "arPortalScale", 0.1, 20.0, 0.1)}
                  {renderControl("Intensidad Perspectiva", "arPortalPerspectiveIntensity", 0.0, 5.0, 0.1)}
                  {renderControl("Amplitud Punto de Fuga", "arPortalVanishingRadius", 0.0, 10.0, 0.1)}
                  {renderControl("Difuminado de Profundidad", "arPortalFade", 0.0, 5.0, 0.01)}
                  {renderControl("Doblado del Portal", "arPortalBending", 0.0, 1.0, 0.01)}
                </div>
              )}
            </div>

            {/* Interface & Reactivity */}
            <div className="break-inside-avoid">
              <div className="liquid-section">
                <h3 className="text-lg font-bold neon-text text-yellow-400 mb-6 flex items-center gap-2" style={{backgroundImage: 'linear-gradient(135deg, #fde047 0%, #eab308 100%)'}}>
                  <Zap className="w-5 h-5 icon-neon" /> Interfaz
                </h3>
                <div className="flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/5 gap-2 mb-4">
                   <label className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-300 font-semibold truncate flex-1">Mostrar Indicadores</label>
                   <div onClick={() => handleChange('showIndicators', !params.showIndicators)} className={`liquid-switch shrink-0 ${params.showIndicators ? 'active' : ''}`}><div className="liquid-switch-thumb"></div></div>
                </div>
                {renderControl("Transparencia Menú", "menuTransparency", 0.0, 1.0, 0.05)}
                {renderControl("Cierre Automático (s)", "menuAutoCloseTime", 1, 60, 1)}
              </div>

              <div className="liquid-section">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold neon-text text-yellow-400 flex items-center gap-2" style={{backgroundImage: 'linear-gradient(135deg, #fde047 0%, #eab308 100%)'}}>
                    <Zap className="w-5 h-5 icon-neon" /> Reactividad
                  </h3>
                  <button onClick={() => randomizeSection('reactivity')} className="text-yellow-400 hover:text-yellow-300 transition-colors" title="Armonía Aleatoria">
                    <Shuffle size={18} className="icon-neon" />
                  </button>
                </div>
                {renderControl("Sensibilidad", "sensitivity", 0.1, 5.0, 0.1)}
                {renderControl("Espectro Freq", "freqRange", 0.1, 1.0, 0.05)}
                {renderControl("Persistencia", "trail", 0.01, 1.0, 0.01)}
              </div>
            </div>

            {/* Colors */}
            <div className="liquid-section break-inside-avoid border-pink-500/30 shadow-[inset_0_0_30px_rgba(236,72,153,0.05)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold neon-text-pink flex items-center gap-2">
                  <Palette className="w-5 h-5 icon-neon-pink" /> Cromatismo
                </h3>
                <button onClick={() => randomizeSection('color')} className="text-pink-400 hover:text-pink-300 transition-colors" title="Armonía Aleatoria">
                  <Shuffle size={18} className="icon-neon-pink" />
                </button>
              </div>
              
              <div className="mb-4 flex justify-between items-center bg-pink-900/20 p-3 rounded-2xl border border-pink-500/30 gap-2">
                 <label className="text-[10px] sm:text-xs uppercase tracking-wider text-pink-300 font-bold flex items-center gap-2 drop-shadow-[0_0_5px_rgba(236,72,153,0.5)] truncate flex-1">
                    <Music className="w-4 h-4 shrink-0 icon-neon-pink" /> <span className="truncate">Color Armónico</span>
                 </label>
                 <div onClick={() => handleChange('harmonicColor', !params.harmonicColor)} className={`liquid-switch shrink-0 ${params.harmonicColor ? 'active-pink' : ''}`}>
                   <div className="liquid-switch-thumb"></div>
                 </div>
              </div>

              {params.harmonicColor ? (
                <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                  {renderControl("Sensibilidad Color", "harmonicSensitivity", 0.1, 5.0, 0.1)}
                  {renderControl("Profundidad Color", "harmonicDepth", 0, 360, 10)}
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                  {renderControl("Tono Base", "baseHue", 0, 360, 1)}
                  {renderControl("Velocidad Ciclo", "hueSpeed", 0, 5, 0.1)}
                </div>
              )}
              
              <div className="mt-6">
                {renderControl("Rango Gradiente", "hueRange", 0, 360, 1)}
                {renderControl("Saturación", "saturation", 0, 100, 1)}
                {renderControl("Brillo Base", "brightness", 0, 100, 1)}
              </div>
            </div>

            {/* Background */}
            <div className="liquid-section break-inside-avoid border-cyan-500/30 shadow-[inset_0_0_30px_rgba(0,242,254,0.05)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold neon-text flex items-center gap-2">
                  <Palette className="w-5 h-5 icon-neon" /> Fondo
                </h3>
                <button onClick={() => randomizeSection('background')} className="text-cyan-400 hover:text-cyan-300 transition-colors" title="Armonía Aleatoria">
                  <Shuffle size={18} className="icon-neon" />
                </button>
              </div>

              <div className="mb-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                <label className="text-xs uppercase tracking-wider text-gray-300 flex items-center gap-2 mb-3 font-semibold">
                  Modo de Fondo
                </label>
                <select 
                  value={params.bgMode}
                  onChange={(e) => handleChange('bgMode', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 text-cyan-300 text-sm rounded-xl p-3 outline-none focus:border-cyan-400 shadow-inner appearance-none"
                >
                  <option value="solid">Color Sólido</option>
                  <option value="gradient">Degradado</option>
                  <option value="liquid-rainbow">Arcoíris Líquido</option>
                  <option value="crystal-bubbles">Burbujas de Cristal</option>
                  <option value="organic-fade">Transición Orgánica</option>
                  <option value="morphing-colors">Colores Mórficos</option>
                </select>
              </div>

              <div className="mb-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs uppercase tracking-wider text-gray-300 font-semibold">Colores Personalizables</label>
                  <button 
                    onClick={() => handleChange('bgColors', [...(params.bgColors || []), '#ffffff'])}
                    className="text-cyan-400 hover:text-cyan-300 text-xs px-2 py-1 bg-cyan-500/10 rounded"
                  >
                    + Añadir
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(params.bgColors || []).map((color, idx) => (
                    <div key={idx} className="relative group">
                      <input 
                        type="color" 
                        value={color} 
                        onChange={(e) => {
                          const newColors = [...(params.bgColors || [])];
                          newColors[idx] = e.target.value;
                          handleChange('bgColors', newColors);
                        }} 
                        className="w-full h-8 rounded cursor-pointer bg-transparent border-none" 
                      />
                      {(params.bgColors || []).length > 1 && (
                        <button 
                          onClick={() => {
                            const newColors = (params.bgColors || []).filter((_, i) => i !== idx);
                            handleChange('bgColors', newColors);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/5 gap-2 mb-4">
                 <label className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-300 font-semibold truncate flex-1">Animado</label>
                 <div onClick={() => handleChange('bgAnimatable', !params.bgAnimatable)} className={`liquid-switch shrink-0 ${params.bgAnimatable ? 'active' : ''}`}><div className="liquid-switch-thumb"></div></div>
              </div>

              {renderControl("Velocidad Animación", "bgSpeed", 0, 5, 0.1)}

              <div className="flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/5 gap-2 mb-4 mt-4">
                 <label className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-300 font-semibold truncate flex-1">Viñeta</label>
                 <div onClick={() => handleChange('bgVignette', !params.bgVignette)} className={`liquid-switch shrink-0 ${params.bgVignette ? 'active' : ''}`}><div className="liquid-switch-thumb"></div></div>
              </div>

              {params.bgVignette && renderControl("Intensidad Viñeta", "bgVignetteIntensity", 0, 1, 0.05)}
            </div>

            {/* Base Geometry */}
            <div className="liquid-section break-inside-avoid">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold neon-text text-purple-400 flex items-center gap-2" style={{backgroundImage: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)'}}>
                  <Maximize className="w-5 h-5 icon-neon" /> Geometría Base
                </h3>
                <button onClick={() => randomizeSection('baseGeometry')} className="text-purple-400 hover:text-purple-300 transition-colors" title="Armonía Aleatoria">
                  <Shuffle size={18} className="icon-neon" />
                </button>
              </div>
              {renderControl("Factor K (Expansión)", "k", 0.8, 1.2, 0.001, undefined, params.autoPilot)}
              {renderControl("Detalle (Iteraciones)", "iter", 100, 2000, 10, undefined, false)}
              {renderControl("Profundidad (Zoom)", "zoom", 0.001, 3.0, 0.001, undefined, false)}
              {renderControl("Distancia (Zoom)", "distanceZoom", 0.1, 5.0, 0.01, undefined, false)}
              {renderControl("Grosor de Línea Espiral", "spiralThickness", 0.1, 10, 0.1, undefined, false)}
            </div>

            {/* Transformation */}
            <div className="liquid-section break-inside-avoid">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold neon-text text-green-400 flex items-center gap-2" style={{backgroundImage: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'}}>
                  <RotateCw className="w-5 h-5 icon-neon" /> Transformación
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => randomizeSection('transformation')} className="text-green-400 hover:text-green-300 transition-colors" title="Armonía Aleatoria">
                    <Shuffle size={18} className="icon-neon" />
                  </button>
                  <button 
                    onClick={centerSpiral}
                    disabled={params.autoPilot}
                    className={`liquid-bubble px-3 py-2 text-xs uppercase font-bold text-cyan-300 flex items-center gap-1 ${params.autoPilot ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Target size={14} className="icon-neon" /> CENTRAR
                  </button>
                </div>
              </div>
              
              {renderControl("Ángulo ψ", "psi", -6.28, 6.28, 0.01, undefined, params.autoPilot)}
              {renderControl("Desplazamiento X", "z0_r", -2, 2, 0.01, undefined, params.autoPilot)}
              {renderControl("Desplazamiento Y", "z0_i", -2, 2, 0.01, undefined, params.autoPilot)}
            </div>

          </div>
        </div>
      </div>

      {/* Preset Modal */}
      {showPresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="liquid-panel w-full max-w-md p-6 border border-white/20 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold neon-text flex items-center gap-2">
                <Save className="w-6 h-6 icon-neon" />
                Presets y Ajustes
              </h2>
              <button onClick={() => setShowPresetModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-sm text-gray-300 mb-6">
              Selecciona qué categorías deseas guardar o cargar.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { id: 'baseGeometry', label: 'Geometría Base' },
                { id: 'colors', label: 'Cromatismo' },
                { id: 'sacredGeometry', label: 'Geometría Sagrada' },
                { id: 'vrAr', label: 'VR / AR' },
                { id: 'reactivity', label: 'Reactividad' }
              ].map(cat => (
                <label key={cat.id} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={presetCategories[cat.id as keyof typeof presetCategories]}
                    onChange={(e) => setPresetCategories(prev => ({ ...prev, [cat.id]: e.target.checked }))}
                    className="rounded border-gray-500 bg-black/50 text-cyan-500 focus:ring-cyan-500/50"
                  />
                  {cat.label}
                </label>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleExportPreset}
                className="liquid-bubble w-full py-3 text-sm font-bold flex items-center justify-center gap-2 text-emerald-300 hover:text-emerald-200"
              >
                <Download className="w-5 h-5 icon-neon" />
                Exportar Preset Actual
              </button>

              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleImportPreset}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="liquid-bubble w-full py-3 text-sm font-bold flex items-center justify-center gap-2 text-cyan-300 hover:text-cyan-200"
                >
                  <Upload className="w-5 h-5 icon-neon" />
                  Importar Preset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ControlPanel;
