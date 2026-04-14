import { useEffect, useMemo, useRef } from 'react';
import { Check, Clock, Gauge, ListChecks, Repeat2, Rocket } from 'lucide-react';
import './ProjectTimeline.css';

const STATUS_ICON = {
  completed: Check,
  active: Clock,
  pending: Rocket,
};

const THUNDER_TIMELINE_ITEMS = [
  {
    id: 'pre-training',
    marker: '01',
    title: 'Pre-training (0.5B)',
    description:
      'Build the first compact base model on curated multilingual and code-heavy data, then validate coherence, latency, and continuation quality before instruction tuning.',
    timestamp: 'Phase 01',
    status: 'completed',
    metric: 'Output: fast 0.5B base',
    Icon: Gauge,
  },
  {
    id: 'distillation',
    marker: '02',
    title: 'Distillation',
    description:
      'Transfer useful teacher behavior into the small model: sharper summaries, cleaner formatting, fewer dead ends, and stronger responses under tight latency.',
    timestamp: 'Phase 02',
    status: 'completed',
    metric: 'Output: small model, stronger taste',
    Icon: Repeat2,
  },
  {
    id: 'sft',
    marker: '03',
    title: 'SFT',
    description:
      'Teach the assistant the product contract: answer directly, keep structure stable, write usable code, and avoid drifting away from the user request.',
    timestamp: 'Phase 03',
    status: 'completed',
    metric: 'Output: instruction-following loop',
    Icon: ListChecks,
  },
  {
    id: 'dpo',
    marker: '04',
    title: 'DPO',
    description:
      'Tune preference behavior toward concise, decisive, and practical answers, while rejecting verbose filler and weak uncertainty masking.',
    timestamp: 'Phase 04',
    status: 'completed',
    metric: 'Output: useful over noisy',
    Icon: Check,
  },
  {
    id: 'production',
    marker: '05',
    title: 'Production',
    description:
      'Ship the model behind a monitored assistant surface with latency checks, formatting tests, regression prompts, and repeatability tracking.',
    timestamp: 'Phase 05',
    status: 'completed',
    metric: 'Output: production-ready path',
    Icon: Rocket,
  },
  {
    id: 'web-search',
    marker: '06',
    title: 'Web search capabilities',
    description:
      'Add retrieval for current information, source-aware answers, and freshness checks so Thunder can handle questions that depend on live context.',
    timestamp: 'Phase 06',
    status: 'active',
    metric: 'Focus: current, cited answers',
    Icon: Rocket,
  },
  {
    id: 'scale-up',
    marker: '07',
    title: 'Scale up to 4B',
    description:
      'Grow the system to 4B parameters and make it meaningfully multilingual, while preserving the compact answer style and deployment discipline.',
    timestamp: 'Next',
    status: 'pending',
    metric: 'Goal: multilingual 4B model',
    Icon: Rocket,
  },
  {
    id: 'tool-use-reasoning',
    marker: '08',
    title: 'Tool use and reasoning',
    description:
      'Teach Thunder to choose tools, verify intermediate steps, and expose enough reasoning structure for reliable workflows without overexplaining.',
    timestamp: 'Next',
    status: 'pending',
    metric: 'Goal: agentic workflows',
    Icon: Rocket,
  },
];

export const STATSPARROT_TIMELINE_ITEMS = [
  {
    id: 'frontend-dev',
    marker: '01',
    title: 'Frontend development',
    description:
      'Built the signal workspace interface: real-time confidence visualizer, side-by-side model comparison panels, and the drift indicator layer for live match context.',
    timestamp: 'Phase 01',
    status: 'completed',
    metric: 'Output: interactive signal workspace',
    Icon: Check,
  },
  {
    id: 'backend',
    marker: '02',
    title: 'Backend',
    description:
      'Established the data pipeline for ingesting match events, normalizing signal feeds, and exposing structured model outputs to the frontend over a stable API layer.',
    timestamp: 'Phase 02',
    status: 'completed',
    metric: 'Output: stable data pipeline',
    Icon: Gauge,
  },
  {
    id: 'zero-transform',
    marker: '03',
    title: 'Zero transform layer (no ETL)',
    description:
      'Eliminated the traditional ETL pipeline by connecting raw match event streams directly to the inference layer. Data reaches the model without transformation overhead, preserving signal fidelity and cutting end-to-end latency.',
    timestamp: 'Phase 03',
    status: 'completed',
    metric: 'Output: zero-copy signal pipeline',
    Icon: Gauge,
  },
  {
    id: 'agent-alignment',
    marker: '04',
    title: 'Agent alignment',
    description:
      'Tuned the intelligence layer to produce consistent, calibrated reads under volatile match conditions, reducing drift in live predictions and tightening confidence bands.',
    timestamp: 'Phase 04',
    status: 'completed',
    metric: 'Output: calibrated live agent',
    Icon: ListChecks,
  },
  {
    id: 'deployment',
    marker: '05',
    title: 'Deployment',
    description:
      'Shipped Statsparrot to a production environment with latency monitoring, formatted signal output, and repeatability checks across match scenarios.',
    timestamp: 'Phase 05',
    status: 'completed',
    metric: 'Output: production-ready build',
    Icon: Rocket,
  },
  {
    id: 'dynamic-compute',
    marker: '06',
    title: 'Dynamic compute calculation',
    description:
      'Implement adaptive compute allocation that scales inference depth based on match phase, signal volatility, and confidence thresholds — serving faster reads when certainty is high.',
    timestamp: 'In progress',
    status: 'active',
    metric: 'Focus: efficient per-signal inference',
    Icon: Repeat2,
  },
  {
    id: 'user-interaction-learning',
    marker: '07',
    title: 'Learning from user interaction',
    description:
      'Feed user decisions and overrides back into the model loop so the workspace improves its signal weighting and confidence calibration based on how experts actually use the readings.',
    timestamp: 'Next',
    status: 'pending',
    metric: 'Goal: adaptive, expert-informed model',
    Icon: Rocket,
  },
];

export function ProjectTimeline({ items = THUNDER_TIMELINE_ITEMS }) {
  const currentItemRef = useRef(null);
  const currentItemId = useMemo(() => {
    const activeItem = items.find((item) => item.status === 'active');
    const pendingItem = items.find((item) => item.status === 'pending');

    return activeItem?.id ?? pendingItem?.id ?? items[items.length - 1]?.id;
  }, [items]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      currentItemRef.current?.scrollIntoView({
        block: 'center',
        inline: 'nearest',
      });
    }, 80);

    return () => window.clearTimeout(timeout);
  }, [currentItemId]);

  return (
    <section className="project-timeline" aria-label="Thunder timeline">
      <ol className="project-timeline__list">
        {items.map((item, index) => {
          const StatusIcon = STATUS_ICON[item.status] ?? Clock;
          const DetailIcon = item.Icon ?? ListChecks;

          return (
            <li
              className={`project-timeline__item project-timeline__item--${item.status}`}
              key={item.id}
              ref={item.id === currentItemId ? currentItemRef : null}
            >
              {index < items.length - 1 && <span className="project-timeline__connector" aria-hidden="true" />}
              <div className="project-timeline__node" aria-hidden="true">
                <StatusIcon size={14} strokeWidth={2.5} />
              </div>
              <article className="project-timeline__content">
                <div className="project-timeline__meta">
                  <span>{item.marker}</span>
                  <time>{item.timestamp}</time>
                </div>
                <div className="project-timeline__title-row">
                  <DetailIcon size={17} strokeWidth={2.1} />
                  <h4>{item.title}</h4>
                </div>
                <p>{item.description}</p>
                <span className="project-timeline__metric">{item.metric}</span>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
