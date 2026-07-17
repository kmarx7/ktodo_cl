# 미리꼭 — 이어가기 노트 (Resume)

> 다음에 다시 왔을 때 이 파일부터 읽으면 바로 이어서 진행 가능.
> 최종 업데이트: 2026-07-18

## 지금 상태 한 줄 요약
앱은 **완성 + 배포 완료**. 토스 콘솔에서 **앱 정보(app info)가 심사 중**이라 대기 중.
앱 정보가 승인돼야 빌드 검토 요청이 가능함 (심사 ~영업일 2일, 결과는 이메일).

## 다음에 할 일 (블로킹 해제되면)
1. **앱 정보 승인 메일 확인** (수신: infothe1stwave@gmail.com)
2. 토스 콘솔 → **앱 출시 → 빌드 `20260718-9` 선택 → 검토 요청**
3. 제출 시 필요한 링크 (둘 다 준비 완료):
   - 개인정보처리방침: https://kmarx7.github.io/ktodo_cl/privacy.html
   - 이용약관: https://kmarx7.github.io/ktodo_cl/terms.html
4. 만약 빌드 심사에서 **약관/사업자 정보**를 추가로 요구하면 → 개인사업자 등록(홈택스) 안내 필요.
   (참고: 토스로그인/인앱결제/약관 등록은 사업자 정보가 있어야 함. 현재는 **무료-우선**이라 인앱결제 미사용.)

## 앱 핵심 정보
- **앱 이름**: 미리꼭 (What To Do)
- **컨셉**: 로컬 전용(on-device) 체크리스트 + 캘린더 + 기억할 것(기념일). 백엔드/동기화 없음.
- **카테고리 4종 (절대 이름 변경 금지)**: 할 것 / 낼 것 / 살 것 / 생각할 것
- **수익화**: 현재 **무료 우선**. `ait/src/lib/features.ts`의 `MONETIZATION_ENABLED = false` 마스터 플래그로 프리미엄(캘린더+알림) 잠금 계층을 꺼둠. 나중에 `true`로 켜면 IAP 활성화.
- **기억할 것 기능**: 생일🎂/기념일🎉/추도일🌹/기타📌, 양력·음력, 매년·1회, 7일 이내 홈 배너 + 캘린더 골드별 하이라이트. 음력 변환은 `solarlunar` 패키지.

## 배포 / 빌드
- 최신 빌드: **20260718-9**, deploymentId `019f70e4-2b0e-7567-9a56-7dd4ebb898fd`
- 재배포 방법: `cd ait && ait build && ait deploy` (Node v22에서 동작 확인. token은 `ait token add`로 등록됨)
- 브랜드 설정: `ait/granite.config.ts` (appName `todowhat`, displayName `미리꼭 · 할일부터 결제까지`, primaryColor `#3182F6`, icon `icon.png`)

## Git / 계정
- 리모트: `https://github.com/kmarx7/ktodo_cl.git` — **kmarx7 계정으로만 push 가능** (marx21c-ops는 403).
- 작업 브랜치: `feature/appsintoss-web-port` → PR #1 (https://github.com/kmarx7/ktodo_cl/pull/1), 아직 main 미머지.
- push 커맨드 (kmarx7 토큰을 런타임에 주입):
  ```
  git -c credential.helper= -c credential.helper='!f() { echo username=kmarx7; echo "password=$(gh auth token --user kmarx7)"; }; f' push
  ```
- 개인정보/약관 페이지는 **gh-pages 브랜치**로 별도 호스팅 (docs/의 specs는 노출 안 됨).

## 스토어 제출 자산 (`ait/store-assets/`)
- 아이콘_1024.png, 앱로고_600x600.png, 썸네일_1932x828.png
- 스크린샷 4종 (홈 / 낼돈 / 캘린더 / 할일, 636x1048)

## 백로그 (다음 버전)
- "오늘 통합 뷰" — 홈에서 오늘의 할것/낼것/살것 + 기념일을 한 화면에 모으는 뷰. (이번엔 앱 안정성 위해 보류함)
- 관련 스펙: `docs/superpowers/specs/2026-07-16-anniversaries-remember-design.md`
