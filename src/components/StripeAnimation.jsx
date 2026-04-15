import { useEffect, useRef } from 'react';
import { PixelGridOverlay } from './PixelGridOverlay.jsx';
import { FluidSolver } from '../utils/FluidSolver.js';

export const StripeAnimation = ({
    active = true,
    color = '#64dcff',
    backgroundColor = '#001a33',
    responsiveToScroll = false,
    frequency = 1,
    amplitude = 1,
    speed = 1,
    layerCount = 10
}) => {
    const canvasRef = useRef(null);
    const solverRef = useRef(new FluidSolver(48));
    const scrollOffsetRef = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            scrollOffsetRef.current = window.scrollY;
        };
        if (responsiveToScroll) {
            window.addEventListener('scroll', handleScroll);
        }
        return () => window.removeEventListener('scroll', handleScroll);
    }, [responsiveToScroll]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        const solver = solverRef.current;

        const resize = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };

        window.addEventListener('resize', resize);
        resize();

        // --- WARM START ---
        // Pre-simulate steps to ensure waves are already present on mount
        const warmUpSteps = 120;
        for (let i = 0; i < warmUpSteps; i++) {
            const time = i * 0.1;
            for (let j = 0; j < 3; j++) {
                const angle = time * (0.5 + j * 0.2) + j * Math.PI * 0.6;
                const dist = 0.2 + Math.sin(time * 0.3 + j) * 0.1;
                const x = 0.5 + Math.cos(angle) * dist;
                const y = 0.5 + Math.sin(angle) * dist;
                solver.addDensity(x, y, 0.4 * amplitude);
                solver.addVelocity(x, y, Math.cos(angle + Math.PI/2) * 0.02, Math.sin(angle + Math.PI/2) * 0.02);
            }
            solver.step();
        }

        const render = () => {
            if (!active) return;
            
            const w = canvas.width / window.devicePixelRatio;
            const h = canvas.height / window.devicePixelRatio;

            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, w, h);

            // 1. ADD AUTONOMOUS FLUID SOURCES (Splats)
            const time = Date.now() * 0.001 * speed;
            
            for (let i = 0; i < 3; i++) {
                const angle = time * (0.5 + i * 0.2) + i * Math.PI * 0.6;
                const dist = 0.2 + Math.sin(time * 0.3 + i) * 0.1;
                const x = 0.5 + Math.cos(angle) * dist;
                const y = 0.5 + Math.sin(angle) * dist;
                
                solver.addDensity(x, y, 0.4 * amplitude);
                solver.addVelocity(x, y, Math.cos(angle + Math.PI/2) * 0.02, Math.sin(angle + Math.PI/2) * 0.02);
            }

            // 2. SIMULATION STEP
            solver.step();

            // 3. MARCHING SQUARES ON DENSITY FIELD
            const res = solver.size;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;

            const levels = layerCount;
            for (let l = 1; l <= levels; l++) {
                const threshold = l * (0.5 / levels);
                ctx.globalAlpha = Math.max(0.1, 0.6 - (l / levels) * 0.4);
                
                for (let j = 0; j < res; j++) {
                    for (let i = 0; i < res; i++) {
                        const v0 = solver.getDensity(i/res, j/res);
                        const v1 = solver.getDensity((i+1)/res, j/res);
                        const v2 = solver.getDensity((i+1)/res, (j+1)/res);
                        const v3 = solver.getDensity(i/res, (j+1)/res);

                        let state = 0;
                        if (v0 >= threshold) state |= 8;
                        if (v1 >= threshold) state |= 4;
                        if (v2 >= threshold) state |= 2;
                        if (v3 >= threshold) state |= 1;

                        if (state === 0 || state === 15) continue;

                        const lerp = (a, b, t) => a + (b - a) * t;
                        const getP = (val1, val2, p1, p2) => {
                            const mu = (threshold - val1) / (val2 - val1);
                            return { x: lerp(p1.x, p2.x, mu), y: lerp(p1.y, p2.y, mu) };
                        };

                        const cellW = w / res;
                        const cellH = h / res;
                        const pW = { x: i * cellW, y: j * cellH };
                        const pE = { x: (i+1) * cellW, y: j * cellH };
                        const pSE = { x: (i+1) * cellW, y: (j+1) * cellH };
                        const pS = { x: i * cellW, y: (j+1) * cellH };

                        const a = getP(v0, v1, pW, pE);
                        const b = getP(v1, v2, pE, pSE);
                        const c = getP(v3, v2, pS, pSE);
                        const d = getP(v0, v3, pW, pS);

                        ctx.beginPath();
                        switch (state) {
                            case 1: case 14: ctx.moveTo(c.x, c.y); ctx.lineTo(d.x, d.y); break;
                            case 2: case 13: ctx.moveTo(b.x, b.y); ctx.lineTo(c.x, c.y); break;
                            case 3: case 12: ctx.moveTo(b.x, b.y); ctx.lineTo(d.x, d.y); break;
                            case 4: case 11: ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); break;
                            case 5: ctx.moveTo(a.x, a.y); ctx.lineTo(d.x, d.y); ctx.moveTo(b.x, b.y); ctx.lineTo(c.x, c.y); break;
                            case 6: case 9: ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y); break;
                            case 7: case 8: ctx.moveTo(a.x, a.y); ctx.lineTo(d.x, d.y); break;
                            case 10: ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.moveTo(c.x, c.y); ctx.lineTo(d.x, d.y); break;
                        }
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [active, color, backgroundColor, speed, frequency, amplitude, layerCount]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <canvas
                ref={canvasRef}
                style={{
                    width: '110%', // Overscan to hide borders
                    height: '110%',
                    position: 'absolute',
                    top: '-5%',
                    left: '-5%',
                    display: 'block',
                    mixBlendMode: 'screen'
                }}
            />
            <PixelGridOverlay />
        </div>
    );
};
