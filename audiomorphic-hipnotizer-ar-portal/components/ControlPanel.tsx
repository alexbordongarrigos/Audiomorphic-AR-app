import React, { useState, useEffect } from 'react';
import { VisualizerParams } from '../types';
import { Activity, Maximize, Minimize, Target, Download } from 'lucide-react';

interface ControlPanelProps {
  params: VisualizerParams;
  setParams: React.Dispatch<React.SetStateAction<VisualizerParams>>;
  audioActive: boolean;
  toggleAudio: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ params, setParams, audioActive, toggleAudio }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleInstallClick = () => {
    window.open("https://drive.google.com/drive/folders/1bZ8yvbWr7r3eJUdKIQCSSuu-p398mAkn?usp=sharing", "_blank");
  };

  useEffect(() => {
    const handleFullScreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };
  
  const handleChange = (key: keyof VisualizerParams, value: number | boolean | string | string[]) => {
    if (typeof value === 'number' && isNaN(value)) return;
    setParams(prev => ({ ...prev, [key]: value }));
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
    <div className={`mb-5 transition-all duration-500 ${disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex justify-between items-end mb-2">
        <label className="text-xs uppercase tracking-wider text-gray-300 flex items-center gap-2 font-semibold">
          {icon && <span className="text-cyan-300 drop-shadow-[0_0_5px_rgba(0,242,254,0.8)]">{icon}</span>}
          {label}
        </label>
        <input
          type="number"
          step="any"
          value={typeof params[key] === 'number' ? Number(params[key]).toFixed(3) : params[key] as number}
          onChange={(e) => handleChange(key, parseFloat(e.target.value))}
          disabled={disabled}
          className="font-mono text-xs text-cyan-200 bg-black/30 border border-white/10 rounded-lg px-2 py-1 focus:border-cyan-400 outline-none text-right w-20 hover:border-white/30 transition-all shadow-inner"
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

  return (
    <>
      <style>{`
        .liquid-panel {
          background: rgba(15, 15, 25, 0.4);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 
            0 30px 80px rgba(0, 0, 0, 0.6),
            inset 0 1px 2px rgba(255, 255, 255, 0.4),
            inset 0 -10px 30px rgba(255, 255, 255, 0.05),
            inset 0 20px 40px rgba(255, 255, 255, 0.03);
          border-radius: 40px;
          overflow: hidden;
        }

        .liquid-bubble {
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 
            0 8px 32px 0 rgba(0, 0, 0, 0.3),
            inset 0 2px 3px rgba(255, 255, 255, 0.3),
            inset 0 -2px 5px rgba(0, 0, 0, 0.3);
          border-radius: 9999px;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
        }

        .liquid-bubble::before {
          content: '';
          position: absolute;
          top: 2%; left: 15%; right: 15%; height: 35%;
          background: linear-gradient(to bottom, rgba(255,255,255,0.5), transparent);
          border-radius: 50%;
          pointer-events: none;
        }

        .liquid-bubble:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 
            0 15px 40px 0 rgba(0, 0, 0, 0.4),
            inset 0 2px 4px rgba(255, 255, 255, 0.5),
            0 0 25px rgba(0, 242, 254, 0.4);
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%);
        }

        .liquid-bubble:active {
          transform: translateY(1px) scale(0.97);
          box-shadow: 
            0 4px 15px 0 rgba(0, 0, 0, 0.3),
            inset 0 4px 8px rgba(0, 0, 0, 0.5);
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
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,1), rgba(100,200,255,0.8));
          box-shadow: 
            0 4px 12px rgba(0,0,0,0.5), 
            inset 0 2px 5px rgba(255,255,255,1),
            inset 0 -2px 5px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1px solid rgba(255,255,255,0.6);
        }

        .liquid-slider::-webkit-slider-thumb:hover {
          transform: scale(1.25);
          box-shadow: 
            0 8px 20px rgba(0,242,254,0.6), 
            inset 0 2px 5px rgba(255,255,255,1);
        }

        .neon-text {
          background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 20px rgba(0, 242, 254, 0.8);
        }

        .liquid-section {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 32px;
          box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.03), 0 15px 35px rgba(0,0,0,0.3);
          position: relative;
          overflow: hidden;
          padding: 1.5rem;
          break-inside: avoid;
          margin-bottom: 2rem;
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

      <div className="liquid-panel w-full h-full flex flex-col relative z-10">
        <div className="px-6 py-5 border-b border-white/10 flex flex-col gap-4 bg-white/5">
          <div>
            <h1 className="text-2xl font-bold neon-text flex items-center gap-3">
              <Activity className="w-6 h-6 text-cyan-300 drop-shadow-[0_0_10px_rgba(0,242,254,0.8)]" />
              Portal AR
            </h1>
            <p className="text-xs text-cyan-100/70 mt-1 font-medium tracking-wide">Ventana Inteligente</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleAudio}
              className={`liquid-bubble px-3 py-2 text-xs font-bold flex items-center gap-2 flex-1 justify-center ${
                audioActive ? 'text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'text-cyan-300'
              }`}
            >
              {audioActive ? 'Detener Mic' : 'Iniciar Mic'}
            </button>
            <button
              onClick={toggleFullScreen}
              className="liquid-bubble px-3 py-2 text-xs font-bold flex items-center gap-2 flex-1 justify-center text-purple-300"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              {isFullscreen ? 'Salir' : 'Pantalla'}
            </button>
            <button
              onClick={handleInstallClick}
              className="liquid-bubble px-3 py-2 text-xs font-bold flex items-center gap-2 flex-1 justify-center text-emerald-300"
            >
              <Download className="w-4 h-4" />
              Instalar
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 liquid-scroll">
          <div className="flex flex-col gap-6">
            
            {/* AR Portal Section */}
            <div className="liquid-section border-cyan-500/30 shadow-[inset_0_0_30px_rgba(0,242,254,0.05)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold neon-text flex items-center gap-2">
                  <Target className="w-5 h-5" /> Ajustes de Ventana
                </h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={params.arPortalMode}
                    onChange={(e) => handleChange('arPortalMode', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>
              
              <div className={`animate-in fade-in slide-in-from-top-4 duration-700 ${!params.arPortalMode ? 'opacity-40 pointer-events-none' : ''}`}>
                {renderControl("Intensidad Perspectiva", "arPortalPerspectiveIntensity", 0.0, 10.0, 0.001)}
                {renderControl("Escala del Portal", "arPortalScale", 0.0, 20.0, 0.001)}
                {renderControl("Difuminado de Profundidad", "arPortalFade", 0.0, 5.0, 0.001)}
                {renderControl("Amplitud Punto de Fuga", "arPortalVanishingRadius", 0.0, 2.0, 0.001)}
                
                <div className="mt-4 p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-xl text-center">
                  <p className="text-xs text-cyan-300">
                    Mueve tu cabeza frente a la cámara para ver el efecto de profundidad 3D realista a través de la pantalla.
                  </p>
                </div>
              </div>
            </div>

            {/* Base Visuals Section */}
            <div className="liquid-section border-purple-500/30 shadow-[inset_0_0_30px_rgba(168,85,247,0.05)]">
              <h3 className="text-lg font-bold neon-text mb-6 flex items-center gap-2" style={{ backgroundImage: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)' }}>
                <Activity className="w-5 h-5" /> Visuales Base
              </h3>
              
              <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                {renderControl("Factor K", "k", 0.0, 2.0, 0.001)}
                {renderControl("Ángulo Psi", "psi", 0.0, Math.PI * 2, 0.001)}
                {renderControl("Iteraciones", "iter", 100, 10000, 100)}
                {renderControl("Zoom", "zoom", 0.0001, 0.01, 0.0001)}
                {renderControl("Centro X", "z0_r", -2.0, 2.0, 0.001)}
                {renderControl("Centro Y", "z0_i", -2.0, 2.0, 0.001)}
                <button
                  onClick={() => { handleChange('z0_r', 0); handleChange('z0_i', 0); }}
                  className="w-full mb-5 liquid-bubble px-3 py-2 text-xs font-bold text-cyan-300"
                >
                  Centrar Vista
                </button>
                {renderControl("Tono Base", "baseHue", 0, 360, 1)}
                {renderControl("Rango de Tono", "hueRange", 0, 720, 1)}
                {renderControl("Saturación", "saturation", 0, 100, 1)}
                {renderControl("Brillo", "brightness", 0, 100, 1)}
              </div>
            </div>

            {/* Color Armónico Section */}
            <div className="liquid-section border-pink-500/30 shadow-[inset_0_0_30px_rgba(236,72,153,0.05)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold neon-text flex items-center gap-2" style={{ backgroundImage: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)' }}>
                  <Target className="w-5 h-5" /> Color Armónico
                </h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={params.harmonicColor}
                    onChange={(e) => handleChange('harmonicColor', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>
              
              <div className={`animate-in fade-in slide-in-from-top-4 duration-700 ${!params.harmonicColor ? 'opacity-40 pointer-events-none' : ''}`}>
                {renderControl("Sensibilidad Color", "harmonicSensitivity", 0.1, 20.0, 0.1)}
                {renderControl("Profundidad Color", "harmonicDepth", 0, 720, 1)}
              </div>
            </div>

            {/* Automatización Section */}
            <div className="liquid-section border-emerald-500/30 shadow-[inset_0_0_30px_rgba(16,185,129,0.05)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold neon-text flex items-center gap-2" style={{ backgroundImage: 'linear-gradient(135deg, #34d399 0%, #059669 100%)' }}>
                  <Activity className="w-5 h-5" /> Automatización
                </h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={params.autoPilot}
                    onChange={(e) => handleChange('autoPilot', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              
              <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="mb-5">
                  <label className="text-xs uppercase tracking-wider text-gray-300 flex items-center gap-2 font-semibold mb-2">
                    Modo Piloto
                  </label>
                  <div className="flex gap-2">
                    {(['drift', 'harmonic', 'genesis'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => {
                          handleChange('autoPilotMode', mode);
                          handleChange('autoPilot', true);
                        }}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          params.autoPilot && params.autoPilotMode === mode 
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                            : 'bg-black/30 border-white/10 text-gray-400 hover:border-white/30'
                        }`}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className={`transition-all duration-500 ${!params.autoPilot ? 'opacity-40 pointer-events-none' : ''}`}>
                  {params.autoPilotMode === 'genesis' && (
                    <div className="mb-5 p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-xl text-center">
                      <p className="text-xs text-emerald-300 font-bold mb-1">Fase Genesis</p>
                      <p className="text-sm text-white">{['Semilla', 'Expansión', 'Complejidad', 'Trascendencia'][params.genesisStage % 4]}</p>
                    </div>
                  )}

                  {renderControl("Viscosidad", "autoViscosity", 0.0, 1.0, 0.001)}
                  {renderControl("Velocidad Deriva", "autoSpeed", 0.0, 5.0, 0.01)}
                </div>
              </div>
            </div>

            {/* Geometría Sagrada Section */}
            <div className="liquid-section border-amber-500/30 shadow-[inset_0_0_30px_rgba(245,158,11,0.05)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold neon-text flex items-center gap-2" style={{ backgroundImage: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)' }}>
                  <Target className="w-5 h-5" /> Geometría Sagrada
                </h3>
              </div>
              
              <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="mb-5">
                  <label className="text-xs uppercase tracking-wider text-gray-300 flex items-center gap-2 font-semibold mb-2">
                    Modo de Resonancia
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['goldenSpiral', 'flowerOfLife', 'quantumWave', 'torus'] as const).map(mode => {
                      const isActive = params.sgResonanceModes.includes(mode);
                      const labels: Record<string, string> = {
                        goldenSpiral: 'Espiral Áurea',
                        flowerOfLife: 'Flor de la Vida',
                        quantumWave: 'Onda Cuántica',
                        torus: 'Toroide'
                      };
                      return (
                        <button
                          key={mode}
                          onClick={() => {
                            const newModes = isActive 
                              ? params.sgResonanceModes.filter(m => m !== mode)
                              : [...params.sgResonanceModes, mode];
                            // Ensure at least one mode is active
                            if (newModes.length > 0) {
                              handleChange('sgResonanceModes', newModes);
                            }
                          }}
                          className={`flex-1 min-w-[45%] py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            isActive 
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                              : 'bg-black/30 border-white/10 text-gray-400 hover:border-white/30'
                          }`}
                        >
                          {labels[mode]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="text-xs uppercase tracking-wider text-gray-300 flex items-center gap-2 font-semibold mb-2">
                    Modo de Dibujo
                  </label>
                  <div className="flex gap-2">
                    {(['nodes', 'layers'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => handleChange('sgDrawMode', mode)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          params.sgDrawMode === mode 
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                            : 'bg-black/30 border-white/10 text-gray-400 hover:border-white/30'
                        }`}
                      >
                        {mode === 'nodes' ? 'Nodos' : 'Capas'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-5 flex justify-between items-center">
                  <label className="text-xs uppercase tracking-wider text-gray-300 flex items-center gap-2 font-semibold">
                    Auto Resonancia
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={params.sgAutoResonance}
                      onChange={(e) => handleChange('sgAutoResonance', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <div className="mb-5 flex justify-between items-center">
                  <label className="text-xs uppercase tracking-wider text-gray-300 flex items-center gap-2 font-semibold">
                    Mostrar Nodos
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={params.sgShowNodes}
                      onChange={(e) => handleChange('sgShowNodes', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <div className="mb-5">
                  <label className="text-xs uppercase tracking-wider text-gray-300 flex items-center gap-2 font-semibold mb-2">
                    Modo de Dibujo
                  </label>
                  <div className="flex gap-2">
                    {(['nodes', 'layers'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => handleChange('sgDrawMode', mode)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          params.sgDrawMode === mode 
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                            : 'bg-black/30 border-white/10 text-gray-400 hover:border-white/30'
                        }`}
                      >
                        {mode === 'nodes' ? 'Nodos' : 'Capas'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="text-xs uppercase tracking-wider text-gray-300 flex items-center gap-2 font-semibold mb-2">
                    Auto Resonancia
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={params.sgAutoResonance}
                      onChange={(e) => handleChange('sgAutoResonance', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Realidad Virtual Section */}
            <div className="liquid-section border-orange-500/30 shadow-[inset_0_0_30px_rgba(249,115,22,0.05)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold neon-text flex items-center gap-2" style={{ backgroundImage: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)' }}>
                  <Maximize className="w-5 h-5" /> Realidad Virtual
                </h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={params.vrMode}
                    onChange={(e) => handleChange('vrMode', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
              
              <div className={`animate-in fade-in slide-in-from-top-4 duration-700 ${!params.vrMode ? 'opacity-40 pointer-events-none' : ''}`}>
                {renderControl("Profundidad VR", "vrDepth", 1, 100, 1)}
                {renderControl("Distancia VR", "vrDistance", -50, 50, 1)}
                {renderControl("Radio VR", "vrRadius", 0.1, 20, 0.1)}
                {renderControl("Grosor VR", "vrThickness", 0.1, 10, 0.1)}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ControlPanel;
