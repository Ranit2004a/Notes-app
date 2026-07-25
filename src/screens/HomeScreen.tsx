import React, { useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  useColorScheme,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useNotesStore } from '../store/useNotesStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { NoteCard } from '../components/NoteCard';
import { SearchHeader } from '../components/SearchHeader';
import { FAB } from '../components/FAB';
import { EmptyState } from '../components/EmptyState';
import { LIGHT_THEME, DARK_THEME } from '../theme/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const systemColorScheme = useColorScheme();

  const { themeMode, viewMode, setViewMode } = useSettingsStore();
  const { notes, isLoading, searchQuery, setSearchQuery, loadNotes, togglePin } =
    useNotesStore();
  const { categories, selectedCategoryId, setSelectedCategoryId, loadCategories } =
    useCategoryStore();

  const isDarkMode =
    themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  const categoryMap = useMemo(() => {
    const map = new Map<string, (typeof categories)[0]>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const handleRefresh = useCallback(async () => {
    await loadCategories();
    await loadNotes(selectedCategoryId);
  }, [loadCategories, loadNotes, selectedCategoryId]);

  useEffect(() => {
    handleRefresh();
  }, [selectedCategoryId, searchQuery]);

  const pinnedNotes = useMemo(() => notes.filter((n) => n.is_pinned), [notes]);
  const otherNotes = useMemo(() => notes.filter((n) => !n.is_pinned), [notes]);

  const renderHeader = () => (
    <SearchHeader
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      categories={categories}
      selectedCategoryId={selectedCategoryId}
      onSelectCategory={setSelectedCategoryId}
      viewMode={viewMode}
      onToggleViewMode={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
      isDarkMode={isDarkMode}
      totalNotesCount={notes.length}
    />
  );

  const renderNoteItem = ({ item }: { item: (typeof notes)[0] }) => (
    <NoteCard
      note={item}
      category={item.category_id ? categoryMap.get(item.category_id) : undefined}
      isDarkMode={isDarkMode}
      viewMode={viewMode}
      onPress={() => navigation.navigate('NoteEditor', { noteId: item.id })}
      onPinPress={() => togglePin(item.id)}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {viewMode === 'grid' ? (
        <FlatList
          data={notes}
          key="grid-list"
          numColumns={2}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={renderNoteItem}
          contentContainerStyle={styles.listPadding}
          columnWrapperStyle={styles.gridColumnWrapper}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor={theme.accent}
            />
          }
          ListEmptyComponent={
            !isLoading ? (
              <EmptyState
                icon={searchQuery ? 'search-outline' : 'journal-outline'}
                title={searchQuery ? 'No notes found' : 'No notes yet'}
                description={
                  searchQuery
                    ? `No notes match "${searchQuery}". Try a different keyword or filter.`
                    : 'Tap the + button below to create your very first note!'
                }
                isDarkMode={isDarkMode}
              />
            ) : null
          }
        />
      ) : (
        <FlatList
          data={notes}
          key="single-list"
          numColumns={1}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={renderNoteItem}
          contentContainerStyle={styles.listPadding}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor={theme.accent}
            />
          }
          ListEmptyComponent={
            !isLoading ? (
              <EmptyState
                icon={searchQuery ? 'search-outline' : 'journal-outline'}
                title={searchQuery ? 'No notes found' : 'No notes yet'}
                description={
                  searchQuery
                    ? `No notes match "${searchQuery}". Try a different keyword or filter.`
                    : 'Tap the + button below to create your very first note!'
                }
                isDarkMode={isDarkMode}
              />
            ) : null
          }
        />
      )}

      <FAB
        isDarkMode={isDarkMode}
        onPress={() =>
          navigation.navigate('NoteEditor', {
            initialCategoryId: selectedCategoryId || undefined,
          })
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listPadding: {
    paddingBottom: 90,
  },
  gridColumnWrapper: {
    paddingHorizontal: 10,
  },
});
