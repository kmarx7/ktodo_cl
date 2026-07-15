import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useItemStore } from "@/lib/store";
import { useSettingsStore } from "@/lib/settingsStore";
import { ITEM_TYPE_TRANSLATION_KEY, useLocale, useT, type TranslationKey } from "@/lib/i18n";
import { ITEM_TYPES, type Item } from "@/types/item";
import { ITEM_TYPE_THEME } from "@/lib/theme";
import { ItemRow } from "./ItemRow";

const WEEKDAY_KEYS: TranslationKey[] = [
  "calendar.weekday.0",
  "calendar.weekday.1",
  "calendar.weekday.2",
  "calendar.weekday.3",
  "calendar.weekday.4",
  "calendar.weekday.5",
  "calendar.weekday.6",
];

function groupByDate(items: Item[]): Map<string, Item[]> {
  const map = new Map<string, Item[]>();
  for (const item of items) {
    if (!item.dueDate) continue;
    const list = map.get(item.dueDate) ?? [];
    list.push(item);
    map.set(item.dueDate, list);
  }
  return map;
}

/** Compact currency for a calendar cell, e.g. 800000 → "₩80만", 17000 → "₩1.7만". */
function formatCompactWon(n: number): string {
  if (n >= 100_000_000) {
    const v = n / 100_000_000;
    return `₩${Number.isInteger(v) ? v : v.toFixed(1)}억`;
  }
  if (n >= 10_000) {
    const v = n / 10_000;
    return `₩${Number.isInteger(v) ? v : v.toFixed(1)}만`;
  }
  return `₩${n.toLocaleString()}`;
}

export function CalendarView() {
  const items = useItemStore((state) => state.items);
  const calendarCategories = useSettingsStore((state) => state.calendarCategories);
  const t = useT();
  const locale = useLocale();
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState(() => format(new Date(), "yyyy-MM-dd"));

  const visibleItems = useMemo(
    () => items.filter((item) => calendarCategories.includes(item.type)),
    [items, calendarCategories]
  );

  const byDate = useMemo(() => groupByDate(visibleItems), [visibleItems]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const goToday = () => {
    const now = new Date();
    setMonth(now);
    setSelected(format(now, "yyyy-MM-dd"));
  };

  const selectedDate = new Date(`${selected}T00:00`);
  const selectedItems = byDate.get(selected) ?? [];
  const groupedSelected = ITEM_TYPES.map((type) => ({
    type,
    items: selectedItems.filter((item) => item.type === type),
  })).filter((group) => group.items.length > 0);

  const selWeekday = t(WEEKDAY_KEYS[selectedDate.getDay()]);
  const selDateLabel =
    locale === "ko"
      ? `${format(selectedDate, "M월 d일")} (${selWeekday})`
      : `${selWeekday}, ${format(selectedDate, "MMM d")}`;
  const selCount = selectedItems.length;
  const selCountLabel =
    locale === "ko" ? `${selCount}건` : `${selCount} item${selCount !== 1 ? "s" : ""}`;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between px-2 py-3">
        <button
          type="button"
          onClick={() => setMonth((m) => subMonths(m, 1))}
          aria-label={t("calendar.prevMonth")}
          className="flex h-11 w-11 touch-manipulation items-center justify-center"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">
            {format(month, locale === "ko" ? "yyyy년 M월" : "MMMM yyyy")}
          </p>
          <button
            type="button"
            onClick={goToday}
            className="touch-manipulation rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-500 active:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:active:bg-neutral-800"
          >
            {t("calendar.today")}
          </button>
        </div>
        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          aria-label={t("calendar.nextMonth")}
          className="flex h-11 w-11 touch-manipulation items-center justify-center"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid shrink-0 grid-cols-7 px-2 text-center text-[11px] text-neutral-400">
        {WEEKDAY_KEYS.map((key, i) => (
          <div
            key={key}
            className={`py-1 ${i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : ""}`}
          >
            {t(key)}
          </div>
        ))}
      </div>

      <div className="grid shrink-0 grid-cols-7 gap-y-1 px-2 pb-2">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayItems = byDate.get(key) ?? [];
          const count = dayItems.length;
          const types = Array.from(new Set(dayItems.map((item) => item.type)));
          const allDone = count > 0 && dayItems.every((item) => item.checked);
          const payTotal = dayItems
            .filter((item) => item.type === "topay")
            .reduce((sum, item) => sum + (item.amount ?? 0), 0);
          const dow = day.getDay();
          const inMonth = isSameMonth(day, month);
          const selectedDay = isSameDay(day, selectedDate);

          const numColor = selectedDay
            ? ""
            : !inMonth
              ? "text-neutral-300 dark:text-neutral-700"
              : dow === 0
                ? "text-red-500"
                : dow === 6
                  ? "text-blue-500"
                  : "text-neutral-700 dark:text-neutral-300";

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              className={`relative flex min-h-11 touch-manipulation flex-col items-center gap-0.5 rounded-lg py-1.5 text-xs ${
                selectedDay ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : ""
              } ${isToday(day) && !selectedDay ? "ring-1 ring-neutral-400" : ""}`}
            >
              {count >= 3 && (
                <span
                  className={`absolute right-1 top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[9px] font-bold ${
                    selectedDay
                      ? "bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white"
                      : "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  }`}
                >
                  {count}
                </span>
              )}
              <span className={numColor}>{format(day, "d")}</span>
              <span className={`flex h-1.5 gap-0.5 ${allDone ? "opacity-40" : ""}`}>
                {types.map((type) => (
                  <span key={type} className={`h-1.5 w-1.5 rounded-full ${ITEM_TYPE_THEME[type].dot}`} />
                ))}
              </span>
              {payTotal > 0 && (
                <span
                  className={`text-[9px] font-bold leading-none ${
                    selectedDay ? "text-orange-200 dark:text-orange-500" : "text-orange-500"
                  }`}
                >
                  {formatCompactWon(payTotal)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto border-t border-neutral-100 pb-[env(safe-area-inset-bottom)] dark:border-neutral-900">
        <div className="px-4 pt-3 pb-1 text-sm font-bold text-neutral-900 dark:text-neutral-100">
          {selDateLabel}
          {selCount > 0 && (
            <span className="font-medium text-neutral-400"> · {selCountLabel}</span>
          )}
        </div>
        {groupedSelected.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-neutral-400">{t("calendar.noItems")}</p>
        ) : (
          groupedSelected.map(({ type, items: groupItems }) => (
            <div key={type}>
              <p className="px-4 pt-3 pb-1 text-xs font-semibold text-neutral-400">
                {t(ITEM_TYPE_TRANSLATION_KEY[type])}
              </p>
              <ul>
                {groupItems.map((item) => (
                  <ItemRow key={item.id} item={item} />
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
