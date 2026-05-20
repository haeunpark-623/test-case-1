---
doc_type: feature-code-review
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

# feat-be-auth-signup — Code Review

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — 5 commit diff |

## 0. Verdict

- **verdict**: PASS
- **reviewer**: @woosung.ahn@bespinglobal.com
- **review_at**: 2026-05-20

## 1. 컨트랙트 충실도

| Contract After 항목 | PR diff 위치 | 충족 |
|---|---|---|
| lib/jwt.ts (HS256 + JWT_SECRET ≥ 32자 + EXP) | Commit 2 | ✅ |
| lib/passwords.ts (bcryptjs cost=12) | Commit 2 | ✅ |
| lib/errors.ts (ApiError + AUTH_* PREFIX) | Commit 2 | ✅ |
| services/authService.signup | Commit 3 | ✅ — 검증 + 중복 + 해싱 + create + token |
| routes/users.ts POST /api/users | Commit 4 | ✅ — 201/422 envelope |
| app.ts async buildApp + usersRoutes register | Commit 4 | ✅ |
| 단위 22 tests (jwt 4 + passwords 3 + authService 5 + server 5 + client 5) + users-route 3 = **25 tests** | 검증 | ✅ — 25 PASS / 100% func / 94% line |
| RealWorld 응답 envelope | routes/users.ts | ✅ — `{user: {email, username, bio, image, token}}` 201 / `{errors: {field: [msg]}}` 422 |
| 09-lld-api-spec POST /api/users 정합 | spec ↔ 구현 | ✅ |
| 보안 — password 평문 미저장 | authService.signup | ✅ — hashPassword 후만 create |

10/10 ✅.

## 2. 테스트 커버리지

| Workspace | Tests | Line | Branch | Func |
|---|---|---|---|---|
| packages/types | 2 | 100% | 100% | 100% |
| backend | **25** | 94.04% | 81.63% | 100% |
| frontend | 1 | 100% | 100% | 100% |

threshold ≥80% 전 항목 충족. backend 일부 error path(line 28-29, 43-44 jwt.ts / 28-30 users.ts / 31-32, 42 authService.ts)는 unhappy path runtime 실패 케이스 — vi.mock에서 throw 시뮬레이션이 어려운 경로. 추가 보강 가능하나 threshold 충족하므로 PASS.

## 3. 보안 / 시크릿

- JWT_SECRET 길이 검증 (≥ 32자) — lib/jwt.ts ✅
- bcryptjs cost=12 — lib/passwords.ts ✅
- password 평문은 hashPassword 후 즉시 `password_hash` 컬럼 저장 — services/authService.ts ✅
- error envelope에 sensitive value 노출 0건 (`errors.email: ["has already been taken"]`만)
- `.env.<profile>` 평문 미커밋 (.gitignore #4 박제)
- JWT payload는 sub + username만 (email/password 미포함)
- grep secret: 0건 (placeholder 외)

## 4. 가독성 / 단순성

- lib 3 파일 < 50 라인씩 — 단일 책임
- authService.ts 단일 함수 signup — 검증/중복/해싱/create/token 5 단계 명확
- routes/users.ts try/catch — ApiError 분기 + unknown → 500
- naming: signToken/verifyToken/hashPassword/comparePassword — 동사+명사 일관

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
|---|---|---|---|---|
| jsonwebtoken JwtPayload 타입과 내부 DecodedPayload cast 충돌 | O | X (Commit 4에서 fix) | O | `as unknown as` cast 적용 |
| app.ts async 변경으로 server.ts/test 동시 갱신 필요 | O | X (Commit 4 일괄) | O | 처리 완료 |
| timing attack — duplicate username/email 응답이 bcrypt 전이라 즉시 422 | O | X — signup은 사양 허용 (login은 별 처리, #6에서) | O | F-RISK-03 risk 식별. signup N/A |
| 일부 unhappy path coverage < 100% | O | X — threshold ≥80% 충족 | O | 향후 보강 (별 minor PR 가능) |

4 in_scope, blocks_merge 0건.

## 6. NEEDS-WORK 항목

없음.
