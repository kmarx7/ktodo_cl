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

  const selectedItems = byDate.get(selected) ?? [];
  const groupedSelected = ITEM_TYPES.map((type) => ({
    type,
    items: selectedItems.filter((item) => item.type === type),
  })).filter((group) => group.items.length > 0);

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
        <p className="text-sm font-semibold">
          {format(month, locale === "ko" ? "yyyy년 M월" : "MMMM yyyy")}
        </p>
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
        {WEEKDAY_KEYS.map((key) => (
          <div key={key} className="py-1">
            {t(key)}
          </div>
        ))}
      </div>

      <div className="grid shrink-0 grid-cols-7 gap-y-1 px-2 pb-2">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayItems = byDate.get(key) ?? [];
          const types = Array.from(new Set(dayItems.map((item) => item.type)));
          const inMonth = isSameMonth(day, month);
          const selectedDay = isSameDay(day, new Date(selected));

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              className={`flex min-h-11 touch-manipulation flex-col items-center gap-0.5 rounded-lg py-1.5 text-xs ${
                selectedDay
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : inMonth
                    ? "text-neutral-700 dark:text-neutral-300"
                    : "text-neutral-300 dark:text-neutral-700"
              } ${isToday(day) && !selectedDay ? "ring-1 ring-neutral-400" : ""}`}
            >
              {format(day, "d")}
              <span className="flex h-1.5 gap-0.5">
                {types.map((type) => (
                  <span key={type} className={`h-1.5 w-1.5 rounded-full ${ITEM_TYPE_THEME[type].dot}`} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto border-t border-neutral-100 pb-[env(safe-area-inset-bottom)] dark:border-neutral-900">
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
