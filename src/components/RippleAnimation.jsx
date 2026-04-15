import { useEffect, useRef } from 'react';
import { PixelGridOverlay } from './PixelGridOverlay.jsx';

export const RippleAnimation = ({
    active = true,
    color = '#ff5b58',
    backgroundColor = '#2a0a0a',
    responsiveToScroll = false,
    circleCount = 5,
    speed = 5,
    spread = 0.5
}) => {
    const canvasRef = useRef(null);
    const timeRef = useRef(0);
    const scrollOffsetRef = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            if (responsiveToScroll) {
                scrollOffsetRef.current = window.scrollY * 0.5;
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

            timeRef.current += 0.05;
            const t = timeRef.current;
            const s = scrollOffsetRef.current * 0.01;

            const p1 = { x: w * (0.5 - spread / 2), y: h * 0.5 };
            const p2 = { x: w * (0.5 + spread / 2), y: h * 0.5 };

            ctx.strokeStyle = color;
            ctx.globalAlpha = 0.4;
            ctx.lineWidth = 1;

            const maxRadius = Math.max(w, h) * 0.6;
            const spacing = maxRadius / circleCount;

            const drawRipples = (center) => {
                for (let i = 0; i < circleCount; i++) {
                    const radius = (i * spacing + t * speed) % maxRadius;
                    const opacity = Math.max(0, 1 - (radius / maxRadius));

                    ctx.beginPath();
                    ctx.globalAlpha = opacity * 0.4;
                    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
            };

            drawRipples(p1);
            drawRipples(p2);

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [active, color, backgroundColor, speed, circleCount, spread]);

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
