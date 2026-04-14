import { LabMarkLogo } from './LabMarkLogo.jsx';
import './LoadingMenu.css';

export function LoadingMenu() {
  return (
    <section className="loading-menu" aria-label="Static Labs loading menu">
      <p className="hud-kicker loading-menu__kicker">
        <span className="loading-menu__kicker-text">AI/MACHINE LEARNING RESEARCH LAB</span>
      </p>
      <div className="lab-mark lab-mark--large" aria-label="static labs">
        <LabMarkLogo />
        <span className="lab-mark__text">
          <span>STATIC</span>
          <span>LABS</span>
        </span>
      </div>

      <div className="loading-menu__console">
        <p>bending reality</p>
        <div className="loading-menu__bar" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}
