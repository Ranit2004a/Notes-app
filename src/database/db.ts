import * as SQLite from 'expo-sqlite';
import { Category } from '../types/category';

let dbInstance: any = null;

export const getDatabase = () => {
  if (!dbInstance) {
    try {
      dbInstance = SQLite.openDatabaseSync('novanotes.db');
    } catch (err) {
      console.warn('[Database] Failed opening native SQLite db, using sync fallback:', err);
    }
  }
  return dbInstance;
};

export const DEFAULT_CATEGORIES: Omit<Category, 'created_at'>[] = [
  { id: 'cat_personal', name: 'Personal', color: '#3b82f6', icon: 'user' },
  { id: 'cat_work', name: 'Work & Projects', color: '#8b5cf6', icon: 'briefcase' },
  { id: 'cat_ideas', name: 'Ideas & Brainstorm', color: '#ec4899', icon: 'lightbulb' },
  { id: 'cat_todos', name: 'Checklists & Tasks', color: '#10b981', icon: 'check-square' },
  { id: 'cat_finance', name: 'Finance & Bills', color: '#f59e0b', icon: 'dollar-sign' },
];

export const initDatabase = async (): Promise<void> => {
  const db = getDatabase();
  if (!db) return;

  try {
    // Create categories table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        icon TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category_id TEXT,
        color TEXT NOT NULL DEFAULT '#ffffff',
        is_pinned INTEGER NOT NULL DEFAULT 0,
        is_archived INTEGER NOT NULL DEFAULT 0,
        is_trashed INTEGER NOT NULL DEFAULT 0,
        reminder_at INTEGER,
        tags TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_notes_trashed ON notes(is_trashed);
      CREATE INDEX IF NOT EXISTS idx_notes_archived ON notes(is_archived);
      CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category_id);
    `);

    // Seed default categories if empty
    const result = (await db.getFirstAsync('SELECT COUNT(*) as count FROM categories;')) as { count: number } | null;
    if (result && result.count === 0) {
      const now = Date.now();
      for (const cat of DEFAULT_CATEGORIES) {
        await db.runAsync(
          'INSERT INTO categories (id, name, color, icon, created_at) VALUES (?, ?, ?, ?, ?);',
          [cat.id, cat.name, cat.color, cat.icon, now]
        );
      }
    }
  } catch (error) {
    console.error('[Database] Initialization error:', error);
  }
};
