"use client";

import { useEffect } from "react";
import { useItemStore } from "@/lib/store";
import { useT } from "@/lib/i18n";

const UNDO_WINDOW_MS = 5000;

export function UndoToast() {
  const lastDeleted = useItemStore((state) => state.lastDeleted);
  const restoreLastDeleted = useItemStore((state) => state.restoreLastDeleted);
  const clearLastDeleted = useItemStore((state) => state.clearLastDeleted);
  const t = useT();

  const deletedId = lastDeleted?.id ?? null;

  useEffect(() => {
    if (!deletedId) return;
    const timer = setTimeout(clearLastDeleted, UNDO_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [deletedId, clearLastDeleted]);

  if (!lastDeleted) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex animate-[undo-in_200ms_ease-out] items-center gap-3 rounded-full bg-neutral-900 py-2 pl-4 pr-2 text-sm text-white shadow-lg dark:bg-white dark:text-neutral-900">
        <span className="truncate">{t("item.deleted")}</span>
        <button
          type="button"
          onClick={restoreLastDeleted}
          className="min-h-[36px] touch-manipulation rounded-full px-3 font-semibold text-emerald-400 active:bg-white/10 dark:text-emerald-600 dark:active:bg-black/10"
        >
          {t("item.undo")}
        </button>
      </div>
    </div>
  );
}
