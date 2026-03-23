import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { VRButton, XR } from '@react-three/xr';
import * as THREE from 'three';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { Settings, X } from 'lucide-react';
import ControlPanel from './components/ControlPanel';
import SacredGeometryOverlay from './components/SacredGeometryOverlay';
import { VisualizerParams, DEFAULT_PARAMS } from './types';

// --- Hooks ---
const useAudioAnalyzer = () => {
  const [isActive, setIsActive] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const startAudio = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.85;
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      setIsActive(true);
    } catch (err: any) {
      console.error("Error accessing microphone:", err?.message || err);
      setIsActive(false);
    }
  };

  const stopAudio = () => {
    if (sourceRef.current) sourceRef.current.disconnect();
    setIsActive(false);
  };

  const getAudioMetrics = useCallback((sensitivity: number, freqRange: number) => {
    if (!analyserRef.current || !dataArrayRef.current || !isActive) {
      return { volume: 0, frequency: 0 };
    }
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const rangeLimit = Math.floor(dataArrayRef.current.length * freqRange);
    let totalMagnitude = 0;
    let weightedFrequencySum = 0;
    for (let i = 0; i < rangeLimit; i++) {
      const val = dataArrayRef.current[i];
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

  return { isActive, startAudio, stopAudio, getAudioMetrics };
};

const useFaceTracker = (enabled: boolean) => {
  const facePositionRef = useRef({ x: 0, y: 0, z: 5 });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const requestRef = useRef<number>(0);
  const [hasCamera, setHasCamera] = useState(true);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);

  useEffect(() => {
    if (!enabled) {
      // Reset position when disabled
      facePositionRef.current = { x: 0, y: 0, z: 5 };
      return;
    }

    let isMounted = true;
    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: false,
          runningMode: "VIDEO",
          numFaces: 1
        });
        if (!isMounted) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;

        const video = document.createElement('video');
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;
        videoRef.current = video;

        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        video.srcObject = stream;
        
        await new Promise((resolve) => {
          video.onloadedmetadata = () => resolve(true);
        });
        video.play();

        let lastVideoTime = -1;
        const detectFace = () => {
          if (!isMounted || !videoRef.current || !landmarkerRef.current) return;
          if (videoRef.current.readyState >= 2) {
            if (videoRef.current.currentTime !== lastVideoTime) {
              lastVideoTime = videoRef.current.currentTime;
              try {
                const results = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());
                if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                  const landmarks = results.faceLandmarks[0];
                  const nose = landmarks[1];
                  const leftCheek = landmarks[234];
                  const rightCheek = landmarks[454];
                  const faceWidth = Math.sqrt(
                    Math.pow(leftCheek.x - rightCheek.x, 2) + 
                    Math.pow(leftCheek.y - rightCheek.y, 2)
                  );
                  const rawX = (0.5 - nose.x) * 2.0; 
                  const rawY = (0.5 - nose.y) * 2.0; 
                  const clampedFaceWidth = Math.max(Math.min(faceWidth, 0.6), 0.05);
                  const rawZ = 0.15 / clampedFaceWidth;
                  const prev = facePositionRef.current;
                  facePositionRef.current = {
                    x: prev.x * 0.4 + rawX * 0.6,
                    y: prev.y * 0.4 + rawY * 0.6,
                    z: prev.z * 0.4 + rawZ * 0.6
                  };
                }
              } catch (e) {}
            }
          }
          requestRef.current = requestAnimationFrame(detectFace);
        };
        detectFace();
      } catch (err) {
        console.error("Face tracking error, falling back to mouse:", err);
        setHasCamera(false);
      }
    };

    init();

    const handleMouseMove = (e: MouseEvent) => {
      if (!hasCamera) {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = -(e.clientY / window.innerHeight) * 2 + 1;
        const prev = facePositionRef.current;
        facePositionRef.current = {
          x: prev.x + (nx - prev.x) * 0.1,
          y: prev.y + (ny - prev.y) * 0.1,
          z: 5
        };
      }
    };

    if (!hasCamera) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      isMounted = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) stream.getTracks().forEach(track => track.stop());
      }
      if (landmarkerRef.current) landmarkerRef.current.close();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [hasCamera, enabled]);

  return facePositionRef;
};

// --- Components ---
const DynamicCamera = ({ 
  params, 
  targetGroupRef,
  facePos
}: { 
  params: VisualizerParams, 
  targetGroupRef: React.RefObject<THREE.Group>,
  facePos: React.MutableRefObject<{x: number, y: number, z: number}>
}) => {
  const { camera, size } = useThree();
  const isFirstFrame = useRef(true);

  useFrame(() => {
    if (!params.arPortalMode) {
      const targetPos = new THREE.Vector3(0, 0, 5);
      if (isFirstFrame.current) {
        camera.position.copy(targetPos);
        isFirstFrame.current = false;
      } else {
        camera.position.lerp(targetPos, 0.1);
      }
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = 75;
        camera.updateProjectionMatrix();
        camera.rotation.set(0, 0, 0);
      }
      if (targetGroupRef.current) {
        targetGroupRef.current.rotation.set(0, 0, 0);
      }
      return;
    }

    const portalScale = Math.max(0.1, params.arPortalScale ?? 1.0);
    const W = 30 * portalScale;
    const aspect = size.width / size.height;
    const H = W / aspect;

    const intensity = params.arPortalPerspectiveIntensity || 1.0; 
    const portalZ = Math.max(facePos.current.z * W * 0.8 * intensity, W * 0.15);
    const portalX = facePos.current.x * 0.6 * portalZ * intensity;
    const portalY = facePos.current.y * 0.6 * portalZ * intensity;
    const targetPos = new THREE.Vector3(portalX, portalY, portalZ);
    
    if (isFirstFrame.current) {
      camera.position.copy(targetPos);
      isFirstFrame.current = false;
    } else {
      camera.position.lerp(targetPos, 0.25);
    }

    if (camera instanceof THREE.PerspectiveCamera) {
      const n = camera.near;
      const f = camera.far;

      const z_c = Math.max(camera.position.z, 0.01);
      const x_c = camera.position.x;
      const y_c = camera.position.y;

      const portalLeft = (-W / 2 - x_c) * (n / z_c);
      const portalRight = (W / 2 - x_c) * (n / z_c);
      const portalBottom = (-H / 2 - y_c) * (n / z_c);
      const portalTop = (H / 2 - y_c) * (n / z_c);

      camera.projectionMatrix.makePerspective(portalLeft, portalRight, portalTop, portalBottom, n, f);
      camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
      
      camera.rotation.x += (0 - camera.rotation.x) * 0.2;
      camera.rotation.y += (0 - camera.rotation.y) * 0.2;
      camera.rotation.z += (0 - camera.rotation.z) * 0.2;
    }

    if (targetGroupRef.current) {
      targetGroupRef.current.rotation.x += (0 - targetGroupRef.current.rotation.x) * 0.1;
      targetGroupRef.current.rotation.y += (0 - targetGroupRef.current.rotation.y) * 0.1;
      targetGroupRef.current.rotation.z += (0 - targetGroupRef.current.rotation.z) * 0.1;
    }
  });

  return null;
};

const CameraBackground = ({ enabled }: { enabled: boolean }) => {
  const { scene, gl } = useThree();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);

  useEffect(() => {
    if (!enabled) {
      scene.background = null;
      return;
    }

    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    videoRef.current = video;

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        const texture = new THREE.VideoTexture(videoRef.current);
        texture.colorSpace = THREE.SRGBColorSpace;
        textureRef.current = texture;
        scene.background = texture;
      })
      .catch(err => {
        console.error("Error accessing camera:", err?.message || err);
      });

    return () => {
      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
      if (textureRef.current) {
        textureRef.current.dispose();
      }
      scene.background = null;
    };
  }, [scene, gl, enabled]);

  useFrame(() => {
    if (enabled && textureRef.current) {
      scene.background = textureRef.current;
    }
  });

  return null;
};

const Spiral3D = ({ params, setParams, getAudioMetrics, facePos }: { params: VisualizerParams, setParams: React.Dispatch<React.SetStateAction<VisualizerParams>>, getAudioMetrics: any, facePos: React.MutableRefObject<{x: number, y: number, z: number}> }) => {
  const lineRef = useRef<THREE.Line>(null);
  const positionsRef = useRef<Float32Array>(new Float32Array(0));
  const colorsRef = useRef<Float32Array>(new Float32Array(0));
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  
  const smoothedVolRef = useRef<number>(0);
  const smoothedFreqRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const currentHueRef = useRef<number>(params.baseHue);
  const lastPhaseRef = useRef<number>(-1);

  useMemo(() => {
    positionsRef.current = new Float32Array(params.iter * 3);
    colorsRef.current = new Float32Array(params.iter * 3);
  }, [params.iter]);

  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const { size } = useThree();

  useFrame((state, delta) => {
    if (!lineRef.current || !geometryRef.current) return;

    const { volume, frequency } = getAudioMetrics(params.sensitivity, params.freqRange);
    
    smoothedVolRef.current += (volume - smoothedVolRef.current) * 0.05;
    smoothedFreqRef.current += (frequency - smoothedFreqRef.current) * 0.05;
    const sVol = smoothedVolRef.current;
    const sFreq = smoothedFreqRef.current;

    timeRef.current += params.hueSpeed;

    let currentK = params.k;
    let currentPsi = params.psi;
    let currentZ0r = params.z0_r;
    let currentZ0i = params.z0_i;

    if (params.autoPilot) {
      const t = timeRef.current * params.autoSpeed * 0.05;
      if (params.autoPilotMode === 'drift') {
        currentK = 1.0 + Math.sin(t * 0.5) * 0.1;
        currentPsi = t * 0.1;
        currentZ0r = Math.sin(t * 0.3) * 0.5;
        currentZ0i = Math.cos(t * 0.4) * 0.5;
      } else if (params.autoPilotMode === 'harmonic') {
        currentK = 1.0 + sVol * 0.2 + Math.sin(t) * 0.05;
        currentPsi = params.psi + sFreq * 0.1 + t * 0.2;
        currentZ0r = Math.sin(t * 0.5 + sFreq) * 0.3;
        currentZ0i = Math.cos(t * 0.5 + sVol) * 0.3;
      } else if (params.autoPilotMode === 'genesis') {
        const phase = Math.floor(t / 5) % 4;
        if (phase !== lastPhaseRef.current) {
          lastPhaseRef.current = phase;
          setParams(prev => ({ ...prev, genesisStage: phase }));
        }
        const phaseT = (t % 5) / 5;
        if (phase === 0) { // Semilla
          currentK = 1.0 + phaseT * 0.05;
          currentPsi = phaseT * Math.PI * 0.5;
          currentZ0r = 0;
          currentZ0i = 0;
        } else if (phase === 1) { // Expansión
          currentK = 1.05 + phaseT * 0.2;
          currentPsi = Math.PI * 0.5 + phaseT * Math.PI;
          currentZ0r = Math.sin(phaseT * Math.PI) * 0.2;
          currentZ0i = Math.cos(phaseT * Math.PI) * 0.2;
        } else if (phase === 2) { // Complejidad
          currentK = 1.25 + Math.sin(phaseT * Math.PI * 4) * 0.1;
          currentPsi = Math.PI * 1.5 + phaseT * Math.PI * 2;
          currentZ0r = Math.sin(phaseT * Math.PI * 8) * 0.3;
          currentZ0i = Math.cos(phaseT * Math.PI * 8) * 0.3;
        } else { // Trascendencia
          currentK = 1.25 - phaseT * 0.25;
          currentPsi = Math.PI * 3.5 + phaseT * Math.PI * 4;
          currentZ0r = Math.sin(phaseT * Math.PI * 2) * 0.5 * (1 - phaseT);
          currentZ0i = Math.cos(phaseT * Math.PI * 2) * 0.5 * (1 - phaseT);
        }
      }
    }

    const kPulse = (currentK - 1) + (sVol * 0.005); 
    const dynamicK = 1.0 + kPulse;
    const dynamicPsi = currentPsi + (sFreq * 0.05);

    const rotReal = Math.cos(dynamicPsi);
    const rotImag = Math.sin(dynamicPsi);
    
    let zReal = 1.0 + (sVol * 0.2); 
    let zImag = 0.0;

    currentHueRef.current = (params.baseHue + timeRef.current) % 360;
    const displayBaseHue = currentHueRef.current;

    const positions = positionsRef.current;
    const colors = colorsRef.current;

    const zoom = params.zoom * 10; 
    const effectiveDepth = params.vrSymmetric ? params.vrDepth * 10 : params.vrDepth;

    const portalScale = Math.max(0.1, params.arPortalScale ?? 1.0);
    const W = 30 * portalScale;
    const aspect = size.width / size.height;
    const H = W / aspect;
    const screenDiag = Math.sqrt(W*W + H*H) / 2;

    let tempZReal = 1.0 + (sVol * 0.2);
    let tempZImag = 0.0;
    for (let i = 0; i < params.iter; i++) {
        const zrK = tempZReal * dynamicK;
        const ziK = tempZImag * dynamicK;
        tempZReal = (zrK * rotReal - ziK * rotImag) + currentZ0r;
        tempZImag = (zrK * rotImag + ziK * rotReal) + currentZ0i;
    }
    const max_px = tempZReal * zoom;
    const max_py = tempZImag * zoom;
    const max_dist = Math.sqrt(max_px*max_px + max_py*max_py);
    const log_max_dist = Math.log1p(max_dist);

    for (let n = 0; n < params.iter; n++) {
      const zrK = zReal * dynamicK;
      const ziK = zImag * dynamicK;

      let nextReal = (zrK * rotReal - ziK * rotImag) + currentZ0r;
      let nextImag = (zrK * rotImag + ziK * rotReal) + currentZ0i;

      zReal = nextReal;
      zImag = nextImag;

      let px_base = zReal * zoom;
      let py_base = zImag * zoom;
      
      const dist = Math.sqrt(px_base*px_base + py_base*py_base);
      const angle = Math.atan2(py_base, px_base);
      
      let px = px_base;
      let py = py_base;
      let pz = 0;

      if (params.arPortalMode) {
        const depthRatio = n / params.iter;
        let pz_portal = (depthRatio - 1.0) * effectiveDepth;
        
        const vRad = params.arPortalVanishingRadius ?? 0.5;
        const hollowRadius = screenDiag * vRad;
        const growthSpace = screenDiag - hollowRadius;
        
        const normalized_log_dist = Math.log1p(dist) / (log_max_dist || 1);
        const portal_radius = hollowRadius + normalized_log_dist * growthSpace;
        
        px = Math.cos(angle) * portal_radius;
        py = Math.sin(angle) * portal_radius;
        pz = pz_portal;
      }
      
      positions[n * 3] = px;
      positions[n * 3 + 1] = py;
      positions[n * 3 + 2] = pz;

      let edgeFade = 1.0;
      if (params.vrSymmetric) {
          const progress = n / params.iter;
          if (progress < 0.25) {
              edgeFade = progress / 0.25;
          } else if (progress > 0.75) {
              edgeFade = (1.0 - progress) / 0.25;
          }
          edgeFade = Math.pow(edgeFade, 1.5); 
      }
      
      if (params.arPortalMode) {
        const depthRatio = n / params.iter;
        const normalizedDepth = 1.0 - depthRatio;
        const fadeFactor = 1.0 - (normalizedDepth * (params.arPortalFade ?? 1.0));
        const targetEdgeFade = Math.max(0, fadeFactor);
        edgeFade = targetEdgeFade;
      }

      let hue = (displayBaseHue + (n / params.iter) * params.hueRange) % 360;
      if (params.harmonicColor) {
        hue = (hue + sFreq * params.harmonicSensitivity * params.harmonicDepth) % 360;
      }
      const lightness = (params.brightness / 100 + sVol * 0.5) * edgeFade;
      const color = new THREE.Color().setHSL(hue / 360, params.saturation / 100, lightness);
      
      colors[n * 3] = color.r;
      colors[n * 3 + 1] = color.g;
      colors[n * 3 + 2] = color.b;
    }

    if (geometryRef.current) {
      geometryRef.current.setDrawRange(0, params.iter);
      geometryRef.current.attributes.position.needsUpdate = true;
      geometryRef.current.attributes.color.needsUpdate = true;
    }
    
    if (materialRef.current) {
      if ('linewidth' in materialRef.current) {
        (materialRef.current as any).linewidth = params.vrThickness + sVol * 5;
      }
    }
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={params.iter}
          array={positionsRef.current}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={params.iter}
          array={colorsRef.current}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial ref={materialRef} vertexColors transparent opacity={params.trail} />
    </line>
  );
};


export default function App() {
  const [params, setParams] = useState<VisualizerParams>(DEFAULT_PARAMS);
  const { isActive: audioActive, startAudio, stopAudio, getAudioMetrics } = useAudioAnalyzer();
  const [menuOpen, setMenuOpen] = useState(true);
  const spiralGroupRef = useRef<THREE.Group>(null);
  const facePos = useFaceTracker(params.arPortalMode);

  const toggleAudio = () => {
    if (audioActive) stopAudio();
    else startAudio();
  };

  return (
    <div className="w-full h-screen relative bg-transparent overflow-hidden" style={{ touchAction: 'none' }}>
      <button 
        onClick={() => setMenuOpen(!menuOpen)}
        className="absolute top-4 right-4 z-[60] p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors"
      >
        {menuOpen ? <X size={24} /> : <Settings size={24} />}
      </button>

      <div className={`absolute top-0 right-0 h-full w-full sm:w-80 transition-transform duration-300 ease-in-out z-50 ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <ControlPanel 
          params={params} 
          setParams={setParams} 
          audioActive={audioActive} 
          toggleAudio={toggleAudio} 
        />
      </div>

      <SacredGeometryOverlay params={params} getAudioMetrics={getAudioMetrics} />

      {params.vrMode && <VRButton className="absolute bottom-4 left-4 z-[60] p-3 bg-orange-500/80 backdrop-blur-md rounded-full text-white font-bold hover:bg-orange-600 transition-colors" />}
      <Canvas camera={{ position: [0, 0, 5], fov: 75, near: 0.1, far: 1000000 }}>
        <XR>
          <ambientLight intensity={0.5} />
          <group ref={spiralGroupRef}>
            <Spiral3D params={params} setParams={setParams} getAudioMetrics={getAudioMetrics} facePos={facePos} />
          </group>
          <DynamicCamera params={params} targetGroupRef={spiralGroupRef} facePos={facePos} />
          <CameraBackground enabled={params.arPortalMode} />
        </XR>
      </Canvas>
    </div>
  );
}
