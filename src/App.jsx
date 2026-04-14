import { useEffect, useMemo, useState } from 'react';
import { LoadingMenu } from './components/LoadingMenu.jsx';
import { ProjectDetail } from './components/ProjectDetail.jsx';
import { ProjectGallery } from './components/ProjectGallery.jsx';
import { projects } from './data/content.js';

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

    const timer = window.setTimeout(() => setScreen('projects'), 4200);
    return () => window.clearTimeout(timer);
  }, [screen]);

  function openProject(projectId) {
    setSelectedId(projectId);
    setScreen('detail');
  }

  return (
    <div className="app-shell">
      <div className="screen-noise" aria-hidden="true" />
      <main>
        {screen === 'loading' && <LoadingMenu />}
        {screen === 'projects' && <ProjectGallery projects={projects} onOpen={openProject} />}
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
  );
}
