---
doc_type: feature-brief
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

# feat-be-auth-signup — Feature Brief

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — Sprint 1 #5. M-BE-AUTH 모듈 첫 라우트 (POST /api/users) |

## 1. 한 줄 의도

POST `/api/users`로 회원가입 + JWT 발급 (HS256 + 7일 만료), bcrypt(cost=12) 해싱으로 평문 미저장, email/username 중복 422 + 8자 미만 password 422, 단위 ≥5 + 통합 ≥2 테스트.

## 2. 사용자 가치

RealWorld 사용자가 #/register 화면에서 가입 가능. 이후 #6 be-auth-login·#7 be-user-me·#8 fe-shell-router의 의존성 해소. R-N-02 (JWT) + R-N-03 (bcrypt) 보안 요구 충족.

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 (이슈 #4 머지 후 main) | 변경 후 |
| --- | --- | --- |
| backend routes | `/health` 1개 | `/health` + `POST /api/users` 2개 |
| M-BE-AUTH 모듈 | 미생성 | `routes/users.ts` + `services/authService.ts` + `lib/{jwt,passwords,errors}.ts` |
| bcrypt 의존성 | 없음 | `bcryptjs@^2.4.3` (네이티브 의존성 없음, CI 호환) |
| jsonwebtoken 의존성 | 없음 | `jsonwebtoken@^9.0.2` |
| 단위 테스트 | backend 10 tests | + jwt(4) + passwords(3) + authService(5) = 22 tests |
| 통합 테스트 | 0 | + signup happy + duplicate email + weak password = 3 tests (Fastify inject + Prisma test DB) |
| Error PREFIX | 미정의 | `INFRA_/AUTH_/USER_/...` (11 §2) — `AUTH_SIGNUP_DUPLICATE`·`AUTH_SIGNUP_WEAK_PASSWORD` |
| JWT 검증 미들웨어 | 없음 | 본 이슈는 발급만 박제 — 검증은 #6 be-auth-login 또는 #7 be-user-me |

## 4. 모드 자동 감지 결과

**mode=add** (type:feature 라벨 + 신규 동작 + 부정 시그널 0). slug `feat-be-auth-signup`. 브랜치 `feat/be-auth-signup-issue-5`.

## 5. 영향 범위

**신규 파일 (backend)**:
- `backend/src/lib/jwt.ts` — sign({sub, exp}) + verify(token) (HS256, JWT_SECRET, JWT_EXP_SECONDS)
- `backend/src/lib/passwords.ts` — hashPassword + comparePassword (bcryptjs cost=12)
- `backend/src/lib/errors.ts` — `ApiError` 클래스 + error codes table (`AUTH_*`·`USER_*`·`INFRA_*` PREFIX)
- `backend/src/services/authService.ts` — `signup({email, username, password})` (검증 → 중복 체크 → 해싱 → User.create → JWT 발급)
- `backend/src/routes/users.ts` — Fastify route POST `/api/users` + RealWorld request/response schema
- `backend/src/__tests__/jwt.test.ts` — 4 tests (sign+verify cycle / 만료 / 잘못된 secret / payload)
- `backend/src/__tests__/passwords.test.ts` — 3 tests (hash 패턴 / compare ok / compare wrong)
- `backend/src/__tests__/authService.test.ts` — 5 tests (signup happy / dup email / dup username / weak password / 응답 schema)
- `backend/src/__tests__/integration/signup.test.ts` — 3 통합 tests (Fastify inject + 실 DB)

**갱신**:
- `backend/src/app.ts` — `routes/users.ts` 등록 (`app.register(usersRoutes)`)
- `backend/package.json` — `bcryptjs` + `@types/bcryptjs` + `jsonwebtoken` + `@types/jsonwebtoken` devDep

**박제 검증** (변경 없음):
- 이슈 #2 박제 `backend/.env.*.example` (JWT_SECRET·JWT_EXP_SECONDS 그대로)
- 이슈 #3 박제 `backend/prisma/schema.prisma` User 모델 + `backend/src/prisma/client.ts`
- 이슈 #4 박제 `.github/workflows/ci.yml` (자동 검증)

## 6. 비목표

- POST /api/users/login (로그인) — 이슈 #6 책임
- GET/PUT /api/user (현재 사용자) — 이슈 #7 책임
- JWT verify 미들웨어 (보호 라우트용) — #6 또는 #7
- Rate limit (5 req/hour/IP) — 09-lld-api-spec §"운영 단계" — `release-readiness` #23
- bcrypt argon2 마이그레이션 — 별 ADR
- Refresh token — 본 프로젝트 scope 외 (RealWorld 표준 X)
- Email 인증 / 비밀번호 재설정 — scope 외

## 7. Open Questions

- Q1: bcrypt 네이티브 vs bcryptjs? → **bcryptjs** — CI runner 호환 + Windows native build 불필요. timing cost=12 ≥ 200ms는 동일.
- Q2: jsonwebtoken vs jose? → **jsonwebtoken** — HS256 정공 + 가장 보편적 + RealWorld 공식 예제 호환
- Q3: 422 error body 정확 schema? → RealWorld 공식 `{errors: {field: ["message"]}}` — `body.errors.email = ["has already been taken"]`
- Q4: password 정책 — 8자 미만만 거부? → **8자 미만 거부** (09-lld-api-spec §3 명시) + 추가 정책(특수문자 등)은 별 이슈
- Q5: JWT payload — sub(userId)만 vs username 포함? → **sub + username** (FE에서 즉시 사용)

## 참조

- 상류: Issue #5, `04-srs/04-srs.md` R-F-01·R-N-02·R-N-03, `09-lld-api-spec/09-lld-api-spec.md` POST /api/users, `11-coding-conventions/11-coding-conventions.md` §2 에러 PREFIX, `12-scaffolding/typescript.md` §4 M-BE-AUTH
- 하류: #6 be-auth-login (login + verify 미들웨어), #7 be-user-me (보호 라우트), #9 fe-auth-screens (Register UI)
