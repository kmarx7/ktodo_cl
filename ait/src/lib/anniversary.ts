import {
  addDays,
  differenceInCalendarDays,
  endOfDay,
  format,
  isWithinInterval,
  startOfDay,
} from "date-fns";
import { lunarToSolar } from "@/lib/lunar";
import type { Anniversary } from "@/types/anniversary";

function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

/** Short date label in the anniversary's own calendar, e.g. "음 3.15" / "Lunar 3/15". */
export function anniversaryDateText(
  a: Pick<Anniversary, "calendar" | "month" | "day">,
  locale: "en" | "ko"
): string {
  const md = locale === "ko" ? `${a.month}.${a.day}` : `${a.month}/${a.day}`;
  const prefix = a.calendar === "lunar" ? (locale === "ko" ? "음 " : "Lunar ") : "";
  return prefix + md;
}

/** The solar Date this anniversary lands on within a given solar year. */
function occurrenceForSolarYear(a: Anniversary, solarYear: number): Date {
  if (a.calendar === "solar") {
    const day = a.month === 2 && a.day === 29 && !isLeapYear(solarYear) ? 28 : a.day;
    return new Date(solarYear, a.month - 1, day);
  }
  return lunarToSolar(solarYear, a.month, a.day);
}

export interface Occurrence {
  anniversary: Anniversary;
  date: Date;
}

/** All anniversary occurrences whose solar date falls within [start, end]. */
export function anniversaryOccurrences(
  list: Anniversary[],
  start: Date,
  end: Date
): Occurrence[] {
  const interval = { start: startOfDay(start), end: endOfDay(end) };
  const result: Occurrence[] = [];
  for (const a of list) {
    const candidates: Date[] = [];
    if (a.recurring) {
      for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
        candidates.push(occurrenceForSolarYear(a, y));
      }
    } else {
      const year = a.year ?? start.getFullYear();
      candidates.push(occurrenceForSolarYear(a, year));
    }
    for (const date of candidates) {
      if (isWithinInterval(date, interval)) result.push({ anniversary: a, date });
    }
  }
  return result;
}

/** Map of yyyy-MM-dd → anniversaries, for highlighting a calendar range. */
export function anniversariesByDate(
  list: Anniversary[],
  start: Date,
  end: Date
): Map<string, Anniversary[]> {
  const map = new Map<string, Anniversary[]>();
  for (const { anniversary, date } of anniversaryOccurrences(list, start, end)) {
    const key = format(date, "yyyy-MM-dd");
    const arr = map.get(key) ?? [];
    arr.push(anniversary);
    map.set(key, arr);
  }
  return map;
}

export interface UpcomingAnniversary extends Occurrence {
  /** whole days from today (0 = today) */
  dday: number;
}

/** Upcoming anniversaries within the next `withinDays` days (incl. today). */
export function upcomingAnniversaries(
  list: Anniversary[],
  today: Date,
  withinDays = 7
): UpcomingAnniversary[] {
  const start = startOfDay(today);
  const end = addDays(start, withinDays);
  return anniversaryOccurrences(list, start, end)
    .map(({ anniversary, date }) => ({
      anniversary,
      date,
      dday: differenceInCalendarDays(date, start),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}
