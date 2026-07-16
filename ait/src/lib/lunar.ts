import solarlunar from "solarlunar";

// solarlunar is CJS; depending on interop the callable object may sit on `.default`.
const lib =
  (solarlunar as unknown as { default?: typeof solarlunar }).default ?? solarlunar;

export interface Lunar {
  month: number;
  day: number;
  isLeap: boolean;
}

/** Korean/Chinese lunar date for a given solar date (valid ~1900–2100). */
export function solarToLunar(date: Date): Lunar {
  const r = lib.solar2lunar(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return { month: r.lMonth, day: r.lDay, isLeap: r.isLeap };
}

/**
 * Compact cell label: the lunar day, but the 1st of a lunar month shows
 * "M.1" (with a 윤 prefix for a leap month) so month boundaries are visible.
 */
export function lunarCellLabel(date: Date): string {
  const { month, day, isLeap } = solarToLunar(date);
  return day === 1 ? `${isLeap ? "윤" : ""}${month}.${day}` : `${day}`;
}

/**
 * Solar Date for a given lunar month/day in a specific year (leap month ignored).
 * If the day doesn't exist that lunar month, clamps to the 29th.
 */
export function lunarToSolar(year: number, month: number, day: number): Date {
  const r = lib.lunar2solar(year, month, day, false);
  if (r) return new Date(r.cYear, r.cMonth - 1, r.cDay);
  const fallback = lib.lunar2solar(year, month, 29, false);
  if (fallback) return new Date(fallback.cYear, fallback.cMonth - 1, fallback.cDay);
  // Extremely unlikely; return the solar month/day as a last resort.
  return new Date(year, month - 1, Math.min(day, 28));
}
