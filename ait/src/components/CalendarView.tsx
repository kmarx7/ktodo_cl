import { useEffect, useMemo, useRef, useState } from "react";
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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useItemStore } from "@/lib/store";
import { useSettingsStore } from "@/lib/settingsStore";
import { useAnniversaryStore } from "@/lib/anniversaryStore";
import { useUiStore } from "@/lib/uiStore";
import { anniversariesByDate, anniversaryDateText } from "@/lib/anniversary";
import { useLocale, useT, type TranslationKey } from "@/lib/i18n";
import { type Item } from "@/types/item";
import { ANNIVERSARY_EMOJI } from "@/types/anniversary";
import { ITEM_TYPE_THEME } from "@/lib/theme";
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

  // Month agenda: every date in the visible month that has items or
  // anniversaries, sorted, each with its anniversaries (first) and items.
  const agenda = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const annOcc = anniversariesByDate(anniversaries, start, end);
    const keys = new Set<string>();
    for (const key of byDate.keys()) {
      const d = new Date(`${key}T00:00`);
      if (d >= start && d <= end) keys.add(key);
    }
    for (const key of annOcc.keys()) keys.add(key);
    return [...keys].sort().map((key) => ({
      key,
      date: new Date(`${key}T00:00`),
      items: byDate.get(key) ?? [],
      annivs: annOcc.get(key) ?? [],
    }));
  }, [month, byDate, anniversaries]);

  // Tapping a grid day scrolls its agenda section into view.
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  useEffect(() => {
    sectionRefs.current[selected]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selected]);

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
          const payTotal = dayItems
            .filter((item) => item.type === "topay")
            .reduce((sum, item) => sum + (item.amount ?? 0), 0);
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
              <span className={`mt-0.5 flex h-1.5 gap-0.5 ${allDone ? "opacity-40" : ""}`}>
                {types.map((type) => (
                  <span key={type} className={`h-1.5 w-1.5 rounded-full ${ITEM_TYPE_THEME[type].dot}`} />
                ))}
              </span>
              {payTotal > 0 && (
                <span className="text-[9px] font-bold leading-none text-orange-500">
                  {formatCompactWon(payTotal)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto border-t border-neutral-100 pb-[env(safe-area-inset-bottom)] dark:border-neutral-900">
        {agenda.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-neutral-400">
            {t("calendar.emptyMonth")}
          </p>
        ) : (
          agenda.map(({ key, date, items: dayItems, annivs }) => {
            const dd = differenceInCalendarDays(date, new Date());
            const wd = t(WEEKDAY_KEYS[date.getDay()]);
            const dateLabel =
              locale === "ko"
                ? `${format(date, "M월 d일")} (${wd})`
                : `${wd}, ${format(date, "MMM d")}`;
            return (
              <div
                key={key}
                ref={(el) => {
                  sectionRefs.current[key] = el;
                }}
                className={`scroll-mt-2 ${
                  selected === key ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                }`}
              >
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                  <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {dateLabel}
                  </span>
                  {dd === 0 ? (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-500 dark:bg-red-950/40">
                      {t("calendar.today")}
                    </span>
                  ) : dd > 0 ? (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
                      D-{dd}
                    </span>
                  ) : null}
                </div>
                {annivs.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setEditingAnniversaryId(a.id)}
                    className="mx-4 mb-1 flex w-[calc(100%-2rem)] touch-manipulation items-center gap-2.5 rounded-xl bg-pink-50 px-3 py-2.5 text-left dark:bg-pink-950/30"
                  >
                    <span className="text-lg">{ANNIVERSARY_EMOJI[a.kind]}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-pink-700 dark:text-pink-300">
                      {a.title}
                    </span>
                    <span className="shrink-0 text-xs text-pink-400 dark:text-pink-500/80">
                      {anniversaryDateText(a, locale)}
                      {a.recurring ? ` · ${t("anniv.yearly")}` : ""}
                    </span>
                  </button>
                ))}
                {dayItems.length > 0 && (
                  <ul>
                    {dayItems.map((item) => (
                      <ItemRow key={item.id} item={item} />
                    ))}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
