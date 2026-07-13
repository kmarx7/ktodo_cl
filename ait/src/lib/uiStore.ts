import { create } from "zustand";

interface UiStore {
  /** id of the row whose swipe drawer is currently open, if any */
  openRowId: string | null;
  setOpenRow: (id: string | null) => void;
  /** id of the item currently being edited in the edit sheet, if any */
  editingId: string | null;
  setEditingId: (id: string | null) => void;
}

export const useUiStore = create<UiStore>()((set) => ({
  openRowId: null,
  setOpenRow: (id) => set({ openRowId: id }),
  editingId: null,
  setEditingId: (id) => set({ editingId: id }),
}));
