import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDatabase } from './src/database/db';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useSettingsStore } from './src/store/useSettingsStore';
import { useCategoryStore } from './src/store/useCategoryStore';
import { useNotesStore } from './src/store/useNotesStore';
import { LIGHT_THEME, DARK_THEME } from './src/theme/colors';

export default function App() {
  const systemColorScheme = useColorScheme();
  const { themeMode } = useSettingsStore();
  const { loadCategories } = useCategoryStore();
  const { loadNotes } = useNotesStore();

  const [isReady, setIsReady] = useState(false);

  const isDarkMode =
    themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  useEffect(() => {
    async function prepareApp() {
      try {
        await initDatabase();
        await loadCategories();
        await loadNotes();
      } catch (err) {
        console.error('[App] Preparation error:', err);
      } finally {
        setIsReady(true);
      }
    }
    prepareApp();
  }, []);

  if (!isReady) {
    return (
      <View style={[styles.splash, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
