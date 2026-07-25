import { AppSettings } from '../types/settings';

// Cross-platform key-value store wrapper (MMKV native or fallback engine)
let mmkvInstance: any = null;
const fallbackStorage = new Map<string, string>();

try {
  const { MMKV } = require('react-native-mmkv');
  mmkvInstance = new MMKV();
} catch (e) {
  console.log('[Storage] MMKV native module fallback enabled.');
}

export const Storage = {
  getString: (key: string): string | null => {
    try {
      if (mmkvInstance) {
        return mmkvInstance.getString(key) ?? null;
      }
    } catch (_) {}
    return fallbackStorage.get(key) ?? null;
  },

  setString: (key: string, value: string): void => {
    try {
      if (mmkvInstance) {
        mmkvInstance.set(key, value);
        return;
      }
    } catch (_) {}
    fallbackStorage.set(key, value);
  },

  getBoolean: (key: string, defaultValue = false): boolean => {
    try {
      if (mmkvInstance) {
        return mmkvInstance.getBoolean(key) ?? defaultValue;
      }
    } catch (_) {}
    const val = fallbackStorage.get(key);
    return val !== undefined ? val === 'true' : defaultValue;
  },

  setBoolean: (key: string, value: boolean): void => {
    try {
      if (mmkvInstance) {
        mmkvInstance.set(key, value);
        return;
      }
    } catch (_) {}
    fallbackStorage.set(key, String(value));
  },

  getObject: <T>(key: string, defaultValue: T): T => {
    const raw = Storage.getString(key);
    if (!raw) return defaultValue;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  },

  setObject: <T>(key: string, value: T): void => {
    Storage.setString(key, JSON.stringify(value));
  },

  delete: (key: string): void => {
    try {
      if (mmkvInstance) {
        mmkvInstance.delete(key);
        return;
      }
    } catch (_) {}
    fallbackStorage.delete(key);
  },

  clearAll: (): void => {
    try {
      if (mmkvInstance) {
        mmkvInstance.clearAll();
        return;
      }
    } catch (_) {}
    fallbackStorage.clear();
  }
};

export const SETTINGS_KEYS = {
  SETTINGS: 'nova_app_settings_v1',
  LAST_CATEGORY: 'nova_last_category_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'system',
  viewMode: 'grid',
  sortBy: 'updated_at',
  sortOrder: 'desc',
  pinCode: null,
  isPinEnabled: false,
  autoSaveIntervalMs: 1500,
};
