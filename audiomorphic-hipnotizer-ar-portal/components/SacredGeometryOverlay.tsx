import React, { useRef, useEffect } from 'react';
import { VisualizerParams } from '../types';

interface SacredGeometryOverlayProps {
  params: VisualizerParams;
  getAudioMetrics: (sensitivity: number, freqRange: number) => { volume: number, frequency: number };
}

const drawSacredOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number, params: VisualizerParams, volume: number) => {
    const cx = width / 2;
    const cy = height / 2;
    const stage = params.genesisStage || 0;
    
    // Base scale relative to visualizer zoom
    const minDim = Math.min(width, height);
    const resonanceMultiplier = params.sgAutoResonance ? (1 + volume * 0.5) : 1;
    const r = (minDim * 0.18 + (volume * minDim * 0.05)) * resonanceMultiplier; 
    
    ctx.lineWidth = params.sgAutoResonance ? 1 + volume * 2 : 1;
    ctx.strokeStyle = `rgba(255, 255, 255, ${params.sgAutoResonance ? 0.15 + volume * 0.2 : 0.15})`;
    
    const circle = (x: number, y: number, rad: number, fill = false) => {
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI*2);
        if (fill) { ctx.fillStyle = `rgba(255, 255, 255, 0.03)`; ctx.fill(); }
        if (params.sgDrawMode === 'layers') {
            ctx.stroke();
        }
        if (params.sgShowNodes) {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI*2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
        }
    };

    // Stage 0: Void
    if (stage === 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, 2 + volume * 10, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();
        return;
    }

    // Center Sphere (Always present Stage 1+)
    circle(cx, cy, r, true);

    if (stage === 1) { // Vesica
        circle(cx - r/2, cy, r);
        circle(cx + r/2, cy, r);
        // Draw the vertical axis
        if (params.sgDrawMode === 'layers') {
            ctx.beginPath();
            ctx.moveTo(cx, cy - r * 0.866);
            ctx.lineTo(cx, cy + r * 0.866);
            ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
            ctx.stroke();
        }
    } 
    else if (stage >= 2) { // Seed, Egg, Flower, Fruit, Metatron
        // 6 Surrounding circles
        for (let i = 0; i < 6; i++) {
            const angle = i * Math.PI / 3;
            circle(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, r);
        }
    }

    if (stage >= 4) { // Flower
        // Layer 2
        for (let i = 0; i < 6; i++) {
            const angle = i * Math.PI / 3;
            circle(cx + Math.cos(angle)*r*2, cy + Math.sin(angle)*r*2, r);
        }
        for (let i = 0; i < 6; i++) {
            const angle = i * Math.PI / 3 + Math.PI/6;
            const dist = r * Math.sqrt(3);
            circle(cx + Math.cos(angle)*dist, cy + Math.sin(angle)*dist, r);
        }
        // Zona Pellucida
        if (params.sgDrawMode === 'layers') {
            ctx.beginPath();
            ctx.arc(cx, cy, r * 3, 0, Math.PI*2);
            ctx.strokeStyle = 'rgba(253, 224, 71, 0.15)'; // Gold tint
            ctx.stroke();
        }
    }

    // Metatron / Fruit (Male Energy Lines)
    if (stage >= 6 || params.sgResonanceModes.includes('torus')) { 
        const centers: {x:number, y:number}[] = [{x:cx, y:cy}];
        for(let i=0; i<6; i++){
            centers.push({
                x: cx + Math.cos(i*Math.PI/3)*r,
                y: cy + Math.sin(i*Math.PI/3)*r
            });
        }
        for(let i=0; i<6; i++){
            centers.push({
                x: cx + Math.cos(i*Math.PI/3)*r*2,
                y: cy + Math.sin(i*Math.PI/3)*r*2
            });
        }

        if (params.sgDrawMode === 'layers') {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; 

            for(let i=0; i<centers.length; i++){
                for(let j=i+1; j<centers.length; j++){
                    const dx = centers[i].x - centers[j].x;
                    const dy = centers[i].y - centers[j].y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < r * 2.1) {
                        ctx.moveTo(centers[i].x, centers[i].y);
                        ctx.lineTo(centers[j].x, centers[j].y);
                    }
                }
            }
            ctx.stroke();
        }

        if (params.sgShowNodes) {
            ctx.beginPath();
            for(let i=0; i<centers.length; i++){
                ctx.moveTo(centers[i].x + 3, centers[i].y);
                ctx.arc(centers[i].x, centers[i].y, 3, 0, Math.PI*2);
            }
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
        }
    }
};

const SacredGeometryOverlay: React.FC<SacredGeometryOverlayProps> = ({ params, getAudioMetrics }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      (canvas as any).logicalWidth = width;
      (canvas as any).logicalHeight = height;
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const render = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = (canvas as any).logicalWidth || canvas.width;
      const height = (canvas as any).logicalHeight || canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (params.autoPilotMode === 'genesis' || params.autoPilotMode === 'harmonic') {
        const { volume } = getAudioMetrics(params.sensitivity, params.freqRange);
        drawSacredOverlay(ctx, width, height, params, volume);
      }

      requestRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      resizeObserver.disconnect();
    };
  }, [params, getAudioMetrics]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 opacity-50" 
    />
  );
};

export default SacredGeometryOverlay;
