import { getDatabase } from './db';
import { Category } from '../types/category';

export const CategoriesRepo = {
  async getAllCategories(): Promise<Category[]> {
    const db = getDatabase();
    if (!db) return [];
    try {
      const rows = (await db.getAllAsync('SELECT * FROM categories ORDER BY name ASC;')) as any[];
      return rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        color: r.color,
        icon: r.icon,
        created_at: Number(r.created_at),
      }));
    } catch (err) {
      console.error('[CategoriesRepo] getAllCategories error:', err);
      return [];
    }
  },

  async addCategory(category: Omit<Category, 'created_at'>): Promise<Category | null> {
    const db = getDatabase();
    if (!db) return null;
    const now = Date.now();
    try {
      await db.runAsync(
        'INSERT INTO categories (id, name, color, icon, created_at) VALUES (?, ?, ?, ?, ?);',
        [category.id, category.name, category.color, category.icon, now]
      );
      return { ...category, created_at: now };
    } catch (err) {
      console.error('[CategoriesRepo] addCategory error:', err);
      return null;
    }
  },

  async deleteCategory(id: string): Promise<void> {
    const db = getDatabase();
    if (!db) return;
    try {
      // Unassign notes from this category
      await db.runAsync('UPDATE notes SET category_id = NULL WHERE category_id = ?;', [id]);
      // Delete category
      await db.runAsync('DELETE FROM categories WHERE id = ?;', [id]);
    } catch (err) {
      console.error('[CategoriesRepo] deleteCategory error:', err);
    }
  },
};
