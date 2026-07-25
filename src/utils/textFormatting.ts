export interface TextSelection {
  start: number;
  end: number;
}

export type FormattingType = 'bold' | 'italic' | 'underline' | 'bullet' | 'checklist' | 'codeblock';

/**
 * Applies rich text formatting to note content based on selection or insertion.
 * Includes smart spacing to avoid sticking tags onto preceding words.
 */
export function applyFormatting(
  content: string,
  selection: TextSelection,
  type: FormattingType
): { updatedContent: string; newSelection: TextSelection } {
  const { start, end } = selection;
  const safeStart = Math.min(start, end);
  const safeEnd = Math.max(start, end);
  
  const selectedText = content.substring(safeStart, safeEnd);
  const beforeText = content.substring(0, safeStart);
  const afterText = content.substring(safeEnd);

  const needsSpaceBefore =
    beforeText.length > 0 &&
    !beforeText.endsWith(' ') &&
    !beforeText.endsWith('\n')
      ? ' '
      : '';

  switch (type) {
    case 'bold': {
      if (selectedText.length > 0) {
        const newText = `${needsSpaceBefore}**${selectedText}**`;
        const updatedContent = beforeText + newText + afterText;
        return {
          updatedContent,
          newSelection: { start: safeStart + needsSpaceBefore.length, end: safeStart + newText.length },
        };
      } else {
        const placeholder = 'bold text';
        const newText = `${needsSpaceBefore}**${placeholder}** `;
        const updatedContent = beforeText + newText + afterText;
        const targetStart = safeStart + needsSpaceBefore.length + 2;
        return {
          updatedContent,
          newSelection: {
            start: targetStart,
            end: targetStart + placeholder.length,
          },
        };
      }
    }

    case 'italic': {
      if (selectedText.length > 0) {
        const newText = `${needsSpaceBefore}*${selectedText}*`;
        const updatedContent = beforeText + newText + afterText;
        return {
          updatedContent,
          newSelection: { start: safeStart + needsSpaceBefore.length, end: safeStart + newText.length },
        };
      } else {
        const placeholder = 'italic text';
        const newText = `${needsSpaceBefore}*${placeholder}* `;
        const updatedContent = beforeText + newText + afterText;
        const targetStart = safeStart + needsSpaceBefore.length + 1;
        return {
          updatedContent,
          newSelection: {
            start: targetStart,
            end: targetStart + placeholder.length,
          },
        };
      }
    }

    case 'underline': {
      if (selectedText.length > 0) {
        const newText = `${needsSpaceBefore}<u>${selectedText}</u>`;
        const updatedContent = beforeText + newText + afterText;
        return {
          updatedContent,
          newSelection: { start: safeStart + needsSpaceBefore.length, end: safeStart + newText.length },
        };
      } else {
        const placeholder = 'underlined text';
        const newText = `${needsSpaceBefore}<u>${placeholder}</u> `;
        const updatedContent = beforeText + newText + afterText;
        const targetStart = safeStart + needsSpaceBefore.length + 3;
        return {
          updatedContent,
          newSelection: {
            start: targetStart,
            end: targetStart + placeholder.length,
          },
        };
      }
    }

    case 'codeblock': {
      if (selectedText.length > 0) {
        const needsBeforeNewline = beforeText.length > 0 && !beforeText.endsWith('\n') ? '\n' : '';
        const needsAfterNewline = afterText.length > 0 && !afterText.startsWith('\n') ? '\n' : '';
        const newText = `${needsBeforeNewline}\`\`\`\n${selectedText}\n\`\`\`${needsAfterNewline}`;
        const updatedContent = beforeText + newText + afterText;
        const codeStart = safeStart + needsBeforeNewline.length + 4;
        return {
          updatedContent,
          newSelection: { start: codeStart, end: codeStart + selectedText.length },
        };
      } else {
        const needsBeforeNewline = beforeText.length > 0 && !beforeText.endsWith('\n') ? '\n' : '';
        const needsAfterNewline = afterText.length > 0 && !afterText.startsWith('\n') ? '\n' : '';
        const placeholder = '// Write code here';
        const newText = `${needsBeforeNewline}\`\`\`\n${placeholder}\n\`\`\`${needsAfterNewline}`;
        const updatedContent = beforeText + newText + afterText;
        const codeStart = safeStart + needsBeforeNewline.length + 4;
        return {
          updatedContent,
          newSelection: {
            start: codeStart,
            end: codeStart + placeholder.length,
          },
        };
      }
    }

    case 'bullet': {
      const lineStart = beforeText.lastIndexOf('\n') + 1;
      const relativeLineEnd = afterText.indexOf('\n');
      const lineEnd = relativeLineEnd === -1 ? content.length : safeEnd + relativeLineEnd;
      const targetChunk = content.substring(lineStart, lineEnd);
      const lines = targetChunk.split('\n');

      const formattedLines = lines.map((line) => {
        if (line.startsWith('- ')) return line.substring(2);
        if (line.startsWith('* ')) return line.substring(2);
        if (line.startsWith('[ ] ')) return `- ${line.substring(4)}`;
        if (line.startsWith('[x] ')) return `- ${line.substring(4)}`;
        return `- ${line}`;
      });

      const updatedChunk = formattedLines.join('\n');
      const updatedContent = content.substring(0, lineStart) + updatedChunk + content.substring(lineEnd);
      return {
        updatedContent,
        newSelection: { start: lineStart, end: lineStart + updatedChunk.length },
      };
    }

    case 'checklist': {
      const lineStart = beforeText.lastIndexOf('\n') + 1;
      const relativeLineEnd = afterText.indexOf('\n');
      const lineEnd = relativeLineEnd === -1 ? content.length : safeEnd + relativeLineEnd;
      const targetChunk = content.substring(lineStart, lineEnd);
      const lines = targetChunk.split('\n');

      const formattedLines = lines.map((line) => {
        if (line.startsWith('[ ] ')) return line.substring(4);
        if (line.startsWith('[x] ')) return line.substring(4);
        if (line.startsWith('- ')) return `[ ] ${line.substring(2)}`;
        if (line.startsWith('* ')) return `[ ] ${line.substring(2)}`;
        return `[ ] ${line}`;
      });

      const updatedChunk = formattedLines.join('\n');
      const updatedContent = content.substring(0, lineStart) + updatedChunk + content.substring(lineEnd);
      return {
        updatedContent,
        newSelection: { start: lineStart, end: lineStart + updatedChunk.length },
      };
    }

    default:
      return { updatedContent: content, newSelection: selection };
  }
}

/**
 * Toggles a checklist line at specified line index between [ ] and [x]
 */
export function toggleChecklistAtLine(content: string, lineIndex: number): string {
  const lines = content.split('\n');
  if (lineIndex < 0 || lineIndex >= lines.length) return content;

  const targetLine = lines[lineIndex];
  const trimmed = targetLine.trim();

  if (trimmed.startsWith('[ ] ')) {
    lines[lineIndex] = targetLine.replace('[ ] ', '[x] ');
  } else if (trimmed.startsWith('[x] ')) {
    lines[lineIndex] = targetLine.replace('[x] ', '[ ] ');
  }

  return lines.join('\n');
}
