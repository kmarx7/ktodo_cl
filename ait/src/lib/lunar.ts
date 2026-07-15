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
