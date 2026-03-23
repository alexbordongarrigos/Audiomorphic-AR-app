import React, { useState, useEffect, useRef } from 'react';
import { VisualizerParams, SacredGeometryMode, SacredGeometrySettings } from '../types';
import { Activity, Zap, Maximize, Minimize, RotateCw, Palette, Target, Music, BrainCircuit, Wind, Droplets, Waves, Shuffle, Sprout, Glasses, Download, X } from 'lucide-react';

interface ControlPanelProps {
  params: VisualizerParams;
  setParams: React.Dispatch<React.SetStateAction<VisualizerParams>>;
  audioActive: boolean;
  toggleAudio: () => void;
  onClose?: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ params, setParams, audioActive, toggleAudio, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedSgEditMode, setSelectedSgEditMode] = useState<SacredGeometryMode>('flowerOfLife');

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
        } catch (err) {
          console.error(`Wake Lock error: ${err}`);
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

  const centerSpiral = () => setParams(prev => ({ ...prev, z0_r: 0, z0_i: 0 }));

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
          value={typeof params[key] === 'number' ? Number(params[key]).toFixed(3) : params[key] as number}
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
          value={value}
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
          background: rgba(15, 15, 25, ${params.menuTransparency});
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 
            0 30px 80px rgba(0, 0, 0, 0.6),
            inset 0 1px 2px rgba(255, 255, 255, 0.4),
            inset 0 -10px 30px rgba(255, 255, 255, 0.05),
            inset 0 20px 40px rgba(255, 255, 255, 0.03);
          border-radius: 24px;
          overflow: hidden;
        }
        @media (min-width: 768px) {
          .liquid-panel {
            border-radius: 40px;
          }
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
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.03), 0 15px 35px rgba(0,0,0,0.3);
          position: relative;
          overflow: hidden;
          padding: 0.75rem;
          margin-bottom: 1rem;
        }
        @media (min-width: 768px) {
          .liquid-section {
            border-radius: 24px;
            padding: 1rem;
          }
        }

        .liquid-section::before {
          content: '';
          position: absolute;
          top: -50%; left: -50%; width: 200%; height: 200%;
          background: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.08), transparent 50%);
          pointer-events: none;
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
          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-bold neon-text flex items-center justify-center md:justify-start gap-2">
              <Activity className="w-5 h-5 md:w-6 md:h-6 icon-neon" />
              AudioMorphic
            </h1>
            <p className="text-[10px] md:text-xs text-cyan-100/70 mt-0.5 font-medium tracking-wide">Recurrencia Compleja Sonora</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={toggleAudio}
              className={`liquid-bubble px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-bold flex items-center gap-2 ${
                audioActive ? 'text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'text-cyan-300'
              }`}
            >
              <span className="hidden sm:inline">{audioActive ? 'Detener Micrófono' : 'Iniciar Micrófono'}</span>
              <span className="sm:hidden">{audioActive ? 'Detener' : 'Iniciar'}</span>
            </button>
            <button
              onClick={toggleFullScreen}
              className="liquid-bubble px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-bold flex items-center gap-2 text-purple-300"
            >
              {isFullscreen ? <Minimize className="w-5 h-5 icon-neon" /> : <Maximize className="w-5 h-5 icon-neon" />}
              <span className="hidden sm:inline">{isFullscreen ? 'Salir' : 'Pantalla Completa'}</span>
            </button>
            <button
              onClick={handleInstallClick}
              className="liquid-bubble px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-bold flex items-center gap-2 text-emerald-300"
            >
              <Download className="w-5 h-5 icon-neon" />
              <span className="hidden sm:inline">Instalar</span>
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
                  </div>
               )}
            </div>

            {/* Perturbación de Espiral Section */}
            <div className="liquid-section break-inside-avoid border-emerald-500/30 shadow-[inset_0_0_30px_rgba(16,185,129,0.05)]">
              <h3 className="text-lg font-bold neon-text-emerald flex items-center gap-2 mb-4">
                <Waves className="w-5 h-5 icon-neon-emerald" /> Perturbación de Espiral
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-emerald-500/20 shadow-inner">
                {[
                  { id: 'goldenSpiral', label: 'Espiral Áurea' },
                  { id: 'flowerOfLife', label: 'Flor de la Vida' },
                  { id: 'quantumWave', label: 'Onda Cuántica' },
                  { id: 'torus', label: 'Toroide' }
                ].map(mode => {
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
                <div 
                   onClick={() => handleChange('sacredGeometryEnabled', !params.sacredGeometryEnabled)}
                   className={`liquid-switch shrink-0 ${params.sacredGeometryEnabled ? 'active' : ''}`}
                 >
                   <div className="liquid-switch-thumb"></div>
                 </div>
              </div>

              {params.sacredGeometryEnabled && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                  <div className="mb-4">
                    <label className="text-xs uppercase tracking-wider text-gray-300 flex items-center gap-2 mb-3 font-semibold">
                      Tipos de Geometría
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-emerald-500/20 shadow-inner">
                      {[
                        { id: 'goldenSpiral', label: 'Espiral Áurea' },
                        { id: 'flowerOfLife', label: 'Flor de la Vida' },
                        { id: 'quantumWave', label: 'Onda Cuántica' },
                        { id: 'torus', label: 'Toroide' }
                      ].map(mode => {
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-emerald-500/20 shadow-inner">
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

                {params.sgDrawMode === 'nodes' && (
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
                      Resonancia Automática
                   </label>
                   <div 
                     onClick={() => handleChange('sgAutoResonance', !params.sgAutoResonance)}
                     className={`liquid-switch shrink-0 ${params.sgAutoResonance ? 'active-emerald' : ''}`}
                   >
                     <div className="liquid-switch-thumb"></div>
                   </div>
                </div>

                {!params.sgAutoResonance ? (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="mb-5 mt-6">
                      <label className="text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-3 font-semibold">
                        Ajustes Independientes
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-emerald-500/20 mb-4 shadow-inner">
                        {[
                          { id: 'goldenSpiral', label: 'Espiral Áurea' },
                          { id: 'flowerOfLife', label: 'Flor de la Vida' },
                          { id: 'quantumWave', label: 'Onda Cuántica' },
                          { id: 'torus', label: 'Toroide' }
                        ].map(mode => (
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
              <h3 className="text-lg font-bold neon-text text-purple-400 mb-4 flex items-center gap-2" style={{backgroundImage: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)'}}>
                <Glasses className="w-5 h-5 icon-neon-pink" /> Realidad Virtual
              </h3>
              
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
              <h3 className="text-lg font-bold neon-text text-emerald-400 mb-4 flex items-center gap-2" style={{backgroundImage: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'}}>
                <Glasses className="w-5 h-5 icon-neon-pink" /> Portal AR
              </h3>
              
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
                <h3 className="text-lg font-bold neon-text text-yellow-400 mb-6 flex items-center gap-2" style={{backgroundImage: 'linear-gradient(135deg, #fde047 0%, #eab308 100%)'}}>
                  <Zap className="w-5 h-5 icon-neon" /> Reactividad
                </h3>
                {renderControl("Sensibilidad", "sensitivity", 0.1, 5.0, 0.1)}
                {renderControl("Espectro Freq", "freqRange", 0.1, 1.0, 0.05)}
                {renderControl("Persistencia", "trail", 0.01, 1.0, 0.01)}
              </div>
            </div>

            {/* Colors */}
            <div className="liquid-section break-inside-avoid border-pink-500/30 shadow-[inset_0_0_30px_rgba(236,72,153,0.05)]">
              <h3 className="text-lg font-bold neon-text-pink mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 icon-neon-pink" /> Cromatismo
              </h3>
              
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

            {/* Base Geometry */}
            <div className="liquid-section break-inside-avoid">
              <h3 className="text-lg font-bold neon-text text-purple-400 mb-4 flex items-center gap-2" style={{backgroundImage: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)'}}>
                <Maximize className="w-5 h-5 icon-neon" /> Geometría Base
              </h3>
              {renderControl("Factor K (Expansión)", "k", 0.8, 1.2, 0.001, undefined, params.autoPilot)}
              {renderControl("Detalle (Iteraciones)", "iter", 100, 2000, 10, undefined, false)}
              {renderControl("Profundidad (Zoom)", "zoom", 0.001, 3.0, 0.001, undefined, false)}
              {renderControl("Distancia (Zoom)", "distanceZoom", 0.1, 5.0, 0.01, undefined, false)}
            </div>

            {/* Transformation */}
            <div className="liquid-section break-inside-avoid">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold neon-text text-green-400 flex items-center gap-2" style={{backgroundImage: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'}}>
                  <RotateCw className="w-5 h-5 icon-neon" /> Transformación
                </h3>
                <button 
                  onClick={centerSpiral}
                  disabled={params.autoPilot}
                  className={`liquid-bubble px-3 py-2 text-xs uppercase font-bold text-cyan-300 flex items-center gap-1 ${params.autoPilot ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Target size={14} className="icon-neon" /> CENTRAR
                </button>
              </div>
              
              {renderControl("Ángulo ψ", "psi", -6.28, 6.28, 0.01, undefined, params.autoPilot)}
              {renderControl("Desplazamiento X", "z0_r", -2, 2, 0.01, undefined, params.autoPilot)}
              {renderControl("Desplazamiento Y", "z0_i", -2, 2, 0.01, undefined, params.autoPilot)}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ControlPanel;
