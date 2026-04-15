import { useEffect, useRef } from 'react';
import './ProjectMedia.css';
import './ProjectMediaTune.css';

const MEDIA_MAP = {
  '001': '/thunder.mp4',
  '002': '/statsparrot.mp4',
  '003': '/pixtooth.mp4',
};

export function ProjectMedia({ projectId, accent = 'blue', className = '' }) {
  const videoRef = useRef(null);
  const videoSrc = MEDIA_MAP[projectId];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.85; // Slightly slower for a more cinematic feel
    }
  }, []);

  if (!videoSrc) return null;

  return (
    <div className={`project-media project-media--${accent} project-media--id-${projectId} ${className}`}>
      <div className="project-media__video-container">
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="project-media__video"
        />
        <div className="project-media__video-tint" />
      </div>
      <div className="project-media__overlay" />
    </div>
  );
}
