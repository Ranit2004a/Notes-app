import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useNotesStore } from '../store/useNotesStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { ColorPicker } from '../components/ColorPicker';
import { RichTextRenderer } from '../components/RichTextRenderer';
import { RichTextToolbar } from '../components/RichTextToolbar';
import { applyFormatting, toggleChecklistAtLine, TextSelection, FormattingType } from '../utils/textFormatting';
import { getWordCount, getCharacterCount, formatDate } from '../utils/formatters';
import { LIGHT_THEME, DARK_THEME, NOTE_PALETTES } from '../theme/colors';

type RouteProps = RouteProp<RootStackParamList, 'NoteEditor'>;
type NavProps = NativeStackNavigationProp<RootStackParamList>;

export const NoteEditorScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavProps>();
  const systemColorScheme = useColorScheme();

  const { noteId, initialCategoryId } = route.params || {};

  const { themeMode } = useSettingsStore();
  const { notes, saveNote, moveToTrash } = useNotesStore();
  const { categories } = useCategoryStore();

  const isDarkMode =
    themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  const existingNote = notes.find((n) => n.id === noteId);

  // Editor Local State
  const [id] = useState<string>(noteId || 'note_' + Date.now().toString(36));
  const [title, setTitle] = useState<string>(existingNote?.title || '');
  const [content, setContent] = useState<string>(existingNote?.content || '');
  const [color, setColor] = useState<string>(existingNote?.color || 'default');
  const [categoryId, setCategoryId] = useState<string | null>(
    existingNote?.category_id || initialCategoryId || null
  );
  const [isPinned, setIsPinned] = useState<boolean>(existingNote?.is_pinned || false);
  const [isArchived, setIsArchived] = useState<boolean>(existingNote?.is_archived || false);
  const [tags, setTags] = useState<string[]>(existingNote?.tags || []);
  const [tagInput, setTagInput] = useState<string>('');
  
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

  // Refs for cursor tracking and input focus
  const bodyInputRef = useRef<TextInput>(null);
  const selectionRef = useRef<TextSelection>({ start: 0, end: 0 });

  // Auto-save debounce timer
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSave = useCallback(async () => {
    if (!title.trim() && !content.trim()) return;
    await saveNote({
      id,
      title: title.trim(),
      content,
      color,
      category_id: categoryId,
      is_pinned: isPinned,
      is_archived: isArchived,
      tags,
    });
  }, [id, title, content, color, categoryId, isPinned, isArchived, tags, saveNote]);

  // Auto save when inputs change
  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave();
    }, 1200);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [title, content, color, categoryId, isPinned, isArchived, tags, handleSave]);

  const handleApplyFormat = (type: FormattingType) => {
    const currentSelection = selectionRef.current || { start: content.length, end: content.length };
    const { updatedContent, newSelection } = applyFormatting(content, currentSelection, type);
    
    setContent(updatedContent);
    selectionRef.current = newSelection;

    setTimeout(() => {
      bodyInputRef.current?.focus();
    }, 40);
  };

  const handleToggleChecklist = (lineIndex: number) => {
    const updated = toggleChecklistAtLine(content, lineIndex);
    setContent(updated);
  };

  const handleAddTag = () => {
    const cleanTag = tagInput.trim().replace(/^#/, '');
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleDelete = () => {
    Alert.alert(
      'Move to Trash',
      'Are you sure you want to move this note to Trash?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move to Trash',
          style: 'destructive',
          onPress: async () => {
            if (noteId) {
              await moveToTrash(noteId);
            }
            navigation.goBack();
          },
        },
      ]
    );
  };

  const palette = NOTE_PALETTES.find((p) => p.id === color);
  const editorBg = palette
    ? isDarkMode
      ? palette.dark
      : palette.light
    : isDarkMode
    ? theme.background
    : '#ffffff';

  const statusBarPaddingTop = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 8 : 8;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: editorBg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Clean Top Navigation Bar (Back, Color Palette, Pin, Archive, Trash) */}
        <View style={[styles.topBar, { paddingTop: statusBarPaddingTop }]}>
          <TouchableOpacity
            onPress={() => {
              handleSave();
              navigation.goBack();
            }}
            style={styles.headerButton}
          >
            <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerRightActions}>
            {/* Color Palette Toggle Button */}
            <TouchableOpacity
              onPress={() => setShowColorPicker(!showColorPicker)}
              style={[
                styles.iconBadge,
                { backgroundColor: showColorPicker ? theme.accent + '33' : 'transparent' },
              ]}
            >
              <Ionicons
                name="color-palette-outline"
                size={20}
                color={showColorPicker ? theme.accent : theme.textPrimary}
              />
            </TouchableOpacity>

            {/* Pin Toggle */}
            <TouchableOpacity
              onPress={() => setIsPinned(!isPinned)}
              style={styles.iconBadge}
            >
              <Ionicons
                name={isPinned ? 'pin' : 'pin-outline'}
                size={20}
                color={isPinned ? theme.pinnedBadge : theme.textPrimary}
              />
            </TouchableOpacity>

            {/* Archive Toggle */}
            <TouchableOpacity
              onPress={() => setIsArchived(!isArchived)}
              style={styles.iconBadge}
            >
              <Ionicons
                name={isArchived ? 'archive' : 'archive-outline'}
                size={20}
                color={isArchived ? theme.accent : theme.textPrimary}
              />
            </TouchableOpacity>

            {/* Trash Button */}
            <TouchableOpacity onPress={handleDelete} style={styles.iconBadge}>
              <Ionicons name="trash-outline" size={20} color={theme.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Optional Collapsible Color Picker */}
        {showColorPicker && (
          <ColorPicker
            selectedColorId={color}
            onSelectColor={setColor}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Compact Category Selector Bar */}
        <View style={styles.categoryBarContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity
              onPress={() => setCategoryId(null)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: categoryId === null ? theme.accent : theme.surfaceVariant,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: categoryId === null ? '#ffffff' : theme.textSecondary,
                  fontWeight: categoryId === null ? '700' : '500',
                }}
              >
                No Category
              </Text>
            </TouchableOpacity>

            {categories.map((cat) => {
              const isSelected = categoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategoryId(cat.id)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected ? cat.color : theme.surfaceVariant,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: isSelected ? '#ffffff' : theme.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    }}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Rich Formatting Toolbar (Bold, Italic, Underline, Bullet lists, Checklists, Code blocks) */}
        <RichTextToolbar
          isDarkMode={isDarkMode}
          onApplyFormat={handleApplyFormat}
        />

        {/* Single Live Formatted Canvas Screen */}
        <ScrollView style={styles.editorScroll} keyboardShouldPersistTaps="handled">
          {/* Note Title Input */}
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Note Title"
            placeholderTextColor={theme.textMuted}
            style={[styles.titleInput, { color: theme.textPrimary }]}
            multiline
          />

          {/* Live Formatted Render Canvas */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              bodyInputRef.current?.focus();
            }}
            style={styles.canvasContainer}
          >
            <RichTextRenderer
              content={content}
              isDarkMode={isDarkMode}
              onToggleChecklist={handleToggleChecklist}
              onLinePress={() => {
                bodyInputRef.current?.focus();
              }}
            />

            {/* Seamless Editor Overlay */}
            <TextInput
              ref={bodyInputRef}
              value={content}
              onChangeText={setContent}
              onSelectionChange={(e) => {
                selectionRef.current = e.nativeEvent.selection;
              }}
              placeholder={content ? '' : 'Tap to start typing...'}
              placeholderTextColor={theme.textMuted}
              style={[
                styles.hiddenBodyInput,
                {
                  color: content ? 'transparent' : theme.textPrimary,
                },
              ]}
              multiline
              textAlignVertical="top"
            />
          </TouchableOpacity>

          {/* Tags Section */}
          <View style={styles.tagSection}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>TAGS</Text>
            <View style={styles.tagRow}>
              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => handleRemoveTag(tag)}
                  style={[styles.tagPill, { backgroundColor: theme.surfaceVariant }]}
                >
                  <Text style={[styles.tagPillText, { color: theme.textPrimary }]}>
                    #{tag}
                  </Text>
                  <Ionicons name="close" size={14} color={theme.textMuted} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.addTagInputRow}>
              <TextInput
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={handleAddTag}
                placeholder="Add tag (e.g. work, todo)..."
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.tagInput,
                  {
                    color: theme.textPrimary,
                    borderColor: theme.surfaceBorder,
                    backgroundColor: theme.surfaceVariant,
                  },
                ]}
              />
              <TouchableOpacity
                onPress={handleAddTag}
                style={[styles.addTagButton, { backgroundColor: theme.accent }]}
              >
                <Ionicons name="add" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Footer Word & Character Counter Bar */}
        <View style={[styles.footerBar, { borderTopColor: theme.surfaceBorder }]}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            {getWordCount(content)} words | {getCharacterCount(content)} chars
          </Text>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            {existingNote ? `Saved ${formatDate(existingNote.updated_at)}` : 'Draft'}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerButton: {
    padding: 4,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBarContainer: {
    height: 38,
    justifyContent: 'center',
    marginVertical: 4,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editorScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '800',
    paddingVertical: 10,
    lineHeight: 30,
  },
  canvasContainer: {
    minHeight: 220,
    paddingVertical: 8,
    position: 'relative',
  },
  hiddenBodyInput: {
    fontSize: 16,
    lineHeight: 24,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.01,
  },
  tagSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addTagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
