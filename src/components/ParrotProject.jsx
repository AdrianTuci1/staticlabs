import { useCallback, useEffect, useRef, useState } from 'react';
import FeatureMindMap from './detached-mindmap/DetachedMindMap.jsx';
import { useStore } from './detached-mindmap/MockStoreProvider.jsx';
import { HeroWidgetCollage } from './detached-hero-widgets/HeroWidgetCollage.jsx';
import { ProjectTimeline, STATSPARROT_TIMELINE_ITEMS } from './ProjectTimeline.jsx';
import { MarkdownContent } from './MarkdownContent.jsx';
import { statsparrotMarkdown } from '../data/projectMarkdown.js';
import './ParrotProject.css';

const HERO_WIDGETS_HOLD_MS = 8000;

function ParrotPresentation() {
  return (
    <section className="parrot-project parrot-project--presentation" aria-label="Statsparrot presentation">
      <div className="parrot-project__presentation-shell">
        <MarkdownContent content={statsparrotMarkdown} />
      </div>
    </section>
  );
}

function ParrotVisualizer() {
  const { workspaceStore } = useStore();
  const [phase, setPhase] = useState('mindmap'); // 'mindmap' | 'widgets'
  const heroTimerRef = useRef(null);
  const cycleKeyRef = useRef(0);

  const startMindmap = useCallback(() => {
    setPhase('mindmap');
  }, []);

  const onMindmapComplete = useCallback(() => {
    setPhase('widgets');
    heroTimerRef.current = window.setTimeout(() => {
      cycleKeyRef.current += 1;
      startMindmap();
    }, HERO_WIDGETS_HOLD_MS);
  }, [startMindmap]);

  useEffect(() => {
    if (phase === 'mindmap') {
      workspaceStore.startDiscovery(onMindmapComplete);
    }
    return () => {
      window.clearTimeout(heroTimerRef.current);
    };
  }, [phase, workspaceStore, onMindmapComplete]);

  return (
    <section className="parrot-project parrot-project--visualize" aria-label="Statsparrot visualizer">
      <div className="parrot-project__visualizer-container">
        {phase === 'mindmap' && (
          <FeatureMindMap key={`mindmap-${cycleKeyRef.current}`} />
        )}
        {phase === 'widgets' && (
          <div className="parrot-project__hero-widgets">
            <HeroWidgetCollage key={`widgets-${cycleKeyRef.current}`} />
          </div>
        )}
      </div>
    </section>
  );
}

export function ParrotProject({ view = 'visualize' }) {
  if (view === 'presentation') {
    return <ParrotPresentation />;
  }

  if (view === 'timeline') {
    return <ProjectTimeline items={STATSPARROT_TIMELINE_ITEMS} />;
  }

  return <ParrotVisualizer />;
}
