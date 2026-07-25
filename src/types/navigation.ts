import { Note } from './note';

export type RootStackParamList = {
  MainTabs: undefined;
  NoteEditor: { noteId?: string; initialCategoryId?: string };
  CategoryDetail: { categoryId: string; categoryName: string };
  Settings: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  CategoriesTab: undefined;
  ArchiveTrashTab: { initialTab?: 'archive' | 'trash' };
  SettingsTab: undefined;
};
