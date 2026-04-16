import { LabMarkLogo } from './LabMarkLogo.jsx';
import './LoadingMenu.css';

export function LoadingMenu() {
  const kickerText = "AI AND MACHINE LEARNING RESEARCH LAB";
  const kickerWords = kickerText.split(" ");

  return (
    <section className="loading-menu" aria-label="Static Labs loading menu">
      <p className="hud-kicker loading-menu__kicker">
        {kickerWords.map((word, i) => (
          <span key={i} className="loading-menu__kicker-word" style={{ "--word-index": i }}>
            {word}
          </span>
        ))}
      </p>
      <div className="lab-mark lab-mark--large" aria-label="static labs">
        <LabMarkLogo />
        <span className="lab-mark__text">
          <span>STATIC</span>
          <span>LABS</span>
        </span>
      </div>

      <div className="loading-menu__console">
        <div className="loading-menu__status">
          <span className="loading-menu__status-label">bending</span>
          <img src="/logo.svg" className="loading-menu__status-icon" alt="" />
          <span className="loading-menu__status-label">reality</span>
        </div>
        <div className="loading-menu__bar" aria-hidden="true">
          <span />
          <div className="loading-menu__bar-text">ACCESSING FILES...</div>
        </div>
      </div>
    </section>
  );
}
