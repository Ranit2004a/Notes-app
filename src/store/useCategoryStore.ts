import { create } from 'zustand';
import { Category } from '../types/category';
import { CategoriesRepo } from '../database/categoriesRepo';
import { SETTINGS_KEYS, Storage } from '../storage/mmkv';

interface CategoryState {
  categories: Category[];
  selectedCategoryId: string | null;
  isLoading: boolean;
  loadCategories: () => Promise<void>;
  setSelectedCategoryId: (id: string | null) => void;
  addCategory: (name: string, color: string, icon: string) => Promise<Category | null>;
  deleteCategory: (id: string) => Promise<void>;
}

const savedCategoryId = Storage.getString(SETTINGS_KEYS.LAST_CATEGORY);

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  selectedCategoryId: savedCategoryId || null,
  isLoading: false,

  loadCategories: async () => {
    set({ isLoading: true });
    const categories = await CategoriesRepo.getAllCategories();
    set({ categories, isLoading: false });
  },

  setSelectedCategoryId: (id: string | null) => {
    set({ selectedCategoryId: id });
    if (id) {
      Storage.setString(SETTINGS_KEYS.LAST_CATEGORY, id);
    } else {
      Storage.delete(SETTINGS_KEYS.LAST_CATEGORY);
    }
  },

  addCategory: async (name: string, color: string, icon: string) => {
    const id = 'cat_' + Date.now().toString(36);
    const newCat = await CategoriesRepo.addCategory({ id, name, color, icon });
    if (newCat) {
      await get().loadCategories();
    }
    return newCat;
  },

  deleteCategory: async (id: string) => {
    await CategoriesRepo.deleteCategory(id);
    if (get().selectedCategoryId === id) {
      get().setSelectedCategoryId(null);
    }
    await get().loadCategories();
  },
}));
