import { useEffect, useRef } from 'react';
import { PixelGridOverlay } from './PixelGridOverlay.jsx';

export const DNAAnimation = ({ 
    active = true, 
    color = '#ffd25d', 
    backgroundColor = '#2a220a',
    responsiveToScroll = false,
    scale = 1,
    yOffset = 0
}) => {
    const canvasRef = useRef(null);
    const timeRef = useRef(0);
    const scrollOffsetRef = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            if (responsiveToScroll) {
                scrollOffsetRef.current = window.scrollY * 0.1;
            }
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

        const resize = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };

        window.addEventListener('resize', resize);
        resize();

        const render = () => {
            if (!active) return;
            
            const w = canvas.width / window.devicePixelRatio;
            const h = canvas.height / window.devicePixelRatio;

            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, w, h);

            timeRef.current += 0.02;
            const t = timeRef.current;
            const s = scrollOffsetRef.current * 0.05;

            const centerY = h * (0.5 + yOffset);
            const nodes = 18;
            const spacing = w / (nodes - 1);
            const amp = h * 0.25 * scale;
            const freq = 0.5;

            // Draw bars first
            ctx.lineWidth = 2 * scale;
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = color;

            for (let i = 0; i < nodes; i++) {
                const x = i * spacing;
                const phase = i * freq + t + s;
                const y1 = centerY + Math.sin(phase) * amp;
                const y2 = centerY + Math.sin(phase + Math.PI) * amp;

                ctx.beginPath();
                ctx.moveTo(x, y1);
                ctx.lineTo(x, y2);
                ctx.stroke();
            }

            // Draw nodes and strands
            const drawStrand = (offset) => {
                ctx.beginPath();
                ctx.lineWidth = 3 * scale;
                ctx.globalAlpha = 0.6;
                ctx.strokeStyle = color;

                for (let i = 0; i < nodes; i++) {
                    const x = i * spacing;
                    const phase = i * freq + t + s + offset;
                    const y = centerY + Math.sin(phase) * amp;
                    const z = Math.cos(phase); // For fake 3D depth effect

                    const size = (5 + z * 3) * scale;
                    ctx.fillStyle = color;
                    ctx.globalAlpha = 0.4 + (z + 1) * 0.3;
                    
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);

                    // Draw node
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                }
                ctx.stroke();
            };

            drawStrand(0);
            drawStrand(Math.PI);

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [active, color, backgroundColor, scale, yOffset]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', display: 'block' }}
            />
            <PixelGridOverlay />
        </div>
    );
};
