import { ProjectTimeline, PIXTOOTH_TIMELINE_ITEMS } from './ProjectTimeline.jsx';
import { MarkdownContent } from './MarkdownContent.jsx';
import { pixtoothMarkdown } from '../data/projectMarkdown.js';
import './PixProject.css';

function PixVisualizer() {

  return (
    <section className="pix-project pix-project--visualize" aria-label="Pixtooth visualizer">
      <div className="pix-project__visualizer">
        <div className="pix-project__camera">
          <div className="pix-project__image-container">
            <img src="/pix1.png" alt="Clinical Scan 01" className="pix-project__image" />
          </div>
          <div className="pix-project__image-container">
            <img src="/pix2.png" alt="Clinical Scan 02" className="pix-project__image" />
          </div>
          <div className="pix-project__image-container">
            <img src="/pix3.png" alt="Clinical Scan 03" className="pix-project__image" />
          </div>
        </div>
      </div>
    </section>
  );
}

function PixPresentation() {
  return (
    <section className="pix-project--presentation" aria-label="Pixtooth presentation">
      <div className="pix-project__presentation-shell">
        <MarkdownContent content={pixtoothMarkdown} />
      </div>
    </section>
  );
}

export function PixProject({ view = 'visualize' }) {
  if (view === 'presentation') {
    return <PixPresentation />;
  }

  if (view === 'timeline') {
    return <ProjectTimeline items={PIXTOOTH_TIMELINE_ITEMS} />;
  }

  return <PixVisualizer />;
}
