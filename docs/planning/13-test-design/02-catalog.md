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

# Conduit (RealWorld Clone) — Test Design / Test Scenario Catalog (단위·통합·E2E 별 묶음)

> ADR-0036 — 레벨별 §1·§2·§3 + 매트릭스 §4. 모든 시나리오는 04 SRS·05 PRD 출처 인용 (ADR-0034).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-19 | woosung.ahn@bespinglobal.com | 재생성 (/flow-design re-run, Phase 2/4) — R-/F- fan-in (04·05 출처) + 매트릭스 ❌ 0건 보존 |
| v0.1 | 2026-05-19 | woosung.ahn@bespinglobal.com | 초안 — R-/F- 시나리오 fan-in |

## 1. 단위 테스트 카탈로그

### R-F-01 — 회원가입 (단위)

- **출처**: 04#R-F-01 · 05#F-01.
- **테스트 레벨**: 단위
- **시나리오**: `authService.signup({username,email,password})` — bcrypt cost=12 + Prisma create + JWT sign → `{user:{token,...}}`. `lib/jwt.sign({sub,email,username})` verify 동일 payload. `lib/bcrypt.hash` 결과 `^\$2[aby]\$12\$`.
- **진입점**: `services/authService.test.ts`, `lib/jwt.test.ts`, `lib/bcrypt.test.ts`.

### R-F-02 — 로그인 (단위)

- **출처**: 04#R-F-02 · 05#F-01.
- **테스트 레벨**: 단위
- **시나리오**: `authService.login` — DB findUnique + bcrypt.compare → 200 또는 동일 메시지 throw (E_AUTH_INVALID_CREDENTIALS). user enumeration 방지.

### R-F-03 — 현재 사용자 조회·수정 (단위)

- **출처**: 04#R-F-03 · 05#F-02.
- **테스트 레벨**: 단위
- **시나리오**: `userService.getCurrent(userId)` mock + `update(userId, partial)` email 중복 → E_USER_EMAIL_TAKEN.

### R-F-04 — 프로필 조회 (단위)

- **출처**: 04#R-F-04 · 05#F-02.
- **테스트 레벨**: 단위
- **시나리오**: `userService.getProfile(username, viewerId?)` — 비로그인 viewer → `following=false` / 미존재 → E_USER_NOT_FOUND.

### R-F-05 — 팔로우/언팔로우 (단위)

- **출처**: 04#R-F-05 · 05#F-02.
- **테스트 레벨**: 단위
- **시나리오**: `followService.follow(followerId, followeeUsername)` — self → E_USER_CANNOT_FOLLOW_SELF / idempotent upsert / unfollow deleteMany no-op.

### R-F-06 — 글 목록 (단위)

- **출처**: 04#R-F-06 · 05#F-05.
- **테스트 레벨**: 단위
- **시나리오**: `articleService.list({tag,author,favorited,limit,offset})` — 쿼리 매트릭스 / limit > 100 → E_VAL_LIMIT_EXCEEDED.

### R-F-07 — 개인 피드 (단위)

- **출처**: 04#R-F-07 · 05#F-06.
- **테스트 레벨**: 단위
- **시나리오**: `articleService.feed(userId, {limit,offset})` — followee 0명 → 빈 배열.

### R-F-08 — 글 상세 (단위)

- **출처**: 04#R-F-08 · 05#F-04.
- **테스트 레벨**: 단위
- **시나리오**: `articleService.get(slug, viewerId?)` — `favorited` 계산 / 미존재 → E_ART_NOT_FOUND.

### R-F-09 — 글 작성 (단위)

- **출처**: 04#R-F-09 · 05#F-03.
- **테스트 레벨**: 단위
- **시나리오**: `articleService.create(authorId, {title,description,body,tagList})` — slug 발급 + 태그 upsert / title 누락 → E_ART_TITLE_BLANK.

### R-F-10 — 글 수정 (단위)

- **출처**: 04#R-F-10 · 05#F-03.
- **테스트 레벨**: 단위
- **시나리오**: `articleService.update(slug, authorId, partial)` — 타인 → E_ART_FORBIDDEN / title 변경 시 slug 재계산.

### R-F-11 — 글 삭제 (단위)

- **출처**: 04#R-F-11 · 05#F-04.
- **테스트 레벨**: 단위
- **시나리오**: `articleService.delete(slug, authorId)` — cascade 검증 / 타인 → E_ART_FORBIDDEN.

### R-F-12 — 즐겨찾기 (단위)

- **출처**: 04#R-F-12 · 05#F-04.
- **테스트 레벨**: 단위
- **시나리오**: `favoriteService.add/remove` idempotent / count 정합.

### R-F-13 — 댓글 작성 (단위)

- **출처**: 04#R-F-13 · 05#F-07.
- **테스트 레벨**: 단위
- **시나리오**: `commentService.create(slug, authorId, {body})` — 빈 body → E_CMT_BODY_BLANK / 미존재 slug → E_ART_NOT_FOUND.

### R-F-14 — 댓글 목록 (단위)

- **출처**: 04#R-F-14 · 05#F-07.
- **테스트 레벨**: 단위
- **시나리오**: `commentService.list(slug)` — 최신순 / 미존재 slug → E_ART_NOT_FOUND.

### R-F-15 — 댓글 삭제 (단위)

- **출처**: 04#R-F-15 · 05#F-07.
- **테스트 레벨**: 단위
- **시나리오**: `commentService.delete(slug, commentId, authorId)` — 타인 → E_CMT_FORBIDDEN / 미존재 → E_CMT_NOT_FOUND.

### R-F-16 — 인기 태그 (단위)

- **출처**: 04#R-F-16 · 05#F-08.
- **테스트 레벨**: 단위
- **시나리오**: `tagService.popular(limit=20)` — count desc / 0개 빈 배열.

### R-F-17 — 로그아웃 (단위, FE 전용)

- **출처**: 04#R-F-17 · 05#F-01.
- **테스트 레벨**: 단위
- **시나리오**: `useAuth().logout()` — store.token null + localStorage.removeItem / 실패 시 in-memory fallback.

### R-N-02 — JWT 검증 (단위)

- **출처**: 04#R-N-02.
- **테스트 레벨**: 단위
- **시나리오**: `verifyJwt(token)` — 만료 → E_AUTH_TOKEN_EXPIRED / 위변조 → E_AUTH_TOKEN_INVALID.

### R-N-03 — bcrypt 해싱 (단위)

- **출처**: 04#R-N-03.
- **테스트 레벨**: 단위
- **시나리오**: `hash(password)` 평문 0건 + 패턴 `^\$2[aby]\$12\$` / `compare` 정확.

### R-N-06 — 구조적 로깅 (단위)

- **출처**: 04#R-N-06.
- **테스트 레벨**: 단위
- **시나리오**: `loggerPlugin` `req.id` 자동 / password·token PII 마스킹.

### F-01·F-02·F-03·F-04·F-05·F-06·F-07·F-08 — FE 컴포넌트 단위 (단위)

- **출처**: 05#F-01·02·03·04·05·06·07·08.
- **테스트 레벨**: 단위
- **시나리오**: 각 F-ID UI 컴포넌트 RTL 단위 — `<Login>`·`<ProfileCard>`·`<Editor>`·`<ArticleCard>`·`<FeedTabs>`·`<Pagination>`·`<CommentList>`·`<TagPills>`. 입력·콜백·렌더 매트릭스.

## 2. 통합 테스트 카탈로그

### R-F-01 — 회원가입 (통합)

- **출처**: 04#R-F-01.
- **테스트 레벨**: 통합
- **시나리오**: `POST /api/users` testcontainers + Fastify inject — Happy 201 / dup email 422 / dup username 422.
- **진입점**: `routes/users.int.test.ts`.

### R-F-02 — 로그인 (통합)

- **출처**: 04#R-F-02.
- **테스트 레벨**: 통합
- **시나리오**: `POST /api/users/login` — 200 + token / 잘못된 password 422 / 미존재 email 422 (동일).

### R-F-03 — 현재 사용자 (통합)

- **출처**: 04#R-F-03.
- **테스트 레벨**: 통합
- **시나리오**: `GET/PUT /api/user` — 토큰 없음 401 / 만료 401 / bio 변경 200 / email 중복 422.

### R-F-04 — 프로필 (통합)

- **출처**: 04#R-F-04.
- **테스트 레벨**: 통합
- **시나리오**: `GET /api/profiles/:username` — 200 / 404 / following 정확.

### R-F-05 — 팔로우 (통합)

- **출처**: 04#R-F-05.
- **테스트 레벨**: 통합
- **시나리오**: `POST/DELETE /api/profiles/:username/follow` — 200 / self 403 / 미로그인 401 / 미존재 404 + Your Feed 등장.

### R-F-06 — 글 목록 (통합)

- **출처**: 04#R-F-06.
- **테스트 레벨**: 통합
- **시나리오**: `GET /api/articles` — default 10 / tag / author / favorited / limit > 100 422 / offset.

### R-F-07 — 개인 피드 (통합)

- **출처**: 04#R-F-07.
- **테스트 레벨**: 통합
- **시나리오**: `GET /api/articles/feed` — 8건 Happy / 0명 빈 / 401.

### R-F-08·R-F-09·R-F-10·R-F-11 — 글 CRUD (통합)

- **출처**: 04#R-F-08·09·10·11.
- **테스트 레벨**: 통합
- **시나리오**: `GET/POST/PUT/DELETE /api/articles[/:slug]` 전 사이클 + cascade + title 변경 시 slug 재계산.

### R-F-12 — 즐겨찾기 (통합)

- **출처**: 04#R-F-12.
- **테스트 레벨**: 통합
- **시나리오**: `POST/DELETE /api/articles/:slug/favorite` — idempotent count 불변 + 401 / 404.

### R-F-13·R-F-14·R-F-15 — 댓글 CRUD (통합)

- **출처**: 04#R-F-13·14·15.
- **테스트 레벨**: 통합
- **시나리오**: 작성 201 / 목록 200 / 본인 삭제 204 / 타인 403 / 빈 body 422.

### R-F-16 — 인기 태그 (통합)

- **출처**: 04#R-F-16.
- **테스트 레벨**: 통합
- **시나리오**: `GET /api/tags` — 글 30개 with 다양한 태그 → 상위 20 desc / 0개 빈.

### R-N-01 — 응답 시간 (통합)

- **출처**: 04#R-N-01.
- **테스트 레벨**: 통합
- **시나리오**: testcontainers + k6 시드 100 → `GET /api/articles?limit=10` p95 ≤ 1000ms. N+1 회귀 시 Prisma query count assertion fail.

### R-N-02 — JWT 만료 통합 (통합)

- **출처**: 04#R-N-02.
- **테스트 레벨**: 통합
- **시나리오**: 만료 토큰으로 보호 endpoint → 401 + 페이로드.

### R-N-03 — 비밀번호 평문 회귀 (통합)

- **출처**: 04#R-N-03.
- **테스트 레벨**: 통합
- **시나리오**: 가입 후 DB 조회 → `password_hash` bcrypt 패턴 + 평문 0건.

### R-N-05 — 3 profile 부팅 자산 정합 (통합)

- **출처**: 04#R-N-05.
- **테스트 레벨**: 통합
- **시나리오**: `pnpm lint:boot-assets` — `.env.{p}.example` 6종 존재 + 12 §6 키 정합 + LOCAL.md §4 동기.

### R-N-06 — 로깅 미들웨어 (통합)

- **출처**: 04#R-N-06.
- **테스트 레벨**: 통합
- **시나리오**: 요청 1건 → pino capture → JSON 1줄 + 키 정합 + password 마스킹.

### F-01·F-02·F-03·F-04·F-05·F-06·F-07 — FE flow 통합 (통합)

- **출처**: 05#F-01·02·03·04·05·06·07.
- **테스트 레벨**: 통합
- **시나리오**: MSW + RTL — 가입 → 로그인 → 글 작성 → 즐겨찾기 → 댓글 → logout flow.

## 3. E2E 테스트 카탈로그

### R-F-01·R-F-02·R-F-17 — 인증 E2E (E2E)

- **출처**: 04#R-F-01·02·17 + 05#F-01.
- **테스트 레벨**: E2E
- **시나리오**: gstack UC-01·02·11 + Newman `auth.json` + axe-core 0 위반.

### R-F-03·R-F-04·R-F-05 — 프로필/팔로우 E2E (E2E)

- **출처**: 04#R-F-03·04·05 + 05#F-02.
- **테스트 레벨**: E2E
- **시나리오**: gstack UC-09 (팔로우 토글) + UC-11 (Settings 수정 → 헤더 반영) + UC-12 (프로필).

### R-F-06·R-F-16 — 글 목록 + 인기 태그 E2E (E2E)

- **출처**: 04#R-F-06·16 + 05#F-05·F-08.
- **테스트 레벨**: E2E
- **시나리오**: gstack UC-06 — Home → 카드 10 + 사이드바 태그 → 클릭 시 탭·필터 → 페이지네이션.

### R-F-07 — 개인 피드 E2E (E2E)

- **출처**: 04#R-F-07 + 05#F-06.
- **테스트 레벨**: E2E
- **시나리오**: gstack UC-07 — Your Feed → 팔로우 사용자 글만 / 0명 빈 상태.

### R-F-08·R-F-12 — 글 상세 + 즐겨찾기 E2E (E2E)

- **출처**: 04#R-F-08·12 + 05#F-04.
- **테스트 레벨**: E2E
- **시나리오**: gstack UC-04 + UC-08 — 카드 클릭 → 상세 markdown → 즐겨찾기 토글 → count 갱신.

### R-F-09·R-F-10·R-F-11 — Editor + 글 수정/삭제 E2E (E2E)

- **출처**: 04#R-F-09·10·11 + 05#F-03·F-04.
- **테스트 레벨**: E2E
- **시나리오**: gstack UC-03 + UC-05 — New Article → Publish → 본인 글 Edit → Update → Delete → 사라짐.

### R-F-13·R-F-14·R-F-15 — 댓글 CRUD E2E (E2E)

- **출처**: 04#R-F-13·14·15 + 05#F-07.
- **테스트 레벨**: E2E
- **시나리오**: gstack UC-10 — 댓글 작성 → prepend → 본인 trash → 제거. 비로그인 "Sign in to add comments".

### R-N-02 — 만료 토큰 리다이렉트 E2E (E2E)

- **출처**: 04#R-N-02.
- **테스트 레벨**: E2E
- **시나리오**: gstack — 만료 토큰 inject → 보호 endpoint 호출 401 → 자동 `/#/login` 리다이렉트 시각 확인.

### R-N-04 — 접근성 E2E (E2E)

- **출처**: 04#R-N-04.
- **테스트 레벨**: E2E
- **시나리오**: gstack 모든 골든패스 axe-core 자동 — Home·Login·Register·Editor·Article 5 화면 위반 0건.

### R-N-05 — 3 profile 부팅 E2E (E2E)

- **출처**: 04#R-N-05.
- **테스트 레벨**: E2E
- **시나리오**: AI 게이트 6축 — CI에서 `docker compose -f docker-compose.<profile>.yml ...` 3 profile 순차 → ready + 에러 0.

### R-N-07 — 브라우저 매트릭스 E2E (E2E)

- **출처**: 04#R-N-07.
- **테스트 레벨**: E2E
- **시나리오**: gstack 골든패스를 Chrome / Firefox / Safari 각 2 메이저 → 모두 PASS.

### Newman 전건 회귀 — RealWorld 합치 (E2E)

- **출처**: 04 §1 범위 + 01-project-brief §4 KPI 1.
- **테스트 레벨**: E2E
- **시나리오**: `tests/postman/conduit.postman_collection.json` Newman 실행 → 19 endpoint 모든 케이스 PASS.

## 4. 레벨 매트릭스 (단위·통합·E2E)

> ADR-0036 + ADR-0023 — ❌ 금지. ✅ = 등재됨 / N/A = 부적합.

| ID(R-/F-) | 단위 | 통합 | E2E | 비고 |
|---|---|---|---|---|
| R-F-01 | ✅ | ✅ | ✅ | 회원가입 — 04#R-F-01 |
| R-F-02 | ✅ | ✅ | ✅ | 로그인 — 04#R-F-02 |
| R-F-03 | ✅ | ✅ | ✅ | 현재 사용자 — 04#R-F-03 |
| R-F-04 | ✅ | ✅ | ✅ | 프로필 — 04#R-F-04 |
| R-F-05 | ✅ | ✅ | ✅ | 팔로우 — 04#R-F-05 |
| R-F-06 | ✅ | ✅ | ✅ | 글 목록 — 04#R-F-06 |
| R-F-07 | ✅ | ✅ | ✅ | 개인 피드 — 04#R-F-07 |
| R-F-08 | ✅ | ✅ | ✅ | 글 상세 — 04#R-F-08 |
| R-F-09 | ✅ | ✅ | ✅ | 글 작성 — 04#R-F-09 |
| R-F-10 | ✅ | ✅ | ✅ | 글 수정 — 04#R-F-10 |
| R-F-11 | ✅ | ✅ | ✅ | 글 삭제 — 04#R-F-11 |
| R-F-12 | ✅ | ✅ | ✅ | 즐겨찾기 — 04#R-F-12 |
| R-F-13 | ✅ | ✅ | ✅ | 댓글 작성 — 04#R-F-13 |
| R-F-14 | ✅ | ✅ | ✅ | 댓글 목록 — 04#R-F-14 |
| R-F-15 | ✅ | ✅ | ✅ | 댓글 삭제 — 04#R-F-15 |
| R-F-16 | ✅ | ✅ | N/A | 인기 태그 — F-05 골든패스 포함 |
| R-F-17 | ✅ | N/A | ✅ | 로그아웃 — 서버 호출 없음 |
| R-N-01 | N/A | ✅ | N/A | 성능 — 단위 의미 없음·E2E 노이즈 |
| R-N-02 | ✅ | ✅ | ✅ | JWT |
| R-N-03 | ✅ | ✅ | N/A | bcrypt — E2E hash 확인 불가 |
| R-N-04 | N/A | N/A | ✅ | 접근성 axe-core |
| R-N-05 | N/A | ✅ | ✅ | 3 profile 부팅 |
| R-N-06 | ✅ | ✅ | N/A | 로깅 |
| R-N-07 | N/A | N/A | ✅ | 브라우저 매트릭스 |
| F-01 | ✅ | ✅ | ✅ | 인증 (PRD) |
| F-02 | ✅ | ✅ | ✅ | 프로필 + 팔로우 |
| F-03 | ✅ | ✅ | ✅ | Editor |
| F-04 | ✅ | ✅ | ✅ | 글 상세 + 즐겨찾기 + 삭제 |
| F-05 | ✅ | ✅ | ✅ | 글 목록 |
| F-06 | ✅ | ✅ | ✅ | 개인 피드 |
| F-07 | ✅ | ✅ | ✅ | 댓글 |
| F-08 | ✅ | ✅ | N/A | 인기 태그 — F-05 포함 |

매트릭스 셀 ❌ 0건.
