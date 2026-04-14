import { useCallback, useEffect, useRef, useState } from 'react';
import FeatureMindMap from './detached-mindmap/DetachedMindMap.jsx';
import { useStore } from './detached-mindmap/MockStoreProvider.jsx';
import { HeroWidgetCollage } from './detached-hero-widgets/HeroWidgetCollage.jsx';
import { ProjectTimeline, STATSPARROT_TIMELINE_ITEMS } from './ProjectTimeline.jsx';
import './ParrotProject.css';

const HERO_WIDGETS_HOLD_MS = 8000;

const PRESENTATION_POINTS = [
  {
    title: 'Match Signal Intelligence',
    text:
      'Statsparrot turns raw match data into a readable surface for high-stakes decisions. By mapping incoming signals in real-time, the workspace helps teams identify drift and momentum before they become obvious on the scoreboard.',
  },
  {
    title: 'Confidence and Uncertainty',
    text:
      'The strongest result is not just prediction accuracy, but the way the workspace makes uncertainty legible. We use confidence bands and drift indicators to show when a model read is losing its grip on the live flow.',
  },
  {
    title: 'Faster Comparisons',
    text:
      'Compare different model takes side-by-side. Statsparrot is built for the moment where two signals disagree, giving the user the tools to dive into the evidence and choose the more reliable read.',
  },
];

function ParrotPresentation() {
  return (
    <section className="parrot-project parrot-project--presentation" aria-label="Statsparrot presentation">
      <div className="parrot-project__presentation-shell">
        <p className="parrot-project__eyebrow">presentation</p>
        <h3>Match intelligence for faster decisions.</h3>
        <p className="parrot-project__lede">
          Statsparrot turns match data into a clearer reading surface. The system emphasizes
          how fast signals are compared and how easy it is to move from raw data to a decision.
        </p>
        <article className="parrot-project__article">
          {PRESENTATION_POINTS.map((point) => (
            <section className="parrot-project__article-section" key={point.title}>
              <h4>{point.title}</h4>
              <p>{point.text}</p>
            </section>
          ))}
        </article>
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

