import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { appStorage } from "@/lib/storage";

interface PremiumStore {
  /** True once the user has purchased (or restored) the premium unlock. */
  isPremium: boolean;
  /** Grant premium — called from the IAP grant/restore flow after a paid order. */
  grantPremium: () => void;
}

export const usePremiumStore = create<PremiumStore>()(
  persist(
    (set) => ({
      isPremium: false,
      grantPremium: () => set({ isPremium: true }),
    }),
    {
      name: "todo-cl-premium",
      storage: createJSONStorage(() => appStorage),
    }
  )
);
