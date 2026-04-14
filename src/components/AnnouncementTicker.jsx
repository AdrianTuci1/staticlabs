import './AnnouncementTicker.css';

const announcementText =
  'STATIC LABS // VISUALIZER PASS // PROJECT INDEX ONLINE // FEEDBACK CHANNEL OPEN //';

export function AnnouncementTicker() {
  return (
    <div className="announcement-ticker" aria-label="Announcements">
      <div className="announcement-ticker__track">
        <span>{announcementText}</span>
        <span aria-hidden="true">{announcementText}</span>
      </div>
    </div>
  );
}
