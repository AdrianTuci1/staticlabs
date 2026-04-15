import { useCallback, useEffect, useRef, useState } from 'react';
import FeatureMindMap from './detached-mindmap/DetachedMindMap.jsx';
import { useStore } from './detached-mindmap/MockStoreProvider.jsx';
import { HeroWidgetCollage } from './detached-hero-widgets/HeroWidgetCollage.jsx';
import { ProjectTimeline, STATSPARROT_TIMELINE_ITEMS } from './ProjectTimeline.jsx';
import { MarkdownContent } from './MarkdownContent.jsx';
import './ParrotProject.css';

const HERO_WIDGETS_HOLD_MS = 8000;

const PARROT_MARKDOWN = `
# System Architecture: Statsparrot Autonomous Analytics
## Zero ETL Data Projections and Coordinator Agent Orchestration

### Executive Summary
Statsparrot represents a paradigm shift in data engineering by introducing an **Autonomous Data Layer**. By abstracting the complexities of traditional ETL (Extract, Transform, Load) processes, the system enables an orchestrated environment where coordinator agents manage real-time data projections and infrastructure scaling without manual intervention.

### 1. Zero ETL & Real-Time Projections
Traditional data pipelines are often brittle and latent. Statsparrot employs a **Zero ETL architecture**, creating direct, synchronized projections between disparate data sources and analytics engines. This eliminates the staging layer entirely, allowing for millisecond-latency updates across multi-client production environments while maintaining strict projection integrity.\n\n### 2. Coordinator Agent Orchestration\nThe system's intelligence resides in its network of **coordinator agents**. These specialized models are trained to oversee the health and topology of data workflows. They proactively identify bottlenecks, resolve schema drift, and optimize data routing paths, ensuring that the system remains resilient even under volatile load conditions.\n\n### 3. Predictive Infrastructure Scaling\nIntegrating a dedicated analytics engine, Statsparrot dynamically computes the computational overhead required for both active data streams and projected workflows. This predictive scaling mechanism allows for precise resource allocation on A100/H100 clusters, preventing both under-performance and resource wastage in high-stakes production deployments.\n\n### 4. Mindmap-Driven Engineering Interface\nWe have transitioned the engineering workflow from imperative coding to high-level strategic intervention. The **Mindmap Interface** allows engineers to visualize and steer the underlying graph topology of autonomous data flows, focusing on strategic intent rather than implementation details.\n\n### 5. Production Viability\nStatsparrot is currently deployed and tested with multiple enterprise clients, demonstrating a significant reduction in data engineering overhead and a marked increase in the stability of real-time analytical projections.

[statsparrot.com](https://statsparrot.com)
`;
function ParrotPresentation() {
  return (
    <section className="parrot-project parrot-project--presentation" aria-label="Statsparrot presentation">
      <div className="parrot-project__presentation-shell">
        <MarkdownContent content={PARROT_MARKDOWN} />
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

