import { ArrowUp, Pencil } from 'lucide-react';
import { useState } from 'react';

const DEFAULT_VISITOR = 'visitor_2048';

export function ProjectFeedback({ messages = [] }) {
  const [visitorName, setVisitorName] = useState(DEFAULT_VISITOR);
  const [draft, setDraft] = useState('');
  const [localMessages, setLocalMessages] = useState([]);
  const visibleMessages = [...messages.map((message) => message.text), ...localMessages];

  function handleSubmit(event) {
    event.preventDefault();

    const text = draft.trim();

    if (!text) {
      return;
    }

    setLocalMessages((currentMessages) => [text, ...currentMessages]);
    setDraft('');
  }

  return (
    <div className="project-feedback" aria-label="Project feedback">
      <div className="project-feedback__rail" aria-hidden="true">
        <div className="project-feedback__track">
          {[...visibleMessages, ...visibleMessages].map((message, index) => (
            <article className="project-feedback__card" key={`${message}-${index}`}>
              <p>{message}</p>
            </article>
          ))}
        </div>
      </div>

      <form className="project-feedback__composer" onSubmit={handleSubmit}>
        <label className="project-feedback__visitor">
          <input
            aria-label="Visitor name"
            onChange={(event) => setVisitorName(event.target.value)}
            value={visitorName}
          />
          <Pencil size={12} strokeWidth={2} aria-hidden="true" />
        </label>

        <div className="project-feedback__message-row">
          <input
            aria-label="Feedback message"
            onChange={(event) => setDraft(event.target.value)}
            placeholder={`Leave feedback as @${visitorName || DEFAULT_VISITOR}`}
            value={draft}
          />
          <button type="submit" aria-label="Send feedback">
            <ArrowUp size={17} strokeWidth={2.4} />
          </button>
        </div>
      </form>
    </div>
  );
}
