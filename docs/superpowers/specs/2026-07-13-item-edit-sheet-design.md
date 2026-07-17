# Item Edit Sheet — Design

**Date:** 2026-07-13
**Scope:** App-in-Toss web build (`ait/`), branch `feature/appsintoss-web-port`

## Problem

Items can be added, completed (checkbox), and deleted (swipe-left), but there
is no way to **edit** an existing item's title, amount, or due date/time.
Users want per-item editing in every category.

Note: the data layer already supports this — `useItemStore` exposes
`updateItem(id, patch: Partial<Item>)` (`src/lib/store.ts`). This is a
**UI-only** addition.

## Interaction

Coexists with existing gestures on `ItemRow`:

- **Tap item body** → open the edit sheet *(new)*
- Tap checkbox → toggle complete *(unchanged)*
- Swipe left → reveal delete button *(unchanged)*
- If the row's swipe drawer is open, a tap closes it and does **not** open the
  editor (avoids gesture conflict — matches current close-on-tap behavior).

## Edit sheet

A bottom sheet that slides up over a dimmed backdrop.

- **Fields** (prefilled from the item):
  - Title — text (always)
  - Amount — numeric, shown only for amount-bearing types
    (`ITEM_TYPE_HAS_AMOUNT[item.type]`, i.e. To Pay / To Buy)
  - Due date — `<input type="date">`
  - Due time — `<input type="time">`
- **Actions:** Delete (destructive, left) · Save (primary, right).
  Cancel via backdrop tap or Escape.
- **Save:** call `updateItem(id, patch)` with the edited fields, fire
  `tapFeedback`, close. If due date/time changed, also set `notified: false`
  so a premium reminder can re-fire.
- **Delete:** call `deleteItem(id)` and close — reuses the existing undo toast.

## Architecture & data flow

- `uiStore` gains `editingId: string | null` + `setEditingId` (sits alongside
  the existing `openRowId`/`setOpenRow`).
- `ItemRow` tap handler calls `setEditingId(item.id)`.
- New `EditItemSheet.tsx` is mounted once at the top level (`App.tsx`). It reads
  `editingId`, looks the item up in `useItemStore`, and renders the sheet when
  found. Because it is driven by the store, it works whether the tap came from a
  list screen or the calendar.
- If the item no longer exists (e.g. deleted), the sheet renders nothing and the
  id is cleared.

Flow: tap → `setEditingId(id)` → sheet opens with form state seeded from the
item → Save/Delete/Cancel → `setEditingId(null)`.

## i18n

Add `edit.title`, `edit.save`, `edit.cancel` (en/ko). Reuse existing
`quickAdd.*` placeholders (`itemName`, `amount`, `date`, `time`) and
`item.delete`.

## Accessibility / polish

- Focus the title input on open; Escape and backdrop tap close.
- Slide-up animation respects `prefers-reduced-motion` (like the undo toast).
- Role `dialog` with an accessible label.

## Out of scope (YAGNI)

Multi-select / bulk edit, drag-to-reorder, moving an item between categories.

## Verification

- `tsc --noEmit` + `vite build` pass.
- In-browser: tap an item → edit fields → Save reflects the change; Delete from
  the sheet removes it and shows the undo toast; edit works from both a list and
  the calendar.
