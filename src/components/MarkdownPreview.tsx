import React from 'react';
import { RichTextRenderer } from './RichTextRenderer';

interface MarkdownPreviewProps {
  content: string;
  isDarkMode: boolean;
  onToggleChecklist?: (lineIndex: number) => void;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  isDarkMode,
  onToggleChecklist,
}) => {
  return (
    <RichTextRenderer
      content={content}
      isDarkMode={isDarkMode}
      onToggleChecklist={onToggleChecklist}
    />
  );
};
