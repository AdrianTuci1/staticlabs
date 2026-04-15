import { useEffect, useRef, useState } from 'react';
import { ProjectTopbar } from './ProjectTopbar.jsx';
import { ProjectFeedback } from './ProjectFeedback.jsx';
import { ThunderProject } from './ThunderProject.jsx';
import { ParrotProject } from './ParrotProject.jsx';
import { MarkdownContent } from './MarkdownContent.jsx';
import { ProjectMedia } from './ProjectMedia.jsx';
import { useSoundEffects } from '../context/SoundContext.jsx';
import { GlitchButton } from './GlitchButton.jsx';
import './ProjectDetail.css';

const CRYSTAL_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$)@$*@!)#$%^*)%_+#$^&[]{}<>/\\|~=-+;:,.?';

function scrambleText(text, revealRatio = 0) {
  const revealIndex = Math.floor(text.length * revealRatio);

  return Array.from(text, (char, index) => {
    if (/\s/.test(char) || index < revealIndex) {
      return char;
    }

    return CRYSTAL_CHARS[Math.floor(Math.random() * CRYSTAL_CHARS.length)];
  }).join('');
}

function ProjectDetailAnimation({ projectId, accent }) {
  if (projectId === '001') return null;
  return <ProjectMedia projectId={projectId} accent={accent} />;
}

function ProjectCursor({ accent, visible }) {
  return (
    <div className={`project-cursor-layer project-cursor-layer--${accent} ${visible ? 'is-visible' : ''}`}>
      {accent === 'blue' && (
        <>
          <span className="project-cursor project-cursor--target-line project-cursor--target-line-x" />
          <span className="project-cursor project-cursor--target-line project-cursor--target-line-y" />
          <span className="project-cursor project-cursor--target" />
        </>
      )}
      {accent === 'purple' && (
        <>
          <span className="project-cursor project-cursor--dot" />
          <span className="project-cursor project-cursor--orbit project-cursor--orbit-one" />
          <span className="project-cursor project-cursor--orbit project-cursor--orbit-two" />
          <span className="project-cursor project-cursor--orbit project-cursor--orbit-three" />
        </>
      )}
      {accent === 'orange' && (
        <span className="project-cursor project-cursor--diamond">
          <span className="project-cursor__arrow project-cursor__arrow--up">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 11L8 4L15 11" strokeLinecap="square" />
            </svg>
          </span>
          <span className="project-cursor__arrow project-cursor__arrow--right">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 1L12 8L5 15" strokeLinecap="square" />
            </svg>
          </span>
          <span className="project-cursor__arrow project-cursor__arrow--down">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 5L8 12L15 5" strokeLinecap="square" />
            </svg>
          </span>
          <span className="project-cursor__arrow project-cursor__arrow--left">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 1L4 8L11 15" strokeLinecap="square" />
            </svg>
          </span>
        </span>
      )}
    </div>
  );
}

function CrystallizedText({ text }) {
  const [renderedText, setRenderedText] = useState(() => scrambleText(text));

  useEffect(() => {
    let frame = 0;
    const totalFrames = 22;

    setRenderedText(scrambleText(text));
    const interval = window.setInterval(() => {
      frame += 1;
      const revealRatio = Math.min((frame / totalFrames) ** 0.62, 1);

      setRenderedText(scrambleText(text, revealRatio));

      if (frame >= totalFrames) {
        window.clearInterval(interval);
        setRenderedText(text);
      }
    }, 22);

    return () => window.clearInterval(interval);
  }, [text]);

  return renderedText;
}



function ProjectVisualizer({ menu, project }) {
  return (
    <div className="visualizer-placeholder" aria-label={`${project.title} visualizer placeholder`}>
      <div className="visualizer-placeholder__scope">
        <span />
        <span />
        <span />
      </div>
      {menu.component && <span className="visualizer-placeholder__slot">{menu.component}</span>}
      <p>{menu.shortText}</p>
    </div>
  );
}

function ProjectStageContent({ menu, project }) {
  if (menu.type === 'chat') {
    return <ProjectFeedback messages={menu.messages} />;
  }

  if (menu.type === 'mermaid') {
    return (
      <div className="mermaid-text" aria-label="Markdown presentation text">
        <MarkdownContent content={menu.mermaid} />
      </div>
    );
  }

  if (project.title === 'Thunder') {
    return <ThunderProject view={menu.id} />;
  }

  if (project.title === 'Statsparrot') {
    return <ParrotProject view={menu.id} />;
  }

  return <ProjectVisualizer menu={menu} project={project} />;
}

function handleDirectionalHover(e, playHover) {
  playHover?.();
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
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

  btn.style.setProperty('--slide-start-x', side === 'left' ? '-100%' : side === 'right' ? '100%' : '0');
  btn.style.setProperty('--slide-start-y', side === 'top' ? '-100%' : side === 'bottom' ? '100%' : '0');
}

function DetailHeader({ onBack }) {
  return <ProjectTopbar className="detail-topbar" logoText={['static', 'labs']} logoLabel="Back to projects" onLogoClick={onBack} />;
}

function DetailTabs({ onBack, onNext, onPrevious }) {
  const { playClick, playHover } = useSoundEffects();
  return (
    <div className="detail-tabs" aria-label="Project navigation">
      <div className="detail-tabs__mark" aria-hidden="true">
        <span className="detail-tabs__stripe detail-tabs__stripe--one" />
        <span className="detail-tabs__stripe detail-tabs__stripe--two" />
        <span className="detail-tabs__stripe detail-tabs__stripe--three" />
      </div>
      <div className="detail-tabs__items">
        <button
          type="button"
          onMouseEnter={(e) => handleDirectionalHover(e, playHover)}
          onClick={(e) => {
            playClick();
            onPrevious();
          }}
          aria-label="Previous project"
        >
          &lt;
        </button>
        <button
          type="button"
          onMouseEnter={(e) => handleDirectionalHover(e, playHover)}
          onClick={(e) => {
            playClick();
            onNext();
          }}
          aria-label="Next project"
        >
          &gt;
        </button>
        <button
          type="button"
          onMouseEnter={(e) => handleDirectionalHover(e, playHover)}
          onClick={(e) => {
            playClick();
            onBack();
          }}
          aria-label="Back to projects"
        >
          x
        </button>
      </div>
    </div>
  );
}

function DetailSidebar({ activeMenuIndex, project, projectMenus, onSelectMenu }) {
  const { playClick, playHover } = useSoundEffects();

  return (
    <aside className="detail-sidebar" aria-label="Project menu">
      <p className="hud-kicker">{project.id} // {project.code}</p>
      <h2>{project.title}</h2>
      <p className="detail-sidebar__copy">
        {project.description}
      </p>
      <div className="detail-sidebar__list">
        {projectMenus.map((menu, index) => {
          const isSelected = index === activeMenuIndex;
          return (
            <button
              className={isSelected ? 'is-selected' : ''}
              key={menu.id}
              type="button"
              onMouseEnter={(e) => !isSelected && handleDirectionalHover(e, playHover)}
              onClick={() => {
                if (isSelected) return;
                playClick();
                onSelectMenu(index);
              }}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {menu.label}
            </button>
          );
        })}
      </div>
      <div className="detail-sidebar__actions">
        <GlitchButton
          text="see project live"
          onClick={() => {}}
        />
      </div>
    </aside>
  );
}

function DetailStage({ activeMenu, project }) {
  return (
    <section className="detail-stage" aria-label="Project stage">
      <div className="detail-preview">
        <ProjectStageContent menu={activeMenu} project={project} />
      </div>
    </section>
  );
}

export function ProjectDetail({ project, projects, onBack, onSelectProject }) {
  const projectMenus = project.menus ?? [];
  const [activeMenuIndex, setActiveMenuIndex] = useState(0);
  const [isCursorVisible, setIsCursorVisible] = useState(false);
  const detailRef = useRef(null);
  const cursorFrameRef = useRef(0);
  const pendingCursorRef = useRef({ x: 0, y: 0 });
  const activeMenu = projectMenus[activeMenuIndex] ?? projectMenus[0];
  const currentProjectIndex = projects.findIndex((item) => item.id === project.id);

  function selectProject(projectId) {
    onSelectProject(projectId);
  }

  function selectAdjacentProject(direction) {
    const nextIndex = (currentProjectIndex + direction + projects.length) % projects.length;
    selectProject(projects[nextIndex].id);
  }

  function flushCursorPosition() {
    cursorFrameRef.current = 0;

    if (!detailRef.current) {
      return;
    }

    detailRef.current.style.setProperty('--cursor-x', `${pendingCursorRef.current.x}px`);
    detailRef.current.style.setProperty('--cursor-y', `${pendingCursorRef.current.y}px`);
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

  useEffect(() => {
    setActiveMenuIndex(0);
  }, [project.id]);

  return (
    <section
      ref={detailRef}
      className={`project-detail project-detail--${project.accent}`}
      aria-label={`${project.title} project detail`}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={() => setIsCursorVisible(false)}
      onPointerMove={handlePointerMove}
    >
      <ProjectCursor accent={project.accent} visible={isCursorVisible} />
      <div className="project-detail__animation">
        {project.id === '001' && (
          <div className="project-detail__bg-image project-detail__bg-image--thunder" aria-hidden="true" />
        )}
        <ProjectDetailAnimation projectId={project.id} accent={project.accent} />
      </div>
      <DetailHeader onBack={onBack} />
      <DetailTabs
        onBack={onBack}
        onNext={() => selectAdjacentProject(1)}
        onPrevious={() => selectAdjacentProject(-1)}
      />

      <div className="detail-workspace">
        <DetailSidebar
          activeMenuIndex={activeMenuIndex}
          onSelectMenu={setActiveMenuIndex}
          project={project}
          projectMenus={projectMenus}
        />
        <DetailStage activeMenu={activeMenu} project={project} />
      </div>
    </section>
  );
}
