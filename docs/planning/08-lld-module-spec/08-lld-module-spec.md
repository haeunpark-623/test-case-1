---
doc_type: module-spec
version: v0.2 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-19
gate: C
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-04, R-F-05, R-F-06, R-F-07, R-F-08, R-F-09, R-F-10, R-F-11, R-F-12, R-F-13, R-F-14, R-F-15, R-F-16, R-F-17, R-N-01, R-N-02, R-N-03, R-N-06]
  F-ID: [F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08]
  supersedes: null
---

# Conduit (RealWorld Clone) — Module Spec (LLD — 모듈/통신)

<!-- ADR-0031: 본 문서의 모든 모듈은 07 HLD §1 "핵심 모듈 / 컴포넌트" 표의 행을 그대로 인용. -->

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-19 | woosung.ahn@bespinglobal.com | 재생성 (/flow-design re-run, Phase 2/4) — 동일 07 §1 fan-out trace 유지 (15 모듈 "07 HLD §1 참조" 보존) |
| v0.1 | 2026-05-19 | woosung.ahn@bespinglobal.com | 초안 (/flow-design Gate C) — 15 모듈 LLD |

## 1. 모듈 개요

> **07 HLD §1 참조**: 본 §1의 모듈 ID 15개(M-BE-AUTH·M-BE-USER·M-BE-ARTICLE·M-BE-COMMENT·M-BE-TAG·M-BE-INFRA·M-BE-DB·M-FE-SHELL·M-FE-AUTH·M-FE-ARTICLE·M-FE-PROFILE·M-FE-COMMENT·M-FE-API·M-FE-AUTH-STORE·M-FE-MD·M-SHARED-TYPES)는 07 HLD §1 "핵심 모듈 / 컴포넌트" 표의 동명 행에서 fan-out된 것이다 (ADR-0031).

### M-BE-AUTH

- **모듈 ID**: M-BE-AUTH
- **책임**: 회원가입(POST /api/users)·로그인(POST /api/users/login)·JWT 발급(HS256·exp 7d)·JWT 검증 미들웨어. bcrypt 해시(cost=12).
- **07 HLD §1 참조**: 07 §1 행 1 (M-BE-AUTH).
- **R-ID 매핑**: R-F-01, R-F-02, R-F-17, R-N-02, R-N-03
- **F-ID 매핑**: F-01

### M-BE-USER

- **모듈 ID**: M-BE-USER
- **책임**: GET/PUT /api/user·GET /api/profiles/:username·POST/DELETE /api/profiles/:username/follow. 자기 자신 팔로우 403 거부.
- **07 HLD §1 참조**: 07 §1 행 2 (M-BE-USER).
- **R-ID 매핑**: R-F-03, R-F-04, R-F-05
- **F-ID 매핑**: F-02

### M-BE-ARTICLE

- **모듈 ID**: M-BE-ARTICLE
- **책임**: 글 CRUD + 목록 + feed + 즐겨찾기. slug 생성(`slugify(title) + nanoid(4)`).
- **07 HLD §1 참조**: 07 §1 행 3 (M-BE-ARTICLE).
- **R-ID 매핑**: R-F-06, R-F-07, R-F-08, R-F-09, R-F-10, R-F-11, R-F-12, R-N-01
- **F-ID 매핑**: F-03, F-04, F-05, F-06

### M-BE-COMMENT

- **모듈 ID**: M-BE-COMMENT
- **책임**: 댓글 CRUD. 작성자 본인만 삭제 (403 미들웨어).
- **07 HLD §1 참조**: 07 §1 행 4 (M-BE-COMMENT).
- **R-ID 매핑**: R-F-13, R-F-14, R-F-15
- **F-ID 매핑**: F-07

### M-BE-TAG

- **모듈 ID**: M-BE-TAG
- **책임**: 태그 마스터 + 인기 태그 집계(GET /api/tags). 단순 count desc 상위 20. 글 작성·수정 시 자동 upsert.
- **07 HLD §1 참조**: 07 §1 행 5 (M-BE-TAG).
- **R-ID 매핑**: R-F-16
- **F-ID 매핑**: F-08

### M-BE-INFRA

- **모듈 ID**: M-BE-INFRA
- **책임**: Fastify app·CORS·schema validation·request ID·pino 로그·전역 에러 핸들러(`{errors:{<field>:[...]}}`). cross-cutting.
- **07 HLD §1 참조**: 07 §1 행 6 (M-BE-INFRA).
- **R-ID 매핑**: R-N-02, R-N-06, R-N-07
- **F-ID 매핑**: (cross-cutting)

### M-BE-DB

- **모듈 ID**: M-BE-DB
- **책임**: Prisma Client 싱글톤·트랜잭션 헬퍼·마이그레이션 진입. dev `db push` / 운영 `migrate deploy`.
- **07 HLD §1 참조**: 07 §1 행 7 (M-BE-DB).
- **R-ID 매핑**: R-N-01, R-N-05
- **F-ID 매핑**: (cross-cutting)

### M-FE-SHELL

- **모듈 ID**: M-FE-SHELL
- **책임**: `App.tsx` + Header + Footer + HashRouter + AuthGuard + Layout grid.
- **07 HLD §1 참조**: 07 §1 행 8 (M-FE-SHELL).
- **R-ID 매핑**: R-F-17, R-N-04, R-N-07
- **F-ID 매핑**: F-01, F-05

### M-FE-AUTH

- **모듈 ID**: M-FE-AUTH
- **책임**: Login·Register·Settings + 폼 검증(zod) + localStorage 'conduit-jwt' + logout 핸들러.
- **07 HLD §1 참조**: 07 §1 행 9 (M-FE-AUTH).
- **R-ID 매핑**: R-F-01, R-F-02, R-F-03, R-F-17
- **F-ID 매핑**: F-01, F-02

### M-FE-ARTICLE

- **모듈 ID**: M-FE-ARTICLE
- **책임**: Home(Global/Your Feed·태그·페이지네이션) + Article 상세(markdown·즐겨찾기·삭제) + Editor.
- **07 HLD §1 참조**: 07 §1 행 10 (M-FE-ARTICLE).
- **R-ID 매핑**: R-F-06, R-F-07, R-F-08, R-F-09, R-F-10, R-F-11, R-F-12, R-N-01
- **F-ID 매핑**: F-03, F-04, F-05, F-06

### M-FE-PROFILE

- **모듈 ID**: M-FE-PROFILE
- **책임**: Profile 페이지 + My/Favorited 탭 + Follow 버튼. 본인 프로필은 Edit Profile만.
- **07 HLD §1 참조**: 07 §1 행 11 (M-FE-PROFILE).
- **R-ID 매핑**: R-F-04, R-F-05
- **F-ID 매핑**: F-02

### M-FE-COMMENT

- **모듈 ID**: M-FE-COMMENT
- **책임**: Article 상세 임베드 — 댓글 폼 + 카드 + 본인 trash. 비로그인은 "Sign in to add comments".
- **07 HLD §1 참조**: 07 §1 행 12 (M-FE-COMMENT).
- **R-ID 매핑**: R-F-13, R-F-14, R-F-15
- **F-ID 매핑**: F-07

### M-FE-API

- **모듈 ID**: M-FE-API
- **책임**: fetch wrapper. `Authorization: Token <jwt>` 자동. 401 → store.clear() + /#/login. 422 → `{errors}` 파싱.
- **07 HLD §1 참조**: 07 §1 행 13 (M-FE-API).
- **R-ID 매핑**: R-N-02
- **F-ID 매핑**: (cross-cutting)

### M-FE-AUTH-STORE

- **모듈 ID**: M-FE-AUTH-STORE
- **책임**: zustand — `{token, user}` 인메모리 + localStorage sync. R-F-17 logout에서 `clear()`.
- **07 HLD §1 참조**: 07 §1 행 14 (M-FE-AUTH-STORE).
- **R-ID 매핑**: R-F-17, R-N-02
- **F-ID 매핑**: F-01

### M-FE-MD

- **모듈 ID**: M-FE-MD
- **책임**: marked 12 + DOMPurify 3. 글 상세 본문 한정. heading anchor·image dimension 제한·script 차단.
- **07 HLD §1 참조**: 07 §1 행 15 (M-FE-MD).
- **R-ID 매핑**: R-F-08, R-N-02
- **F-ID 매핑**: F-04

### M-SHARED-TYPES

- **모듈 ID**: M-SHARED-TYPES
- **책임**: `@conduit/types` — Article·User·Comment·Profile·ErrorPayload TS type + Fastify schema에서 도출한 JSON Schema export.
- **07 HLD §1 참조**: 07 §1 행 16 (M-SHARED-TYPES).
- **R-ID 매핑**: (전체) — 페이로드 schema drift 차단
- **F-ID 매핑**: (cross-cutting)

## 2. 외부 인터페이스

| 인터페이스 | 입력 | 출력 | 에러 |
|---|---|---|---|
| M-BE-AUTH.signup(POST /api/users) | `{user:{username,email,password}}` | 201 `{user:{token,...}}` | 422 dup email/username, 422 password 짧음 |
| M-BE-AUTH.login(POST /api/users/login) | `{user:{email,password}}` | 200 `{user:{...}}` | 422 "email or password is invalid" |
| M-BE-AUTH.verifyJWT(미들웨어) | `Authorization: Token <jwt>` | `req.user={id,email,username}` | 401 unauthorized (만료/위변조/누락) |
| M-BE-USER.getCurrent(GET /api/user) | JWT | 200 `{user:{...}}` | 401 |
| M-BE-USER.update(PUT /api/user) | JWT + `{user: partial}` | 200 `{user:{...}}` | 401, 422 (email dup) |
| M-BE-USER.getProfile(GET /api/profiles/:username) | JWT optional | 200 `{profile:{...}}` | 404 |
| M-BE-USER.follow(POST /api/profiles/:username/follow) | JWT | 200 `{profile:{...,following:true}}` | 401, 403 (self), 404 |
| M-BE-USER.unfollow(DELETE) | JWT | 200 `{profile:{...,following:false}}` | 401, 404 |
| M-BE-ARTICLE.list(GET /api/articles) | optional JWT + `{tag?,author?,favorited?,limit=10,offset=0}` | 200 `{articles, articlesCount}` | 422 (limit > 100) |
| M-BE-ARTICLE.feed(GET /api/articles/feed) | JWT + `{limit, offset}` | 200 `{articles, articlesCount}` | 401 |
| M-BE-ARTICLE.get(GET /api/articles/:slug) | JWT optional | 200 `{article:{...}}` | 404 |
| M-BE-ARTICLE.create(POST /api/articles) | JWT + `{article:{title,description,body,tagList?}}` | 201 `{article}` | 401, 422 (title/body 누락) |
| M-BE-ARTICLE.update(PUT /api/articles/:slug) | JWT + `{article: partial}` | 200 `{article}` | 401, 403, 404 |
| M-BE-ARTICLE.delete(DELETE /api/articles/:slug) | JWT | 204 | 401, 403, 404 |
| M-BE-ARTICLE.favorite(POST /api/articles/:slug/favorite) | JWT | 200 `{article:{favorited:true}}` | 401, 404 |
| M-BE-ARTICLE.unfavorite(DELETE) | JWT | 200 `{article:{favorited:false}}` | 401, 404 |
| M-BE-COMMENT.list(GET /api/articles/:slug/comments) | optional JWT | 200 `{comments}` | 404 |
| M-BE-COMMENT.create(POST) | JWT + `{comment:{body}}` | 201 `{comment}` | 401, 404, 422 (빈 body) |
| M-BE-COMMENT.delete(DELETE /:id) | JWT | 204 | 401, 403, 404 |
| M-BE-TAG.list(GET /api/tags) | (none) | 200 `{tags: string[]}` | 500 (DB fallback) |
| M-FE-API.fetch(url, init?) | url + auto JWT | parsed json | rethrow {status, errors} |
| M-FE-AUTH-STORE.setToken(token) | string | (sync) | (none) — localStorage 실패 시 in-memory |
| M-FE-MD.render(markdown) | string | sanitized html | (sanitize 차단 silently) |
| @conduit/types.Article | (compile-time) | `interface Article {...}` | (none) |

## 3. 내부 컴포넌트

| 모듈 | 내부 컴포넌트 | 책임 |
|---|---|---|
| M-BE-AUTH | `routes/users.ts`, `services/authService.ts`, `lib/jwt.ts`, `lib/bcrypt.ts` | 라우트 / 비즈니스 / JWT / hash·compare |
| M-BE-USER | `routes/{user,profiles}.ts`, `services/{userService,followService}.ts` | 본인 user / 프로필 / 비즈니스 |
| M-BE-ARTICLE | `routes/articles.ts`, `services/{articleService,favoriteService}.ts`, `lib/slug.ts` | 라우트 / 비즈니스 / slug |
| M-BE-COMMENT | `routes/comments.ts`, `services/commentService.ts` | 댓글 |
| M-BE-TAG | `routes/tags.ts`, `services/tagService.ts` | 태그 집계 |
| M-BE-INFRA | `app.ts`, `plugins/{cors,auth,logger,errorHandler,requestId}.ts` | 부팅 + plugin |
| M-BE-DB | `prisma/schema.prisma`, `prisma/client.ts`, `prisma/migrations/`, `prisma/seed.ts` | schema·singleton·seed |
| M-FE-SHELL | `App.tsx`, `Layout.tsx`, `Header.tsx`, `Footer.tsx`, `AuthGuard.tsx`, `router.tsx` | shell |
| M-FE-AUTH | `pages/{Login,Register,Settings}.tsx`, `forms/AuthForm.tsx` | 인증 화면 |
| M-FE-ARTICLE | `pages/{Home,Article,Editor}.tsx`, `components/{ArticleCard,FeedTabs,Pagination,FavoriteButton}.tsx` | 페이지 + 컴포넌트 |
| M-FE-PROFILE | `pages/Profile.tsx`, `components/{ProfileTabs,FollowButton}.tsx` | 프로필 |
| M-FE-COMMENT | `components/{CommentForm,CommentList,CommentCard}.tsx` | 임베드 |
| M-FE-API | `lib/api.ts`, `lib/errors.ts` | wrapper + 에러 매핑 |
| M-FE-AUTH-STORE | `stores/auth.ts` | zustand |
| M-FE-MD | `lib/markdown.ts` | marked + DOMPurify |
| M-SHARED-TYPES | `packages/types/src/index.ts` | 공유 타입 export |

## 4. 데이터 흐름

본 절은 07 HLD §2 시퀀스를 그대로 인용. 모듈 경계 입·출력:

- **회원가입 (R-F-01)**: M-FE-AUTH → M-FE-API → POST /api/users → M-BE-AUTH(bcrypt) → M-BE-DB → JWT → localStorage `conduit-jwt`.
- **글 목록 + 인기 태그 (R-F-06+16)**: Home 진입 → GET /api/articles + /api/tags 병렬. M-BE-ARTICLE은 Prisma include로 author·tagList·favoritesCount 1쿼리.
- **글 상세 + 댓글 (R-F-08+14)**: GET /api/articles/:slug + /comments 병렬. M-FE-MD sanitize 렌더. 댓글 작성 시 optimistic prepend.
- **즐겨찾기 토글 (R-F-12)**: optimistic toggle → POST/DELETE → 응답으로 reconcile.
- **인증 만료 (R-N-02)**: M-BE-INFRA verifyJWT → 401 → M-FE-API catch → store.clear() + navigate /#/login.
- **부팅 (R-N-05)**: docker compose --env-file → db healthcheck → api Prisma migrate → vite/caddy → web ready.

## 5. 상태·라이프사이클

- **JWT**: 발급 즉시 localStorage → 새로고침 시 store hydrate. 만료(7d) 또는 logout 시 삭제.
- **글 slug**: 작성 시 `slugify(title) + '-' + nanoid(4)`. title 수정 시 재계산 (PUT 응답에 새 slug, M-FE-ARTICLE URL 갱신).
- **Article cache (FE)**: SWR-like 단순 캐시. mutation 시 invalidate.

## 6. 에러 처리

| 에러 | 발생 조건 | 처리 |
|---|---|---|
| 422 ValidationError | Fastify schema 실패 / 비즈니스 룰 위반 | `{errors:{<field>:["msg"]}}`. M-FE-API가 폼 위 표출 |
| 422 EmailTaken/UsernameTaken | unique 충돌 | `{errors:{email\|username:["has already been taken"]}}` |
| 422 InvalidCredentials | 로그인 실패 (user-enum 방지 동일 메시지) | `{errors:{"email or password":["is invalid"]}}` |
| 401 Unauthorized | JWT 누락/만료/위변조 | `{errors:{body:["unauthorized"]}}`. store.clear() + /#/login |
| 403 Forbidden | 타인 글/댓글 수정·삭제, self-follow | `{errors:{body:["forbidden"]}}` |
| 404 NotFound | 미존재 slug/username/comment id | `{errors:{<resource>:["not found"]}}` |
| 500 InternalError | DB 장애·예상 못 한 예외 | pino stack trace 기록 + `{errors:{body:["internal error"]}}` (PII 누출 금지) |
| MarkdownRenderError | DOMPurify 차단 태그 | silently 제거 |
| NetworkError (FE) | fetch reject | M-FE-API 토스트 + 재시도 |

## 7. 동시성·트랜잭션

- **글 생성/수정 + 태그 upsert**: `prisma.$transaction([articleUpsert, tagsUpsertMany])`.
- **즐겨찾기 idempotent**: POST upsert (no-op + count 불변). DELETE deleteMany (없으면 no-op).
- **slug 충돌**: nanoid(4) 64^4 ≈ 16M 공간. unique constraint + 충돌 시 1회 재시도.
- **세션**: stateless — DB 락 없음.

## 8. 테스트 진입점

| 모듈 | 단위 | 통합 | E2E |
|---|---|---|---|
| M-BE-AUTH | `services/authService.test.ts`·`lib/{jwt,bcrypt}.test.ts` | `routes/users.int.test.ts` (testcontainers) | Newman `auth.json` + gstack UC-01·02 |
| M-BE-USER | `services/{userService,followService}.test.ts` | `routes/{user,profiles}.int.test.ts` | Newman + gstack UC-09·11·12 |
| M-BE-ARTICLE | `services/{articleService,favoriteService}.test.ts`·`lib/slug.test.ts` | `routes/articles.int.test.ts` | Newman + gstack UC-03·04·05·06·07·08 |
| M-BE-COMMENT | `services/commentService.test.ts` | `routes/comments.int.test.ts` | Newman + gstack UC-10 |
| M-BE-TAG | `services/tagService.test.ts` | `routes/tags.int.test.ts` | (N/A — F-05 포함) |
| M-BE-INFRA | `plugins/{auth,errorHandler,logger,requestId}.test.ts` | `app.int.test.ts` smoke | (N/A) |
| M-BE-DB | `prisma/client.test.ts` | migration smoke int | (N/A) |
| M-FE-SHELL | `App.test.tsx`·`AuthGuard.test.tsx` | (N/A) | gstack 전 시나리오 |
| M-FE-AUTH | `pages/{Login,Register,Settings}.test.tsx` | MSW + RTL `auth.flow.test.tsx` | gstack UC-01·02·11 |
| M-FE-ARTICLE | `pages/{Home,Article,Editor}.test.tsx`·`components/{ArticleCard,Pagination}.test.tsx` | MSW + RTL `article.flow.test.tsx` | gstack UC-03·04·05·06·07·08 |
| M-FE-PROFILE | `pages/Profile.test.tsx`·`components/FollowButton.test.tsx` | MSW + RTL `profile.flow.test.tsx` | gstack UC-09·12 |
| M-FE-COMMENT | `components/{CommentForm,CommentList}.test.tsx` | MSW + RTL `comment.flow.test.tsx` | gstack UC-10 |
| M-FE-API | `lib/{api,errors}.test.ts` | MSW mock | (N/A) |
| M-FE-AUTH-STORE | `stores/auth.test.ts` | (N/A) | (N/A) |
| M-FE-MD | `lib/markdown.test.ts` (XSS 페이로드 회귀) | (N/A) | gstack 본문 sanitize |
| M-SHARED-TYPES | `packages/types/src/index.test-d.ts` (tsd) | (N/A) | (N/A) |
