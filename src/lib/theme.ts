import type { ItemType } from "@/types/item";

interface TypeTheme {
  dot: string;
  cardBg: string;
  iconBg: string;
  iconText: string;
}

export const ITEM_TYPE_THEME: Record<ItemType, TypeTheme> = {
  todo: {
    dot: "bg-blue-500",
    cardBg: "bg-blue-50 dark:bg-blue-950/40",
    iconBg: "bg-blue-100 dark:bg-blue-900/60",
    iconText: "text-blue-600 dark:text-blue-300",
  },
  topay: {
    dot: "bg-orange-500",
    cardBg: "bg-orange-50 dark:bg-orange-950/40",
    iconBg: "bg-orange-100 dark:bg-orange-900/60",
    iconText: "text-orange-600 dark:text-orange-300",
  },
  tobuy: {
    dot: "bg-emerald-500",
    cardBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/60",
    iconText: "text-emerald-600 dark:text-emerald-300",
  },
  tothink: {
    dot: "bg-violet-500",
    cardBg: "bg-violet-50 dark:bg-violet-950/40",
    iconBg: "bg-violet-100 dark:bg-violet-900/60",
    iconText: "text-violet-600 dark:text-violet-300",
  },
};
