import { useEffect, useRef, useState } from 'react';
import { LabMarkLogo } from './LabMarkLogo.jsx';
import { AnnouncementTicker } from './AnnouncementTicker.jsx';
import { ProjectFeedback } from './ProjectFeedback.jsx';
import { ThunderProject } from './ThunderProject.jsx';
import { ParrotProject } from './ParrotProject.jsx';
import { MarkdownContent } from './MarkdownContent.jsx';
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
      {accent === 'red' && (
        <>
          <span className="project-cursor project-cursor--dot" />
          <span className="project-cursor project-cursor--orbit project-cursor--orbit-one" />
          <span className="project-cursor project-cursor--orbit project-cursor--orbit-two" />
          <span className="project-cursor project-cursor--orbit project-cursor--orbit-three" />
        </>
      )}
      {accent === 'yellow' && (
        <span className="project-cursor project-cursor--diamond">
          <span className="project-cursor__arrow project-cursor__arrow--up">^</span>
          <span className="project-cursor__arrow project-cursor__arrow--right">&gt;</span>
          <span className="project-cursor__arrow project-cursor__arrow--down">v</span>
          <span className="project-cursor__arrow project-cursor__arrow--left">&lt;</span>
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

function DetailHeader({ onBack }) {
  return (
    <header className="detail-topbar">
      <button className="lab-mark" type="button" onClick={onBack} aria-label="Back to projects">
        <LabMarkLogo />
        <span className="lab-mark__text">
          <span>static</span>
          <span>labs</span>
        </span>
      </button>
      <AnnouncementTicker />
    </header>
  );
}

function DetailTabs({ onBack, onNext, onPrevious }) {
  return (
    <div className="detail-tabs" aria-label="Project navigation">
      <div className="detail-tabs__mark" aria-hidden="true" />
      <div className="detail-tabs__items">
        <button type="button" onClick={onPrevious} aria-label="Previous project">
          &lt;
        </button>
        <button type="button" onClick={onNext} aria-label="Next project">
          &gt;
        </button>
        <button type="button" onClick={onBack} aria-label="Back to projects">
          x
        </button>
      </div>
    </div>
  );
}

function DetailSidebar({ activeMenuIndex, project, projectMenus, onSelectMenu }) {
  return (
    <aside className="detail-sidebar" aria-label="Project menu">
      <p className="hud-kicker">{project.id} // {project.code}</p>
      <h2>{project.title}</h2>
      <p className="detail-sidebar__copy">
        {project.description}
      </p>
      <div className="detail-sidebar__list">
        {projectMenus.map((menu, index) => (
          <button
            className={index === activeMenuIndex ? 'is-selected' : ''}
            key={menu.id}
            type="button"
            onClick={() => onSelectMenu(index)}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            {menu.label}
          </button>
        ))}
      </div>
      <button className="detail-sidebar__terms" type="button">
        See live
      </button>
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
