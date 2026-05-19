---
doc_type: test-design
version: v0.2 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-19
gate: C
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-04, R-F-05, R-F-06, R-F-07, R-F-08, R-F-09, R-F-10, R-F-11, R-F-12, R-F-13, R-F-14, R-F-15, R-F-16, R-F-17, R-N-01, R-N-02, R-N-03, R-N-04, R-N-05, R-N-06, R-N-07]
  F-ID: [F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08]
  supersedes: null
---

# Conduit (RealWorld Clone) — Test Design / Test Strategy

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-19 | woosung.ahn@bespinglobal.com | 재생성 (/flow-design re-run, Phase 2/4) — 방법론·레벨·도구 매트릭스 보존 (커버리지 ≥80% baseline 유지) |
| v0.1 | 2026-05-19 | woosung.ahn@bespinglobal.com | 초안 — 방법론·도구·커버리지 |

## 1. 방법론 (TDD/BDD)

- **방법론**: **비-TDD (Test-after) + BDD-style 시나리오 명명**.
- **이유**: RealWorld 외부 합치 검증을 위해 *Postman 공식 컬렉션*과 *frontend 라우트 체크리스트*가 정본이다. 본 프로젝트는 그 정본을 만족시키는 *행동*을 구현하므로, 단위 테스트를 먼저 쓰는 TDD보다 *Given/When/Then 시나리오*를 04-srs·05-prd에서 끌어와 단위·통합·E2E에 fan-out하는 흐름이 자연스럽다. 단, *비즈니스 룰이 RealWorld 공식에 미정의*인 영역(예: slug 충돌 정책, password 복잡도)은 *해당 영역에 한정해 TDD 권장*.
- **레벨**: **단위 / 통합 / E2E** 3계층. ADR-0023 정합 — 모든 R-/F-ID는 3 레벨 결정 ✅/N/A 명시 (❌ 금지).
- **레벨별 정의**:
  - **단위**: 함수·서비스·hook·컴포넌트 단위. mocking은 외부 경계만. 인메모리 + 결정적.
  - **통합**: 모듈 경계 + DB(testcontainers Postgres) + Fastify app 부팅. MSW는 frontend integration에서.
  - **E2E**: gstack `/qa` brower + Newman으로 RealWorld 공식 Postman 전건 회귀.

## 2. 도구 선택

| 레벨 | 도구 | 이유 |
|---|---|---|
| 단위 (BE) | Vitest 1.x + tsx + tsd | ESM 호환·watch 빠름. tsd는 @conduit/types 회귀 차단. |
| 단위 (FE) | Vitest + React Testing Library + jest-dom | RTL은 사용자 관점 쿼리 강제. |
| 통합 (BE) | Vitest + testcontainers (postgres:16-alpine) + Fastify inject | 실제 DB로 SQL/Prisma 회귀. |
| 통합 (FE) | Vitest + RTL + MSW 2.x | API mock 단일 출처. |
| E2E (API) | Newman 6 + RealWorld 공식 Postman (vendored) | KPI 1 (API 합치 100%) 자동화. |
| E2E (UI) | gstack `/qa` (헤드리스 chromium) | UI 골든패스 + axe-core + 브라우저 매트릭스. |
| 성능 | k6 0.50+ | 단일 binary·CI 호환. R-N-01 p95. |
| 보안 | OWASP ZAP baseline (선택) + npm/pnpm audit + snyk | endpoint scanning·dependency vuln. |
| 부팅 검증 (AI 게이트 6축) | LOCAL.md §3 + `act` (ADR-0047) | profile별 fresh checkout. R-N-05. |
| 커버리지 | `@vitest/coverage-v8` | branch/function/line 80%+. |

## 3. 커버리지 목표 (≥ 80%)

- **커버리지 목표**: **line 80% / branch 80% / function 80%** 이상 (BE·FE·shared).
- **측정**: `pnpm test:unit -- --coverage` → vitest lcov + html. CI는 lcov를 GitHub Actions summary 또는 codecov.
- **CI 임계**:
  - 단위 + 통합 합산 line ≥ 80% → PASS.
  - < 80% → AI 게이트 2축 BLOCK + 미커버 파일 리스트 PR comment.
- **분야별 예외**:
  - `backend/prisma/migrations/*.sql` — N/A.
  - `frontend/src/main.tsx` — N/A.
  - 그 외 예외는 ADR (ADR-0015 §2.3).
- **목표 추적**: 13/02-catalog 매트릭스의 ✅ 셀이 각 레벨에서 R-/F- 1행당 1+ 있을 때 80% 도달 추정. 직접 측정은 coverage report.

## 4. D-06 게이트 정합 (참고)

본 sub-file은 ADR-0030 분할 모드 1번 절. D-06 게이트 정합은 03-regression·05-delivery-format.
