import { useEffect, useRef, useState } from 'react';
import { useSoundEffects } from '../context/SoundContext.jsx';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#%<>[]{}';

function scrambleText(text) {
  return Array.from(text, (char) => {
    if (char === ' ') return ' ';
    return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
  }).join('');
}

export function GlitchButton({ text, onClick, className = '' }) {
  const { playHover, playClick } = useSoundEffects();
  const buttonRef = useRef(null);
  const [direction, setDirection] = useState('');
  const [renderedText, setRenderedText] = useState(text);
  const textRef = useRef(text);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    textRef.current = text;
    setRenderedText(text);
  }, [text]);

  useEffect(() => {
    return () => {
      window.clearInterval(intervalRef.current);
      window.clearTimeout(timeoutRef.current);
    };
  }, []);

  function glitchTitle() {
    window.clearInterval(intervalRef.current);
    window.clearTimeout(timeoutRef.current);

    setRenderedText(scrambleText(textRef.current));
    intervalRef.current = window.setInterval(() => {
      setRenderedText(scrambleText(textRef.current));
    }, 55);

    timeoutRef.current = window.setTimeout(() => {
      window.clearInterval(intervalRef.current);
      setRenderedText(textRef.current);
    }, 420);
  }

  const handleMouseEnter = (e) => {
    playHover();
    glitchTitle();
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    const dists = [
      { side: 'top', d: y },
      { side: 'right', d: w - x },
      { side: 'bottom', d: h - y },
      { side: 'left', d: x }
    ];

    const sorted = dists.sort((a, b) => a.d - b.d);
    const side = sorted[0].side;

    const btn = buttonRef.current;
    btn.style.setProperty('--slide-start-x', side === 'left' ? '-100%' : side === 'right' ? '100%' : '0');
    btn.style.setProperty('--slide-start-y', side === 'top' ? '-100%' : side === 'bottom' ? '100%' : '0');

    setDirection(side);
  };

  const handleMouseLeave = () => {
    setDirection('');
  };

  return (
    <button
      ref={buttonRef}
      className={`hud-button hud-button--glitch ${direction ? `is-hovered-${direction}` : ''} ${className}`}
      type="button"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        playClick();
        onClick?.();
      }}
    >
      {renderedText}
    </button>
  );
}
