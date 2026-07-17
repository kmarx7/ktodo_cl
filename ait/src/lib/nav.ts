import { create } from "zustand";
import type { ItemType } from "@/types/item";

/**
 * Client-side navigation for the App-in-Toss web build.
 *
 * The original app used Next.js file routing (next/link + usePathname). The
 * App-in-Toss scaffold has no router, so we drive screens from a small store.
 */
export type Screen = "home" | ItemType | "calendar" | "settings" | "iap" | "remember";

/** Screens that show the bottom tab bar (the original "root" routes). */
export const TAB_SCREENS: Screen[] = ["home", "calendar", "settings"];

interface NavStore {
  screen: Screen;
  go: (screen: Screen) => void;
}

export const useNav = create<NavStore>((set) => ({
  screen: "home",
  go: (screen) => {
    const commit = () => set({ screen });
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };
    if (typeof doc.startViewTransition === "function") {
      doc.startViewTransition(commit);
    } else {
      commit();
    }
  },
}));
