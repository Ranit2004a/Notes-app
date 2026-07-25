import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  useColorScheme,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotesStore } from '../store/useNotesStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { NoteCard } from '../components/NoteCard';
import { EmptyState } from '../components/EmptyState';
import { LIGHT_THEME, DARK_THEME } from '../theme/colors';

export const ArchiveTrashScreen: React.FC = () => {
  const systemColorScheme = useColorScheme();
  const { themeMode, viewMode } = useSettingsStore();
  const {
    archivedNotes,
    trashedNotes,
    loadArchivedNotes,
    loadTrashedNotes,
    toggleArchive,
    restoreFromTrash,
    deletePermanently,
    emptyTrash,
  } = useNotesStore();

  const isDarkMode =
    themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  const [activeSegment, setActiveSegment] = useState<'archive' | 'trash'>('archive');

  useEffect(() => {
    if (activeSegment === 'archive') {
      loadArchivedNotes();
    } else {
      loadTrashedNotes();
    }
  }, [activeSegment]);

  const handleEmptyTrash = () => {
    Alert.alert(
      'Empty Trash',
      'Are you sure you want to permanently delete all notes in the Trash? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Empty Trash',
          style: 'destructive',
          onPress: async () => {
            await emptyTrash();
          },
        },
      ]
    );
  };

  const activeNotesList = activeSegment === 'archive' ? archivedNotes : trashedNotes;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {activeSegment === 'archive' ? 'Archive' : 'Trash Bin'}
        </Text>
        {activeSegment === 'trash' && trashedNotes.length > 0 && (
          <TouchableOpacity
            onPress={handleEmptyTrash}
            style={[styles.emptyTrashBtn, { backgroundColor: theme.danger + '22' }]}
          >
            <Ionicons name="trash" size={16} color={theme.danger} />
            <Text style={[styles.emptyTrashText, { color: theme.danger }]}>
              Empty Trash
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Segmented Control Switcher */}
      <View style={[styles.segmentContainer, { backgroundColor: theme.surfaceVariant }]}>
        <TouchableOpacity
          onPress={() => setActiveSegment('archive')}
          style={[
            styles.segmentBtn,
            {
              backgroundColor:
                activeSegment === 'archive' ? theme.surface : 'transparent',
            },
          ]}
        >
          <Ionicons
            name="archive-outline"
            size={16}
            color={activeSegment === 'archive' ? theme.accent : theme.textMuted}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.segmentText,
              {
                color:
                  activeSegment === 'archive' ? theme.textPrimary : theme.textMuted,
                fontWeight: activeSegment === 'archive' ? '700' : '500',
              },
            ]}
          >
            Archived ({archivedNotes.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveSegment('trash')}
          style={[
            styles.segmentBtn,
            {
              backgroundColor:
                activeSegment === 'trash' ? theme.surface : 'transparent',
            },
          ]}
        >
          <Ionicons
            name="trash-outline"
            size={16}
            color={activeSegment === 'trash' ? theme.danger : theme.textMuted}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.segmentText,
              {
                color: activeSegment === 'trash' ? theme.textPrimary : theme.textMuted,
                fontWeight: activeSegment === 'trash' ? '700' : '500',
              },
            ]}
          >
            Trash ({trashedNotes.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notes List */}
      <FlatList
        data={activeNotesList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <NoteCard
              note={item}
              isDarkMode={isDarkMode}
              viewMode="list"
              onPress={() => {}}
              onPinPress={() => {}}
            />

            {/* Action Overlay Row for Archive & Trash items */}
            <View style={[styles.actionRow, { backgroundColor: theme.surfaceVariant }]}>
              {activeSegment === 'archive' ? (
                <TouchableOpacity
                  onPress={() => toggleArchive(item.id)}
                  style={styles.actionBtn}
                >
                  <Ionicons name="arrow-undo-outline" size={16} color={theme.accent} />
                  <Text style={[styles.actionText, { color: theme.accent }]}>Unarchive</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => restoreFromTrash(item.id)}
                    style={styles.actionBtn}
                  >
                    <Ionicons name="refresh-outline" size={16} color={theme.success} />
                    <Text style={[styles.actionText, { color: theme.success }]}>Restore</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => deletePermanently(item.id)}
                    style={styles.actionBtn}
                  >
                    <Ionicons name="trash" size={16} color={theme.danger} />
                    <Text style={[styles.actionText, { color: theme.danger }]}>
                      Delete Forever
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={
          <EmptyState
            icon={activeSegment === 'archive' ? 'archive-outline' : 'trash-outline'}
            title={
              activeSegment === 'archive' ? 'No Archived Notes' : 'Trash Bin is Empty'
            }
            description={
              activeSegment === 'archive'
                ? 'Notes you archive will be moved here for safekeeping.'
                : 'Deleted notes will stay here until you empty the trash.'
            }
            isDarkMode={isDarkMode}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 12 : 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
  },
  emptyTrashBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  emptyTrashText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  segmentContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 14,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  segmentText: {
    fontSize: 13,
  },
  listPadding: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginTop: -8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
