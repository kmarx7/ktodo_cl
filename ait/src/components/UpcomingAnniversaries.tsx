import { useMemo } from "react";
import { useAnniversaryStore } from "@/lib/anniversaryStore";
import { useNav } from "@/lib/nav";
import { anniversaryDateText, upcomingAnniversaries } from "@/lib/anniversary";
import { useLocale, useT } from "@/lib/i18n";
import { ANNIVERSARY_EMOJI } from "@/types/anniversary";

/** Home banner listing anniversaries within the next 7 days (incl. today). */
export function UpcomingAnniversaries() {
  const items = useAnniversaryStore((state) => state.items);
  const go = useNav((state) => state.go);
  const t = useT();
  const locale = useLocale();

  const upcoming = useMemo(() => upcomingAnniversaries(items, new Date(), 7), [items]);
  if (upcoming.length === 0) return null;

  return (
    <div className="mx-4 mt-2 divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-100 dark:divide-neutral-800/70 dark:border-neutral-800/70">
      {upcoming.map(({ anniversary, dday }, i) => (
        <button
          key={`${anniversary.id}-${i}`}
          type="button"
          onClick={() => go("remember")}
          className="flex w-full touch-manipulation items-center gap-3 px-4 py-2.5 text-left active:bg-neutral-50 dark:active:bg-neutral-900"
        >
          <span className="text-lg">{ANNIVERSARY_EMOJI[anniversary.kind]}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {anniversary.title}
            </p>
            <p className="text-xs text-neutral-400">
              {anniversaryDateText(anniversary, locale)}
              {anniversary.recurring ? ` · ${t("anniv.yearly")}` : ""}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
              dday === 0
                ? "bg-red-100 text-red-500 dark:bg-red-950/50"
                : "bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-300"
            }`}
          >
            {dday === 0 ? t("calendar.today") : `D-${dday}`}
          </span>
        </button>
      ))}
    </div>
  );
}
