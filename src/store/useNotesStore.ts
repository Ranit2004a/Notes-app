import { create } from 'zustand';
import { Note } from '../types/note';
import { NotesRepo } from '../database/notesRepo';
import { useSettingsStore } from './useSettingsStore';

interface NotesState {
  notes: Note[];
  archivedNotes: Note[];
  trashedNotes: Note[];
  searchQuery: string;
  isLoading: boolean;
  activeNoteId: string | null;
  stats: { total: number; pinned: number; archived: number; trashed: number };

  setSearchQuery: (query: string) => void;
  setActiveNoteId: (id: string | null) => void;
  loadNotes: (categoryId?: string | null) => Promise<void>;
  loadArchivedNotes: () => Promise<void>;
  loadTrashedNotes: () => Promise<void>;
  saveNote: (note: Partial<Note> & { id: string }) => Promise<Note | null>;
  togglePin: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  moveToTrash: (id: string) => Promise<void>;
  restoreFromTrash: (id: string) => Promise<void>;
  deletePermanently: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  archivedNotes: [],
  trashedNotes: [],
  searchQuery: '',
  isLoading: false,
  activeNoteId: null,
  stats: { total: 0, pinned: 0, archived: 0, trashed: 0 },

  setSearchQuery: (searchQuery: string) => {
    set({ searchQuery });
  },

  setActiveNoteId: (activeNoteId: string | null) => {
    set({ activeNoteId });
  },

  loadNotes: async (categoryId?: string | null) => {
    set({ isLoading: true });
    const { sortBy, sortOrder } = useSettingsStore.getState();
    const notes = await NotesRepo.getAllNotes({
      isArchived: false,
      isTrashed: false,
      categoryId,
      searchQuery: get().searchQuery,
      sortBy,
      sortOrder,
    });
    set({ notes, isLoading: false });
    get().refreshStats();
  },

  loadArchivedNotes: async () => {
    const { sortBy, sortOrder } = useSettingsStore.getState();
    const archivedNotes = await NotesRepo.getAllNotes({
      isArchived: true,
      isTrashed: false,
      searchQuery: get().searchQuery,
      sortBy,
      sortOrder,
    });
    set({ archivedNotes });
  },

  loadTrashedNotes: async () => {
    const { sortBy, sortOrder } = useSettingsStore.getState();
    const trashedNotes = await NotesRepo.getAllNotes({
      isArchived: false,
      isTrashed: true,
      searchQuery: get().searchQuery,
      sortBy,
      sortOrder,
    });
    set({ trashedNotes });
  },

  saveNote: async (note) => {
    const saved = await NotesRepo.saveNote(note);
    if (saved) {
      // Reload current views
      await get().loadNotes();
      get().refreshStats();
    }
    return saved;
  },

  togglePin: async (id: string) => {
    await NotesRepo.togglePin(id);
    await get().loadNotes();
  },

  toggleArchive: async (id: string) => {
    await NotesRepo.toggleArchive(id);
    await get().loadNotes();
    await get().loadArchivedNotes();
  },

  moveToTrash: async (id: string) => {
    await NotesRepo.moveToTrash(id);
    await get().loadNotes();
    await get().loadTrashedNotes();
  },

  restoreFromTrash: async (id: string) => {
    await NotesRepo.restoreFromTrash(id);
    await get().loadNotes();
    await get().loadTrashedNotes();
  },

  deletePermanently: async (id: string) => {
    await NotesRepo.deletePermanently(id);
    await get().loadTrashedNotes();
    get().refreshStats();
  },

  emptyTrash: async () => {
    await NotesRepo.emptyTrash();
    await get().loadTrashedNotes();
    get().refreshStats();
  },

  refreshStats: async () => {
    const stats = await NotesRepo.getNoteCounts();
    set({ stats });
  },
}));
