import { create } from 'zustand';
import { AppSettings, ThemeMode } from '../types/settings';
import { SortBy, SortOrder, ViewMode } from '../types/note';
import { DEFAULT_SETTINGS, SETTINGS_KEYS, Storage } from '../storage/mmkv';

interface SettingsState extends AppSettings {
  setThemeMode: (mode: ThemeMode) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  setPinCode: (pin: string | null) => void;
  togglePinLock: (enabled: boolean) => void;
  resetSettings: () => void;
}

const initialSettings = Storage.getObject<AppSettings>(SETTINGS_KEYS.SETTINGS, DEFAULT_SETTINGS);

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...initialSettings,

  setThemeMode: (themeMode: ThemeMode) => {
    set({ themeMode });
    Storage.setObject(SETTINGS_KEYS.SETTINGS, { ...get(), themeMode });
  },

  setViewMode: (viewMode: ViewMode) => {
    set({ viewMode });
    Storage.setObject(SETTINGS_KEYS.SETTINGS, { ...get(), viewMode });
  },

  setSortBy: (sortBy: SortBy) => {
    set({ sortBy });
    Storage.setObject(SETTINGS_KEYS.SETTINGS, { ...get(), sortBy });
  },

  setSortOrder: (sortOrder: SortOrder) => {
    set({ sortOrder });
    Storage.setObject(SETTINGS_KEYS.SETTINGS, { ...get(), sortOrder });
  },

  setPinCode: (pinCode: string | null) => {
    set({ pinCode, isPinEnabled: Boolean(pinCode) });
    Storage.setObject(SETTINGS_KEYS.SETTINGS, { ...get(), pinCode, isPinEnabled: Boolean(pinCode) });
  },

  togglePinLock: (isPinEnabled: boolean) => {
    set({ isPinEnabled });
    Storage.setObject(SETTINGS_KEYS.SETTINGS, { ...get(), isPinEnabled });
  },

  resetSettings: () => {
    set(DEFAULT_SETTINGS);
    Storage.setObject(SETTINGS_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },
}));
