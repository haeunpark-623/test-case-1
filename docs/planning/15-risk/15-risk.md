---
doc_type: risk
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-19
gate: operations
related:
  R-ID: [R-N-01, R-N-02, R-N-03, R-N-04, R-N-05, R-N-06, R-N-07]
  F-ID: [F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08]
  supersedes: null
---

# Conduit (RealWorld Clone) — Risk Register

<!-- /flow-wbs Phase 3/4 산출 1/2. 시스템 차원 리스크 식별·완화·등급. ADR-0031 1수준 +1 재할당으로 14→15. -->

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-19 | woosung.ahn@bespinglobal.com | 초안 (/flow-wbs Phase 3/4) — 11 리스크 식별 5 카테고리 (기술/일정/외부 의존/보안/운영), High 6 단계적 롤아웃 |

## 1. 리스크 일람

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 | 영향 받는 Sprint/Issue | 대응 |
|---|---|---|---|---|---|---|
| RISK-01 | RealWorld 공식 spec 모호 영역 (필드/에러 페이로드) | 4 | 4 | **High** | S1: be-auth, be-article-crud / S2: be-feed | reference 구현 1~2개 본 + Newman 회귀 |
| RISK-02 | 3 profile 부팅 자산 동기 누락으로 AI 게이트 6축 BLOCK | 5 | 4 | **High** | 전 Sprint 매 PR | LOCAL.md §3 SoT 일찍 확정 + AI 게이트 6축 자동화 |
| RISK-03 | UI 골든패스 회귀 잦음 → 검증 시간 누적 | 3 | 5 | **High** | S2·S3 모든 FE 이슈 | 03-user-scenarios에 5 핵심 골든패스 박제 + gstack /qa 표준화 |
| RISK-04 | Bootstrap 4 + CSS Modules 시각 정합 (stylesheet 솔루션 ADR-0038) | 3 | 4 | **High** | S1: fe-shell / S2: fe-article-home / S3: fe-editor | 10 §3 디자인 토큰 4종 BLOCK으로 양축 매핑 |
| RISK-05 | N+1 쿼리 회귀로 R-N-01 p95 초과 | 4 | 3 | **High** | S2: be-article-list / be-feed / S3: be-comments | Prisma query log assertion + k6 마이크로 부하 매 PR |
| RISK-06 | JWT/bcrypt 보안 회귀 (만료·평문 저장) | 5 | 2 | **High** | S1: be-auth | 단위 + 통합 매트릭스 R-N-02·N-03 매 PR + secret leak gitleaks |
| RISK-07 | MVP 5주(3 sprint) 일정 압박 | 4 | 3 | Medium | 전 Sprint | F-08 P2 우선 후행 + 매 sprint retro |
| RISK-08 | Prisma migration 회귀 (dev/stg/prod 동기 누락) | 4 | 3 | Medium | S1: be-db / S2·S3 schema 변경 시 | migration 폴더 분리형(LOCAL.md (a)) + 매 PR 12 §7 동기 lint |
| RISK-09 | markdown XSS sanitize 회귀 (DOMPurify policy) | 5 | 2 | Medium | S2: fe-md / fe-article-detail | DOMPurify 단위 + `<script>`·`onerror`·`javascript:` 페이로드 회귀 |
| RISK-10 | GitHub Actions 워크플로 PR 검증 차단 (ADR-0047) | 3 | 3 | Medium | 전 Sprint 매 PR | act 로컬 검증 명령 LOCAL.md §5 박제 + Manual verification 체크 강제 |
| RISK-11 | 외부 reference (RealWorld Postman·frontend spec) 갱신 | 2 | 3 | Low | 운영 단계 | vendoring + 분기별 외부 PR 알림 수신 |

> 등급 = 영향 × 가능성 / 5 — 16 이상 High, 8 이상 Medium, 그 외 Low.

## 2. 리스크 상세

### RISK-01: RealWorld 공식 spec 모호 영역

- **카테고리**: 외부 의존
- **설명**: RealWorld 공식 spec(https://realworld-docs.netlify.app)이 일부 필드(예: `following` 비로그인 응답, `favoritesCount` cap 등) + 에러 페이로드 shape(특히 422 키 명) 미명시. 단순 implementation 결정으로는 외부 reference 구현 150+ 개와 미세 차이가 날 위험.
- **영향**: 4 — Newman 회귀 fail 가능, MVP KPI(합치율 100%) 미달.
- **가능성**: 4 — 첫 sprint 진입 시 즉시 노출.
- **현재 상태**: 식별
- **트리거 신호**: Newman PR 첫 실행 FAIL 또는 reference 구현(특히 Node Express 공식 본)과 응답 shape 1바이트 이상 차이.
- **완화 전략**: 02-feasibility §1·§2에서 reference 구현(Node Express + React) 1~2개 본을 *정답지*로 박제. 모호 영역은 본 정답지를 따른다. ADR-0001 §6 부록에 의사 결정 로그 누적. Newman 매 PR 자동 회귀.
- **대응 이슈**: S1 `be-auth-signup` · S1 `be-article-crud` · S2 `be-feed-list` — 첫 PR open 시 reference 응답 캡처 + Newman fixtures 동기.

### RISK-02: 3 profile 부팅 자산 동기 누락

- **카테고리**: 운영
- **설명**: ADR-0037 v1.1 + ADR-0040 강제로 `.env.{dev,stg,prod}.example` + Prisma migrations + LOCAL.md §3 + workspace lockfile + 12-scaffolding §7 표 5종 자산이 매 PR 동기 갱신되어야 함. 한 profile만 갱신 시 AI 게이트 6번째 축 BLOCK + PR 차단.
- **영향**: 5 — PR open 전부 차단 → 전 Sprint stall.
- **가능성**: 4 — schema 변경·env 키 추가는 빈번.
- **현재 상태**: 식별
- **트리거 신호**: AI 게이트 6번째 축 stderr `BLOCK: 12 §7 자산 7행 중 N행 누락` 또는 `LOCAL.md §3 profile X 명령 부재`.
- **완화 전략**: S1 sprint 초반에 12-scaffolding §6·§7 + LOCAL.md §3·§4를 SoT로 확정 (`infra-scaffold` 이슈). 매 PR 7 자산 동기 lint 자동(`/qa-test --ai` 6번째 축).
- **대응 이슈**: S1 `infra-scaffold` · S1 `infra-prisma-init` · 매 sprint sprint-retro 회귀 점검.

### RISK-03: UI 골든패스 회귀 잦음

- **카테고리**: 일정
- **설명**: ADR-0011 강제로 매 PR마다 gstack `/qa` 호출 + 스크린샷 첨부. FE 변경이 잦으면 검증 시간 누적 → sprint 일정 압박.
- **영향**: 3 — sprint 일정 +N% 지연.
- **가능성**: 5 — FE 화면 5개(Home/Login/Register/Article/Editor) 모두 골든패스 대상이라 변경 빈도 높음.
- **현재 상태**: 식별
- **트리거 신호**: 단일 FE PR에서 gstack `/qa` 5분 초과 또는 회귀 2개 sprint 연속 ≥3건.
- **완화 전략**: 03-user-scenarios에 5 핵심 골든패스(UC-01 가입 · UC-02 로그인 · UC-04 글 상세 · UC-06 Home 목록 · UC-08 글 작성) 박제 + 표준 셀렉터(`data-testid`) 11-coding-conventions §1 강제 + gstack `/qa` 명령 LOCAL.md §5 박제.
- **대응 이슈**: S1 `fe-shell-router` · S2 `fe-article-home` · S2 `fe-article-detail` · S3 `fe-editor` — 각 골든패스 시나리오 1건 이상.

### RISK-04: Bootstrap 4 + CSS Modules 시각 정합

- **카테고리**: 기술
- **설명**: ADR-0038 stylesheet 솔루션 1택(본 프로젝트 = Bootstrap 4 CDN + CSS Modules) + 10 §3 디자인 토큰 4종(Color 8 / Typography 7 / Spacing 6 / primitives 8) BLOCK. RealWorld 공식 demo와 시각 정합 미세 차이 빈발 위험.
- **영향**: 3 — 시각 정합 KPI 미달 + sponsor 피드백 반복.
- **가능성**: 4 — 신규 FE 멤버는 Bootstrap 4 idiom과 CSS Modules 의 양축 차이를 자주 혼용.
- **현재 상태**: 식별
- **트리거 신호**: gstack `/qa` 스크린샷 vs https://demo.realworld.io diff 시각 차이 또는 axe-core R-N-04 위반 발견.
- **완화 전략**: 12-scaffolding §8 stylesheet 솔루션 박제 + Vite import in `main.tsx` + 10 §3 디자인 토큰 양축 매핑 + 11-coding-conventions §1 클래스명 컨벤션 강제.
- **대응 이슈**: S1 `fe-shell-router` (Bootstrap CDN import) · S2 `fe-article-home` (목록 카드 토큰) · S3 `fe-editor` (form 토큰).

### RISK-05: N+1 쿼리 회귀로 R-N-01 p95 초과

- **카테고리**: 기술
- **설명**: 글 목록 + 피드 + 댓글 + favoritesCount 등 include 깊이가 깊은 쿼리에서 Prisma 기본 동작이 N+1로 회귀할 위험. R-N-01 (p95 ≤ 1000ms) BLOCK 가능.
- **영향**: 4 — KPI 미달 + 운영 latency alert.
- **가능성**: 3 — Prisma include 잘못 쓰면 즉시 회귀.
- **현재 상태**: 식별
- **트리거 신호**: k6 마이크로 부하 PR에서 p95 > 1000ms 또는 Prisma query log 호출당 쿼리 수 > 2 (목록·상세).
- **완화 전략**: 13/04 §3 도구·시점에 N+1 회귀 assertion 매 PR 자동(`pnpm test:perf`). 호출당 쿼리 수 목록 1+1=2 / 상세 1+1=2 / include 깊이 ≤ 2 정책 정합. 운영 단계 k6 VU=50 nightly.
- **대응 이슈**: S2 `be-article-list` · S2 `be-feed-list` · S3 `be-comments-crud`.

### RISK-06: JWT/bcrypt 보안 회귀

- **카테고리**: 보안
- **설명**: R-N-02 (JWT 만료·위변조) + R-N-03 (bcrypt 해싱 평문 저장 0건) 강제. 회귀 시 사용자 자격 증명 노출.
- **영향**: 5 — 보안 침해 → CLAUDE.md §보안 항목 위반 + 신뢰 손실.
- **가능성**: 2 — 의도적 회귀 가능성은 낮으나, 새 멤버의 raw SQL/secret leak 회귀는 항상 가능.
- **현재 상태**: 식별
- **트리거 신호**: 통합 테스트에서 DB 컬럼이 bcrypt 패턴 미일치 또는 만료된 토큰으로 보호 엔드포인트 200 응답.
- **완화 전략**: 13/04 §2 보안 테스트 매 PR (JWT 만료·위변조 매트릭스 + bcrypt cost=12 timing ≥ 200ms + secret leak gitleaks pre-commit). secret 길이 정책 11-coding-conventions §6 박제.
- **대응 이슈**: S1 `be-auth-signup` · S1 `be-auth-login` · 운영 단계 `cso-quarterly`.

### RISK-07: MVP 5주(3 sprint) 일정 압박

- **카테고리**: 일정
- **설명**: 01-project-brief §6 일정상 MVP v1.0 머지 2026-06-30 목표. 22 이슈 × 3 sprint × ~2일 평균 = 약 132 person-day 예상이나 단일 sprint당 이슈 ≥10건 → 1인 부담 시 위험.
- **영향**: 4 — KPI(MVP 합치율 100%) 미달.
- **가능성**: 3 — 외부 reference가 풍부해 실제 도메인 비용은 낮으나 toolchain 정합 비용이 변수.
- **현재 상태**: 식별
- **트리거 신호**: sprint retro 1~2회 연속으로 burndown 30% 미만 진행 또는 P2 이슈 sprint 연속 carry-over.
- **완화 전략**: F-08 (P2 인기 태그) 후행 + sprint별 retro에서 우선순위 재조정. P0 이슈 BLOCKED 즉시 사용자 에스컬레이션.
- **대응 이슈**: 전 Sprint sprint-retro · S3 `release-readiness`.

### RISK-08: Prisma migration 회귀

- **카테고리**: 기술
- **설명**: dev/stg/prod 3 profile에서 Prisma migrations 폴더 분리형(LOCAL.md 패턴 (a)) 적용. migration 한 profile만 갱신 시 부팅 회귀 + ADR-0040 BLOCK.
- **영향**: 4 — AI 게이트 6축 BLOCK + 부팅 stall.
- **가능성**: 3 — schema 변경은 sprint마다 발생 가능.
- **현재 상태**: 식별
- **트리거 신호**: `prisma migrate status` 한 profile만 OK 또는 LOCAL.md §3 부팅 명령 한 profile FAIL.
- **완화 전략**: 12-scaffolding §7 자산 표 1행에 migration 분리형 박제 + 매 PR 6축 lint 자동.
- **대응 이슈**: S1 `infra-prisma-init` · 매 schema 변경 PR.

### RISK-09: markdown XSS sanitize 회귀

- **카테고리**: 보안
- **설명**: R-F-08 글 본문 markdown 렌더링은 DOMPurify로 sanitize 강제(M-FE-MD). policy 회귀 시 `<script>` 또는 `onerror` 페이로드 통과.
- **영향**: 5 — XSS 노출 → 신뢰 손실 + 보안 침해.
- **가능성**: 2 — DOMPurify 기본 policy가 strict하나 allowedAttrs override 시 위험.
- **현재 상태**: 식별
- **트리거 신호**: 13/04 §2 XSS 매트릭스 단위 테스트 FAIL 또는 외부 보안 보고서.
- **완화 전략**: M-FE-MD 단위 테스트에 `<script>` · `onerror` · `javascript:` URL · `<iframe>` 페이로드 회귀 매 PR. policy 변경 PR은 의무적으로 ADR + reviewer 2인 강제.
- **대응 이슈**: S2 `fe-md-sanitize` · S2 `fe-article-detail`.

### RISK-10: GitHub Actions 워크플로 PR 검증 차단

- **카테고리**: 운영
- **설명**: ADR-0047 강제로 매 PR Manual verification에 act/manual reproduction/dev fork 실 실행 증거 명시 필요. 누락 시 PR open 자체 BLOCK.
- **영향**: 3 — PR open 차단 → 작업 흐름 stall.
- **가능성**: 3 — 새 멤버가 LOCAL.md §5 act 명령 누락하기 쉬움.
- **현재 상태**: 식별
- **트리거 신호**: `/qa-test --ai` 6번째 축 워크플로 lint stderr `BLOCK: Manual verification act 증거 부재`.
- **완화 전략**: LOCAL.md §5 act 명령 박제 + .actrc + .env.act 템플릿 12 §7에 자산 추가 + S1 sprint 초반 `infra-ci-workflow` 이슈에서 표준 한번 박제.
- **대응 이슈**: S1 `infra-ci-workflow` · 매 PR 작성자 self-check.

### RISK-11: 외부 reference (RealWorld Postman·frontend spec) 갱신

- **카테고리**: 외부 의존
- **설명**: RealWorld 공식 spec/Postman 갱신 시 본 프로젝트의 Newman fixtures + frontend 라우트 체크리스트 회귀 가능. 빈도는 낮으나 알림 미수신 시 외부 동치성 검증 자동화 깨짐.
- **영향**: 2 — 운영 단계 분기별 조정 시간 +N시간.
- **가능성**: 3 — 외부 spec은 분기당 1~2회 갱신.
- **현재 상태**: 식별
- **트리거 신호**: nightly Newman smoke 회귀 FAIL 또는 외부 GitHub release 알림.
- **완화 전략**: Postman 컬렉션 + frontend 체크리스트 vendoring(`tests/fixtures/realworld/`) + 분기 1회 외부 PR 알림 수동 흡수.
- **대응 이슈**: 운영 단계 `reference-sync-quarterly`.

## 3. High 리스크 단계적 롤아웃

High 6건 (RISK-01·02·03·04·05·06)은 S1 초기에 *우선 흡수*하여 sprint 후반/S2·S3 carry-over 최소화한다.

### 단계 1 — S1 첫 주: 기반 박제

- **목표**: 운영 위험 4건(RISK-02·04·06·10)의 SoT 박제로 매 PR 자동 lint 가동.
- **수행 이슈**:
  - `infra-scaffold` — 12 §6·§7 + LOCAL.md §3·§4 SoT 작성. RISK-02·08 흡수.
  - `infra-ci-workflow` — `.github/workflows/ci.yml` + LOCAL.md §5 act 명령. RISK-10 흡수.
  - `be-auth-signup` + `be-auth-login` — JWT + bcrypt 단위·통합 매트릭스. RISK-06 흡수.
  - `fe-shell-router` — Bootstrap CDN + CSS Modules + AuthGuard. RISK-04 부분 흡수.
- **종료 조건**: AI 게이트 6번째 축(부팅) + 5번째 축(stylesheet) PR마다 PASS 가능 상태.

### 단계 2 — S2 글 본문 시나리오: 외부 합치 검증

- **목표**: RISK-01(spec 모호) + RISK-05(N+1) + RISK-09(XSS) 흡수.
- **수행 이슈**:
  - `be-article-list` + `be-feed-list` — Newman fixtures + k6 마이크로 부하 + Prisma include 회귀 assertion.
  - `fe-md-sanitize` — DOMPurify 단위 매트릭스.
  - `fe-article-detail` — 시각 정합 + 보안 통합.
- **종료 조건**: RealWorld 공식 Postman 19 endpoint 중 7건(인증·프로필·글 CRUD·목록·피드) PASS.

### 단계 3 — S3 인터랙션·릴리스: UI 회귀 안정화

- **목표**: RISK-03(UI 회귀) + RISK-07(일정) 흡수.
- **수행 이슈**:
  - `fe-editor` + `fe-comments` + `fe-profile-follow` — 5 핵심 골든패스 자동화.
  - `release-readiness` — Newman 전건 PASS + axe-core PASS + 3 profile 부팅 PASS + sprint retro.
- **종료 조건**: KPI 4건(API 100% + FE 100% + coverage ≥80% + AI 게이트 6축 100%) 모두 PASS → MVP v1.0 머지 OK.

### Rollback Trigger

- RealWorld 공식 Postman 회귀 ≥3건 sprint 종료까지 미해소 → MVP cut F-08 후행 + S4 sprint 신설 검토 + 사용자 승인.
- AI 게이트 6번째 축 BLOCK 3건 이상 연속 PR → 12-scaffolding §6·§7 + LOCAL.md §3 SoT 재검토 ADR 발의.
- 보안 RISK-06·09 발생 시 즉시 `priority:high` hotfix 이슈 + sprint 진행 일시 정지 + /cso 점검.
