import { getDatabase } from './db';
import { Note, SortBy, SortOrder } from '../types/note';

const parseNoteRow = (row: any): Note => ({
  id: row.id,
  title: row.title,
  content: row.content,
  category_id: row.category_id,
  color: row.color,
  is_pinned: Boolean(row.is_pinned),
  is_archived: Boolean(row.is_archived),
  is_trashed: Boolean(row.is_trashed),
  reminder_at: row.reminder_at ? Number(row.reminder_at) : null,
  tags: row.tags ? JSON.parse(row.tags) : [],
  created_at: Number(row.created_at),
  updated_at: Number(row.updated_at),
});

export const NotesRepo = {
  async getAllNotes(options?: {
    isArchived?: boolean;
    isTrashed?: boolean;
    categoryId?: string | null;
    searchQuery?: string;
    sortBy?: SortBy;
    sortOrder?: SortOrder;
  }): Promise<Note[]> {
    const db = getDatabase();
    if (!db) return [];

    const isArchived = options?.isArchived ? 1 : 0;
    const isTrashed = options?.isTrashed ? 1 : 0;
    const categoryId = options?.categoryId;
    const searchQuery = options?.searchQuery?.trim();
    const sortBy = options?.sortBy || 'updated_at';
    const sortOrder = (options?.sortOrder || 'desc').toUpperCase();

    let query = `
      SELECT * FROM notes 
      WHERE is_trashed = ? AND is_archived = ?
    `;
    const params: any[] = [isTrashed, isArchived];

    if (categoryId) {
      query += ` AND category_id = ?`;
      params.push(categoryId);
    }

    if (searchQuery) {
      query += ` AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)`;
      const searchPattern = `%${searchQuery}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY is_pinned DESC, ${sortBy} ${sortOrder}`;

    try {
      const rows = (await db.getAllAsync(query, params)) as any[];
      return rows.map(parseNoteRow);
    } catch (err) {
      console.error('[NotesRepo] getAllNotes error:', err);
      return [];
    }
  },

  async getNoteById(id: string): Promise<Note | null> {
    const db = getDatabase();
    if (!db) return null;
    try {
      const row = (await db.getFirstAsync('SELECT * FROM notes WHERE id = ?;', [id])) as any;
      return row ? parseNoteRow(row) : null;
    } catch (err) {
      console.error('[NotesRepo] getNoteById error:', err);
      return null;
    }
  },

  async saveNote(note: Partial<Note> & { id: string }): Promise<Note | null> {
    const db = getDatabase();
    if (!db) return null;

    const now = Date.now();
    const existing = await NotesRepo.getNoteById(note.id);

    if (existing) {
      const updated: Note = {
        ...existing,
        ...note,
        updated_at: now,
      };

      await db.runAsync(
        `UPDATE notes SET 
          title = ?, 
          content = ?, 
          category_id = ?, 
          color = ?, 
          is_pinned = ?, 
          is_archived = ?, 
          is_trashed = ?, 
          reminder_at = ?, 
          tags = ?, 
          updated_at = ? 
        WHERE id = ?;`,
        [
          updated.title,
          updated.content,
          updated.category_id || null,
          updated.color,
          updated.is_pinned ? 1 : 0,
          updated.is_archived ? 1 : 0,
          updated.is_trashed ? 1 : 0,
          updated.reminder_at || null,
          JSON.stringify(updated.tags || []),
          updated.updated_at,
          updated.id,
        ]
      );
      return updated;
    } else {
      const created: Note = {
        id: note.id,
        title: note.title || '',
        content: note.content || '',
        category_id: note.category_id || null,
        color: note.color || '#ffffff',
        is_pinned: note.is_pinned || false,
        is_archived: note.is_archived || false,
        is_trashed: note.is_trashed || false,
        reminder_at: note.reminder_at || null,
        tags: note.tags || [],
        created_at: note.created_at || now,
        updated_at: now,
      };

      await db.runAsync(
        `INSERT INTO notes (
          id, title, content, category_id, color, is_pinned, is_archived, is_trashed, reminder_at, tags, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          created.id,
          created.title,
          created.content,
          created.category_id || null,
          created.color,
          created.is_pinned ? 1 : 0,
          created.is_archived ? 1 : 0,
          created.is_trashed ? 1 : 0,
          created.reminder_at || null,
          JSON.stringify(created.tags),
          created.created_at,
          created.updated_at,
        ]
      );
      return created;
    }
  },

  async togglePin(id: string): Promise<boolean> {
    const db = getDatabase();
    if (!db) return false;
    const note = await NotesRepo.getNoteById(id);
    if (!note) return false;
    const newPinned = !note.is_pinned;
    await db.runAsync('UPDATE notes SET is_pinned = ?, updated_at = ? WHERE id = ?;', [
      newPinned ? 1 : 0,
      Date.now(),
      id,
    ]);
    return newPinned;
  },

  async moveToTrash(id: string): Promise<void> {
    const db = getDatabase();
    if (!db) return;
    await db.runAsync('UPDATE notes SET is_trashed = 1, is_pinned = 0, updated_at = ? WHERE id = ?;', [
      Date.now(),
      id,
    ]);
  },

  async restoreFromTrash(id: string): Promise<void> {
    const db = getDatabase();
    if (!db) return;
    await db.runAsync('UPDATE notes SET is_trashed = 0, updated_at = ? WHERE id = ?;', [Date.now(), id]);
  },

  async toggleArchive(id: string): Promise<boolean> {
    const db = getDatabase();
    if (!db) return false;
    const note = await NotesRepo.getNoteById(id);
    if (!note) return false;
    const newArchived = !note.is_archived;
    await db.runAsync('UPDATE notes SET is_archived = ?, is_pinned = 0, updated_at = ? WHERE id = ?;', [
      newArchived ? 1 : 0,
      Date.now(),
      id,
    ]);
    return newArchived;
  },

  async deletePermanently(id: string): Promise<void> {
    const db = getDatabase();
    if (!db) return;
    await db.runAsync('DELETE FROM notes WHERE id = ?;', [id]);
  },

  async emptyTrash(): Promise<void> {
    const db = getDatabase();
    if (!db) return;
    await db.runAsync('DELETE FROM notes WHERE is_trashed = 1;');
  },

  async getNoteCounts(): Promise<{ total: number; pinned: number; archived: number; trashed: number }> {
    const db = getDatabase();
    if (!db) return { total: 0, pinned: 0, archived: 0, trashed: 0 };
    try {
      const rows = (await db.getAllAsync(`
        SELECT 
          SUM(CASE WHEN is_trashed = 0 AND is_archived = 0 THEN 1 ELSE 0 END) as total,
          SUM(CASE WHEN is_trashed = 0 AND is_archived = 0 AND is_pinned = 1 THEN 1 ELSE 0 END) as pinned,
          SUM(CASE WHEN is_trashed = 0 AND is_archived = 1 THEN 1 ELSE 0 END) as archived,
          SUM(CASE WHEN is_trashed = 1 THEN 1 ELSE 0 END) as trashed
        FROM notes;
      `)) as any[];
      const row = rows[0] || {};
      return {
        total: row.total || 0,
        pinned: row.pinned || 0,
        archived: row.archived || 0,
        trashed: row.trashed || 0,
      };
    } catch {
      return { total: 0, pinned: 0, archived: 0, trashed: 0 };
    }
  },
};
