import { Storage } from "@apps-in-toss/web-framework";
import type { StateStorage } from "zustand/middleware";

/**
 * Async storage adapter for zustand `persist`.
 *
 * The App-in-Toss `Storage` bridge only works inside the Toss webview/sandbox.
 * During plain-browser dev (`vite dev` outside Toss) those calls reject, so we
 * fall back to `localStorage` to keep the app usable while developing.
 */
export const appStorage: StateStorage = {
  getItem: async (name) => {
    try {
      return await Storage.getItem(name);
    } catch {
      return globalThis.localStorage?.getItem(name) ?? null;
    }
  },
  setItem: async (name, value) => {
    try {
      await Storage.setItem(name, value);
    } catch {
      globalThis.localStorage?.setItem(name, value);
    }
  },
  removeItem: async (name) => {
    try {
      await Storage.removeItem(name);
    } catch {
      globalThis.localStorage?.removeItem(name);
    }
  },
};
