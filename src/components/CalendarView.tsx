"use client";

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
import type { Item, ItemType } from "@/types/item";
import { ItemRow } from "./ItemRow";

const TYPE_DOT: Record<ItemType, string> = {
  todo: "bg-blue-500",
  tobuy: "bg-emerald-500",
  topay: "bg-orange-500",
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

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
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState(() => format(new Date(), "yyyy-MM-dd"));

  const byDate = useMemo(() => groupByDate(items), [items]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const selectedItems = byDate.get(selected) ?? [];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between px-4 py-3">
        <button type="button" onClick={() => setMonth((m) => subMonths(m, 1))} aria-label="이전 달">
          <ChevronLeft size={20} />
        </button>
        <p className="text-sm font-semibold">{format(month, "yyyy년 M월")}</p>
        <button type="button" onClick={() => setMonth((m) => addMonths(m, 1))} aria-label="다음 달">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid shrink-0 grid-cols-7 px-2 text-center text-[11px] text-neutral-400">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1">
            {day}
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
              className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-xs ${
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
                  <span key={type} className={`h-1.5 w-1.5 rounded-full ${TYPE_DOT[type]}`} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto border-t border-neutral-100 dark:border-neutral-900">
        {selectedItems.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-neutral-400">이 날에는 일정이 없어요</p>
        ) : (
          <ul>
            {selectedItems.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
