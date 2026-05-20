---
doc_type: feature-contract
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

# feat-be-auth-signup — Change Contract

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — M-BE-AUTH 모듈 첫 라우트 contract |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
|---|---|---|
| R-ID (요구) | `docs/planning/04-srs/04-srs.md` | R-F-01 (회원가입), R-N-02 (JWT 발급), R-N-03 (bcrypt 해싱) |
| F-ID (기능) | `docs/planning/05-prd/05-prd.md` | F-01 (Authentication & Authorization) |
| 영향 모듈 | `docs/planning/07-hld/07-hld.md` §1 + `08-lld-module-spec/08-lld-module-spec.md` | M-BE-AUTH (신규), M-BE-INFRA (app.ts 라우트 등록), M-BE-DB (User.create via prisma client) |
| 영향 엔드포인트 | `docs/planning/09-lld-api-spec/09-lld-api-spec.md` | POST /api/users (신규 박제) |
| 적용 컨벤션 절 | `docs/planning/11-coding-conventions/11-coding-conventions.md` + `12-scaffolding/typescript.md` | 11 §1 명명 (camelCase 함수, PascalCase 클래스) · §2 에러 PREFIX (AUTH_/INFRA_/USER_) · §5 Lint / 12 §4 M-BE-AUTH 디렉토리 (`routes/users.ts` + `services/authService.ts` + `lib/{jwt,passwords,errors}.ts`) |

## 1. 변경 의도

POST `/api/users` 라우트 박제로 RealWorld 회원가입 흐름 활성화. bcryptjs(cost=12) 해싱 + HS256 JWT 발급 + email/username 중복 422 + 8자 미만 password 422. R-F-01 + R-N-02 + R-N-03 충족.

## 2. Before / After

| 항목 | Before (#4 머지 후) | After |
|---|---|---|
| backend routes | `GET /health` 1개 | `GET /health` + `POST /api/users` 2개 |
| M-BE-AUTH 모듈 | 미생성 | `routes/users.ts` + `services/authService.ts` + `lib/{jwt,passwords,errors}.ts` |
| backend devDependencies | (#2·#3 박제) | + `bcryptjs ^2.4.3` + `@types/bcryptjs` + `jsonwebtoken ^9.0.2` + `@types/jsonwebtoken` |
| 단위 테스트 | backend 10 tests / 100% | + jwt(4) + passwords(3) + authService(5) = **22 tests** |
| 통합 테스트 | 0 | + signup 3 tests (Fastify inject + 실 DB, 본 PR 머지 후 ci runner에서 실행) |
| API error format | 미정의 | RealWorld 공식 `{errors: {field: [message]}}` + 내부 PREFIX `AUTH_*`·`INFRA_*` |
| JWT 발급/검증 lib | 없음 | `signToken(payload)` + `verifyToken(token)` (HS256, JWT_SECRET, JWT_EXP_SECONDS 환경 변수 의존) |
| Password hashing lib | 없음 | `hashPassword(plain)` + `comparePassword(plain, hash)` (bcryptjs cost=12) |
| Error class | 없음 | `ApiError(code: string, status: number, fields?: Record<string, string[]>)` |
| 응답 schema | placeholder `/health` 200만 | `POST /api/users` → 201 `{user: {email, username, bio, image, token}}` / 422 `{errors: {email\|username\|password: [...]}}` |
| 데이터 영속성 | seed 880 row (#3) | + signup 시 User 1 row 추가 (password_hash bcrypt만, 평문 0건) |
| 보안 절대 규칙 | (#2~#4 정합) | password 평문 0건 commit (bcrypt 해시만 DB 저장 + JWT_SECRET은 .env 환경 변수) |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
|---|---|---|
| `backend/src/app.ts` | 신규 routes register | 본 PR diff |
| `backend/src/prisma/client.ts` (#3 박제) | `prisma.user.create` 호출 | 본 이슈가 첫 사용자 |
| `backend/.env.*.example` (#2 박제) | `JWT_SECRET`·`JWT_EXP_SECONDS` 그대로 사용 | 변경 없음 |
| `backend/prisma/schema.prisma` (#3 박제) | User 모델 그대로 사용 | 변경 없음 |
| `.github/workflows/ci.yml` (#4 박제) | 본 PR이 첫 자동 검증 대상 | ci status check가 본 PR 머지 게이트 |
| 후속 이슈 #6 `be-auth-login` | `comparePassword` + `signToken` lib 재사용 + `verifyToken` 새로 정의 가능 | 본 이슈가 base lib 박제 |
| 후속 이슈 #7 `be-user-me` | `verifyToken` 미들웨어 + `req.user` decoration | 본 이슈가 lib 기반 |
| 후속 이슈 #9 `fe-auth-screens` | Register 폼 → POST /api/users 호출 | 본 이슈가 API 박제 |
| `docs/planning/09-lld-api-spec/09-lld-api-spec.md` POST /api/users | 본 이슈가 spec 그대로 구현 | spec ↔ 구현 정합 (code-review에서 점검) |

## 4. Backward Compatibility

- **Breaking**: no
- **마이그레이션 필요**: no

신규 라우트 + 신규 모듈. 기존 `/health` 영향 없음.

## 5. Rollback 전략

- **revert 가능**: yes
- **rollback 절차**:
  1. `git revert <merge-commit-sha>` (squash 단일)
  2. DB는 `Users` 테이블 비움 또는 그대로 (signup으로 생긴 row만 정리 — 운영 시 별 SQL)
  3. 후속 #6·#7·#9 이슈가 본 이슈 lib 의존 → 회귀 시 그 이슈도 BLOCK
- **데이터 손상 위험**: low — 본 이슈가 첫 signup, DB User row가 적음. revert 시 새 signup만 차단. 기존 row는 보존 (cascade delete 없이 schema 그대로)

## 6. 비목표

- 로그인 / 보호 라우트 / refresh / email 인증 — 후속 이슈
- Rate limit / 캡차 — `release-readiness` #23
- argon2 / OAuth2 / SSO — scope 외
