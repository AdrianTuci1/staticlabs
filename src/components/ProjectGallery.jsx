import { LabMarkLogo } from './LabMarkLogo.jsx';
import { AnnouncementTicker } from './AnnouncementTicker.jsx';
import { useEffect, useRef, useState } from 'react';
import { ProjectMedia } from './ProjectMedia.jsx';
import { MissionView } from './MissionView.jsx';
import './ProjectGallery.css';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#%<>[]{}';

function scrambleText(text) {
  return Array.from(text, (char) => {
    if (char === ' ') {
      return ' ';
    }

    return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
  }).join('');
}

function ProjectCardAnimation({ projectId, accent }) {
  return <ProjectMedia projectId={projectId} accent={accent} />;
}

function ProjectCard({ project, index, onOpen, isExiting, baseDelay = 0 }) {
  const [label, setLabel] = useState(project.title);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setLabel(project.title);
  }, [project.title]);

  useEffect(() => {
    return () => {
      window.clearInterval(intervalRef.current);
      window.clearTimeout(timeoutRef.current);
    };
  }, []);

  function glitchTitle() {
    window.clearInterval(intervalRef.current);
    window.clearTimeout(timeoutRef.current);

    setLabel(scrambleText(project.title));
    intervalRef.current = window.setInterval(() => {
      setLabel(scrambleText(project.title));
    }, 55);

    timeoutRef.current = window.setTimeout(() => {
      window.clearInterval(intervalRef.current);
      setLabel(project.title);
    }, 420);
  }

  return (
    <button
      className={`project-card project-card--${project.accent} ${isExiting ? 'is-exiting' : ''}`}
      style={{
        '--project-card-reveal-delay': `${baseDelay + (index * 140)}ms`,
        '--project-card-exit-delay': `${index * 80}ms`
      }}
      type="button"
      onClick={() => onOpen(project.id)}
      onFocus={glitchTitle}
      onMouseEnter={glitchTitle}
    >
      <span className="project-card__code">
        {project.id} // {project.code}
      </span>
      <span className="project-card__media" aria-hidden="true">
        <ProjectCardAnimation projectId={project.id} accent={project.accent} />
        <span className="project-card__target">
          <span className="project-card__target-inner" />
        </span>
      </span>
      <span className="project-card__title">{label}</span>
    </button>
  );
}

function MissionButton({ isActive, onClick }) {
  const buttonRef = useRef(null);
  const [direction, setDirection] = useState('');
  const [label, setLabel] = useState(isActive ? 'FILES' : 'our mission');
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setLabel(isActive ? 'FILES' : 'our mission');
  }, [isActive]);

  useEffect(() => {
    return () => {
      window.clearInterval(intervalRef.current);
      window.clearTimeout(timeoutRef.current);
    };
  }, []);

  function glitchTitle() {
    window.clearInterval(intervalRef.current);
    window.clearTimeout(timeoutRef.current);

    const targetText = isActive ? 'FILES' : 'our mission';
    setLabel(scrambleText(targetText));
    intervalRef.current = window.setInterval(() => {
      setLabel(scrambleText(targetText));
    }, 55);

    timeoutRef.current = window.setTimeout(() => {
      window.clearInterval(intervalRef.current);
      setLabel(targetText);
    }, 420);
  }

  const handleMouseEnter = (e) => {
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
      className={`hud-button hud-button--mission ${direction ? `is-hovered-${direction}` : ''}`}
      type="button"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function ProjectGallery({ projects, onOpen }) {
  const [isMissionActive, setIsMissionActive] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [railGlitchText, setRailGlitchText] = useState({ label: '', time: '' });
  const railIntervalRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Europe/Bucharest',
  });

  const getRailLabel = () => isMissionActive ? 'MISSION' : 'access files';
  const getRailTime = () => `${formattedTime} BUCHAREST, ROMANIA`;

  function toggleMission() {
    setIsGlitching(true);
    const nextMissionActive = !isMissionActive;
    setIsMissionActive(nextMissionActive);

    const targetLabel = nextMissionActive ? 'MISSION' : 'access files';
    const targetTime = getRailTime();

    window.clearInterval(railIntervalRef.current);
    railIntervalRef.current = window.setInterval(() => {
      setRailGlitchText({
        label: scrambleText(targetLabel),
        time: scrambleText(targetTime)
      });
    }, 55);

    setTimeout(() => {
      window.clearInterval(railIntervalRef.current);
      setIsGlitching(false);
    }, 640);
  }

  const [isCursorVisible, setIsCursorVisible] = useState(false);
  const galleryRef = useRef(null);
  const cursorFrameRef = useRef(0);
  const pendingCursorRef = useRef({ x: 0, y: 0 });

  function flushCursorPosition() {
    cursorFrameRef.current = 0;

    if (!galleryRef.current) {
      return;
    }

    galleryRef.current.style.setProperty('--gallery-cursor-x', `${pendingCursorRef.current.x}px`);
    galleryRef.current.style.setProperty('--gallery-cursor-y', `${pendingCursorRef.current.y}px`);
  }

  function handlePointerMove(event) {
    pendingCursorRef.current = { x: event.clientX, y: event.clientY };

    if (!cursorFrameRef.current) {
      cursorFrameRef.current = requestAnimationFrame(flushCursorPosition);
    }
  }

  function handlePointerEnter(event) {
    setIsCursorVisible(true);
    handlePointerMove(event);
  }

  useEffect(() => () => cancelAnimationFrame(cursorFrameRef.current), []);

  return (
    <section
      ref={galleryRef}
      className={`project-gallery ${isMissionActive ? 'is-mission-active' : ''}`}
      aria-label="Project archive"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={() => setIsCursorVisible(false)}
      onPointerMove={handlePointerMove}
    >
      <span className={`project-gallery__cursor ${isCursorVisible ? 'is-visible' : ''}`} aria-hidden="true" />
      <header className="archive-header">
        <div className="archive-header__left">
          <div className="lab-mark" aria-label="static labs">
            <LabMarkLogo />
            <span className="lab-mark__text">
              <span>STATIC</span>
              <span>LABS</span>
            </span>
          </div>
          <span>sound off</span>
        </div>
        {/* <AnnouncementTicker /> */}
        <a href="mailto:hello@staticlabs.ro" className="project-gallery__email">
          hello@staticlabs.ro
        </a>
      </header>

      <div className="project-gallery__rail">
        <span className={isGlitching ? 'glitch-rail' : ''}>
          {isGlitching ? railGlitchText.label : (isMissionActive ? 'MISSION' : 'access files')}
        </span>
        <span className={isGlitching ? 'glitch-rail' : ''}>
          {isGlitching ? railGlitchText.time : getRailTime()}
        </span>
      </div>

      <MissionView active={isMissionActive} />

      <div className="project-cards">
        {projects.map((project, index) => (
          <ProjectCard
            key={`${project.id}-${isMissionActive ? 'm' : 'g'}`}
            project={project}
            index={index}
            onOpen={onOpen}
            isExiting={isMissionActive}
            baseDelay={isMissionActive ? 0 : 800}
          />
        ))}
      </div>

      <div className="project-gallery__contact">
        <MissionButton isActive={isMissionActive} onClick={toggleMission} />
      </div>
    </section>
  );
}
