# TodoCL 로드맵 — 로컬 우선 · 앱인토스 수익화

작성: 2026-07-11 · 대상 채널: **앱인토스(App-in-Toss)** 미니앱

## 확정된 제약 (바꾸지 않음)

- **네 카테고리 이름 고정**: To Do / To Pay / To Buy / To Think (할 일 / 낼 돈 / 살 것 / 생각할 것). 이름·번역·병합 금지.
- **로컬 우선**: 모든 데이터는 기기의 로컬 저장소에. 백엔드 DB·계정·기기 간 동기화 없음.
- **배포·수익화 채널**: 앱인토스 미니앱.

## 확정된 방향 (2026-07-11)

- **수익화: 일회성 인앱결제(프리미엄 잠금 해제).**
- 따라서 **네이티브(React Native) 트랙**으로 간다 (인앱결제는 웹 트랙에서 불가).
- **재사용**: 데이터 모델/타입, 비즈니스 로직(파싱·알람·스토어 리듀서), i18n 문자열, 네 카테고리 이름.
- **재작성**: 모든 UI/화면, 제스처(스와이프), 네비게이션(granite 라우터), 저장(zustand-persist/localStorage → 프레임워크 `Storage` API), 화면 전환.
- 지금까지 만든 커스텀 웹 UI(하단 탭바·스와이프·ViewTransition)는 **그대로 이식되지 않음** — RN으로 다시 짓는다. 참고 레퍼런스는 공식 `with-in-app-purchase`(RN) + `weekly-todo-react`(UX 흐름).

## ⚠️ 실측 정정 (2026-07-11, `create-ait-app` 스캐폴드 직접 생성 — 후보 B/2a 수행)

**이전 결론("인앱결제는 네이티브 RN 트랙 전용, 웹 트랙은 IAP 불가")은 틀렸다.** 공식 스캐폴더 `create-ait-app@0.1.3`을 실제로 돌려 확인한 현재 사실:

- `npx create-ait-app <name> --template react-ts --tds --sample iap` 이 만드는 것은 **Vite + React 18 + TypeScript 웹앱**이다 (granite/react-native 골격이 아님). 메모리의 RN 스켈레톤은 구버전 — 현재 툴링은 웹 프레임워크로 통합됐다.
- 핵심 의존성 **`@apps-in-toss/web-framework@2.10.5`** 하나가 `@apps-in-toss/web-bridge`를 re-export하며 아래를 전부 제공한다:
  - **IAP(일회성 + 구독 둘 다)**: `IAP.getProductItemList()`, `IAP.createOneTimePurchaseOrder({ options:{ sku, processProductGrant }, onEvent, onError })`, `IAP.getPendingOrders()`, `IAP.completeProductGrant()`.
  - **영속 저장 `Storage`** (async): `getItem→Promise<string|null>`, `setItem`, `removeItem`, `clearItems`. → zustand `persist`의 async storage 어댑터로 그대로 꽂힌다.
  - **광고** `GoogleAdMob` / `TossAds`(배너·전면), 알림 동의, 카메라, 클립보드, 위치, safe-area, 리뷰 요청 등.
- UI는 **TDS 모바일**: `@toss/tds-mobile`(`Top`, `Button`, `List`, `ListRow`, `Result`, `Text`, `Asset`…), `@toss/tds-mobile-ait`(`TDSMobileAITProvider`), `@toss/tds-colors`.
- 스크립트: `granite dev`(내부적으로 `vite dev`), `ait build`, `ait deploy`. 설정은 `granite.config.ts`의 `defineConfig({ appName, brand, web:{ commands }, permissions, outdir })`.
- 스캐폴드 라우팅은 파일 기반 라우터가 아니라 `App.tsx`의 단순 `useState` 페이지 스위칭(예제 수준). 라우팅은 우리가 자유롭게 선택.
- ⚠️ 툴링 engine 요구가 **Node ≥ 24** (`@apps-in-toss/ait-format`). 현재 v22.22.3에서 스캐폴드/설치는 됐지만 EBADENGINE 경고. 빌드·배포 전 Node 24로 올릴 것.

### 결과: 트랙 결정 재검토 필요
- **네이티브(RN) 전면 재작성은 더 이상 IAP의 전제조건이 아니다.** 웹 프레임워크 트랙에서 일회성 IAP가 된다.
- 따라서 **큰 작업(RN 재작성) → 작은 작업(웹앱 이식)** 으로 스코프가 크게 준다: 기존 React 컴포넌트 대부분 유지, 바꾸는 건 (1) 라우팅(Next App Router → Vite/클라이언트 라우팅), (2) 저장(zustand-persist/localStorage → `Storage` async 어댑터, 인터페이스 동일), (3) 일부 UI를 TDS로 교체(카테고리 이름은 유지), (4) `granite.config.ts` + IAP 훅 연결.
- 아래 "확정된 방향"과 "표준 방식 확인" 표의 IAP 행은 이 정정으로 대체됨.

## 앱인토스 사실 확인 (공식 문서, 2026-07-11 기준)

출처: [앱인토스 개발자센터](https://developers-apps-in-toss.toss.im/), [FAQ](https://developers-apps-in-toss.toss.im/faq.html), [앱인토스 소개](https://toss.im/apps-in-toss), [공식 예제](https://github.com/toss/apps-in-toss-examples)

- **기술 스택**: WebView 기반 웹앱을 지원한다. 기존 React/Next.js/Vue 웹앱을 **이식(port)** 할 수 있고, WebView에서 일반 웹 API 사용은 제한하지 않는다. 단 **TDS(Toss Design System) SDK 의존성 설치가 필요**하고, 스캐폴더 `npx create-ait-app`이 제공된다. (React Native 기반 경로도 별도로 존재)
- **로컬 저장 주의**: "앱 데이터는 앱 삭제 시 삭제됨. 영구 보관은 백엔드 서버 연동 필요." → localStorage는 세션 간엔 유지되지만 삭제/초기화 시 사라지고 클라우드 백업·기기 간 이동은 없다.
- **사업자 등록(사업자 등록)**: 앱 출시 자체엔 필수 아님. 단 **수익화 기능(인앱 결제, 토스페이, 인앱 광고, 토스 로그인, 프로모션, 비즈월렛)에는 필수.** 처리 ~1영업일.
- **심사·출시 절차**: 콘솔 가입 → 워크스페이스 생성 → (수익화 시) 사업자 등록 → 앱 등록(로고·이름·카테고리·고객센터) → 심사 요청. **비게임 심사 리드타임 약 1~3개월**, 앱 등록 심사 1~2영업일, 출시 심사 3~5영업일.
- **수익화 옵션 / 수수료**: 인앱 광고(전면·보상형, 광고수익 15% 수수료), 인앱 결제(품목당 ₩400~₩1,400,000; 5% 플랫폼 + 15~30% 앱스토어 수수료), 토스페이, 프로모션 푸시(건당 ₩9.9). 현재 별도 플랫폼 입점료는 없음.

## 표준 방식 확인 — 웹 vs 네이티브 두 갈래 (공식 예제 실측, 2026-07-11)

출처: [공식 예제 레포](https://github.com/toss/apps-in-toss-examples) 각 예제의 package.json·README 태그.

앱인토스 미니앱은 **두 가지 빌드 트랙**으로 나뉜다. "보통" 하나로 정해진 게 아니라, 쓰려는 기능이 트랙을 강제한다.

| | 웹(WebView) 트랙 | 네이티브(React Native) 트랙 |
|---|---|---|
| 패키지 | `@apps-in-toss/web-framework` + `react-dom` + rsbuild | `@apps-in-toss/framework` + `@granite-js/react-native` + `react-native` 0.72 + `@toss/tds-react-native` |
| 도구 | `granite dev/build`, `ait deploy` | `granite dev/build` |
| UI | HTML/CSS/React (웹) — 기존 웹앱 이식 가능 | React Native 컴포넌트 (재작성 필요) |
| 로컬 저장 | 프레임워크 `Storage.getItem/setItem`(async) 권장, 일반 웹 API도 허용 | RN storage 브리지 |
| 대표 예제 | `weekly-todo-react`(투두앱!), `weekly-todo-vue` | `with-storage`, `with-in-app-purchase` |
| **인앱결제(IAP)** | **불가** (예제가 react-native 전용) | **가능** (`getProductItemList`, `createOneTimePurchaseOrder`) |
| 광고(전면·보상형) | 가능 | 가능 |
| 로그인·햅틱·저장·공유 | 가능 | 가능 |

**결론:** 로그인/광고/햅틱/저장 등 대부분 기능은 두 트랙 다 되지만, **인앱결제는 네이티브(RN) 트랙에서만** 된다.

- **광고로 수익화** → 웹 트랙 유지 → 지금 Next.js/React 앱을 `@apps-in-toss/web-framework`로 **이식**(작은 작업). `weekly-todo-react`가 딱 이 경로의 투두앱 레퍼런스.
- **일회성 인앱결제(프리미엄 잠금 해제)로 수익화** → **네이티브(RN) 트랙 필수** → UI를 React Native로 **재작성**(큰 작업). 지금 만든 커스텀 웹 UI는 로직·데이터만 재사용.

추가 확인: 웹 트랙의 저장도 순수 localStorage가 아니라 프레임워크 `Storage` API가 표준이다(`weekly-todo-react`의 `useTaskState.ts`가 `@apps-in-toss/web-framework`의 `Storage` 사용). 인앱결제는 샌드박스에서 테스트 불가 — 토스 앱에서 테스트하면 실제 결제 발생.

## 핵심 트레이드오프 — 반드시 결정할 것

**로컬 우선 vs 데이터 영속성.** 앱인토스는 로컬 데이터를 앱 삭제 시 보장하지 않는다. "모두 로컬" 원칙을 지키면서 데이터 유실 위험을 줄이려면 백엔드 없이도 가능한 완충책이 있다:

- **내보내기/가져오기(백업 파일)**: 전체 데이터를 JSON 파일로 내보내고 다시 불러오는 기능. 서버 0, 계정 0. 로컬 우선 원칙 유지하면서 유일한 유실 대비책.
- 이걸 넣을지, 아니면 "이 앱의 데이터는 이 기기에서만·백업 없음"을 그대로 수용할지가 첫 결정.

## 현재 상태 (Phase 0 — 완료)

- 네 카테고리 UI, 모바일 UX(하단 탭바, 스와이프+되돌리기, 방향 전환, 햅틱), i18n(en/ko)
- 데이터: zustand `persist` → localStorage (`todo-cl-items`, `todo-cl-settings`)
- PWA 스캐폴드: manifest, 서비스워커(단, 캐싱 없는 통과 핸들러), standalone, 아이콘
- `main`에 머지 완료

## 단계별 로드맵

### Phase 1 — 진짜 로컬 우선 완성 (작음, 즉시)
- **1a. 서비스워커 오프라인 캐싱**: 현재 `public/sw.js`의 fetch 핸들러가 빈 통과라 오프라인에서 앱 셸이 안 뜬다. 앱 셸(HTML/JS/CSS)을 캐싱하도록 구현 → "다운받아 오프라인 사용"이 실제로 성립. (독립 PWA로 쓸 경우 필수. 앱인토스 WebView에선 로딩 방식이 달라 이 항목의 가치는 독립 설치 여부에 달림 — 아래 Phase 2에서 재판단)
- **1b. 데이터 내보내기/가져오기**: 위 트레이드오프의 완충책. 결정에 따라 포함.

### Phase 2 — 앱인토스 웹 미니앱으로 이식
- **2a. 스캐폴드 생성**: `npx create-ait-app`로 앱인토스 프로젝트 골격 생성, 구조 파악.
- **2b. 로직 이식**: 현재 React 컴포넌트 / zustand 스토어 / localStorage 로직을 그대로 옮김. 데이터 계층은 재사용 가능성 높음.
- **2c. TDS 통합 판단**: TDS(Toss Design System) SDK가 필수 의존성. 우리가 만든 커스텀 모바일 UI(탭바·스와이프·전환)와 TDS 컴포넌트가 충돌/중복될 수 있음 — 어디까지 TDS를 쓰고 어디까지 커스텀 UI를 유지할지 결정 필요. **네 카테고리 이름은 유지.**
- **2d. WebView 로컬 저장 검증**: Toss WebView 안에서 localStorage가 실제로 세션 간 유지되는지 실측(정책상 정리될 여지 확인).
- ※ 미확인 지점: Next.js 앱을 얼마나 그대로 쓰는지 vs create-ait-app 골격으로 재구성하는지 — 2a에서 실제 스캐폴드를 보고 확정.

### Phase 3 — 사업자 등록 + 수익화 설계
- **3a. 사업자 등록** (수익화 기능 잠금 해제, ~1영업일).
- **3b. 수익화 모델 결정** (아래 결정 항목). 로컬 우선·단순함엔 **일회성 인앱 결제(프리미엄 잠금 해제)** 가 가장 잘 맞음. 광고는 UX 침해가 있고, 구독은 서버 없는 로컬 앱과 궁합이 나쁨.
- **3c. 선택한 결제 SDK 통합** (인앱 결제 또는 광고 SDK).

### Phase 4 — 등록 · 심사 · 출시
- 콘솔에서 앱 등록(로고·이름·카테고리·고객센터), 심사 요청 → 출시.
- **리드타임 주의: 비게임 심사 약 1~3개월.** 이 기간을 로드맵 초반에 감안해 병행 준비.

## 사용자가 결정할 항목

1. **데이터 유실 대비**: 내보내기/가져오기 백업을 넣을까, 아니면 순수 로컬(백업 없음) 그대로 갈까?
2. **독립 PWA도 유지?**: 앱인토스 외에 "홈 화면 추가"로 쓰는 독립 PWA도 목표인가(그럼 Phase 1a 필수), 아니면 앱인토스 하나만 목표인가?
3. **수익화 모델**: 일회성 잠금 해제(권장) / 인앱 광고 / 둘 다?
4. **TDS 적용 범위**: 우리가 만든 커스텀 UI를 최대한 유지 vs TDS로 재구성?

## 다음 실행 후보

- **A.** Phase 1a(오프라인 캐싱)부터 — 지금 코드로 바로 가능한 실질 개선.
- **B.** `create-ait-app` 스캐폴드를 만들어 앱인토스 실제 구조를 파악하고 이식 규모를 확정(2a).
- **C.** 위 결정 4개를 먼저 확정하고 상세 실행 계획으로.
