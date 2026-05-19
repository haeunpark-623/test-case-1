---
doc_type: test-design
version: v0.2 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-19
gate: C
related:
  R-ID: [R-N-01, R-N-02, R-N-03, R-N-04]
  F-ID: []
  supersedes: null
---

# Conduit (RealWorld Clone) — Test Design / Performance & Security Tests

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-19 | woosung.ahn@bespinglobal.com | 재생성 (/flow-design re-run, Phase 2/4) |
| v0.1 | 2026-05-19 | woosung.ahn@bespinglobal.com | 초안 |

## 1. 성능 테스트

- **목표 (R-N-01)**: `GET /api/articles?limit=10` p95 ≤ 1000ms, `GET /api/articles/:slug` p95 ≤ 800ms. 단일 인스턴스 + 시드 100건.
- **시나리오**:
  - **마이크로 부하**: k6 30s VU=10 — 평균/p95. CI 통합. p95 초과 BLOCK.
  - **N+1 회귀**: Prisma query log + 호출당 쿼리 수 assertion (목록 1+1=2, 상세 1+1=2, include 깊이 ≤ 2).
  - **부하 시뮬 (운영 단계)**: k6 VU=50, 5min — connection pool·메모리.
- **도구·시점**: §3.

## 2. 보안 테스트

- **JWT (R-N-02)**: 만료·위변조 매트릭스 (단위 + 통합). secret 길이.
- **bcrypt (R-N-03)**: 평문 회귀 차단 통합 (02-catalog R-N-03). cost=12 timing ≥ 200ms.
- **SQL injection**: Prisma ORM parameterized 기본. raw SQL 0건 정책 + ESLint rule.
- **XSS — markdown sanitize (R-F-08)**: DOMPurify 단위 — `<script>`·`onerror`·`javascript:` URL 페이로드 회귀.
- **CORS**: profile별 origin allow-list. preflight 검증 통합.
- **dependency audit**: `pnpm audit` + `snyk test`. high/critical CVE PR BLOCK.
- **OWASP ZAP baseline**: 운영 단계 nightly dev/stg.
- **secret leak**: pre-commit hook (gitleaks) + `.env*`·`*.key`·`*.pem` 차단. CLAUDE.md §보안 정합.

## 3. 도구·시점

| 종류 | 도구 | 시점 | R-ID |
|---|---|---|---|
| 마이크로 부하 | k6 0.50+ | 매 PR | R-N-01 |
| N+1 query 회귀 | Prisma query log + custom assertion | 매 PR | R-N-01 |
| JWT 위변조 | Vitest 단위 + 통합 | 매 PR | R-N-02 |
| bcrypt timing | Vitest 단위 | 매 PR | R-N-03 |
| XSS sanitize | Vitest 단위 (M-FE-MD) | 매 PR | R-F-08, R-N-02 |
| dependency audit | `pnpm audit` + `snyk test` | 매 PR + nightly | (CVE) |
| axe-core 접근성 | gstack `/qa` 통합 | 매 PR (E2E) | R-N-04 |
| OWASP ZAP baseline | docker zap CLI | nightly (운영 단계) | R-N-02 |
| secret leak | gitleaks + pre-commit | 매 commit | (보안) |
| 부하 시뮬 | k6 VU=50, 5min | 운영 단계 nightly | R-N-01 |
