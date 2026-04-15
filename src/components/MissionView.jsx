import React from 'react';
import { MarkdownContent } from './MarkdownContent.jsx';
import missionContent from '../content/mission.md?raw';
import './MissionView.css';

export function MissionView({ active }) {
  return (
    <div className={`mission-view ${active ? 'is-active' : ''}`}>
      <div className="mission-view__container">
        <MarkdownContent content={missionContent} />
      </div>
    </div>
  );
}
