import { useCallback, useEffect, useRef, useState } from 'react';
import { LabMarkLogo } from './LabMarkLogo.jsx';
import { ArrowUp, BrainCircuit, Earth } from 'lucide-react';
import { ProjectTimeline } from './ProjectTimeline.jsx';
import './ThunderProject.css';

const CRYSTAL_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$)@$*@!)#$%^*)%_+#$^&[]{}<>/\\|~=-+;:,.?';
const THUNDER_MODEL = 'Thunder-01';
const THUNDER_REASONING = 'high';
const REPLAY_DELAY = 2200;
const RESPONSE_HOLD = 2600;
const SEND_HOLD = 520;

const PRESENTATION_POINTS = [
  {
    title: 'How we got here',
    text:
      'Thunder was shaped around the moment where a user asks a direct question and expects the first useful answer before the thread loses energy. The prototype reduces ceremony around the response, keeps formatting close to the reasoning, and treats latency as part of the product experience rather than a separate benchmark.',
  },
  {
    title: 'What changed',
    text:
      'The interface now rewards concise answers, structured output, and repeatable presentation formats. Instead of a visualizer that performs abstraction, Thunder behaves like a working assistant: prompt, answer, table, code, summary.',
  },
  {
    title: 'Benefits',
    text:
      'Teams can test response quality, formatting, and perceived speed in the same surface. The result is easier to demo, easier to compare across runs, and clearer for product workflows where waiting breaks momentum.',
  },
];

const DEMO_SCRIPT = [
  {
    prompt: 'Can you summarize latency, quality, and reliability signals for the Thunder demo?',
    response: [
      {
        type: 'text',
        text:
          'Thunder reads like a low-latency assistant when the first useful sentence arrives quickly, the answer stays compact, and evidence is formatted without extra ceremony.',
      },
      {
        type: 'csv',
        rows: [
          ['signal', 'target', 'demo_read'],
          ['time_to_first_token', '< 250ms', 'instant enough to keep flow'],
          ['answer_quality', 'high precision', 'short reasoning with concrete next steps'],
          ['reliability', 'stable repeats', 'same structure across similar prompts'],
        ],
      },
    ],
  },
  {
    prompt: 'Give me a tiny scoring function for the live presentation.',
    response: [
      {
        type: 'code',
        filename: 'scoring.js',
        code:
          'const thunderScore = ({ latencyMs, quality, reliability }) => ({\n' +
          '  ready: latencyMs < 250 && quality >= 0.86 && reliability >= 0.9,\n' +
          '  label: latencyMs < 180 ? "feels instant" : "fast enough",\n' +
          '});',
      },
      {
        type: 'text',
        text:
          'Use it as a narrative prop, not a benchmark claim. The point is to make speed, quality, and repeatability visible in one glance.',
      },
    ],
  },
  {
    prompt: 'What should the final slide say?',
    response: [
      {
        type: 'text',
        text:
          'Lead with the feeling of speed, then prove it with repeatable measurements and clean output formats. Thunder should feel instant without becoming shallow.',
      },
      {
        type: 'csv',
        rows: [
          ['slide', 'message'],
          ['01', 'answers arrive before attention drifts'],
          ['02', 'formatting is part of the intelligence'],
          ['03', 'reliability matters more than spectacle'],
        ],
      },
    ],
  },
];

function scrambleText(text, revealRatio = 0) {
  const revealIndex = Math.floor(text.length * revealRatio);

  return Array.from(text, (char, index) => {
    if (/\s/.test(char) || index < revealIndex) {
      return char;
    }

    return CRYSTAL_CHARS[Math.floor(Math.random() * CRYSTAL_CHARS.length)];
  }).join('');
}

function CrystallizedText({ text, enabled = true, onTick }) {
  const [renderedText, setRenderedText] = useState(() => (enabled ? scrambleText(text) : text));

  useEffect(() => {
    if (!enabled) {
      setRenderedText(text);
      return undefined;
    }

    let frame = 0;
    const totalFrames = 22;

    setRenderedText(scrambleText(text));
    const interval = window.setInterval(() => {
      frame += 1;
      const revealRatio = Math.min((frame / totalFrames) ** 0.62, 1);

      setRenderedText(scrambleText(text, revealRatio));
      onTick?.();

      if (frame >= totalFrames) {
        window.clearInterval(interval);
        setRenderedText(text);
        onTick?.();
      }
    }, 22);

    return () => window.clearInterval(interval);
  }, [enabled, onTick, text]);

  return renderedText;
}

function TypewriterText({ text, speed = 46, onComplete }) {
  const [visibleText, setVisibleText] = useState('');
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setVisibleText('');

    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setVisibleText(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(interval);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => window.clearInterval(interval);
  }, [speed, text]);

  return (
    <>
      {visibleText}
      <span className="thunder-project__caret" aria-hidden="true" />
    </>
  );
}

function CrystalBlock({ children, delay = 0, onReveal }) {
  const [isVisible, setIsVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) {
      setIsVisible(true);
      onReveal?.();
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setIsVisible(true);
      onReveal?.();
    }, delay);
    return () => window.clearTimeout(timeout);
  }, [delay, onReveal]);

  if (!isVisible) {
    return null;
  }

  return children;
}

function ResponseBlock({ block, live, delay, onReveal, onTick }) {
  if (block.type === 'csv') {
    return (
      <CrystalBlock delay={delay} onReveal={onReveal}>
        <div className="thunder-project__csv" aria-label="CSV response table">
          {block.rows.map((row, rowIndex) => (
            <div className="thunder-project__csv-row" key={row.join('-')}>
              {row.map((cell) => (
                <span key={cell}>
                  <CrystallizedText
                    enabled={live}
                    text={rowIndex === 0 ? cell.toUpperCase() : cell}
                    onTick={onTick}
                  />
                </span>
              ))}
            </div>
          ))}
        </div>
      </CrystalBlock>
    );
  }

  if (block.type === 'code') {
    return (
      <CrystalBlock delay={delay} onReveal={onReveal}>
        <figure className="thunder-project__code">
          <figcaption>{block.filename}</figcaption>
          <pre><code><CrystallizedText enabled={live} text={block.code} onTick={onTick} /></code></pre>
        </figure>
      </CrystalBlock>
    );
  }

  return (
    <CrystalBlock delay={delay} onReveal={onReveal}>
      <p><CrystallizedText enabled={live} text={block.text} onTick={onTick} /></p>
    </CrystalBlock>
  );
}

function AssistantMessage({ response, live, onReveal, onTick }) {
  return (
    <article className="thunder-project__message thunder-project__message--assistant">
      <span className="thunder-project__role">Thunder</span>
      {response.map((block, index) => (
        <ResponseBlock
          block={block}
          delay={live ? index * 420 : 0}
          key={`${block.type}-${index}`}
          live={live}
          onReveal={onReveal}
          onTick={onTick}
        />
      ))}
    </article>
  );
}

function ThunderPresentation() {
  return (
    <section className="thunder-project thunder-project--presentation" aria-label="Thunder presentation">
      <div className="thunder-project__presentation-shell">
        <p className="thunder-project__eyebrow">presentation</p>
        <h3>Instant answers without shallow thinking.</h3>
        <p className="thunder-project__lede">
          Thunder is designed around one practical promise: the answer should arrive quickly enough to keep momentum,
          while still carrying the structure that makes it usable.
        </p>
        <article className="thunder-project__article">
          {PRESENTATION_POINTS.map((point) => (
            <section className="thunder-project__article-section" key={point.title}>
              <h4>{point.title}</h4>
              <p>{point.text}</p>
            </section>
          ))}
        </article>
      </div>
    </section>
  );
}

function ThunderChatDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState('typing');
  const [replayKey, setReplayKey] = useState(0);
  const messagesRef = useRef(null);
  const activeScene = DEMO_SCRIPT[Math.min(activeIndex, DEMO_SCRIPT.length - 1)];

  const scrollToLatest = useCallback(() => {
    window.requestAnimationFrame(() => {
      if (!messagesRef.current) {
        return;
      }

      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: 'smooth',
      });
    });
  }, []);

  function sendPrompt() {
    setPhase('sending');

    window.setTimeout(() => {
      setPhase('responding');
      scrollToLatest();
    }, SEND_HOLD);
  }

  useEffect(() => {
    if (phase !== 'responding') {
      return undefined;
    }

    const interval = window.setInterval(scrollToLatest, 160);
    const advance = window.setTimeout(() => {
      if (activeIndex < DEMO_SCRIPT.length - 1) {
        setActiveIndex((currentIndex) => currentIndex + 1);
        setPhase('typing');
      } else {
        setActiveIndex(DEMO_SCRIPT.length);
        setPhase('replay-wait');
      }
    }, RESPONSE_HOLD);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(advance);
    };
  }, [activeIndex, phase, scrollToLatest]);

  useEffect(() => {
    if (phase !== 'replay-wait') {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setActiveIndex(0);
      setPhase('typing');
      setReplayKey((currentKey) => currentKey + 1);
    }, REPLAY_DELAY);
    return () => window.clearTimeout(timeout);
  }, [phase]);

  return (
    <section className="thunder-project thunder-project--chat" aria-label="Thunder chat visualizer">
      <div className="thunder-project__messages" ref={messagesRef}>
        <div className="thunder-project__messages-inner">
          {DEMO_SCRIPT.slice(0, activeIndex).map((scene) => (
            <div className="thunder-project__exchange" key={scene.prompt}>
              <article className="thunder-project__message thunder-project__message--user">
                <p>{scene.prompt}</p>
              </article>
              <AssistantMessage response={scene.response} />
            </div>
          ))}

          {phase === 'responding' && (
            <div className="thunder-project__exchange">
              <article className="thunder-project__message thunder-project__message--user">
                <p>{activeScene.prompt}</p>
              </article>
              <AssistantMessage response={activeScene.response} live onReveal={scrollToLatest} onTick={scrollToLatest} />
            </div>
          )}
        </div>
      </div>

      <div
        className={`thunder-project__composer-wrap ${activeIndex === 0 && (phase === 'typing' || phase === 'sending') ? 'is-centered' : ''}`}
      >
        {activeIndex === 0 && (phase === 'typing' || phase === 'sending') && (
          <div className="thunder-project__brand" aria-hidden="true">
            <LabMarkLogo className="thunder-project__brand-glyph" />
            <span>static labs</span>
          </div>
        )}

        <div className={`thunder-project__composer ${phase === 'sending' ? 'is-sending' : ''}`}>
          <div className="thunder-project__prompt">
            <span>
              {phase === 'typing' ? (
                <TypewriterText key={`${replayKey}-${activeIndex}`} text={activeScene.prompt} onComplete={sendPrompt} />
              ) : phase === 'sending' ? (
                activeScene.prompt
              ) : (
                'Ask anything'
              )}
            </span>
          </div>
          <div className="thunder-project__meta" aria-hidden="true">
            <span className="thunder-project__icon-button">
              <Earth size={14} strokeWidth={2} />
            </span>
            <span className="thunder-project__reasoning">
              <BrainCircuit size={14} strokeWidth={2} />
              {THUNDER_REASONING}
            </span>
            <span className="thunder-project__model">{THUNDER_MODEL}</span>
            <button className="thunder-project__send" type="button" tabIndex={-1} aria-label="Send demo prompt">
              <ArrowUp size={17} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ThunderProject({ view = 'visualize' }) {
  if (view === 'presentation') {
    return <ThunderPresentation />;
  }

  if (view === 'timeline') {
    return <ProjectTimeline />;
  }

  return <ThunderChatDemo />;
}
