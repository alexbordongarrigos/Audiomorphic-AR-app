import React, { useState, useEffect, useRef, useCallback } from 'react';
import ControlPanel from './components/ControlPanel';
import VisualizerCanvas from './components/VisualizerCanvas';
import VisualizerVR from './components/VisualizerVR';
import { BackgroundLayer } from './components/BackgroundLayer';
import { VisualizerParams, DEFAULT_PARAMS, GeometryInfo, GeometryRegime } from './types';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';

// --- TREATISE DATA: GENESIS & MUSIC ---
const GENESIS_STAGES = [
  { name: 'I. El Vacío (Singularidad)', V: 1, E: 0 },
  { name: 'II. Vesica Piscis (Luz)', V: 2, E: 1 },
  { name: 'III. Semilla de la Vida', V: 7, E: 12 },
  { name: 'IV. Huevo de la Vida (Cubo)', V: 8, E: 12 }, // Cubo
  { name: 'V. Flor de la Vida', V: 19, E: 36 },
  { name: 'VI. Fruto de la Vida', V: 13, E: 24 }, // Vector Equilibrium
  { name: 'VII. Cubo de Metatrón', V: 13, E: 78 }
];

// Additional Platonic definitions for advanced mappings (future use or high energy)
const PLATONIC_FORMS = [
  { name: 'Tetraedro (Fuego)', V: 4, E: 6 },
  { name: 'Octaedro (Aire)', V: 6, E: 12 },
  { name: 'Icosaedro (Agua)', V: 12, E: 30 },
  { name: 'Dodecaedro (Éter)', V: 20, E: 30 }
];

// Linear interpolation
const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;

// Angle interpolation
const lerpAngle = (start: number, end: number, amt: number) => {
  const d = end - start;
  const delta = (((d + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  return start + delta * amt;
};

// --- MATH ENGINE: TREATISE ON HARMONIC UNIFICATION ---
const calculateHarmonicGeometry = (V: number, E: number): { 
  alpha: number, 
  beta: number, 
  sigma: number, 
  gamma: number, 
  k: number, 
  psi: number,
  regime: GeometryRegime
} => {
  // 1. INPUTS TOPOLOGICOS
  const alpha = V / 2;       // Variable Dual (Estructura)
  const beta = Math.sqrt(E); // Variable Potencial (Tensión)

  // 2. REGIMEN
  // Primario: Alpha >= Beta (Estabilidad)
  // Reciproco: Alpha < Beta (Tensión)
  // Void check
  if (V === 1 && E === 0) {
    return { alpha: 0.5, beta: 0, sigma: 1, gamma: 0, k: 1, psi: 0.05, regime: 'void' };
  }

  const regime: GeometryRegime = alpha >= beta ? 'primary' : 'reciprocal';

  // 3. TRIANGULO ARMONICO
  const c = Math.max(alpha, beta); // Hipotenusa
  const a = Math.min(alpha, beta); // Cateto Estructural
  // Cateto Base/Oculto: b = sqrt(c^2 - a^2)
  const b = Math.sqrt((c * c) - (a * a));

  // 4. FACTORES DE RESPIRACION
  const sigma = c + b; // Expansión (Yang)
  const gamma = c - b; // Contracción (Yin)

  // 5. ECUACION DE LA ESPIRAL
  // k = Factor de Cierre. 
  // Treatise: k = Gamma / Sigma. 
  let k_raw = (sigma === 0) ? 1 : (gamma / sigma);
  
  // Special case for perfect equilibrium (Vesica, Square) where Gamma = Sigma (b=0) -> k=1
  if (b < 0.001) k_raw = 1.0;

  // VISUAL CORRECTION: 
  // Raw math values (e.g. 0.7) cause the spiral to collapse to zero in the fractal loop.
  // We map the "geometric tension" (deviation from 1) to a very subtle visual deviation
  // typically between 0.995 and 1.000, so the spiral remains full-screen.
  // The '0.004' factor ensures the geometry influences the shape without destroying visibility.
  const k = 1.0 - (1.0 - k_raw) * 0.004; 

  // Psi = Angulo de Giro = arccos(b/c)
  const psi = (c === 0) ? 0 : Math.acos(b / c);

  return { alpha, beta, sigma, gamma, k, psi, regime };
};


const App: React.FC = () => {
  const [params, setParams] = useState<VisualizerParams>(DEFAULT_PARAMS);
  const { isActive, error, startAudio, stopAudio, getAudioMetrics } = useAudioAnalyzer();
  const [controlsVisible, setControlsVisible] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetHideTimer = useCallback(() => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, params.menuAutoCloseTime * 1000);
  }, [params.menuAutoCloseTime]);

  useEffect(() => {
    if (controlsVisible) {
      resetHideTimer();
    } else {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    }
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [controlsVisible, resetHideTimer]);

  // Logic Refs
  const animationFrameRef = useRef<number>(0);
  
  // --- PILOT STATE ---
  const pilotRef = useRef({
    targetK: DEFAULT_PARAMS.k,
    targetPsi: DEFAULT_PARAMS.psi,
    targetZ0_r: DEFAULT_PARAMS.z0_r,
    targetZ0_i: DEFAULT_PARAMS.z0_i,
    targetHue: params.baseHue,
    lastBeatTime: 0,
    currentParams: { ...DEFAULT_PARAMS },
    genesisTargetStage: 0
  });

  const toggleAudio = () => {
    if (isActive) {
      stopAudio();
    } else {
      startAudio(params.audioSource);
    }
  };

  // Restart audio if source changes while active
  useEffect(() => {
    if (isActive) {
      stopAudio();
      startAudio(params.audioSource);
    }
  }, [params.audioSource]);

  // --- AUTO PILOT ENGINE ---
  useEffect(() => {
    if (!params.autoPilot) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const updateLoop = () => {
      const { volume, frequency } = getAudioMetrics(params.sensitivity, params.freqRange);
      const now = Date.now();
      const p = pilotRef.current;
      let geometryData: GeometryInfo | undefined;

      // --- GENESIS MODE (Treatise Implementation) ---
      if (params.autoPilotMode === 'genesis') {
        
        // 1. Determine Stage based on Energy
        // Combine Volume (Matter/Density) and Frequency (Vibration/Spirit)
        const emotionSens = params.autoEmotionSensitivity ?? 0.5;
        const energy = (volume + (frequency * 0.4)) * (0.5 + emotionSens);
        
        // Map energy to Genesis progression
        let stageIdx = 0;
        if (energy < 0.05) stageIdx = 0;      // Void
        else if (energy < 0.15) stageIdx = 1; // Vesica
        else if (energy < 0.30) stageIdx = 2; // Seed
        else if (energy < 0.45) stageIdx = 3; // Egg (Cube)
        else if (energy < 0.60) stageIdx = 4; // Flower
        else if (energy < 0.75) stageIdx = 5; // Fruit
        else stageIdx = 6;                    // Metatron (Max complexity)

        // Hysteresis for stability
        if (Math.abs(stageIdx - p.genesisTargetStage) > 0.1) {
             p.genesisTargetStage = stageIdx;
        }

        const currentStage = GENESIS_STAGES[p.genesisTargetStage];

        // 2. CALCULATE MATH
        const math = calculateHarmonicGeometry(currentStage.V, currentStage.E);

        // 3. APPLY TO TARGETS
        // Audio reactivity modulates the strict math slightly (Breathing)
        const breathing = 1.0 + (volume * 0.015 * (emotionSens * 2)); 

        p.targetPsi = math.psi;
        p.targetK = math.k * breathing;
        p.targetZ0_r = 0;
        p.targetZ0_i = 0;

        // Color based on Regime
        if (math.regime === 'primary') {
             p.targetHue = 200 - (p.genesisTargetStage * 10); // Cool colors
        } else if (math.regime === 'reciprocal') {
             p.targetHue = 0 + (p.genesisTargetStage * 5); // Warm/Hot colors
        } else {
             p.targetHue = 240; // Void = Dark Blue
        }

        // Expose Math to UI
        geometryData = {
          V: currentStage.V,
          E: currentStage.E,
          alpha: math.alpha,
          beta: math.beta,
          regime: math.regime,
          name: currentStage.name
        };

      } 
      // --- HARMONIC MODE (Musical Geometry) ---
      else if (params.autoPilotMode === 'harmonic') {
         const emotionSens = params.autoEmotionSensitivity ?? 0.5;
         // Map freq to notes, then to polygons per the Treatise
         const rawNote = Math.floor(frequency * 36); 
         const noteIndex = rawNote % 12;
         const interval = Math.abs(noteIndex - params.rootNote) % 12;
         
         // Use the interval to determine shape V/E from Chapter III
         let V=1, E=0, name="Unison";
         switch(interval) {
            case 6: V=2; E=1; name="Tritono"; break; // Line
            case 4: V=3; E=3; name="Aumentada"; break; // Triangle
            case 3: V=4; E=4; name="Disminuida"; break; // Square
            case 2: V=6; E=6; name="Tonos Enteros"; break; // Hexagon
            case 7: V=7; E=7; name="Escala Mayor"; break; // Heptagon
            default: V=12; E=12; name="Cromática"; break; // Dodecagon
         }

         const math = calculateHarmonicGeometry(V, E);
         
         // Harmonic breathing
         const breathing = 1.0 + (volume * 0.012 * (emotionSens * 2)); 

         p.targetPsi = math.psi;
         p.targetK = math.k * breathing;
         p.targetHue = (noteIndex * 30) % 360; // Circle of fifths approx
         p.targetZ0_r = 0;
         p.targetZ0_i = 0;

         geometryData = {
            V, E, alpha: math.alpha, beta: math.beta, regime: math.regime, name
         };
      } 
      // --- DRIFT MODE ---
      else {
        const emotionSens = params.autoEmotionSensitivity ?? 0.5;
        const fluidity = params.autoStyleFluidity ?? 0.5;
        const isBeat = volume > (0.6 - (emotionSens * 0.4)); // Sensibilidad al beat
        
        // El tiempo entre cambios aleatorios depende de la fluidez
        const beatCooldown = 3000 - (fluidity * 2000); 

        if (isBeat && (now - p.lastBeatTime > beatCooldown)) {
          p.lastBeatTime = now;
          
          // Cambios aleatorios en múltiples parámetros basados en la fluidez
          p.targetPsi = (Math.random() * Math.PI * 2);
          
          if (Math.random() < fluidity) {
             p.targetK = DEFAULT_PARAMS.k + (Math.random() * 0.02 - 0.01) * emotionSens;
          }
          
          if (Math.random() < fluidity * 0.5) {
             p.targetZ0_r = (Math.random() * 0.5 - 0.25) * emotionSens;
             p.targetZ0_i = (Math.random() * 0.5 - 0.25) * emotionSens;
          }
        }
        
        // Si no hay beat, tiende a volver a la normalidad o deriva suavemente
        if (now - p.lastBeatTime > beatCooldown * 2) {
           p.targetK = lerp(p.targetK, DEFAULT_PARAMS.k, 0.01);
           p.targetZ0_r = lerp(p.targetZ0_r, 0, 0.01);
           p.targetZ0_i = lerp(p.targetZ0_i, 0, 0.01);
        }

        p.targetPsi += (frequency * 0.0005 * (0.5 + emotionSens));
        p.targetHue = (p.currentParams.baseHue + (0.2 + fluidity * 0.5) * (0.5 + emotionSens)) % 360;
      }

      // --- PHYSICS ---
      const viscosity = params.autoViscosity ?? 0.96;
      const fluidity = params.autoStyleFluidity ?? 0.5;
      const emotionSens = params.autoEmotionSensitivity ?? 0.5;
      
      let alpha = (1 - viscosity) * 0.05 * (0.5 + fluidity * 1.5);
      if (volume > 0.3) alpha *= (1.0 + emotionSens);

      p.currentParams.k = lerp(p.currentParams.k, p.targetK, alpha);
      p.currentParams.psi = lerpAngle(p.currentParams.psi, p.targetPsi, alpha);
      p.currentParams.z0_r = lerp(p.currentParams.z0_r, p.targetZ0_r, alpha);
      p.currentParams.z0_i = lerp(p.currentParams.z0_i, p.targetZ0_i, alpha);
      p.currentParams.baseHue = lerpAngle(p.currentParams.baseHue, p.targetHue, alpha * 0.5);

      setParams(prev => {
        return {
          ...prev,
          k: p.currentParams.k,
          psi: p.currentParams.psi,
          z0_r: p.currentParams.z0_r,
          z0_i: p.currentParams.z0_i,
          baseHue: p.currentParams.baseHue,
          genesisStage: p.genesisTargetStage,
          geometryData: geometryData
        };
      });

      animationFrameRef.current = requestAnimationFrame(updateLoop);
    };

    pilotRef.current.currentParams = { ...params };
    updateLoop();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [params.autoPilot, params.autoPilotMode, params.autoSpeed, params.autoViscosity, params.rootNote, isActive]); 

  return (
    <div 
      className="flex h-screen w-screen overflow-hidden bg-black text-white relative"
      onPointerDown={() => setControlsVisible(true)}
      onPointerMove={() => { if (controlsVisible) resetHideTimer(); }}
    >
      <div className="absolute inset-0 z-0">
        <BackgroundLayer params={params} getAudioMetrics={getAudioMetrics} />
        {(params.vrMode || params.arPortalMode) ? (
          <VisualizerVR 
            params={params} 
            getAudioMetrics={getAudioMetrics}
            setParams={setParams}
            audioActive={isActive}
            toggleAudio={toggleAudio}
          />
        ) : (
          <VisualizerCanvas 
            params={params} 
            getAudioMetrics={getAudioMetrics}
          />
        )}
      </div>

      {!(params.vrMode || params.arPortalMode) && params.showIndicators && (
        <div className="absolute top-6 right-6 flex gap-4 z-20 transition-opacity duration-500" style={{ opacity: controlsVisible ? 1 : 0.5 }}>
           <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono backdrop-blur-sm transition-colors duration-300 pointer-events-none
             ${isActive 
               ? 'bg-red-500/10 border-red-500/40 text-red-400 animate-pulse' 
               : 'bg-gray-800/30 border-gray-700 text-gray-500'}
           `}>
             <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500' : 'bg-gray-500'}`}></div>
             {isActive ? 'MIC LIVE' : 'MIC OFF'}
           </div>
           
           {params.autoPilot && (
             <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/40 bg-indigo-500/10 text-indigo-400 text-xs font-mono backdrop-blur-sm shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <span className="animate-spin mr-1">❖</span> 
                {params.autoPilotMode === 'harmonic' ? 'ARQUITECTURA ARMÓNICA' : 
                 params.autoPilotMode === 'genesis' ? 'GÉNESIS GEOMÉTRICO' : 'AUTO-DERIVA'}
             </div>
           )}
      </div>
      )}

      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-900/80 border border-red-500 text-red-100 px-6 py-3 rounded-lg shadow-lg backdrop-blur-md text-sm font-mono flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          {error}
        </div>
      )}

      {!(params.vrMode) && (
        <>
          {/* Overlay to close menu when clicking outside */}
          <div 
            className={`absolute inset-0 z-20 transition-opacity duration-500 ${controlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onPointerDown={(e) => {
              e.stopPropagation();
              setControlsVisible(false);
            }}
            onPointerMove={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          />
          <div 
            className={`
              absolute top-1/2 left-1/2 z-30 w-[95vw] md:w-[90vw] max-w-5xl h-[90vh] flex flex-col
              transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
              ${controlsVisible ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
            `}
            onPointerDown={(e) => { e.stopPropagation(); resetHideTimer(); }}
            onPointerMove={(e) => { e.stopPropagation(); resetHideTimer(); }}
            onTouchMove={(e) => { e.stopPropagation(); resetHideTimer(); }}
            onWheel={(e) => { e.stopPropagation(); resetHideTimer(); }}
          >
            <ControlPanel 
              params={params} 
              setParams={setParams} 
              audioActive={isActive}
              toggleAudio={toggleAudio}
              onClose={() => setControlsVisible(false)}
              getAudioMetrics={getAudioMetrics}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default App;