import './LabMarkLogo.css';

export function LabMarkLogo({ className = "" }) {
  return (
    <span className={`lab-mark__glyph ${className}`} aria-hidden="true">
      <span className="lab-mark__logo" />
    </span>
  );
}
