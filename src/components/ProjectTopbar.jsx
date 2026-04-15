import { LabMarkLogo } from './LabMarkLogo.jsx';
import { AnnouncementTicker } from './AnnouncementTicker.jsx';
import { SoundToggle, useSoundEffects } from '../context/SoundContext.jsx';
import './ProjectTopbar.css';

export function ProjectTopbar({
  className = '',
  logoText = ['STATIC', 'LABS'],
  logoLabel = 'static labs',
  onLogoClick,
  rightAction,
  showTicker = true,
}) {
  const { playClick, playHover } = useSoundEffects();
  const topbarClassName = ['project-topbar', className].filter(Boolean).join(' ');

  const logoContent = (
    <>
      <LabMarkLogo />
      <span className="lab-mark__text">
        {logoText.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </span>
    </>
  );

  return (
    <header className={topbarClassName}>
      <div className="project-topbar__left">
        {onLogoClick ? (
          <button
            className="lab-mark"
            type="button"
            onMouseEnter={playHover}
            onClick={() => {
              playClick();
              onLogoClick();
            }}
            aria-label={logoLabel}
          >
            {logoContent}
          </button>
        ) : (
          <div className="lab-mark" aria-label={logoLabel}>
            {logoContent}
          </div>
        )}
      </div>
      <div className="project-topbar__content">
        <SoundToggle />
        {showTicker && <AnnouncementTicker />}
        {rightAction && <div className="project-topbar__action">{rightAction}</div>}
      </div>
    </header>
  );
}
