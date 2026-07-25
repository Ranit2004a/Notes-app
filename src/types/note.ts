export type NoteColor = 
  | '#ffffff' // Default Light / Card
  | '#fef2f2' // Soft Red / Rose
  | '#fffbebf' // Soft Orange / Amber
  | '#fefce8' // Soft Yellow
  | '#f0fdf4' // Soft Mint / Green
  | '#f0f9ff' // Soft Sky Blue
  | '#f5f3ff' // Soft Purple / Lavender
  | '#fdf2f8' // Soft Pink
  | '#1e293b' // Dark Slate
  | '#18181b' // Dark Zinc
  | '#1f1924' // Dark Plum
  | '#0f172a'; // Dark Ocean

export interface Note {
  id: string;
  title: string;
  content: string;
  category_id: string | null;
  color: string;
  is_pinned: boolean;
  is_archived: boolean;
  is_trashed: boolean;
  reminder_at: number | null;
  tags: string[]; // parsed array
  created_at: number;
  updated_at: number;
}

export type SortBy = 'updated_at' | 'created_at' | 'title';
export type SortOrder = 'desc' | 'asc';
export type ViewMode = 'grid' | 'list';
