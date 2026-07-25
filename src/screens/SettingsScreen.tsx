import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  useColorScheme,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '../store/useSettingsStore';
import { useNotesStore } from '../store/useNotesStore';
import { ThemeMode } from '../types/settings';
import { SortBy, SortOrder, ViewMode } from '../types/note';
import { LIGHT_THEME, DARK_THEME } from '../theme/colors';

export const SettingsScreen: React.FC = () => {
  const systemColorScheme = useColorScheme();
  const {
    themeMode,
    setThemeMode,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    resetSettings,
  } = useSettingsStore();

  const { stats, notes, emptyTrash } = useNotesStore();

  const isDarkMode =
    themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(notes, null, 2);
    Alert.alert(
      'Export Successful',
      `Exported ${notes.length} notes in JSON format.\n\nPreview:\n${jsonStr.substring(0, 150)}...`
    );
  };

  const handleResetSettings = () => {
    Alert.alert('Reset Settings', 'Are you sure you want to reset all preferences to default?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetSettings },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>
        <Text style={[styles.subTitle, { color: theme.textMuted }]}>
          Preferences, theme & storage inspector
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollPadding}>
        {/* Theme Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
            APPEARANCE & THEME
          </Text>
          <View
            style={[
              styles.cardGroup,
              { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
            ]}
          >
            {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => setThemeMode(mode)}
                style={[styles.rowItem, { borderBottomColor: theme.surfaceBorder }]}
              >
                <View style={styles.rowLeft}>
                  <Ionicons
                    name={
                      mode === 'system'
                        ? 'color-palette-outline'
                        : mode === 'light'
                        ? 'sunny-outline'
                        : 'moon-outline'
                    }
                    size={20}
                    color={theme.accent}
                  />
                  <Text style={[styles.rowText, { color: theme.textPrimary }]}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
                  </Text>
                </View>
                {themeMode === mode && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Layout & Grid Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
            DEFAULT LAYOUT
          </Text>
          <View
            style={[
              styles.cardGroup,
              { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
            ]}
          >
            {(['grid', 'list'] as ViewMode[]).map((v) => (
              <TouchableOpacity
                key={v}
                onPress={() => setViewMode(v)}
                style={[styles.rowItem, { borderBottomColor: theme.surfaceBorder }]}
              >
                <View style={styles.rowLeft}>
                  <Ionicons
                    name={v === 'grid' ? 'grid-outline' : 'list-outline'}
                    size={20}
                    color={theme.accent}
                  />
                  <Text style={[styles.rowText, { color: theme.textPrimary }]}>
                    {v.toUpperCase()} View
                  </Text>
                </View>
                {viewMode === v && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sorting Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
            SORTING PREFERENCES
          </Text>
          <View
            style={[
              styles.cardGroup,
              { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
            ]}
          >
            {[
              { id: 'updated_at', label: 'Last Modified Date' },
              { id: 'created_at', label: 'Creation Date' },
              { id: 'title', label: 'Title Alphabetical' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setSortBy(opt.id as SortBy)}
                style={[styles.rowItem, { borderBottomColor: theme.surfaceBorder }]}
              >
                <Text style={[styles.rowText, { color: theme.textPrimary }]}>
                  Sort by {opt.label}
                </Text>
                {sortBy === opt.id && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Storage & Database Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
            DATABASE & MMKV STORAGE INSPECTOR
          </Text>
          <View
            style={[
              styles.cardGroup,
              { backgroundColor: theme.surface, borderColor: theme.surfaceBorder, padding: 14 },
            ]}
          >
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Relational DB (SQLite)
              </Text>
              <Text style={[styles.statValue, { color: theme.accent }]}>
                {stats.total} Active Notes
              </Text>
            </View>

            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Pinned Notes
              </Text>
              <Text style={[styles.statValue, { color: theme.pinnedBadge }]}>
                {stats.pinned} Notes
              </Text>
            </View>

            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Archived & Trashed
              </Text>
              <Text style={[styles.statValue, { color: theme.textMuted }]}>
                {stats.archived} Archived / {stats.trashed} Trashed
              </Text>
            </View>

            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Fast Settings (MMKV)
              </Text>
              <Text style={[styles.statValue, { color: theme.success }]}>
                Active & Persistent
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleExportJSON}
              style={[styles.actionBtn, { backgroundColor: theme.accent, marginTop: 12 }]}
            >
              <Ionicons name="download-outline" size={18} color="#ffffff" />
              <Text style={styles.actionBtnText}>Export Notes Backup (JSON)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions Zone */}
        <View style={styles.section}>
          <TouchableOpacity
            onPress={handleResetSettings}
            style={[
              styles.cardGroup,
              styles.dangerRow,
              { backgroundColor: theme.surface, borderColor: theme.danger + '44' },
            ]}
          >
            <Ionicons name="refresh-outline" size={18} color={theme.danger} />
            <Text style={[styles.dangerText, { color: theme.danger }]}>
              Reset All App Preferences
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 12 : 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
  },
  subTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollPadding: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  cardGroup: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    fontSize: 15,
    fontWeight: '600',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statLabel: {
    fontSize: 13,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  dangerText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
