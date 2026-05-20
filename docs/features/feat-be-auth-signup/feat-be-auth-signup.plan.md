---
doc_type: feature-plan
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

# feat-be-auth-signup — Implementation Plan

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — 5 commit DAG |

## 1. 커밋 시퀀스 (DAG)

| # | 커밋 | 영향 파일 | 테스트 추가 | 회귀 위험 |
|---|---|---|---|---|
| 1 | `chore(backend): bcryptjs + jsonwebtoken deps (#5)` | `backend/package.json` + `pnpm-lock.yaml` | (없음 — deps) | None |
| 2 | `feat(backend): lib/{jwt,passwords,errors} 박제 (#5)` | `backend/src/lib/{jwt,passwords,errors}.ts` + `backend/src/__tests__/{jwt,passwords}.test.ts` | jwt 4 + passwords 3 = 7 tests | Low — placeholder lib |
| 3 | `feat(backend): services/authService.signup (#5)` | `backend/src/services/authService.ts` + `backend/src/__tests__/authService.test.ts` | authService 5 tests | Low |
| 4 | `feat(backend): POST /api/users 라우트 + app.ts 등록 (#5)` | `backend/src/routes/users.ts` + `backend/src/app.ts` 갱신 | 통합 3 tests (Fastify inject) | Med — 라우트 등록 영향 |
| 5 | `chore(infra): lockfile 갱신 + 검증 (#5)` | `pnpm-lock.yaml` (갱신) | 전체 lint+tsc+test:unit PASS | Low |

## 2. 의존성 그래프

```
Commit 1 (deps)
   ▼
Commit 2 (lib) — deps 필요
   ▼
Commit 3 (authService) — lib 의존
   ▼
Commit 4 (route + app.ts) — service 의존
   ▼
Commit 5 (lockfile + 검증)
```

선형. 후속 #6·#7이 본 이슈 lib 의존.

## 3. 테스트 매핑

| 커밋 | 테스트 추가 위치 | 시나리오 |
|---|---|---|
| Commit 1 | (없음) | pnpm install 정합 (수동) |
| Commit 2 | `backend/src/__tests__/jwt.test.ts` (4) / `passwords.test.ts` (3) | jwt: sign+verify cycle / 만료 / 잘못된 secret / payload 정합 · passwords: bcrypt 해시 패턴 / 정합 verify / 잘못된 비밀번호 false |
| Commit 3 | `backend/src/__tests__/authService.test.ts` (5) | signup happy (응답 schema) / duplicate email 422 / duplicate username 422 / weak password (< 8자) 422 / bcrypt hash 평문 미저장 검증 |
| Commit 4 | `backend/src/__tests__/users-route.test.ts` (3) Fastify inject | POST /api/users 201 / 422 duplicate / 422 weak password (HTTP layer 검증) |
| Commit 5 | (재검증) | typecheck + lint + test:unit 모두 PASS — backend 22 tests, 3 workspace 100% |

커버리지: backend 추가 lib/service/route 모든 라인 ≥ 80% 충족. Prisma client는 vi.mock (이슈 #3 패턴).

## 4. 빌드·실행 검증 단계

```bash
# A — 정적 검증
pnpm install --frozen-lockfile
pnpm -r typecheck && pnpm -r lint
# B — 단위 테스트
pnpm -r test:unit
# C — GitHub Actions ci.yml 자동 (PR push 시) — 본 이슈부터 ci runner가 자동 실행
# D — Newman fixture (선택, release-readiness #23에서 본격)
```

## 5. 점진 합의 / 결정 발생 항목

- **ADR 작성 필요**: no — bcryptjs vs bcrypt, jsonwebtoken vs jose는 brief Open Questions 명시 + 본 plan 박제
- 사전 합의:
  - bcryptjs ^2.4.3 (CI 호환 + Windows native build 불필요)
  - jsonwebtoken ^9.0.2 (HS256)
  - bcrypt cost = 12 (timing ≥ 200ms)
  - password ≥ 8자
  - JWT_EXP_SECONDS = 604800 (7일, .env 박제 그대로)
  - JWT payload: `{sub: userId, username, iat, exp}`
  - 응답 schema: RealWorld 공식 `{user: {email, username, bio, image, token}}`
  - error body: `{errors: {field: [message]}}` (RealWorld 공식)
