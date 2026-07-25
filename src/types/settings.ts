import { SortBy, SortOrder, ViewMode } from './note';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface AppSettings {
  themeMode: ThemeMode;
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  pinCode: string | null;
  isPinEnabled: boolean;
  autoSaveIntervalMs: number;
}
