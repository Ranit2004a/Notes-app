import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Alert,
  useColorScheme,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCategoryStore } from '../store/useCategoryStore';
import { useNotesStore } from '../store/useNotesStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Category } from '../types/category';
import { LIGHT_THEME, DARK_THEME } from '../theme/colors';

const CATEGORY_COLOR_PRESETS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
];

const CATEGORY_ICON_PRESETS = [
  'folder',
  'bookmark',
  'star',
  'briefcase',
  'heart',
  'bulb',
  'code',
  'film',
];

export const CategoriesScreen: React.FC = () => {
  const systemColorScheme = useColorScheme();
  const { themeMode } = useSettingsStore();

  const { categories, loadCategories, addCategory, deleteCategory } = useCategoryStore();
  const { notes } = useNotesStore();

  const isDarkMode =
    themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>(CATEGORY_COLOR_PRESETS[0]);
  const [selectedIcon, setSelectedIcon] = useState<string>(CATEGORY_ICON_PRESETS[0]);

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!name.trim()) {
      Alert.alert('Category Name Required', 'Please enter a category name.');
      return;
    }
    await addCategory(name.trim(), selectedColor, selectedIcon);
    setName('');
    setIsModalOpen(false);
  };

  const handleDeleteCategory = (cat: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${cat.name}"? Notes in this category will not be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCategory(cat.id);
          },
        },
      ]
    );
  };

  const renderCategoryCard = ({ item }: { item: Category }) => {
    const noteCount = notes.filter((n) => n.category_id === item.id).length;

    return (
      <View
        style={[
          styles.categoryCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.surfaceBorder,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: item.color + '22' },
            ]}
          >
            <Ionicons
              name={(item.icon as any) || 'folder-outline'}
              size={22}
              color={item.color}
            />
          </View>

          <TouchableOpacity
            onPress={() => handleDeleteCategory(item)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.categoryTitle, { color: theme.textPrimary }]}>
          {item.name}
        </Text>

        <Text style={[styles.noteCountText, { color: theme.textMuted }]}>
          {noteCount} {noteCount === 1 ? 'note' : 'notes'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>
            Categories
          </Text>
          <Text style={[styles.pageSubTitle, { color: theme.textMuted }]}>
            Organize notes into custom folders
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsModalOpen(true)}
          style={[styles.addButton, { backgroundColor: theme.accent }]}
        >
          <Ionicons name="add" size={22} color="#ffffff" />
          <Text style={styles.addButtonText}>New Folder</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderCategoryCard}
        contentContainerStyle={styles.listPadding}
        columnWrapperStyle={styles.gridRow}
      />

      {/* Modal for Creating Custom Category */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: theme.surface,
                borderColor: theme.surfaceBorder,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Create New Category
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Category Name (e.g. Work, Travels)..."
              placeholderTextColor={theme.textMuted}
              style={[
                styles.modalInput,
                {
                  color: theme.textPrimary,
                  borderColor: theme.surfaceBorder,
                  backgroundColor: theme.surfaceVariant,
                },
              ]}
            />

            {/* Color Palette Selector */}
            <Text style={[styles.modalLabel, { color: theme.textMuted }]}>
              Category Color
            </Text>
            <View style={styles.colorRow}>
              {CATEGORY_COLOR_PRESETS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setSelectedColor(c)}
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor: c,
                      borderColor: selectedColor === c ? theme.textPrimary : 'transparent',
                      borderWidth: selectedColor === c ? 2 : 0,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Icon Selector */}
            <Text style={[styles.modalLabel, { color: theme.textMuted }]}>
              Icon Badge
            </Text>
            <View style={styles.iconRow}>
              {CATEGORY_ICON_PRESETS.map((iconName) => (
                <TouchableOpacity
                  key={iconName}
                  onPress={() => setSelectedIcon(iconName)}
                  style={[
                    styles.iconOption,
                    {
                      backgroundColor:
                        selectedIcon === iconName ? theme.accent : theme.surfaceVariant,
                    },
                  ]}
                >
                  <Ionicons
                    name={iconName as any}
                    size={20}
                    color={selectedIcon === iconName ? '#ffffff' : theme.textPrimary}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Modal Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                style={[styles.modalBtn, { backgroundColor: theme.surfaceVariant }]}
              >
                <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreateCategory}
                style={[styles.modalBtn, { backgroundColor: theme.accent }]}
              >
                <Text style={{ color: '#ffffff', fontWeight: '700' }}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 12,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '900',
  },
  pageSubTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  listPadding: {
    paddingHorizontal: 10,
    paddingBottom: 40,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  categoryCard: {
    flex: 1,
    marginHorizontal: 6,
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    padding: 4,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  noteCountText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  modalInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconOption: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
});
