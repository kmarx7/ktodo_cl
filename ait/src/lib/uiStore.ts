import { create } from "zustand";

interface UiStore {
  openRowId: string | null;
  setOpenRow: (id: string | null) => void;
}

export const useUiStore = create<UiStore>()((set) => ({
  openRowId: null,
  setOpenRow: (id) => set({ openRowId: id }),
}));
