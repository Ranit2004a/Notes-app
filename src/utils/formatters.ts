export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  if (isYesterday) {
    return 'Yesterday, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const sameYear = date.getFullYear() === now.getFullYear();
  if (sameYear) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

export const getWordCount = (text: string): number => {
  const clean = text.trim();
  if (!clean) return 0;
  return clean.split(/\s+/).length;
};

export const getCharacterCount = (text: string): number => {
  return text.length;
};

export const getReadingTimeMinutes = (text: string): number => {
  const words = getWordCount(text);
  return Math.max(1, Math.ceil(words / 200));
};

export const stripFormatting = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/```[\s\S]*?```/g, '[Code Block]') // replace code blocks
    .replace(/<u>(.*?)<\/u>/gi, '$1') // strip underline tags
    .replace(/<ins>(.*?)<\/ins>/gi, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1') // strip bold
    .replace(/\*(.*?)\*/g, '$1') // strip italic
    .replace(/`([^`]+)`/g, '$1') // strip inline code
    .replace(/^\[[ x]\]\s+/gm, '') // strip checklist prefix
    .replace(/^[-*]\s+/gm, '') // strip bullet list prefix
    .replace(/^#+\s+/gm, '') // strip header tags
    .replace(/^>\s+/gm, ''); // strip quotes
};

export const truncateText = (text: string, maxLength: number): string => {
  const cleanText = stripFormatting(text);
  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.substring(0, maxLength).trim() + '...';
};
