# 네이티브 앱 같은 모바일 UX — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** TodoCL에 하단 탭바, 스와이프 제스처(삭제 확인 + 되돌리기), 방향성 있는 화면 전환, 햅틱을 넣어 브라우저에서도 네이티브 앱처럼 느껴지게 만든다.

**Architecture:** 기존 Next.js App Router 구조를 유지한다. 탭바는 `layout.tsx`에 전역으로 놓고 `usePathname()`으로 탭 루트에서만 렌더링한다. 스와이프는 Pointer Events + CSS `transform`으로 `ItemRow` 안에서 직접 구현하고, 한 번에 한 행만 열리도록 저장하지 않는 zustand 스토어가 열린 행 id를 들고 있다. 화면 전환은 Next 16의 `experimental.viewTransition`과 React `<ViewTransition>`을 쓴다. 새 npm 패키지는 없다.

**Tech Stack:** Next.js 16.2.9 (App Router, Turbopack), React 19.2.4, TypeScript, Tailwind CSS v4, zustand 5 (persist), lucide-react, date-fns

**Spec:** `docs/superpowers/specs/2026-07-10-native-mobile-ux-design.md`

## Global Constraints

- **새 npm 의존성 금지.** `package.json`에 패키지를 추가하지 않는다.
- **테스트 프레임워크를 도입하지 않는다.** 이 저장소에는 테스트가 없고, 이 작업은 거의 전부 제스처·애니메이션이라 단위 테스트로 잡히는 게 없다. 각 태스크의 검증은 `npx tsc --noEmit`, `npm run lint`, 그리고 모바일 뷰포트 브라우저 확인이다.
- **작업 브랜치:** `feature/native-mobile-ux`. `main`에 직접 커밋하지 않는다.
- **참고 문서:** 화면 전환 API는 `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`를 따른다. 이 Next.js는 학습 데이터와 다를 수 있으므로 추측하지 말고 문서를 읽는다.
- **i18n:** 사용자에게 보이는 모든 문자열은 `src/lib/i18n.ts`의 `en`/`ko` 사전에 키로 넣는다. JSX에 하드코딩하지 않는다. `en`에 키를 추가하면 `ko`에도 반드시 추가해야 타입이 통과한다(`Dict` 타입이 강제한다).
- **터치 타겟 최소 44px.** 새로 만드는 모든 탭 가능한 요소에 적용한다.
- **safe-area:** 하단에 고정되는 요소는 `env(safe-area-inset-bottom)`을 반영한다.
- **다크 모드:** 모든 새 UI에 `dark:` 변형을 준다.
- **커밋 메시지:** 영어, 명령형. 끝에 `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` 붙인다.

## 파일 구조

| 파일 | 책임 |
|---|---|
| `src/lib/haptics.ts` (신규) | `navigator.vibrate` 래핑. 미지원 환경에서 안전하게 no-op |
| `src/lib/uiStore.ts` (신규) | 저장하지 않는 UI 상태. 현재는 열린 스와이프 행 id 하나 |
| `src/components/TabBar.tsx` (신규) | 하단 3탭 네비게이션. 탭 루트에서만 렌더 |
| `src/components/UndoToast.tsx` (신규) | 삭제 후 5초 되돌리기 토스트. 전역 |
| `src/lib/store.ts` | 아이템 CRUD + `lastDeleted` 보관 |
| `src/components/ItemRow.tsx` | 한 행의 표시 + 스와이프 제스처 |
| `src/app/layout.tsx` | 전역 셸: 헤더, 전환 래퍼, 탭바, 토스트 |
| `src/app/globals.css` | 폰트, view transition 키프레임 |

`ItemList.tsx`와 `ListPage.tsx`는 손대지 않는다. `ItemRow`가 열린 상태를 스토어에서 직접 읽으므로 프롭 드릴링이 없다.

## 태스크 순서

1. 곁다리 폰트 수정 (가장 작고 독립적)
2. `haptics.ts`
3. `store.ts` — `lastDeleted` + 복원
4. `uiStore.ts` + `ItemRow` 스와이프
5. `UndoToast.tsx`
6. `TabBar.tsx` + `HeaderBar` 정리
7. 화면 전환
8. 최종 브라우저 검증

각 태스크는 독립적으로 커밋하고, 앱은 매 커밋마다 동작해야 한다.

---

### Task 1: Geist 폰트 복구

`globals.css`의 `body` 규칙이 `layout.tsx`에서 로드한 Geist 폰트 변수를 Arial로 덮어쓰고 있다.

**Files:**
- Modify: `src/app/globals.css:22-26`

**Interfaces:**
- Consumes: 없음
- Produces: 없음

- [ ] **Step 1: `body` 규칙의 `font-family`를 바꾼다**

`src/app/globals.css`에서:

```css
body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

를 다음으로:

```css
body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist-sans), system-ui, sans-serif;
}
```

- [ ] **Step 2: 타입체크와 린트**

```bash
npx tsc --noEmit && npm run lint
```

Expected: 둘 다 에러 없이 종료.

- [ ] **Step 3: 브라우저에서 확인**

`npm run dev`가 이미 돌고 있지 않으면 띄운다. `http://localhost:3000`을 열고 devtools에서 `<body>`의 computed `font-family`가 `__Geist_...`로 시작하는지 본다. Arial이면 실패다.

- [ ] **Step 4: 커밋**

```bash
git add src/app/globals.css
git commit -m "$(cat <<'EOF'
Use the loaded Geist font instead of Arial

The body rule overrode the font variable set in layout.tsx.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: 햅틱 헬퍼

**Files:**
- Create: `src/lib/haptics.ts`

**Interfaces:**
- Consumes: 없음
- Produces: `tapFeedback(pattern?: number | number[]): void` — Task 4, 6에서 쓴다.

- [ ] **Step 1: `src/lib/haptics.ts`를 만든다**

```ts
/**
 * iOS Safari does not implement navigator.vibrate, so this is a no-op there.
 * Treat haptics as an Android-only enhancement, never as required feedback.
 */
export function tapFeedback(pattern: number | number[] = 10): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  navigator.vibrate(pattern);
}
```

주석은 이 파일의 유일한 주석이다. 코드가 스스로 말할 수 없는 제약(iOS 미지원)만 적었다.

- [ ] **Step 2: 타입체크와 린트**

```bash
npx tsc --noEmit && npm run lint
```

Expected: 에러 없음. 아직 아무도 `tapFeedback`을 쓰지 않지만 `export`이므로 미사용 경고는 나지 않는다.

- [ ] **Step 3: 커밋**

```bash
git add src/lib/haptics.ts
git commit -m "$(cat <<'EOF'
Add haptic feedback helper

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: store에 삭제 되돌리기 추가

**Files:**
- Modify: `src/lib/store.ts`

**Interfaces:**
- Consumes: `Item` (`src/types/item.ts`)
- Produces:
  - `useItemStore` 상태에 `lastDeleted: Item | null`
  - `restoreLastDeleted: () => void`
  - `clearLastDeleted: () => void`
  - `deleteItem(id: string)`의 동작 변경 — 삭제한 항목을 `lastDeleted`에 담는다

  Task 4(`ItemRow`)와 Task 5(`UndoToast`)가 이 이름들을 쓴다.

- [ ] **Step 1: `ItemStore` 인터페이스를 넓힌다**

`src/lib/store.ts`의 인터페이스를 다음으로 바꾼다:

```ts
interface ItemStore {
  items: Item[];
  lastDeleted: Item | null;
  addItem: (input: NewItemInput) => void;
  toggleChecked: (id: string) => void;
  deleteItem: (id: string) => void;
  restoreLastDeleted: () => void;
  clearLastDeleted: () => void;
  updateItem: (id: string, patch: Partial<Item>) => void;
  markNotified: (id: string) => void;
}
```

- [ ] **Step 2: 초기값과 액션을 구현한다**

`items: []` 바로 아래에 `lastDeleted: null,`을 넣는다.

`deleteItem`을 다음으로 교체한다:

```ts
      deleteItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          lastDeleted: state.items.find((item) => item.id === id) ?? null,
        })),
      restoreLastDeleted: () =>
        set((state) =>
          state.lastDeleted
            ? { items: [state.lastDeleted, ...state.items], lastDeleted: null }
            : state
        ),
      clearLastDeleted: () => set({ lastDeleted: null }),
```

- [ ] **Step 3: `lastDeleted`를 저장에서 제외한다**

`persist`의 옵션 객체를 다음으로 바꾼다:

```ts
    {
      name: "todo-cl-items",
      partialize: (state) => ({ items: state.items }),
    }
```

앱을 껐다 켰는데 5초짜리 되돌리기 토스트가 살아 있으면 안 된다.

- [ ] **Step 4: 타입체크와 린트**

```bash
npx tsc --noEmit && npm run lint
```

Expected: 에러 없음.

`partialize`가 `ItemStore`의 부분집합을 반환하므로 zustand의 `PersistOptions` 제네릭이 좁혀진다. 만약 타입 에러가 나면 `persist<ItemStore, [], [], Pick<ItemStore, "items">>`로 명시한다.

- [ ] **Step 5: 브라우저에서 확인**

`http://localhost:3000/todo`에서 항목을 하나 추가하고 휴지통 아이콘으로 삭제한다. devtools 콘솔에서:

```js
JSON.parse(localStorage.getItem("todo-cl-items")).state
```

Expected: `items` 키만 있고 `lastDeleted` 키는 없다.

- [ ] **Step 6: 커밋**

```bash
git add src/lib/store.ts
git commit -m "$(cat <<'EOF'
Keep the last deleted item so a delete can be undone

lastDeleted is excluded from persistence: a five-second undo
window must not survive a page reload.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: 스와이프 가능한 항목 행

이 계획에서 가장 큰 태스크다. `ItemRow`는 `ItemList`(목록 화면)와 `CalendarView`(캘린더 상세) 양쪽에서 쓰이므로, 두 부모를 모두 고치지 않으려면 열린 행 id를 스토어에 둬야 한다.

**Files:**
- Create: `src/lib/uiStore.ts`
- Modify: `src/components/ItemRow.tsx` (전면 재작성)
- Modify: `src/lib/i18n.ts` (키 추가)

**Interfaces:**
- Consumes: `tapFeedback` (Task 2), `useItemStore.deleteItem`/`toggleChecked` (Task 3)
- Produces:
  - `useUiStore` — `{ openRowId: string | null; setOpenRow: (id: string | null) => void }`
  - i18n 키 `item.deleted`, `item.undo` (Task 5가 쓴다)

- [ ] **Step 1: `src/lib/uiStore.ts`를 만든다**

```ts
import { create } from "zustand";

interface UiStore {
  openRowId: string | null;
  setOpenRow: (id: string | null) => void;
}

export const useUiStore = create<UiStore>()((set) => ({
  openRowId: null,
  setOpenRow: (id) => set({ openRowId: id }),
}));
```

`persist`를 쓰지 않는다. 새로고침하면 모든 행이 닫혀 있어야 한다.

- [ ] **Step 2: i18n 키를 추가한다**

`src/lib/i18n.ts`의 `en` 객체에서 `"item.delete": "Delete",` 아래에 넣는다:

```ts
  "item.deleted": "Deleted",
  "item.undo": "Undo",
```

`ko` 객체에서 `"item.delete": "삭제",` 아래에 넣는다:

```ts
  "item.deleted": "삭제됨",
  "item.undo": "되돌리기",
```

`ko`는 `Dict` 타입이라 `en`에만 넣으면 타입 에러가 난다. 둘 다 넣어야 한다.

- [ ] **Step 3: `ItemRow.tsx`를 재작성한다**

`src/components/ItemRow.tsx` 전체를 다음으로 바꾼다:

```tsx
"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import { Check, Trash2 } from "lucide-react";
import { useItemStore } from "@/lib/store";
import { useUiStore } from "@/lib/uiStore";
import { tapFeedback } from "@/lib/haptics";
import { formatCurrency } from "@/lib/parse";
import { useLocale, useT } from "@/lib/i18n";
import type { Item } from "@/types/item";

const DELETE_WIDTH = 80;
const OPEN_THRESHOLD = DELETE_WIDTH / 2;
const COMPLETE_THRESHOLD = 60;
const DIRECTION_LOCK = 8;

function formatDue(dueDate: string | null, dueTime: string | null, locale: "en" | "ko"): string | null {
  if (!dueDate) return null;
  const datePart = format(new Date(`${dueDate}T00:00`), locale === "ko" ? "M월 d일" : "MMM d");
  return dueTime ? `${datePart}, ${dueTime}` : datePart;
}

function isOverdue(dueDate: string | null, dueTime: string | null): boolean {
  if (!dueDate) return false;
  const due = new Date(`${dueDate}T${dueTime ?? "23:59"}`);
  return due.getTime() < Date.now();
}

export function ItemRow({ item }: { item: Item }) {
  const toggleChecked = useItemStore((state) => state.toggleChecked);
  const deleteItem = useItemStore((state) => state.deleteItem);
  const openRowId = useUiStore((state) => state.openRowId);
  const setOpenRow = useUiStore((state) => state.setOpenRow);
  const t = useT();
  const locale = useLocale();

  const isOpen = openRowId === item.id;
  const [dragX, setDragX] = useState<number | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const axis = useRef<"undecided" | "horizontal" | "vertical">("undecided");

  const due = formatDue(item.dueDate, item.dueTime, locale);
  const overdue = !item.checked && isOverdue(item.dueDate, item.dueTime);

  const restingX = isOpen ? -DELETE_WIDTH : 0;
  const offset = dragX ?? restingX;

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY };
    axis.current = "undecided";
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;

    if (axis.current === "undecided") {
      if (Math.abs(dx) < DIRECTION_LOCK && Math.abs(dy) < DIRECTION_LOCK) return;
      if (Math.abs(dy) >= Math.abs(dx)) {
        axis.current = "vertical";
        start.current = null;
        return;
      }
      axis.current = "horizontal";
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    const next = Math.max(-DELETE_WIDTH, Math.min(COMPLETE_THRESHOLD + 20, restingX + dx));
    setDragX(next);
  }

  function handlePointerUp() {
    if (!start.current || axis.current !== "horizontal" || dragX === null) {
      start.current = null;
      setDragX(null);
      return;
    }

    if (dragX >= COMPLETE_THRESHOLD) {
      toggleChecked(item.id);
      tapFeedback(10);
      setOpenRow(null);
    } else if (dragX <= -OPEN_THRESHOLD) {
      if (!isOpen) tapFeedback(10);
      setOpenRow(item.id);
    } else {
      setOpenRow(null);
    }

    start.current = null;
    axis.current = "undecided";
    setDragX(null);
  }

  function handleDelete() {
    tapFeedback(20);
    setOpenRow(null);
    deleteItem(item.id);
  }

  function handleCheckboxClick() {
    tapFeedback(10);
    toggleChecked(item.id);
  }

  return (
    <li className="relative overflow-hidden border-b border-neutral-100 dark:border-neutral-900">
      <div className="absolute inset-y-0 left-0 flex w-full items-center bg-emerald-500 pl-4 text-white">
        <Check size={20} />
      </div>

      <button
        type="button"
        onClick={handleDelete}
        aria-label={t("item.delete")}
        style={{ width: DELETE_WIDTH }}
        className="absolute inset-y-0 right-0 flex touch-manipulation items-center justify-center bg-red-500 text-white"
        tabIndex={isOpen ? 0 : -1}
      >
        <Trash2 size={18} />
      </button>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={() => isOpen && setOpenRow(null)}
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragX === null ? "transform 200ms ease-out" : "none",
          touchAction: "pan-y",
        }}
        className="relative flex items-center gap-2 bg-white pl-2 pr-3 dark:bg-neutral-950"
      >
        <button
          type="button"
          onClick={handleCheckboxClick}
          aria-label={item.checked ? t("item.uncheck") : t("item.check")}
          className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center"
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
              item.checked
                ? "border-neutral-900 bg-neutral-900 dark:border-white dark:bg-white"
                : "border-neutral-300 dark:border-neutral-700"
            }`}
          >
            {item.checked && (
              <svg viewBox="0 0 16 16" className="h-3 w-3 fill-white dark:fill-neutral-900">
                <path d="M6.5 11.5 3 8l1-1 2.5 2.5L12 4l1 1z" />
              </svg>
            )}
          </span>
        </button>

        <div className="min-w-0 flex-1 py-3">
          <p
            className={`truncate text-sm ${
              item.checked
                ? "text-neutral-400 line-through dark:text-neutral-600"
                : "text-neutral-900 dark:text-neutral-100"
            }`}
          >
            {item.title}
          </p>
          {due && (
            <p className={`text-xs ${overdue ? "text-red-500" : "text-neutral-400"}`}>{due}</p>
          )}
        </div>

        {item.amount !== null && (
          <span
            className={`shrink-0 pr-1 text-sm font-medium ${
              item.checked ? "text-neutral-300 line-through dark:text-neutral-700" : "text-neutral-700 dark:text-neutral-300"
            }`}
          >
            {formatCurrency(item.amount)}
          </span>
        )}
      </div>
    </li>
  );
}
```

핵심 세 가지:

1. `touchAction: "pan-y"`가 브라우저에 세로 스크롤 우선권을 준다. 첫 8px에서 세로가 우세하면 `start.current`를 버려 제스처를 포기한다.
2. 드래그 중에는 `transition: none`, 손을 뗀 뒤(`dragX === null`) 200ms 스냅.
3. 열린 행 id가 스토어에 있으므로 다른 행을 열면 이전 행은 자동으로 `restingX = 0`이 되어 닫힌다.

- [ ] **Step 4: 타입체크와 린트**

```bash
npx tsc --noEmit && npm run lint
```

Expected: 에러 없음.

- [ ] **Step 5: 브라우저에서 확인**

devtools를 모바일 에뮬레이션(iPhone 12 Pro, 390×844)으로 켜고 `http://localhost:3000/todo`에서 항목을 3개 이상 추가한 뒤:

1. 항목을 왼쪽으로 밀면 빨간 삭제 버튼이 드러난다.
2. 삭제 버튼을 탭해야 삭제된다. 미는 것만으로는 삭제되지 않는다.
3. 열린 행의 본문을 탭하면 닫힌다.
4. 다른 행을 밀면 이전 행이 닫힌다.
5. 항목을 오른쪽으로 밀면 체크된다. 다시 밀면 해제된다.
6. 목록을 세로로 스크롤할 수 있다 (스와이프가 스크롤을 막지 않는다).
7. `http://localhost:3000/calendar`에서 날짜를 눌러 나온 항목에도 같은 스와이프가 동작한다.

- [ ] **Step 6: 커밋**

```bash
git add src/lib/uiStore.ts src/components/ItemRow.tsx src/lib/i18n.ts
git commit -m "$(cat <<'EOF'
Add swipe gestures to item rows

Swipe left reveals a delete button that must be tapped; swipe
right toggles completion. Only one row can be open at a time,
tracked in a non-persisted store because ItemRow renders under
both ItemList and CalendarView.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: 되돌리기 토스트

**Files:**
- Create: `src/components/UndoToast.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `lastDeleted`, `restoreLastDeleted`, `clearLastDeleted` (Task 3), i18n 키 `item.deleted`/`item.undo` (Task 4)
- Produces: `<UndoToast />`

- [ ] **Step 1: `src/components/UndoToast.tsx`를 만든다**

```tsx
"use client";

import { useEffect } from "react";
import { useItemStore } from "@/lib/store";
import { useT } from "@/lib/i18n";

const UNDO_WINDOW_MS = 5000;

export function UndoToast() {
  const lastDeleted = useItemStore((state) => state.lastDeleted);
  const restoreLastDeleted = useItemStore((state) => state.restoreLastDeleted);
  const clearLastDeleted = useItemStore((state) => state.clearLastDeleted);
  const t = useT();

  const deletedId = lastDeleted?.id ?? null;

  useEffect(() => {
    if (!deletedId) return;
    const timer = setTimeout(clearLastDeleted, UNDO_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [deletedId, clearLastDeleted]);

  if (!lastDeleted) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex animate-[undo-in_200ms_ease-out] items-center gap-3 rounded-full bg-neutral-900 py-2 pl-4 pr-2 text-sm text-white shadow-lg dark:bg-white dark:text-neutral-900">
        <span className="truncate">{t("item.deleted")}</span>
        <button
          type="button"
          onClick={restoreLastDeleted}
          className="min-h-[36px] touch-manipulation rounded-full px-3 font-semibold text-emerald-400 active:bg-white/10 dark:text-emerald-600 dark:active:bg-black/10"
        >
          {t("item.undo")}
        </button>
      </div>
    </div>
  );
}
```

`deletedId`를 effect 의존성으로 쓰는 이유: 연속으로 삭제하면 `lastDeleted` 객체가 바뀌면서 타이머가 리셋되어야 한다. 객체 자체를 의존성으로 두면 매 렌더마다 재실행될 위험이 있다.

- [ ] **Step 2: 진입 애니메이션 키프레임을 추가한다**

`src/app/globals.css` 맨 아래에 붙인다:

```css
@keyframes undo-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] **Step 3: `layout.tsx`에 붙인다**

`src/app/layout.tsx`의 import에 추가:

```tsx
import { UndoToast } from "@/components/UndoToast";
```

`<main>` 바로 아래, `<AlarmWatcher />` 위에 넣는다:

```tsx
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        <UndoToast />
        <AlarmWatcher />
```

전역으로 두는 이유는 삭제가 목록 화면과 캘린더 상세 양쪽에서 일어나기 때문이다.

- [ ] **Step 4: 타입체크와 린트**

```bash
npx tsc --noEmit && npm run lint
```

Expected: 에러 없음.

- [ ] **Step 5: 브라우저에서 확인**

모바일 뷰포트, `http://localhost:3000/todo`:

1. 항목을 왼쪽으로 밀고 삭제 버튼을 탭하면 항목이 사라지고 하단에 토스트가 뜬다.
2. 토스트가 QuickAdd 입력창에 가리지 않는다.
3. "되돌리기"를 누르면 항목이 원래 자리(생성 시각 순서)로 돌아온다.
4. 아무것도 안 하면 5초 뒤 토스트가 사라진다.
5. 항목 A를 지우고 3초 뒤 항목 B를 지우면, 토스트 타이머가 리셋되어 B 삭제 시점부터 5초를 센다.
6. 토스트가 떠 있는 동안 새로고침하면 토스트는 사라지고 삭제는 유지된다.

- [ ] **Step 6: 커밋**

```bash
git add src/components/UndoToast.tsx src/app/layout.tsx src/app/globals.css
git commit -m "$(cat <<'EOF'
Add an undo toast after deleting an item

Mounted globally: deletes happen from both the list screens and
the calendar day detail.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: 하단 탭바

**Files:**
- Create: `src/components/TabBar.tsx`
- Modify: `src/components/HeaderBar.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/lib/i18n.ts`
- Modify: `src/components/QuickAdd.tsx`

**Interfaces:**
- Consumes: `tapFeedback` (Task 2)
- Produces: `<TabBar />`, i18n 키 `nav.home`

- [ ] **Step 1: i18n 키 `nav.home`을 추가한다**

`src/lib/i18n.ts`의 `en`에서 `"nav.calendar": "Calendar",` 위에 넣는다:

```ts
  "nav.home": "Home",
```

`ko`에서 `"nav.calendar": "캘린더",` 위에 넣는다:

```ts
  "nav.home": "홈",
```

- [ ] **Step 2: `src/components/TabBar.tsx`를 만든다**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Settings } from "lucide-react";
import { useT, type TranslationKey } from "@/lib/i18n";

const TABS: { href: string; icon: typeof Home; labelKey: TranslationKey }[] = [
  { href: "/", icon: Home, labelKey: "nav.home" },
  { href: "/calendar", icon: CalendarDays, labelKey: "nav.calendar" },
  { href: "/settings", icon: Settings, labelKey: "nav.settings" },
];

const TAB_ROOTS = TABS.map((tab) => tab.href);

export function TabBar() {
  const pathname = usePathname();
  const t = useT();

  if (!pathname || !TAB_ROOTS.includes(pathname)) return null;

  return (
    <nav
      style={{ viewTransitionName: "tab-bar" }}
      className="flex shrink-0 border-t border-neutral-200 bg-white/95 pb-[max(env(safe-area-inset-bottom),0.5rem)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95"
    >
      {TABS.map(({ href, icon: Icon, labelKey }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[44px] flex-1 touch-manipulation flex-col items-center justify-center gap-0.5 pt-2 ${
              active
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-400 dark:text-neutral-500"
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{t(labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```

`viewTransitionName: "tab-bar"`는 Task 7에서 전환 중 탭바를 고정하는 데 쓴다. 지금 넣어두면 Task 7이 CSS만 추가하면 된다.

`TranslationKey`는 `src/lib/i18n.ts`가 이미 export하고 있다.

- [ ] **Step 3: `HeaderBar`에서 아이콘 링크를 걷어낸다**

`src/components/HeaderBar.tsx`의 홈 분기를 다음으로 바꾼다. 캘린더·설정으로 가는 두 `<Link>`는 탭바가 대신하므로 지운다:

```tsx
  if (pathname === "/") {
    return (
      <header
        style={{ viewTransitionName: "site-header" }}
        className="flex shrink-0 items-center justify-between px-4 py-3 pt-[max(env(safe-area-inset-top),0.75rem)]"
      >
        <h1 className="text-base font-bold">{t("app.name")}</h1>
      </header>
    );
  }
```

이제 `CalendarDays`와 `Settings` import가 쓰이지 않는다. import 줄을 다음으로 줄인다:

```tsx
import { ChevronLeft } from "lucide-react";
```

두 번째 분기의 `<header>`에도 같은 `style`을 준다:

```tsx
    <header
      style={{ viewTransitionName: "site-header" }}
      className="flex shrink-0 items-center gap-2 px-2 py-3 pt-[max(env(safe-area-inset-top),0.75rem)]"
    >
```

- [ ] **Step 4: `layout.tsx`에 탭바를 붙인다**

import 추가:

```tsx
import { TabBar } from "@/components/TabBar";
```

`<UndoToast />` 아래에 넣는다:

```tsx
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        <TabBar />
        <UndoToast />
        <AlarmWatcher />
```

- [ ] **Step 5: QuickAdd에 햅틱을 넣는다**

`src/components/QuickAdd.tsx`의 import에 추가:

```tsx
import { tapFeedback } from "@/lib/haptics";
```

`handleSubmit` 안에서 `addItem({...})` 호출 바로 뒤에 넣는다:

```tsx
    tapFeedback(10);
```

- [ ] **Step 6: 타입체크와 린트**

```bash
npx tsc --noEmit && npm run lint
```

Expected: 에러 없음. `HeaderBar`에서 지운 import를 남겨두면 `@typescript-eslint/no-unused-vars`가 잡는다.

- [ ] **Step 7: 브라우저에서 확인**

모바일 뷰포트(iPhone 12 Pro, 390×844):

1. `/`, `/calendar`, `/settings`에서 하단 탭바가 보인다.
2. `/todo`, `/topay`, `/tobuy`, `/tothink`에서는 탭바가 없고 QuickAdd만 하단에 있다.
3. 현재 탭이 색으로 구분된다.
4. 홈 헤더에 캘린더·설정 아이콘이 더는 없다.
5. devtools 기기 프레임에서 탭바가 홈 인디케이터 영역에 가리지 않는다.
6. `/calendar`에서 항목 목록이 탭바에 가리지 않는지 본다. 가린다면 `CalendarView.tsx:137`의 `pb-[env(safe-area-inset-bottom)]`은 탭바 높이를 모르므로, 탭바가 `layout.tsx`의 flex 컬럼에서 자리를 차지하는지 확인한다 (`<main>`이 `flex-1`, 탭바가 `shrink-0`이므로 겹치지 않아야 한다).

- [ ] **Step 8: 커밋**

```bash
git add src/components/TabBar.tsx src/components/HeaderBar.tsx src/app/layout.tsx src/lib/i18n.ts src/components/QuickAdd.tsx
git commit -m "$(cat <<'EOF'
Add a bottom tab bar for Home, Calendar, and Settings

The bar shows only on tab roots. List screens keep QuickAdd
pinned to the bottom instead, so the two never stack.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: 방향성 있는 화면 전환

**시작 전에 반드시 읽는다:** `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`. 이 Next.js 버전은 학습 데이터와 다르다.

**Files:**
- Modify: `next.config.ts`
- Create: `src/types/react-view-transition.d.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/components/HomeCards.tsx`
- Modify: `src/components/HeaderBar.tsx`

**Interfaces:**
- Consumes: `viewTransitionName: "site-header"` (Task 6), `viewTransitionName: "tab-bar"` (Task 6)
- Produces: 없음

**사전 확인 결과 (계획 작성 시 검증됨):**
- Next의 번들 React(`next/dist/compiled/react`)는 `ViewTransition`을 export한다(`unstable_` 접두사 없음). 앱 코드에서 `import { ViewTransition } from "react"`를 쓰면 Next이 빌드 시 컴파일된 React로 별칭 처리하므로 **런타임은 동작한다**.
- 하지만 설치된 `@types/react` 19.2.17에는 `ViewTransition` 타입이 없다. 그대로 두면 `npx tsc --noEmit`이 `Module '"react"' has no exported member 'ViewTransition'`로 실패한다. Step 2에서 타입 선언으로 메운다.
- `<Link>`의 `transitionTypes?: string[]` 프롭은 이 Next 버전에 존재한다(`node_modules/next/dist/client/link.d.ts:102`). 별도 처리 불필요.

- [ ] **Step 1: `next.config.ts`에서 플래그를 켠다**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
```

- [ ] **Step 2: `ViewTransition` 타입을 보강한다**

`@types/react` 19.2.17에는 `ViewTransition`이 없으므로 선언을 추가한다. `src/types/react-view-transition.d.ts`를 만든다:

```ts
import "react";

declare module "react" {
  interface ViewTransitionProps {
    children?: React.ReactNode;
    name?: string;
    default?: string;
    enter?: string | Record<string, string>;
    exit?: string | Record<string, string>;
    share?: string;
    update?: string;
  }
  export const ViewTransition: React.FC<ViewTransitionProps>;
}
```

이 프롭 이름들은 참고 문서(`view-transitions.md`)의 예시에서 그대로 가져왔다. 런타임 export는 이미 확인했으므로(계획 헤더 참고) 이 선언은 타입만 채운다.

- [ ] **Step 3: `layout.tsx`의 `<main>` 내용을 `<ViewTransition>`으로 감싼다**

import 추가 (React에서 직접 가져온다. Next이 컴파일된 React로 별칭 처리한다):

```tsx
import { ViewTransition } from "react";
```

`<main>`을 다음으로 바꾼다:

```tsx
        <main className="flex min-h-0 flex-1 flex-col">
          <ViewTransition
            enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "auto" }}
            exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "auto" }}
            default="auto"
          >
            {children}
          </ViewTransition>
        </main>
```

`default: "auto"`가 탭 간 이동(방향 없음)의 크로스페이드를 담당한다. 크로스페이드가 나오지 않으면 `default`를 `"none"`으로 바꾸고 명시적 크로스페이드 클래스를 지정한다.

- [ ] **Step 4: 홈 카드 링크에 방향을 태깅한다**

`src/components/HomeCards.tsx`의 `<Link>`에 `transitionTypes`를 추가한다:

```tsx
          <Link
            key={type}
            href={href}
            transitionTypes={["nav-forward"]}
            className={`flex min-h-[132px] touch-manipulation flex-col justify-between rounded-3xl p-4 active:scale-[0.97] transition-transform ${theme.cardBg}`}
          >
```

- [ ] **Step 5: 뒤로가기 링크에 방향을 태깅한다**

`src/components/HeaderBar.tsx`의 두 번째 분기에 있는 홈으로 가는 `<Link>`에 추가한다:

```tsx
      <Link
        href="/"
        transitionTypes={["nav-back"]}
        aria-label={t("nav.backHome")}
        className="touch-manipulation rounded-full p-2 text-neutral-500 active:bg-neutral-100 dark:text-neutral-400 dark:active:bg-neutral-900"
      >
```

탭바의 링크에는 `transitionTypes`를 주지 않는다. 탭 간 이동에는 앞/뒤 방향이 없다.

- [ ] **Step 6: 전환 CSS를 `globals.css`에 추가한다**

`@keyframes undo-in` 아래에 붙인다:

```css
::view-transition-old(.nav-forward) {
  --slide-offset: -60px;
  animation:
    150ms ease-in both vt-fade reverse,
    400ms ease-in-out both vt-slide reverse;
}
::view-transition-new(.nav-forward) {
  --slide-offset: 60px;
  animation:
    210ms ease-out 150ms both vt-fade,
    400ms ease-in-out both vt-slide;
}
::view-transition-old(.nav-back) {
  --slide-offset: 60px;
  animation:
    150ms ease-in both vt-fade reverse,
    400ms ease-in-out both vt-slide reverse;
}
::view-transition-new(.nav-back) {
  --slide-offset: -60px;
  animation:
    210ms ease-out 150ms both vt-fade,
    400ms ease-in-out both vt-slide;
}

@keyframes vt-fade {
  from {
    opacity: 0;
    filter: blur(3px);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
}
@keyframes vt-slide {
  from {
    translate: var(--slide-offset);
  }
  to {
    translate: 0;
  }
}

::view-transition-group(site-header),
::view-transition-group(tab-bar) {
  animation: none;
  z-index: 100;
}
::view-transition-old(site-header),
::view-transition-old(tab-bar) {
  display: none;
}
::view-transition-new(site-header),
::view-transition-new(tab-bar) {
  animation: none;
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*),
  ::view-transition-group(*) {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
  }
}
```

키프레임 이름을 `vt-fade`/`vt-slide`로 접두사를 붙인 이유: `undo-in`과 같은 전역 이름공간을 쓰므로 `fade`/`slide` 같은 흔한 이름은 나중에 충돌한다.

헤더와 탭바를 고정하는 이유: 전환 중 헤더가 같이 미끄러지면 사용자가 붙잡을 공간적 기준점이 사라진다.

- [ ] **Step 7: 타입체크와 린트**

```bash
npx tsc --noEmit && npm run lint
```

Expected: 에러 없음. Step 2의 타입 선언 덕분에 `ViewTransition` import가 통과한다. 그래도 `Module '"react"' has no exported member 'ViewTransition'`이 나오면 Step 2의 d.ts가 `tsconfig.json`의 `include`에 잡히는지 확인한다(`src/**/*.ts`이면 잡힌다).

- [ ] **Step 8: 개발 서버를 재시작한다**

`next.config.ts`는 핫리로드되지 않는다.

```bash
npm run dev
```

- [ ] **Step 9: 브라우저에서 확인**

Chrome(View Transitions API 지원), 모바일 뷰포트:

1. 홈에서 카드를 누르면 새 화면이 오른쪽에서 왼쪽으로 슬라이드해 들어온다.
2. 뒤로가기 화살표를 누르면 반대 방향으로 슬라이드한다.
3. 전환 중 헤더가 움직이지 않는다.
4. 홈 ↔ 캘린더 ↔ 설정 탭 이동은 슬라이드가 아니라 크로스페이드다.
5. 전환 중 탭바가 움직이지 않는다.
6. devtools > Rendering > "Emulate CSS prefers-reduced-motion: reduce"를 켜면 애니메이션 없이 즉시 전환된다.
7. Safari에서 열어 애니메이션이 없어도 앱이 정상 동작하는지 본다 (문서 43행: 미지원 시 애니메이션만 빠진다).

- [ ] **Step 10: 커밋**

```bash
git add next.config.ts src/types/react-view-transition.d.ts src/app/layout.tsx src/app/globals.css src/components/HomeCards.tsx src/components/HeaderBar.tsx
git commit -m "$(cat <<'EOF'
Add directional view transitions between screens

Home to list slides forward, back arrow slides back, tab
switches crossfade. The header and tab bar stay pinned so the
user keeps a spatial anchor.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: 최종 검증

**Files:** 없음 (검증만)

**Interfaces:**
- Consumes: Task 1–7 전부
- Produces: 없음

- [ ] **Step 1: 프로덕션 빌드가 통과하는지 본다**

```bash
npm run build
```

Expected: 에러 없이 완료. `experimental.viewTransition`에 대한 경고는 나올 수 있고 정상이다.

- [ ] **Step 2: 린트**

```bash
npm run lint
```

Expected: 에러 없음.

- [ ] **Step 3: spec의 검증 목록 11개를 전부 훑는다**

`docs/superpowers/specs/2026-07-10-native-mobile-ux-design.md`의 "검증" 절에 있는 11개 항목을 모바일 뷰포트에서 하나씩 확인한다. 실패하는 항목이 있으면 고치고, 무엇이 실패했는지 보고한다.

- [ ] **Step 4: 좁은 화면에서 깨지지 않는지 본다**

devtools에서 iPhone SE(375×667)로 바꾸고 `/topay`를 연다. 금액이 있는 항목의 제목이 잘리되 레이아웃이 깨지지 않아야 한다. 스와이프도 동일하게 동작해야 한다.

- [ ] **Step 5: 발견한 문제를 보고한다**

여기서 통과하지 못한 항목이 있으면 숨기지 말고 무엇이 왜 실패했는지 그대로 보고한다.

---

## 커버리지 확인

| Spec 절 | 태스크 |
|---|---|
| 1. 네비게이션 구조 | Task 6 |
| 2. 스와이프 가능한 항목 행 | Task 4 |
| 3. 되돌리기 (store) | Task 3 |
| 3. 되돌리기 (토스트) | Task 5 |
| 4. 화면 전환 | Task 7 |
| 5. 햅틱 | Task 2 (헬퍼), Task 4 (체크·스와이프·삭제), Task 6 (추가) |
| 6. 곁다리 폰트 수정 | Task 1 |
| 검증 | Task 8 |
