export type AnniversaryKind = "birthday" | "anniversary" | "memorial" | "etc";
export type CalKind = "solar" | "lunar";

export interface Anniversary {
  id: string;
  title: string;
  kind: AnniversaryKind;
  calendar: CalKind;
  /** month/day in the anniversary's own calendar (solar or lunar) */
  month: number;
  day: number;
  /** true = every year, false = one-time */
  recurring: boolean;
  /** required when recurring is false (the specific year, in its own calendar) */
  year: number | null;
  createdAt: number;
}

export const ANNIVERSARY_KINDS: AnniversaryKind[] = [
  "birthday",
  "anniversary",
  "memorial",
  "etc",
];

export const ANNIVERSARY_EMOJI: Record<AnniversaryKind, string> = {
  birthday: "🎂",
  anniversary: "🎉",
  memorial: "🌹",
  etc: "📌",
};
