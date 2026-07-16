import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { appStorage } from "@/lib/storage";
import type { Anniversary } from "@/types/anniversary";

type NewAnniversary = Omit<Anniversary, "id" | "createdAt">;

interface AnniversaryStore {
  items: Anniversary[];
  addAnniversary: (input: NewAnniversary) => void;
  updateAnniversary: (id: string, patch: Partial<Anniversary>) => void;
  removeAnniversary: (id: string) => void;
}

export const useAnniversaryStore = create<AnniversaryStore>()(
  persist(
    (set) => ({
      items: [],
      addAnniversary: (input) =>
        set((state) => ({
          items: [
            { ...input, id: crypto.randomUUID(), createdAt: Date.now() },
            ...state.items,
          ],
        })),
      updateAnniversary: (id, patch) =>
        set((state) => ({
          items: state.items.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      removeAnniversary: (id) =>
        set((state) => ({ items: state.items.filter((a) => a.id !== id) })),
    }),
    {
      name: "todo-cl-anniversaries",
      storage: createJSONStorage(() => appStorage),
    }
  )
);
