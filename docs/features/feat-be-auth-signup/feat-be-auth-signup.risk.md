---
doc_type: feature-risk
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-20
gate: feature
related:
  R-ID: [R-F-01, R-N-02, R-N-03]
  F-ID: [F-01]
  supersedes: null
---

# feat-be-auth-signup — Feature Risk

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — 인증 base 리스크. Med 2 / Low 2, High 0 |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
|---|---|---|---|---|
| F-RISK-01 | JWT_SECRET 약한 값 유출 시 토큰 위조 | 5 | 1 | Med |
| F-RISK-02 | bcrypt cost=12가 응답 시간에 영향 (k6 부하 시) | 3 | 2 | Med |
| F-RISK-03 | timing attack — bcrypt compare로 username 존재 여부 노출 | 2 | 2 | Low |
| F-RISK-04 | Rate limit 부재로 무차별 가입 brute force | 3 | 1 | Low |

High 0건.

## 2. 리스크 상세

### F-RISK-01: JWT_SECRET 약한 값 / 유출

- **카테고리**: 보안
- **트리거 신호**: `.env.<profile>` 시크릿 commit 또는 HS256 길이 미달 (< 32자)
- **완화 전략**:
  - JWT 발급 시 길이 검증 — `if (process.env.JWT_SECRET.length < 32) throw` (lib/jwt.ts)
  - .gitignore가 `.env.<profile>` 평문 차단 (#2/#4 박제)
  - `.env.prod.example`는 `REPLACE_FROM_SECRET_MANAGER_MIN_32_CHARS` placeholder
  - PreToolUse 훅이 `.env.*` Write 자동 차단
- **검증 방법**: lib/jwt.ts에 length assert + passwords.test.ts에서 검증

### F-RISK-02: bcrypt cost=12 성능 영향

- **카테고리**: 성능
- **트리거 신호**: k6 부하 테스트 시 signup 200~600ms × 동시 사용자 → 응답 지연
- **완화 전략**:
  - signup은 user lifecycle에서 1회 호출 (vs login 매 세션) — 부하 적음
  - cost=12는 OWASP 권장 최소 — 변경 시 별 ADR
  - Sprint 2 #6 be-auth-login은 동일 cost compare — 응답 시간 별 측정
- **검증 방법**: `release-readiness` #23 k6에서 p95 측정

### F-RISK-03: timing attack — username 존재 여부 노출

- **카테고리**: 보안
- **트리거 신호**: 중복 username 응답이 bcrypt compare 전이라 즉시 422 → 응답 시간 차이로 username 존재 추론 가능 (signup은 영향 적음, login은 본격)
- **완화 전략**:
  - signup의 경우 username/email 중복 check는 어차피 422 응답 의도이므로 timing 차이 허용 (사양)
  - login(#6)에서 username 존재 여부와 무관 동일 응답 시간 보장 (별 이슈)
- **검증 방법**: signup은 N/A. login에서 검증.

### F-RISK-04: brute force 가입 brute force

- **카테고리**: 보안
- **트리거 신호**: 동일 IP에서 5+ req/hour signup 시도
- **완화 전략**:
  - `release-readiness` #23이 `@fastify/rate-limit` 5 req/hour/IP 적용 (09-lld-api-spec §"운영 단계")
  - 본 이슈는 base 라우트만 박제 (rate limit 후속)
- **검증 방법**: #23에서 통합 테스트

## 3. High 등급 단계적 롤아웃

해당 없음.

## 4. 데이터 영속성 변경

User 테이블에 row 추가 (signup 호출 시). password_hash 컬럼 bcrypt 패턴. 평문 0건. revert 시 신규 row 보존 가능 (사용자 데이터 보호).

## 5. 15-risk.md 갱신 항목

시스템 카테고리 포괄. 본 이슈 scope 한정.
