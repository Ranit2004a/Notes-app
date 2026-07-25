import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types/category';
import { ViewMode } from '../types/note';
import { LIGHT_THEME, DARK_THEME } from '../theme/colors';

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  isDarkMode: boolean;
  totalNotesCount: number;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategoryId,
  onSelectCategory,
  viewMode,
  onToggleViewMode,
  isDarkMode,
  totalNotesCount,
}) => {
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  const statusBarPaddingTop = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 10 : 12;

  return (
    <View style={[styles.container, { paddingTop: statusBarPaddingTop }]}>
      {/* Top Header Title & Stats & Layout Switcher */}
      <View style={styles.titleRow}>
        <View>
          <Text style={[styles.appTitle, { color: theme.textPrimary }]}>
            Nova<Text style={{ color: theme.accent }}>Notes</Text>
          </Text>
          <Text style={[styles.subTitle, { color: theme.textMuted }]}>
            {totalNotesCount} {totalNotesCount === 1 ? 'note' : 'notes'} saved
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onToggleViewMode}
          style={[
            styles.iconButton,
            {
              backgroundColor: theme.surfaceVariant,
              borderColor: theme.surfaceBorder,
            },
          ]}
        >
          <Ionicons
            name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'}
            size={20}
            color={theme.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: theme.surface,
            borderColor: theme.surfaceBorder,
          },
        ]}
      >
        <Ionicons name="search-outline" size={20} color={theme.textMuted} style={styles.searchIcon} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search notes, tags, or content..."
          placeholderTextColor={theme.textMuted}
          style={[styles.searchInput, { color: theme.textPrimary }]}
        />
        {Boolean(searchQuery) && (
          <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {/* All Notes Pill */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onSelectCategory(null)}
          style={[
            styles.chip,
            {
              backgroundColor:
                selectedCategoryId === null ? theme.accent : theme.surfaceVariant,
              borderColor:
                selectedCategoryId === null ? theme.accent : theme.surfaceBorder,
            },
          ]}
        >
          <Ionicons
            name="apps-outline"
            size={14}
            color={selectedCategoryId === null ? theme.accentForeground : theme.textSecondary}
            style={styles.chipIcon}
          />
          <Text
            style={[
              styles.chipText,
              {
                color:
                  selectedCategoryId === null
                    ? theme.accentForeground
                    : theme.textSecondary,
                fontWeight: selectedCategoryId === null ? '700' : '500',
              },
            ]}
          >
            All Notes
          </Text>
        </TouchableOpacity>

        {/* Dynamic Category Pills */}
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.7}
              onPress={() => onSelectCategory(cat.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? cat.color : theme.surfaceVariant,
                  borderColor: isSelected ? cat.color : theme.surfaceBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: isSelected ? '#ffffff' : cat.color },
                ]}
              />
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isSelected ? '#ffffff' : theme.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  categoriesContainer: {
    paddingRight: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipIcon: {
    marginRight: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
  },
});
