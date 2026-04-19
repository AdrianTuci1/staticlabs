import { useEffect, useRef, useState } from 'react';
import { ProjectMedia } from './ProjectMedia.jsx';
import { MissionView } from './MissionView.jsx';
import { useSoundEffects } from '../context/SoundContext.jsx';
import { GlitchButton } from './GlitchButton.jsx';
import { ProjectTopbar } from './ProjectTopbar.jsx';
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
  const { playHover, playClick } = useSoundEffects();
  const [label, setLabel] = useState(project.title);
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setLabel(project.title);
  }, [project.title]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        setIsInView(entry.isIntersecting);
      });
    }, {
      threshold: 0.6
    });

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
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

  const titleId = `project-title-${project.id}`;
  const descId = `project-desc-${project.id}`;

  return (
    <article 
      className={`project-card-container ${isExiting ? 'is-exiting' : ''} ${isInView ? 'is-in-view' : ''}`}
      style={{
        '--project-card-reveal-delay': `${baseDelay + (index * 140)}ms`,
        '--project-card-exit-delay': `${index * 80}ms`
      }}
    >
      <button
        ref={cardRef}
        className={`project-card project-card--${project.accent}`}
        type="button"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={() => {
          playClick();
          onOpen(project.id);
        }}
        onFocus={() => {
          playHover();
          glitchTitle();
        }}
        onMouseEnter={() => {
          playHover();
          glitchTitle();
        }}
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
        <h2 id={titleId} className="project-card__title">{label}</h2>
        <span id={descId} className="visually-hidden">{project.description}</span>
      </button>
    </article>
  );
}

export function ProjectGallery({ projects, onOpen }) {
  const { playClick, playHover } = useSoundEffects();
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
      <h1 className="visually-hidden">Static Labs | AI Research Lab - Cercetare AI & Machine Learning</h1>
      <span className={`project-gallery__cursor ${isCursorVisible ? 'is-visible' : ''}`} aria-hidden="true" />
      <ProjectTopbar
        className="archive-header"
        showTicker={false}
        rightAction={(
          <a
            href="mailto:hello@staticlabs.ro"
            className="project-gallery__email"
            onMouseEnter={playHover}
            onClick={playClick}
          >
            hello@staticlabs.ro
          </a>
        )}
      />

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
        <GlitchButton
          text={isMissionActive ? 'BACK TO ARCHIVE' : 'our mission'}
          onClick={toggleMission}
        />
      </div>
    </section>
  );
}
