import { useMemo, useState } from "react";
import {
  addMonths,
  differenceInCalendarDays,
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
import { CheckSquare, ChevronLeft, ChevronRight, Lightbulb, ShoppingCart, Wallet } from "lucide-react";
import { useItemStore } from "@/lib/store";
import { useSettingsStore } from "@/lib/settingsStore";
import { useAnniversaryStore } from "@/lib/anniversaryStore";
import { useUiStore } from "@/lib/uiStore";
import { anniversariesByDate, anniversaryDateText } from "@/lib/anniversary";
import { ITEM_TYPE_TRANSLATION_KEY, useLocale, useT, type TranslationKey } from "@/lib/i18n";
import { ITEM_TYPES, type Item, type ItemType } from "@/types/item";
import { ANNIVERSARY_EMOJI } from "@/types/anniversary";
import { lunarCellLabel } from "@/lib/lunar";
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

// Small category markers shown on each calendar day (instead of colored dots).
const ITEM_ICON: Record<ItemType, typeof CheckSquare> = {
  todo: CheckSquare,
  topay: Wallet,
  tobuy: ShoppingCart,
  tothink: Lightbulb,
};
const ITEM_ICON_COLOR: Record<ItemType, string> = {
  todo: "text-blue-500",
  topay: "text-orange-500",
  tobuy: "text-emerald-500",
  tothink: "text-violet-500",
};

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
  const anniversaries = useAnniversaryStore((state) => state.items);
  const calendarCategories = useSettingsStore((state) => state.calendarCategories);
  const setEditingAnniversaryId = useUiStore((state) => state.setEditingAnniversaryId);
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

  const annivByDate = useMemo(
    () => anniversariesByDate(anniversaries, days[0], days[days.length - 1]),
    [anniversaries, days]
  );

  const goToday = () => {
    const now = new Date();
    setMonth(now);
    setSelected(format(now, "yyyy-MM-dd"));
  };

  // Moving months moves the selection into the new month so the list below
  // follows: today if the new month is the current one, else the first day
  // that has items, else the 1st.
  const goMonth = (delta: number) => {
    const next = delta > 0 ? addMonths(month, 1) : subMonths(month, 1);
    setMonth(next);
    const today = new Date();
    if (isSameMonth(next, today)) {
      setSelected(format(today, "yyyy-MM-dd"));
      return;
    }
    const monthDays = eachDayOfInterval({
      start: startOfMonth(next),
      end: endOfMonth(next),
    });
    const firstWithItems = monthDays.find((d) => byDate.has(format(d, "yyyy-MM-dd")));
    setSelected(format(firstWithItems ?? startOfMonth(next), "yyyy-MM-dd"));
  };

  const selectedDate = new Date(`${selected}T00:00`);
  const selectedItems = byDate.get(selected) ?? [];
  const groupedSelected = ITEM_TYPES.map((type) => ({
    type,
    items: selectedItems.filter((item) => item.type === type),
  })).filter((group) => group.items.length > 0);

  const selDday = differenceInCalendarDays(selectedDate, new Date());
  const selWeekday = t(WEEKDAY_KEYS[selectedDate.getDay()]);
  const selDateLabel =
    locale === "ko"
      ? `${format(selectedDate, "M월 d일")} (${selWeekday})`
      : `${selWeekday}, ${format(selectedDate, "MMM d")}`;
  const selCount = selectedItems.length;
  const selCountLabel =
    locale === "ko" ? `${selCount}건` : `${selCount} item${selCount !== 1 ? "s" : ""}`;
  const selectedAnnivs = annivByDate.get(selected) ?? [];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between px-2 py-3">
        <button
          type="button"
          onClick={() => goMonth(-1)}
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
            className="touch-manipulation rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 active:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:active:bg-blue-900/60"
          >
            {t("calendar.today")}
          </button>
        </div>
        <button
          type="button"
          onClick={() => goMonth(1)}
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
          const dow = day.getDay();
          const inMonth = isSameMonth(day, month);
          const selectedDay = isSameDay(day, selectedDate);

          const isTodayCell = isToday(day);
          const dayAnnivs = annivByDate.get(key) ?? [];
          const numColor = !inMonth
            ? "text-neutral-300 dark:text-neutral-700"
            : dow === 0
              ? "text-red-500"
              : dow === 6
                ? "text-blue-500"
                : "text-neutral-700 dark:text-neutral-300";
          // Modern date marker: filled blue circle for the selected day, a blue
          // ring for today (when not selected), rose for anniversary days.
          const numCircle = selectedDay
            ? "bg-blue-500 font-semibold text-white"
            : isTodayCell
              ? "font-bold text-blue-600 ring-1 ring-blue-300 dark:text-blue-400 dark:ring-blue-500/60"
              : dayAnnivs.length > 0
                ? "font-bold text-pink-600 dark:text-pink-400"
                : numColor;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              className="relative flex min-h-[56px] touch-manipulation flex-col items-center gap-0 rounded-lg py-1 text-xs"
            >
              {dayAnnivs.length > 0 && (
                <span className="absolute left-1 top-0 text-[11px] leading-none">
                  {ANNIVERSARY_EMOJI[dayAnnivs[0].kind]}
                </span>
              )}
              {count >= 3 && (
                <span className="absolute right-1 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-bold text-white">
                  {count}
                </span>
              )}
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] ${numCircle}`}
              >
                {format(day, "d")}
              </span>
              <span className="text-[8px] leading-tight text-neutral-400 dark:text-neutral-500">
                {lunarCellLabel(day)}
              </span>
              <span className={`mt-0.5 flex h-3 items-center gap-0.5 ${allDone ? "opacity-40" : ""}`}>
                {types.map((type) => {
                  const Icon = ITEM_ICON[type];
                  return <Icon key={type} size={11} strokeWidth={2.5} className={ITEM_ICON_COLOR[type]} />;
                })}
              </span>
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

        {selectedAnnivs.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setEditingAnniversaryId(a.id)}
            className="flex w-full touch-manipulation items-center gap-2.5 border-b border-neutral-100 bg-pink-50/70 px-4 py-2.5 text-left dark:border-neutral-900 dark:bg-pink-950/20"
          >
            <span className="text-lg">{ANNIVERSARY_EMOJI[a.kind]}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-pink-700 dark:text-pink-300">
                {a.title}
              </p>
              <p className="text-xs text-pink-400 dark:text-pink-500/80">
                {anniversaryDateText(a, locale)}
                {a.recurring ? ` · ${t("anniv.yearly")}` : ""}
              </p>
            </div>
            {selDday >= 0 && (
              <span
                className={`shrink-0 text-[11px] font-bold ${
                  selDday === 0 ? "text-red-500" : "text-pink-600 dark:text-pink-300"
                }`}
              >
                {selDday === 0 ? t("calendar.today") : `D-${selDday}`}
              </span>
            )}
          </button>
        ))}

        {groupedSelected.length === 0 && selectedAnnivs.length === 0 ? (
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
