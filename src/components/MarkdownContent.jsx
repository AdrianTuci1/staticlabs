import React from 'react';
import ReactMarkdown from 'react-markdown';
import './MarkdownContent.css';

export function MarkdownContent({ content, className = '' }) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
