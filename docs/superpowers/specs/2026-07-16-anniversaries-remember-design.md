# 기억할 것 (Anniversaries) — Design

**Date:** 2026-07-16
**Scope:** App-in-Toss web build (`ait/`), branch `feature/appsintoss-web-port`

## Problem / goal

Add a **기억할 것** feature: record birthdays, anniversaries, and memorial days
(생일 / 기념일 / 추도일 / 기타) in **solar or lunar** calendar, repeating **every
year** or **once**, and surface them so the user doesn't forget. Anniversary days
are highlighted on the Calendar. This is a **separate layer**, NOT a 5th to-do
category — the four categories (할 것/낼 것/살 것/생각할 것) stay intact.

Leverages the lunar support already added (`lib/lunar.ts` / `solarlunar`).

## Key decisions (from brainstorming)

- **Reminder mechanism:** a **Home-top "다가오는 기념일" banner**. Background push
  is impossible in this local-first app (App-in-Toss only offers server-template
  push, no local scheduled notifications), so reminders are in-app only. Banner
  shows anniversaries within **7 days + on the day** (fixed window), as D-day rows.
- **Management:** a **"🎂 기억할 것" entry point on the Calendar screen** → a manage
  screen (list + add). The Home banner rows also open it.
- **Types:** preset kinds with auto emoji — 🎂 생일 / 🎉 기념일 / 🕯 추도일 / 📌 기타.
- **Calendar highlight:** anniversary day number in **rose (#DB2777)**; the kind
  **emoji at the cell's top-LEFT** (the count badge stays top-RIGHT — no collision).
  Priority for the number style: selected (blue circle) > today (blue ring) >
  anniversary (rose) > weekend (red/blue) > normal.
- **Monetization:** free for now (`MONETIZATION_ENABLED = false`). Future premium
  candidate (esp. if real push is added with a backend) — not gated now.

## Data model — `lib/anniversaryStore.ts` (zustand + appStorage)

```ts
type AnniversaryKind = "birthday" | "anniversary" | "memorial" | "etc";
type CalKind = "solar" | "lunar";

interface Anniversary {
  id: string;
  title: string;          // "엄마 생신"
  kind: AnniversaryKind;  // emoji derived from this
  calendar: CalKind;      // solar | lunar
  month: number;          // 1–12, in its own calendar
  day: number;            // 1–31, in its own calendar
  recurring: boolean;     // true = every year, false = once
  year: number | null;    // required when recurring=false (the specific year)
  createdAt: number;
}
```

Store actions: `items`, `addAnniversary`, `updateAnniversary`, `removeAnniversary`.
Persisted under `todo-cl-anniversaries` via the async `appStorage` adapter, same
pattern as the item/settings stores.

## Occurrence logic — `lib/anniversary.ts`

Compute the **solar date** an anniversary lands on for a given year:

- **solar + recurring:** `new Date(year, month-1, day)`; if day is Feb 29 and the
  year is not a leap year, use Feb 28.
- **solar + once:** only in its stored `year`.
- **lunar + recurring:** `solarlunar.lunar2solar(year, month, day, false)` → solar
  date. If that lunar day doesn't exist that year (e.g. 30 in a 29-day month),
  clamp to the last valid day (29). Leap months are ignored (use the regular
  month) for v1.
- **lunar + once:** convert its stored (`year`, month, day) once → fixed solar date.

Helpers:
- `anniversariesForMonth(list, year, monthIndex): Map<yyyy-MM-dd, Anniversary[]>`
  — for calendar highlighting of the visible month.
- `upcomingAnniversaries(list, today, withinDays=7): { anniversary, date, dday }[]`
  — for the Home banner; sorted by date; `dday` = whole days from today (0 = 오늘).

All dates computed in local time. `solarlunar` valid range ~1900–2100 (acceptable).

## UI

- **`components/UpcomingAnniversaries.tsx`** — Home banner above `HomeCards`.
  Rows: `{emoji} {D-3 | 오늘} · {title} · {음/양 M.D}`. Hidden when none upcoming.
  Row tap → `go("remember")`.
- **`components/RememberScreen.tsx`** — the manage screen (`nav` screen
  `"remember"`). Header with back; list sorted by next upcoming; each row: emoji +
  title + `{양/음 M.D}` + 매년/1회 badge; tap → edit sheet. A "＋" adds a new one.
- **`components/AnniversaryEditSheet.tsx`** — bottom sheet (mirrors
  `EditItemSheet`): title input; kind chips (4); 달력 segmented (양력/음력); 월·일
  pickers; 반복 segmented (매년 / 1회만) + a year field when 1회. Save / Delete.
  Controlled by `uiStore.editingAnniversaryId` (`null` = closed, `"new"` = adding).
- **Calendar (`CalendarView`)**: add the "🎂 기억할 것" button (→ `go("remember")`);
  compute `anniversariesForMonth` and render, per cell, the kind emoji top-left +
  rose number when an anniversary falls there. In the selected-day list, show any
  anniversaries as a rose-tinted row above the to-do groups.

## Navigation & i18n

- `lib/nav.ts`: add `"remember"` to `Screen`. `RememberScreen` renders for it (its
  own header/back, not a tab). Home banner + calendar button navigate to it.
- i18n keys (en/ko): `remember.title` (기억할 것), `remember.add`, `remember.empty`,
  kind labels (`kind.birthday/anniversary/memorial/etc`), `anniv.solar`/`anniv.lunar`,
  `anniv.yearly`/`anniv.once`, `anniv.month`/`anniv.day`, `dday.today`, and a
  `dday.count` helper (`D-${n}` / Korean `D-${n}`). Emoji map lives in a small
  const, not i18n.

## Edge cases

- Lunar day that doesn't exist in a given year → clamp to last valid day.
- Feb 29 solar in a non-leap year → Feb 28.
- One-time anniversary in the past → excluded from the banner; still shown on the
  calendar for its own year only.
- Multiple anniversaries on one day → banner lists each; calendar shows the first
  emoji (or a small "+" if >1) top-left.
- Empty state on the manage screen → friendly prompt + add button.

## Out of scope (YAGNI)

Real background/scheduled push (needs a backend — future, possibly premium),
sharing, contact-book import, multiple reminder lead times per entry, notes/photos
per anniversary, non-Gregorian display beyond the lunar label.

## Verification

- `tsc --noEmit` + `vite build` pass.
- In-browser: add a lunar recurring birthday → appears on the correct solar day in
  the calendar (rose number + 🎂 top-left) and in the Home banner with the right
  D-day; a one-time anniversary shows only in its year; edit/delete work; the four
  category cards and their icons are unchanged.
