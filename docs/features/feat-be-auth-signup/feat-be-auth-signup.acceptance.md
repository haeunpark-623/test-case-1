---
doc_type: feature-acceptance
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

# feat-be-auth-signup — Acceptance Criteria

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — POST /api/users AC + DoD |

## 1. 인수 기준 (Given/When/Then)

### AC-01: 회원가입 happy path 201

- **R-ID**: R-F-01
- **Given**: 미가입 visitor, 유효 username `^[A-Za-z0-9_-]{1,32}$` + 유효 email + 8자 이상 password
- **When**: `POST /api/users` body `{"user":{"username":"...","email":"...","password":"..."}}` 전송
- **Then**: HTTP **201** + body `{"user":{"email":"...","username":"...","bio":"","image":"","token":"<jwt>"}}`. JWT는 HS256 + sub=userId + 7일 만료.
- **측정 방법**: 자동 테스트 (Fastify inject)

### AC-02: 중복 email 422

- **R-ID**: R-F-01
- **Given**: 기존 사용자 email = `jane@example.com`
- **When**: 동일 email로 POST /api/users
- **Then**: HTTP **422** + body `{"errors":{"email":["has already been taken"]}}`. DB에 신규 row 0건.
- **측정 방법**: 자동 테스트

### AC-03: 중복 username 422

- **R-ID**: R-F-01
- **Given**: 기존 사용자 username = `jane`
- **When**: 동일 username + 다른 email로 POST /api/users
- **Then**: HTTP **422** + body `{"errors":{"username":["has already been taken"]}}`. DB row 0.
- **측정 방법**: 자동 테스트

### AC-04: 8자 미만 password 422

- **R-ID**: R-F-01
- **Given**: password = `"abc"` (3자)
- **When**: POST /api/users
- **Then**: HTTP **422** + body `{"errors":{"password":["is too short"]}}`. DB row 0.
- **측정 방법**: 자동 테스트

### AC-05: bcrypt 해시 평문 미저장 (R-N-03)

- **R-ID**: R-N-03
- **Given**: AC-01 happy path 완료 후
- **When**: `SELECT password_hash FROM users WHERE email = ...` 조회
- **Then**: 값이 bcrypt 패턴 `^\$2[aby]?\$\d+\$[./A-Za-z0-9]{53}$`. 평문 비밀번호 0건.
- **측정 방법**: 자동 테스트 (DB row 정규식 검증)

### AC-06: JWT 발급 + verify cycle (R-N-02)

- **R-ID**: R-N-02
- **Given**: AC-01 token
- **When**: `verifyToken(token, JWT_SECRET)` 호출
- **Then**: payload `{sub: userId, username, iat, exp}` 디코딩 성공. exp - iat == 604800.
- **측정 방법**: 자동 테스트 (jwt.test.ts)

### AC-07: bcrypt cost=12 timing ≥ 200ms

- **R-ID**: R-N-03
- **Given**: bcryptjs cost=12 설정
- **When**: `hashPassword("test1234")` 실행 측정
- **Then**: 실행 시간 ≥ 200ms (테스트 환경에 따라 일부 변동, 일반적으로 200~600ms)
- **측정 방법**: 자동 테스트 (passwords.test.ts performance assertion)

### AC-08: lint + typecheck + 단위 + 통합 PASS

- **R-ID**: R-N-06
- **Given**: 본 PR diff 적용
- **When**: `pnpm -r typecheck && lint && test:unit`
- **Then**: 3 workspace exit 0. backend 22 tests + 통합 3 tests = 25 tests all PASS. 커버리지 ≥ 80%.
- **측정 방법**: 자동 테스트

### AC-09: ci.yml 자동 status check PASS

- **R-ID**: R-N-05
- **Given**: 본 PR push (#4 머지 후 첫 ci 자동 적용)
- **When**: GitHub Actions runner 실행
- **Then**: `lint + typecheck + unit + smoke` step 모두 PASS. PR merge 게이트 정상.
- **측정 방법**: 자동 — `gh pr checks <PR>` 결과

## 2. Definition of Done (D-06)

- [ ] **단위 테스트**: backend 22 tests + 통합 3 tests 모두 PASS, 커버리지 ≥ 80%
- [ ] **AI 게이트**: 6축 PASS — ci.yml 자동 검증 포함 (6번째 축 active)
- [ ] **Test Plan 4블록**: PR body 4 sub-section
- [ ] **tested 라벨**: ADR-0046 v1.2 폐지 — pr-body-checkboxes status check 대체
- [ ] **Approve**: ≥ 1
- [ ] **CI green**: ci.yml status check PASS

## 3. 비기능 인수

- POST /api/users 응답 시간 < 500ms (bcrypt 포함, 로컬 dev)
- JWT 토큰 크기 < 500 bytes
- bcrypt cost=12 → 200~600ms

## 4. 회귀 인수

mode=add 신규 라우트. 기존 `/health` 200 응답 정상 유지 (회귀 0건). 이슈 #2~#4 기존 13 tests 100% 유지.
