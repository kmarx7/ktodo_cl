# 네이티브 앱 같은 모바일 UX — 설계

**날짜:** 2026-07-10
**브랜치:** `feature/native-mobile-ux`

## 목표

TodoCL은 이미 PWA 뼈대(manifest, 서비스워커, safe-area 패딩, 44px 탭 타겟)를 갖추고 있다. 이 작업은 그 위에 네이티브 앱의 손맛을 얹는다: 하단 탭바, 스와이프 제스처, 방향성 있는 화면 전환, 햅틱.

패키징(Capacitor)이나 오프라인 캐싱은 이 spec의 범위가 아니다.

## 결정 사항

| 항목 | 결정 |
|---|---|
| 하단 탭바 | 홈 / 캘린더 / 설정 3탭 |
| 탭바 노출 범위 | 탭 루트 3개 화면에만. 목록 화면에서는 숨김 |
| 왼쪽 스와이프 | 삭제 버튼 노출 → 버튼을 탭해야 삭제 |
| 삭제 후 | 5초짜리 "되돌리기" 토스트 |
| 오른쪽 스와이프 | 완료/해제 토글 |
| 화면 전환 | Next 16 `experimental.viewTransition` + React `<ViewTransition>` |
| 햅틱 | `navigator.vibrate()` (안드로이드 한정) |
| 새 의존성 | 없음 |
| 테스트 | 프레임워크 도입 없음. 모바일 뷰포트 브라우저 검증 |

## 1. 네비게이션 구조

목록 화면(`/todo`, `/topay`, `/tobuy`, `/tothink`)은 하단에 QuickAdd 입력창이 고정되어 있다. 여기에 탭바를 더하면 하단 바가 두 겹으로 쌓여 엄지 영역을 잠식한다. iOS 표준 규칙을 따른다 — **탭바는 탭 루트에만 보이고, 푸시된 화면에서는 숨는다.**

| 화면 | 하단 | 상단 |
|---|---|---|
| `/` | 탭바 | 제목 |
| `/calendar` | 탭바 | 제목 |
| `/settings` | 탭바 | 제목 |
| `/todo` `/topay` `/tobuy` `/tothink` | QuickAdd | 뒤로가기 + 제목 |

**새 파일:** `src/components/TabBar.tsx`

- `usePathname()`으로 경로를 읽어 `/`, `/calendar`, `/settings`에서만 렌더링. 그 외에는 `null`.
- `layout.tsx`의 `<main>` 아래, `<AlarmWatcher />` 위에 배치.
- 컨테이너: `pb-[max(env(safe-area-inset-bottom),0.5rem)]`, 상단 보더, `bg-white/95 backdrop-blur` (다크: `bg-neutral-950/95`).
- 각 탭: 세로 스택(아이콘 20px + 라벨 10px), `min-h-[44px]`, `touch-manipulation`, `flex-1`.
- 활성 탭은 `text-neutral-900 dark:text-white`, 비활성은 `text-neutral-400`.
- 아이콘: `Home`, `CalendarDays`, `Settings` (lucide-react, 이미 설치됨).

**변경:** `src/components/HeaderBar.tsx`

- 홈 헤더의 캘린더·설정 `<Link>` 두 개를 제거한다. 탭바가 그 역할을 가져간다.
- 홈 헤더는 제목만 남는다.
- 목록 화면의 뒤로가기 링크는 유지하고 `transitionTypes={['nav-back']}`를 추가한다 (섹션 4).

**i18n 키 추가:** `nav.home` (en: "Home", ko: "홈")

## 2. 스와이프 가능한 항목 행

`src/components/ItemRow.tsx` 안에서 직접 처리한다. 별도 래퍼 컴포넌트를 두면 열림 상태를 위로 끌어올려야 해서 오히려 복잡해진다.

### 동작

- **왼쪽으로 밈** — 행이 왼쪽으로 따라 밀리며 뒤에서 빨간 삭제 버튼(폭 80px)이 드러난다. 손을 떼면 열림(`-80px`) 또는 닫힘(`0`)으로 스냅한다. 임계값은 40px(버튼 폭의 절반). 열린 상태에서 삭제 버튼을 **탭해야** 실제로 삭제된다.
- **오른쪽으로 밈** — 60px를 넘긴 채로 손을 떼면 `toggleChecked`를 실행하고 행은 `0`으로 돌아온다. 미는 동안 뒤에서 초록 배경 + 체크 아이콘이 보인다.
- **한 번에 하나만 열림** — 열린 행의 id를 `ItemList`가 `useState`로 들고 있고 `ItemRow`에 `isOpen`과 `onOpenChange`를 내려준다. 다른 행을 열면 이전 행은 닫힌다. `ItemList`는 현재 서버 컴포넌트이므로 `"use client"`를 붙여야 한다.
- **열린 행의 본문을 탭하면** 닫힌다 (삭제되지 않는다).

### 구현

`onPointerDown` / `onPointerMove` / `onPointerUp` / `onPointerCancel`.

- 행 요소에 `touch-action: pan-y`를 주어 세로 스크롤 우선권을 브라우저에 넘긴다.
- 첫 8px 이동 시점에 방향을 판정한다. `|dx| > |dy|`이면 스와이프로 확정하고 그때부터 `setPointerCapture`로 포인터를 잡는다. 세로가 우세하면 제스처를 포기한다(스크롤에 양보).
- 드래그 중에는 `transform: translateX(dx)`를 직접 쓴다 (transition 없음). 손을 뗀 뒤 스냅할 때만 `transition: transform 200ms ease-out`.
- `checked` 상태에서도 오른쪽 스와이프는 동작한다(해제).

**제거:** 기존 휴지통 아이콘 버튼. 스와이프가 대신하고, 좁은 화면에서 44px를 돌려받는다.

## 3. 되돌리기

### store 변경 — `src/lib/store.ts`

```ts
interface ItemStore {
  items: Item[];
  lastDeleted: Item | null;
  // ...기존
  restoreLastDeleted: () => void;
  clearLastDeleted: () => void;
}
```

- `deleteItem(id)` — 삭제한 항목을 `lastDeleted`에 담는다.
- `restoreLastDeleted()` — `lastDeleted`가 있으면 `items`에 되돌리고 `lastDeleted`를 비운다.
- `clearLastDeleted()` — `lastDeleted`를 비운다.
- `persist` 옵션에 `partialize: (state) => ({ items: state.items })`를 추가해 `lastDeleted`를 저장에서 제외한다. 앱을 껐다 켰는데 5초짜리 토스트가 살아 있으면 안 된다.

복원된 항목은 `items` 맨 앞에 들어가지만 `ListPage`가 `createdAt` 내림차순으로 다시 정렬하므로 원래 자리로 돌아간다.

### 새 파일 — `src/components/UndoToast.tsx`

- `lastDeleted`를 구독한다. 값이 생기면 하단에 뜨고, `useEffect`의 5초 타이머가 끝나면 `clearLastDeleted()`를 호출해 사라진다.
- 항목이 바뀌면(연속 삭제) 타이머를 리셋한다.
- "되돌리기" 버튼 → `restoreLastDeleted()`.
- 배치: `ListPage` 안, `QuickAdd` 위. 목록 화면에만 존재한다.
- 진입은 아래에서 위로 슬라이드 + 페이드.

**i18n 키 추가:** `item.deleted` (en: "Deleted", ko: "삭제됨"), `item.undo` (en: "Undo", ko: "되돌리기")

## 4. 화면 전환

참고 문서: `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`

### `next.config.ts`

```ts
const nextConfig: NextConfig = {
  experimental: { viewTransition: true },
};
```

### 방향 태깅

- `HomeCards`의 카드 `<Link>` → `transitionTypes={['nav-forward']}`
- `HeaderBar`의 뒤로가기 `<Link>` → `transitionTypes={['nav-back']}`
- 탭바의 링크 → 태그 없음. 방향이 없으므로 기본 크로스페이드.

### `layout.tsx`

`<main>` 내용을 `<ViewTransition>`으로 감싼다:

```tsx
<ViewTransition
  enter={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'auto' }}
  exit={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'auto' }}
  default="auto"
>
  {children}
</ViewTransition>
```

`default: 'auto'`가 탭 간 이동의 크로스페이드를 담당한다. 문서 예시는 `default="none"`을 쓰지만 그건 페이지 안에 여러 `<ViewTransition>`이 있을 때 서로 간섭하지 않게 하려는 것이고, 여기서는 `<main>` 하나뿐이라 `auto`로 기본 크로스페이드를 얻는다. 구현 중 크로스페이드가 안 나오면 `none`으로 바꾸고 별도 크로스페이드 클래스를 지정한다.

### 고정 요소

헤더와 탭바에 `viewTransitionName`을 주고 애니메이션을 끈다. 전환 중 헤더가 같이 미끄러지면 공간 감각이 깨진다.

```css
::view-transition-group(site-header),
::view-transition-group(tab-bar) { animation: none; z-index: 100; }
::view-transition-old(site-header),
::view-transition-old(tab-bar) { display: none; }
::view-transition-new(site-header),
::view-transition-new(tab-bar) { animation: none; }
```

### 슬라이드 CSS — `globals.css`

문서의 타이밍을 그대로 쓴다: 오프셋 60px, exit 150ms, enter 210ms(150ms 지연), slide 400ms.

```css
::view-transition-old(.nav-forward) { --slide-offset: -60px; animation: 150ms ease-in both fade reverse, 400ms ease-in-out both slide reverse; }
::view-transition-new(.nav-forward) { --slide-offset: 60px;  animation: 210ms ease-out 150ms both fade, 400ms ease-in-out both slide; }
::view-transition-old(.nav-back)    { --slide-offset: 60px;  animation: 150ms ease-in both fade reverse, 400ms ease-in-out both slide reverse; }
::view-transition-new(.nav-back)    { --slide-offset: -60px; animation: 210ms ease-out 150ms both fade, 400ms ease-in-out both slide; }
```

### 접근성

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*), ::view-transition-new(*), ::view-transition-group(*) {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
  }
}
```

이 API는 Next 16에서 experimental이다. 미지원 브라우저에서는 애니메이션 없이 정상 동작한다.

## 5. 햅틱

### 새 파일 — `src/lib/haptics.ts`

```ts
export function tapFeedback(pattern: number | number[] = 10): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  navigator.vibrate(pattern);
}
```

호출 지점:

| 동작 | 길이 |
|---|---|
| 체크 토글 (탭 또는 오른쪽 스와이프) | 10ms |
| 스와이프가 삭제 버튼을 여는 순간 | 10ms |
| 삭제 확정 | 20ms |
| 항목 추가 | 10ms |

**한계:** iOS Safari는 `navigator.vibrate`를 지원하지 않는다. 안드로이드 Chrome에서만 실제로 진동한다. iOS용 우회 해킹은 신뢰할 수 없어 넣지 않는다. 이 항목은 안드로이드 한정 개선이다.

## 6. 곁다리 수정

`src/app/globals.css`의 `body { font-family: Arial, Helvetica, sans-serif; }`가 `layout.tsx`에서 로드한 Geist를 덮어쓰고 있다. `var(--font-geist-sans)`로 바꾼다.

## 검증

이 저장소에는 테스트 프레임워크가 없고, 이 작업은 거의 전부 제스처·애니메이션·터치 대응이라 단위 테스트로 잡히는 게 없다. 새 프레임워크를 도입하지 않기로 했다.

`npm run dev`로 띄우고 모바일 뷰포트(예: iPhone 12 Pro, 390×844)에서 다음을 직접 확인한다:

1. 홈·캘린더·설정에서 탭바가 보이고, 목록 화면에서는 사라진다.
2. 탭바가 홈 인디케이터에 가리지 않는다.
3. 항목을 왼쪽으로 밀면 삭제 버튼이 드러나고, 버튼을 탭해야 삭제된다.
4. 삭제 후 되돌리기 토스트가 뜨고, 누르면 항목이 원래 자리로 돌아온다.
5. 5초 뒤 토스트가 스스로 사라진다.
6. 항목을 오른쪽으로 밀면 완료 처리되고, 다시 밀면 해제된다.
7. 세로 스크롤이 스와이프에 막히지 않는다.
8. 열린 행이 있을 때 다른 행을 밀면 이전 행이 닫힌다.
9. 홈 → 목록은 왼쪽으로 슬라이드, 뒤로가기는 오른쪽으로 슬라이드. 헤더는 고정.
10. 탭 간 이동은 크로스페이드.
11. 폰트가 Arial이 아니라 Geist다.

`npm run build`와 `npm run lint`가 통과해야 한다.

## 파일 요약

**새 파일**
- `src/components/TabBar.tsx`
- `src/components/UndoToast.tsx`
- `src/lib/haptics.ts`

**변경**
- `next.config.ts` — `experimental.viewTransition`
- `src/app/layout.tsx` — `<ViewTransition>`, `<TabBar />`
- `src/app/globals.css` — 전환 CSS, 폰트 수정
- `src/components/HeaderBar.tsx` — 아이콘 제거, `transitionTypes`, `viewTransitionName`
- `src/components/HomeCards.tsx` — `transitionTypes`
- `src/components/ItemRow.tsx` — 스와이프, 휴지통 제거, 햅틱
- `src/components/ItemList.tsx` — 열린 행 id 상태
- `src/components/ListPage.tsx` — `<UndoToast />`
- `src/components/QuickAdd.tsx` — 추가 시 햅틱
- `src/lib/store.ts` — `lastDeleted`, `restoreLastDeleted`, `clearLastDeleted`, `partialize`
- `src/lib/i18n.ts` — `nav.home`, `item.deleted`, `item.undo`
