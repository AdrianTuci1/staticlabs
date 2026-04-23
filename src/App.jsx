import { useEffect, useMemo, useState } from 'react';
import { LoadingMenu } from './components/LoadingMenu.jsx';
import { ProjectDetail } from './components/ProjectDetail.jsx';
import { ProjectGallery } from './components/ProjectGallery.jsx';
import { projects } from './data/content.js';
import { SoundProvider } from './context/SoundContext.jsx';

export default function App() {
  const [screen, setScreen] = useState('loading');
  const [selectedId, setSelectedId] = useState(projects[0].id);
  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedId) ?? projects[0],
    [selectedId],
  );

  useEffect(() => {
    if (screen !== 'loading') {
      return undefined;
    }

    const timer = window.setTimeout(() => setScreen('projects'), 5800);
    return () => window.clearTimeout(timer);
  }, [screen]);

  // SPA Page View Tracking (GA4)
  useEffect(() => {
    if (window.gtag) {
      const path = screen === 'detail' ? `/project/${selectedProject.title.toLowerCase()}` : '/';
      const title = screen === 'detail' ? `${selectedProject.title} | Static Labs` : 'Archive | Static Labs';

      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title
      });
    }
  }, [screen, selectedId, selectedProject.title]);

  function openProject(projectId) {
    setSelectedId(projectId);
    setScreen('detail');
  }

  return (
    <SoundProvider>
      <div className={`app-shell ${screen === 'detail' ? `app-shell--${selectedProject.accent}` : ''}`}>
        <div className="screen-noise" aria-hidden="true" />
        <main>
          {screen === 'loading' &&
            <LoadingMenu />}
          {screen === 'projects' &&
            <ProjectGallery projects={projects} onOpen={openProject} />}
          {screen === 'detail' && (
            <ProjectDetail
              project={selectedProject}
              projects={projects}
              onBack={() => setScreen('projects')}
              onSelectProject={setSelectedId}
            />
          )}
        </main>
      </div>
    </SoundProvider>
  );
}
