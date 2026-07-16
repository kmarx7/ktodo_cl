import { useMemo } from "react";
import { addDays, startOfDay } from "date-fns";
import { ChevronRight, Plus } from "lucide-react";
import { useAnniversaryStore } from "@/lib/anniversaryStore";
import { useUiStore } from "@/lib/uiStore";
import { anniversaryDateText, anniversaryOccurrences } from "@/lib/anniversary";
import { useLocale, useT } from "@/lib/i18n";
import { ANNIVERSARY_EMOJI } from "@/types/anniversary";

export function RememberScreen() {
  const items = useAnniversaryStore((state) => state.items);
  const setEditingAnniversaryId = useUiStore((state) => state.setEditingAnniversaryId);
  const t = useT();
  const locale = useLocale();

  const sorted = useMemo(() => {
    const today = startOfDay(new Date());
    const occ = anniversaryOccurrences(items, today, addDays(today, 366));
    const next = new Map<string, number>();
    for (const { anniversary, date } of occ) {
      const cur = next.get(anniversary.id);
      if (cur === undefined || date.getTime() < cur) next.set(anniversary.id, date.getTime());
    }
    return [...items].sort(
      (a, b) => (next.get(a.id) ?? Infinity) - (next.get(b.id) ?? Infinity)
    );
  }, [items]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 pb-[env(safe-area-inset-bottom)]">
      <button
        type="button"
        onClick={() => setEditingAnniversaryId("new")}
        className="mb-2 flex touch-manipulation items-center justify-center gap-1.5 rounded-xl border border-dashed border-neutral-300 py-3 text-sm font-semibold text-neutral-500 active:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:active:bg-neutral-900"
      >
        <Plus size={16} />
        {t("remember.add")}
      </button>

      {sorted.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-neutral-400">{t("remember.empty")}</p>
      ) : (
        <ul>
          {sorted.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setEditingAnniversaryId(a.id)}
                className="flex w-full touch-manipulation items-center gap-3 border-b border-neutral-100 py-3 text-left dark:border-neutral-900"
              >
                <span className="text-xl">{ANNIVERSARY_EMOJI[a.kind]}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {a.title}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {anniversaryDateText(a, locale)} ·{" "}
                    {a.recurring
                      ? t("anniv.yearly")
                      : `${a.year ?? ""}${locale === "ko" ? "년" : ""}`}
                  </p>
                </div>
                <ChevronRight size={18} className="shrink-0 text-neutral-300 dark:text-neutral-600" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
