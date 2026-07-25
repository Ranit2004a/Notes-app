import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LIGHT_THEME, DARK_THEME } from '../theme/colors';

interface RichTextRendererProps {
  content: string;
  isDarkMode: boolean;
  onToggleChecklist?: (lineIndex: number) => void;
  onLinePress?: (lineIndex: number) => void;
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content,
  isDarkMode,
  onToggleChecklist,
  onLinePress,
}) => {
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  if (!content || !content.trim()) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
          Empty note content. Use the formatting toolbar above to add Bold, Italic, Underline, Bullet lists, Checklists & Code blocks...
        </Text>
      </View>
    );
  }

  const renderInlineFormatted = (text: string) => {
    // Matches **bold**, <b>bold</b>, <strong>bold</strong>, *italic*, <i>italic</i>, <em>italic</em>, <u>underline</u>, <ins>underline</ins>, `inline code`
    const regex = /(\*\*.*?\*\*|<b>.*?<\/b>|<strong>.*?<\/strong>|\*.*?\*|<i>.*?<\/i>|<em>.*?<\/em>|<u>.*?<\/u>|<ins>.*?<\/ins>|`.*?`)/gi;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;

      const lower = part.toLowerCase();

      // Bold
      if (
        (part.startsWith('**') && part.endsWith('**')) ||
        (lower.startsWith('<b>') && lower.endsWith('</b>')) ||
        (lower.startsWith('<strong>') && lower.endsWith('</strong>'))
      ) {
        let clean = part;
        if (part.startsWith('**')) clean = part.slice(2, -2);
        else if (lower.startsWith('<b>')) clean = part.slice(3, -4);
        else if (lower.startsWith('<strong>')) clean = part.slice(8, -9);

        return (
          <Text key={index} style={{ fontWeight: 'bold' }}>
            {clean}
          </Text>
        );
      }

      // Italic
      if (
        (part.startsWith('*') && part.endsWith('*')) ||
        (lower.startsWith('<i>') && lower.endsWith('</i>')) ||
        (lower.startsWith('<em>') && lower.endsWith('</em>'))
      ) {
        let clean = part;
        if (part.startsWith('*')) clean = part.slice(1, -1);
        else if (lower.startsWith('<i>')) clean = part.slice(3, -4);
        else if (lower.startsWith('<em>')) clean = part.slice(4, -5);

        return (
          <Text key={index} style={{ fontStyle: 'italic' }}>
            {clean}
          </Text>
        );
      }

      // Underline
      if (
        (lower.startsWith('<u>') && lower.endsWith('</u>')) ||
        (lower.startsWith('<ins>') && lower.endsWith('</ins>'))
      ) {
        const startLen = lower.startsWith('<u>') ? 3 : 5;
        const endLen = lower.startsWith('<u>') ? 4 : 6;
        const clean = part.slice(startLen, -endLen);
        return (
          <Text key={index} style={{ textDecorationLine: 'underline', fontWeight: '500' }}>
            {clean}
          </Text>
        );
      }

      // Inline Code
      if (part.startsWith('`') && part.endsWith('`')) {
        const clean = part.slice(1, -1);
        return (
          <Text
            key={index}
            style={[
              styles.inlineCode,
              {
                backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0',
                color: theme.accent,
              },
            ]}
          >
            {clean}
          </Text>
        );
      }

      return <Text key={index}>{part}</Text>;
    });
  };

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = '';

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Check for triple backticks code block
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        const codeText = codeBlockLines.join('\n');
        const lang = codeBlockLang;
        renderedElements.push(
          <View
            key={`codeblock-${idx}`}
            style={[
              styles.codeBlockContainer,
              {
                backgroundColor: isDarkMode ? '#0f172a' : '#1e293b',
                borderColor: isDarkMode ? '#334155' : '#475569',
              },
            ]}
          >
            <View style={styles.codeHeader}>
              <Text style={styles.codeLangText}>{lang || 'CODE BLOCK'}</Text>
              <Ionicons name="code-slash" size={14} color="#94a3b8" />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={styles.codeText}>{codeText}</Text>
            </ScrollView>
          </View>
        );
        inCodeBlock = false;
        codeBlockLines = [];
        codeBlockLang = '';
      } else {
        // Start code block
        inCodeBlock = true;
        codeBlockLang = trimmed.substring(3).trim().toUpperCase();
        codeBlockLines = [];
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    // Header 1 (# )
    if (line.startsWith('# ')) {
      renderedElements.push(
        <Text
          key={idx}
          onPress={() => onLinePress && onLinePress(idx)}
          style={[styles.h1, { color: theme.textPrimary }]}
        >
          {renderInlineFormatted(line.substring(2))}
        </Text>
      );
      return;
    }

    // Header 2 (## )
    if (line.startsWith('## ')) {
      renderedElements.push(
        <Text
          key={idx}
          onPress={() => onLinePress && onLinePress(idx)}
          style={[styles.h2, { color: theme.textPrimary }]}
        >
          {renderInlineFormatted(line.substring(3))}
        </Text>
      );
      return;
    }

    // Checklist [ ] or [x]
    if (trimmed.startsWith('[ ] ') || trimmed.startsWith('[x] ') || trimmed.startsWith('[-] ')) {
      const isChecked = trimmed.startsWith('[x] ');
      const checkText = trimmed.substring(4);
      renderedElements.push(
        <TouchableOpacity
          key={idx}
          activeOpacity={0.7}
          onPress={() => {
            if (onToggleChecklist) {
              onToggleChecklist(idx);
            } else if (onLinePress) {
              onLinePress(idx);
            }
          }}
          style={styles.checkRow}
        >
          <Ionicons
            name={isChecked ? 'checkbox' : 'square-outline'}
            size={20}
            color={isChecked ? theme.success : theme.textMuted}
            style={styles.checkIcon}
          />
          <Text
            style={[
              styles.checkText,
              {
                color: isChecked ? theme.textMuted : theme.textPrimary,
                textDecorationLine: isChecked ? 'line-through' : 'none',
              },
            ]}
          >
            {renderInlineFormatted(checkText)}
          </Text>
        </TouchableOpacity>
      );
      return;
    }

    // Bullet list (- or *)
    if (line.startsWith('- ') || line.startsWith('* ')) {
      renderedElements.push(
        <View key={idx} style={styles.bulletRow}>
          <View style={[styles.bulletDot, { backgroundColor: theme.accent }]} />
          <Text
            onPress={() => onLinePress && onLinePress(idx)}
            style={[styles.bulletText, { color: theme.textPrimary }]}
          >
            {renderInlineFormatted(line.substring(2))}
          </Text>
        </View>
      );
      return;
    }

    // Quote block (> )
    if (line.startsWith('> ')) {
      renderedElements.push(
        <View
          key={idx}
          style={[
            styles.quoteBlock,
            {
              borderLeftColor: theme.accent,
              backgroundColor: theme.surfaceVariant,
            },
          ]}
        >
          <Text
            onPress={() => onLinePress && onLinePress(idx)}
            style={[styles.quoteText, { color: theme.textSecondary }]}
          >
            {renderInlineFormatted(line.substring(2))}
          </Text>
        </View>
      );
      return;
    }

    // Horizontal Divider (--- or ***)
    if (trimmed === '---' || trimmed === '***') {
      renderedElements.push(
        <View key={idx} style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />
      );
      return;
    }

    // Empty Line
    if (trimmed === '') {
      renderedElements.push(<View key={idx} style={{ height: 10 }} />);
      return;
    }

    // Standard Paragraph
    renderedElements.push(
      <Text
        key={idx}
        onPress={() => onLinePress && onLinePress(idx)}
        style={[styles.paragraph, { color: theme.textPrimary }]}
      >
        {renderInlineFormatted(line)}
      </Text>
    );
  });

  // Handle unclosed code block if any
  if (inCodeBlock && codeBlockLines.length > 0) {
    const codeText = codeBlockLines.join('\n');
    renderedElements.push(
      <View
        key="codeblock-unclosed"
        style={[
          styles.codeBlockContainer,
          {
            backgroundColor: isDarkMode ? '#0f172a' : '#1e293b',
            borderColor: isDarkMode ? '#334155' : '#475569',
          },
        ]}
      >
        <View style={styles.codeHeader}>
          <Text style={styles.codeLangText}>{codeBlockLang || 'CODE BLOCK'}</Text>
          <Ionicons name="code-slash" size={14} color="#94a3b8" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text style={styles.codeText}>{codeText}</Text>
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderedElements}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  h1: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 8,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 6,
  },
  inlineCode: {
    fontFamily: 'monospace',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 14,
  },
  codeBlockContainer: {
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 10,
    overflow: 'hidden',
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  codeLangText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.8,
  },
  codeText: {
    fontFamily: 'monospace',
    color: '#f8fafc',
    fontSize: 13,
    lineHeight: 20,
    padding: 12,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    paddingVertical: 4,
  },
  checkIcon: {
    marginRight: 10,
  },
  checkText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  bulletText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  quoteBlock: {
    borderLeftWidth: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginVertical: 6,
  },
  quoteText: {
    fontSize: 15,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    marginVertical: 14,
    width: '100%',
  },
});
