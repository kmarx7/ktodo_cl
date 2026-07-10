import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Item, ItemType } from "@/types/item";

interface NewItemInput {
  type: ItemType;
  title: string;
  amount: number | null;
  dueDate: string | null;
  dueTime: string | null;
}

interface ItemStore {
  items: Item[];
  lastDeleted: Item | null;
  addItem: (input: NewItemInput) => void;
  toggleChecked: (id: string) => void;
  deleteItem: (id: string) => void;
  restoreLastDeleted: () => void;
  clearLastDeleted: () => void;
  updateItem: (id: string, patch: Partial<Item>) => void;
  markNotified: (id: string) => void;
}

export const useItemStore = create<ItemStore>()(
  persist(
    (set) => ({
      items: [],
      lastDeleted: null,
      addItem: (input) =>
        set((state) => ({
          items: [
            {
              id: crypto.randomUUID(),
              type: input.type,
              title: input.title,
              amount: input.amount,
              dueDate: input.dueDate,
              dueTime: input.dueTime,
              checked: false,
              notified: false,
              createdAt: Date.now(),
            },
            ...state.items,
          ],
        })),
      toggleChecked: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, checked: !item.checked } : item
          ),
        })),
      deleteItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          lastDeleted: state.items.find((item) => item.id === id) ?? null,
        })),
      restoreLastDeleted: () =>
        set((state) =>
          state.lastDeleted
            ? { items: [state.lastDeleted, ...state.items], lastDeleted: null }
            : state
        ),
      clearLastDeleted: () => set({ lastDeleted: null }),
      updateItem: (id, patch) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...patch } : item
          ),
        })),
      markNotified: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, notified: true } : item
          ),
        })),
    }),
    {
      name: "todo-cl-items",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
