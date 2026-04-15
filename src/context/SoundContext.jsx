import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const SoundContext = createContext(null);

export function SoundProvider({ children }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const stored = localStorage.getItem('sound_enabled');
    return stored === null ? true : stored === 'true';
  });

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('sound_enabled', String(next));
      return next;
    });
  }, []);

  const playSound = useCallback((type) => {
    if (!isSoundEnabled) return;

    const audio = new Audio(type === 'click' ? '/click.mp3' : '/hover.mp3');
    audio.volume = 0.42;
    audio.play().catch((err) => console.warn('Audio playback failed:', err));
  }, [isSoundEnabled]);

  const value = useMemo(() => ({
    isSoundEnabled,
    toggleSound,
    playHover: () => playSound('hover'),
    playClick: () => playSound('click')
  }), [isSoundEnabled, toggleSound, playSound]);

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundEffects() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSoundEffects must be used within a SoundProvider');
  }
  return context;
}

export function SoundToggle() {
  const { isSoundEnabled, toggleSound, playClick } = useSoundEffects();

  return (
    <button
      className="hud-sound"
      type="button"
      onClick={() => {
        playClick();
        toggleSound();
      }}
    >
      sound {isSoundEnabled ? 'on' : 'off'} <span className="hud-sound__dot" aria-hidden="true" />
    </button>
  );
}
