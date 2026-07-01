import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ITEM_TYPES, type ItemType } from "@/types/item";

export type Locale = "en" | "ko";

interface SettingsStore {
  locale: Locale;
  calendarCategories: ItemType[];
  setLocale: (locale: Locale) => void;
  toggleCalendarCategory: (type: ItemType) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      locale: "en",
      calendarCategories: [...ITEM_TYPES],
      setLocale: (locale) => set({ locale }),
      toggleCalendarCategory: (type) =>
        set((state) => ({
          calendarCategories: state.calendarCategories.includes(type)
            ? state.calendarCategories.filter((t) => t !== type)
            : [...state.calendarCategories, type],
        })),
    }),
    { name: "todo-cl-settings" }
  )
);
