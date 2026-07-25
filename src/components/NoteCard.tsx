import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '../types/note';
import { Category } from '../types/category';
import { formatDate, truncateText } from '../utils/formatters';
import { LIGHT_THEME, DARK_THEME, NOTE_PALETTES } from '../theme/colors';

interface NoteCardProps {
  note: Note;
  category?: Category;
  isDarkMode: boolean;
  viewMode: 'grid' | 'list';
  onPress: () => void;
  onPinPress: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  category,
  isDarkMode,
  viewMode,
  onPress,
  onPinPress,
}) => {
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  // Custom note color or theme fallback
  const palette = NOTE_PALETTES.find((p) => p.id === note.color || p.light === note.color || p.dark === note.color);
  const cardBg = palette
    ? isDarkMode
      ? palette.dark
      : palette.light
    : isDarkMode
    ? theme.surface
    : '#ffffff';

  const isGrid = viewMode === 'grid';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        isGrid ? styles.gridCard : styles.listCard,
        {
          backgroundColor: cardBg,
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        },
      ]}
    >
      {/* Header: Title & Pin button */}
      <View style={styles.headerRow}>
        <Text
          style={[styles.title, { color: theme.textPrimary }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {note.title || 'Untitled Note'}
        </Text>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={(e) => {
            e.stopPropagation();
            onPinPress();
          }}
          style={styles.pinButton}
        >
          <Ionicons
            name={note.is_pinned ? 'pin' : 'pin-outline'}
            size={18}
            color={note.is_pinned ? theme.pinnedBadge : theme.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Content Preview */}
      {Boolean(note.content) && (
        <Text
          style={[styles.content, { color: theme.textSecondary }]}
          numberOfLines={isGrid ? 5 : 2}
          ellipsizeMode="tail"
        >
          {truncateText(note.content, isGrid ? 140 : 100)}
        </Text>
      )}

      {/* Tags Row if present */}
      {note.tags && note.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {note.tags.slice(0, 3).map((tag, idx) => (
            <View
              key={idx}
              style={[
                styles.tagBadge,
                {
                  backgroundColor: isDarkMode
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.05)',
                },
              ]}
            >
              <Text style={[styles.tagText, { color: theme.textSecondary }]}>
                #{tag}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer: Category Pill & Timestamp */}
      <View style={styles.footerRow}>
        {category ? (
          <View style={[styles.categoryBadge, { backgroundColor: category.color + '22' }]}>
            <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
            <Text style={[styles.categoryName, { color: category.color }]} numberOfLines={1}>
              {category.name}
            </Text>
          </View>
        ) : (
          <View />
        )}
        <Text style={[styles.dateText, { color: theme.textMuted }]}>
          {formatDate(note.updated_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  gridCard: {
    flex: 1,
    minHeight: 140,
    marginHorizontal: 6,
  },
  listCard: {
    width: '100%',
    marginHorizontal: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
    lineHeight: 22,
  },
  pinButton: {
    padding: 2,
  },
  content: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 10,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 6,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    maxWidth: '65%',
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
