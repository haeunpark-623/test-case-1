---
doc_type: srs
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-19
gate: B
related:
  R-ID: []
  F-ID: []
  supersedes: null
---

# Conduit (RealWorld Clone) — SRS

<!-- Gate B — 기능(R-F-NN) + 비기능(R-N-NN) 요구사항 카탈로그.
     각 R-ID는 ADR-0023 + ADR-0014 강제 — 우선순위/Acceptance/테스트 시나리오
     /단위·통합·E2E 결정/Happy/Failure 7요소 명시. -->

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-19 | woosung.ahn@bespinglobal.com | 초안 (/flow-init Gate B) |

## 1. 범위 / 가정

- **범위**: RealWorld 공식 backend API 엔드포인트 19개 + frontend 라우트 9개 + Bootstrap 4 시각 정합. MVP는 전체.
- **In-Scope**: 회원가입·로그인·프로필·글 CRUD·즐겨찾기·팔로우·댓글·태그.
- **Out-of-Scope**: 모바일 네이티브, 결제, OAuth, 이미지 업로드, 실시간 알림, i18n, 어드민 UI (01-project-brief §5 참조).
- **가정**:
  - 단일 풀스택 구현. backend·frontend stack은 Gate C에서 1택.
  - 인증은 JWT(Bearer) 1택. 세션 쿠키 옵션은 차기.
  - DB는 RDB 1택(PostgreSQL 후보). NoSQL 미고려.
  - 모든 시각 정합 기준은 RealWorld 공식 데모(https://demo.realworld.io).

## 2. 기능 요구사항

### R-F-01: 회원가입 (POST /api/users)

- **우선순위**: P0
- **요약**: 신규 사용자가 username·email·password로 가입 → JWT 발급.
- **Acceptance**:
  - Given 미가입 visitor가 `/#/register`를 열고 valid한 username·email·password를 입력했을 When Sign up을 클릭하면 Then 서버는 201 + `{user: {token, ...}}`을 반환하고 클라이언트는 토큰을 localStorage에 저장한다.
- **테스트 시나리오**:
  - 정상(Happy path): 유효한 신규 가입 → 201 + 토큰 발급 + `/#/` 리다이렉트.
  - 실패(Failure path): email 또는 username 중복 → 422 + body `{errors: {email: ["has already been taken"]}}` (또는 username) — 폼 위 에러 리스트로 표출.
  - 추가 실패: password 짧음(8자 미만 등 정책 결정) → 422.
- **단위: ✅** (유효성 검증·해싱·토큰 발급 함수 단위)
- **통합: ✅** (DB 충돌 케이스 포함)
- **E2E: ✅** (gstack `/qa` 가입 골든패스)

### R-F-02: 로그인 (POST /api/users/login)

- **우선순위**: P0
- **Acceptance**: Given 기존 Member가 valid email + password를 입력했을 When 로그인을 누르면 Then 서버는 200 + 토큰을 반환하고 클라이언트는 `/#/`로 이동한다.
- **테스트 시나리오**:
  - 정상(Happy): 정확한 자격증명 → 200 + 토큰.
  - 실패(Failure): 잘못된 password → 422 + "email or password is invalid".
  - 추가 실패: 존재하지 않는 email → 422 (동일 메시지로 사용자 enum 방지).
- **단위: ✅**
- **통합: ✅**
- **E2E: ✅**

### R-F-03: 현재 사용자 조회·수정 (GET / PUT /api/user)

- **우선순위**: P0
- **Acceptance**:
  - GET: Given 로그인된 Member의 JWT가 헤더에 있을 When GET `/api/user`를 호출하면 Then 200 + 본인 user 객체.
  - PUT: Given Member가 Settings 폼에서 email/username/bio/image/password 중 일부를 갱신할 When PUT 요청을 보내면 Then 200 + 갱신된 user 객체.
- **테스트 시나리오**:
  - 정상(Happy): bio 변경 → 200 + 갱신.
  - 실패(Failure): 토큰 만료 → 401 + 클라이언트 토큰 삭제 + `/#/login` 이동.
  - 추가 실패: email 중복 변경 → 422.
- **단위: ✅**
- **통합: ✅**
- **E2E: ✅**

### R-F-04: 프로필 조회 (GET /api/profiles/:username)

- **우선순위**: P0
- **Acceptance**: Given 누구든(인증 옵션) `/#/profile/:username`을 열 When GET `/api/profiles/:username`를 호출하면 Then 서버는 200 + `{profile: {username, bio, image, following}}`를 반환한다. 비로그인이면 `following=false` 고정.
- **테스트 시나리오**:
  - 정상(Happy): 존재 사용자 → 200.
  - 실패(Failure): 미존재 username → 404 + UI는 "Profile not found".
- **단위: ✅**
- **통합: ✅**
- **E2E: ✅**

### R-F-05: 팔로우 / 언팔로우 (POST/DELETE /api/profiles/:username/follow)

- **우선순위**: P1
- **Acceptance**: Given Member가 타 사용자 프로필에서 Follow를 누를 When POST `/api/profiles/:username/follow`를 호출하면 Then 200 + `{profile: {..., following: true}}`를 반환한다. 다시 누르면 DELETE → `following: false`.
- **테스트 시나리오**:
  - 정상(Happy): 팔로우 → following=true → Your Feed에 해당 사용자 글 등장.
  - 실패(Failure): 자기 자신 팔로우 시도 → 403 + 에러(또는 UI에서 Edit Profile만 노출하여 사전 방지).
  - 추가 실패: 비로그인 클릭 → 401.
- **단위: ✅**
- **통합: ✅**
- **E2E: ✅**

### R-F-06: 글 목록 조회 (GET /api/articles)

- **우선순위**: P0
- **Acceptance**:
  - Given 누구든(인증 옵션) `/#/`을 열 When GET `/api/articles?limit=10&offset=0`를 호출하면 Then 200 + `{articles: [...], articlesCount: N}`을 반환한다.
  - 쿼리: `tag` / `author` / `favorited` / `limit` / `offset` 지원. 미지정 시 default `limit=10, offset=0`.
- **테스트 시나리오**:
  - 정상(Happy): tag=dragons 필터 → 해당 태그 글만 반환.
  - 실패(Failure): limit > 1000 → 422 (또는 1000으로 cap, RealWorld 공식과 동치 결정 — 04-srs §6).
  - 추가 실패: DB 장애 → 500 + 클라이언트 에러 토스트.
- **단위: ✅**
- **통합: ✅**
- **E2E: ✅**

### R-F-07: 개인 피드 조회 (GET /api/articles/feed)

- **우선순위**: P1
- **Acceptance**: Given 로그인 Member가 Your Feed 탭을 열 When GET `/api/articles/feed?limit=10&offset=0`를 호출하면 Then 200 + 본인이 팔로우하는 사용자들의 글만 최신순으로 반환한다.
- **테스트 시나리오**:
  - 정상(Happy): 팔로우 2명 있고 각각 3·5개 글 → 8개 글 최신순.
  - 실패(Failure): 팔로우 0명 → 200 + `articles: []` + UI 빈 상태 메시지.
  - 추가 실패: 비로그인 → 401.
- **단위: ✅**
- **통합: ✅**
- **E2E: ✅**

### R-F-08: 글 상세 조회 (GET /api/articles/:slug)

- **우선순위**: P0
- **Acceptance**: Given 누구든 글 상세 페이지를 열 When GET `/api/articles/:slug`을 호출하면 Then 200 + 본문(markdown) + author + tagList + favoritesCount + favorited + createdAt/updatedAt를 반환한다.
- **테스트 시나리오**:
  - 정상(Happy): 존재 slug → 200, 클라이언트가 markdown 렌더링.
  - 실패(Failure): 미존재 slug → 404 + UI "Article not found".
  - 추가 실패: 삭제된 글 slug → 404.
- **단위: ✅**
- **통합: ✅**
- **E2E: ✅**

### R-F-09: 글 작성 (POST /api/articles)

- **우선순위**: P0
- **Acceptance**: Given Member가 `/#/editor`에서 title/description/body + tagList를 입력했을 When Publish를 누르면 Then 201 + 새 글 + slug(title 기반 + 충돌 시 suffix)를 반환한다.
- **테스트 시나리오**:
  - 정상(Happy): 유효 입력 → 201 + `/#/article/:slug` 이동.
  - 실패(Failure): title 또는 body 누락 → 422 + 폼 에러 리스트.
  - 추가 실패: 비로그인 → 401 → `/#/login` 이동.
- **단위: ✅**
- **통합: ✅**
- **E2E: ✅**

### R-F-10: 글 수정 (PUT /api/articles/:slug)

- **우선순위**: P0
- **Acceptance**: Given 작성자 본인 Member가 `/#/editor/:slug`에서 본문/제목 등을 수정할 When PUT `/api/articles/:slug`을 호출하면 Then 200 + 갱신 article를 반환한다. title 변경 시 slug도 재계산.
- **테스트 시나리오**:
  - 정상(Happy): 본인 글 수정 → 200.
  - 실패(Failure): 타인 글 수정 시도 → 403 거부.
  - 추가 실패: 빈 본문으로 수정 → 422.
- **단위: ✅**
- **통합: ✅**
- **E2E: ✅**

### R-F-11: 글 삭제 (DELETE /api/articles/:slug)

- **우선순위**: P1
- **Acceptance**: Given 작성자 본인이 글 상세에서 Delete를 클릭할 When DELETE `/api/articles/:slug`을 호출하면 Then 204를 반환하고 클라이언트는 `/#/`로 이동한다.
- **테스트 시나리오**:
  - 정상(Happy): 본인 글 삭제 → 204 + 목록에서 사라짐.
  - 실패(Failure): 타인 글 삭제 시도 → 403.
  - 추가 실패: 미존재 slug → 404.
- **단위: ✅**
- **통합: ✅**
- **E2E: ✅**

### R-F-12: 즐겨찾기 add / remove (POST/DELETE /api/articles/:slug/favorite)

- **우선순위**: P1
- **Acceptance**: Given Member가 글 카드 또는 상세의 favorite 버튼을 누를 When POST `/api/articles/:slug/favorite`을 호출하면 Then 200 + `{article: {..., favorited: true, favoritesCount: +1}}`을 반환한다. 다시 누르면 DELETE → false / -1.
- **테스트 시나리오**:
  - 정상(Happy): 즐겨찾기 add → favoritesCount 증가.
  - 실패(Failure): 비로그인 클릭 → 401 또는 UI에서 사전 차단 (`/#/login` 리다이렉트).
  - 추가 실패: 이미 favorited 상태에서 POST 재호출 → idempotent (200, count 불변).
- **단위: ✅**
- **통합: ✅**
- **E2E: ✅**

### R-F-13: 댓글 작성 (POST /api/articles/:slug/comments)

- **우선순위**: P1
- **Acceptance**: Given Member가 글 상세 하단 댓글 폼에 body를 입력하고 Post를 누를 When POST `/api/articles/:slug/comments`을 호출하면 Then 201 + `{comment: {id, body, author, createdAt}}`을 반환하고 UI에 추가한다.
- **테스트 시나리오**:
  - 정상(Happy): 본문 입력 → 201.
  - 실패(Failure): 빈 본문 → 422.
  - 추가 실패: 비로그인 → 401 + UI는 댓글 폼 자체를 "Sign in to add comments" 링크로 대체.
- **단위: ✅**
- **통합: ✅**
- **E2E: ✅**

### R-F-14: 댓글 목록 조회 (GET /api/articles/:slug/comments)

- **우선순위**: P1
- **Acceptance**: Given 누구든 글 상세를 열 When GET `/api/articles/:slug/comments`을 호출하면 Then 200 + `{comments: [...]}`을 최신순으로 반환한다.
- **테스트 시나리오**:
  - 정상(Happy): 댓글 0~N개 → 적절히 표출.
  - 실패(Failure): 미존재 slug → 404.
- **단위: ✅**
- **통합: ✅**
- **E2E: ✅**

### R-F-15: 댓글 삭제 (DELETE /api/articles/:slug/comments/:id)

- **우선순위**: P2
- **Acceptance**: Given 작성자 본인이 댓글의 trash 아이콘을 누를 When DELETE `/api/articles/:slug/comments/:id`을 호출하면 Then 204를 반환하고 UI에서 카드를 제거한다.
- **테스트 시나리오**:
  - 정상(Happy): 본인 댓글 삭제 → 204.
  - 실패(Failure): 타인 댓글 삭제 시도 → 403 거부.
  - 추가 실패: 미존재 id → 404.
- **단위: ✅**
- **통합: ✅**
- **E2E: ✅**

### R-F-16: 인기 태그 (GET /api/tags)

- **우선순위**: P2
- **Acceptance**: Given 누구든 `/#/`을 열 When GET `/api/tags`을 호출하면 Then 200 + `{tags: ["string", ...]}`을 반환한다 — 본 프로젝트는 단순 count desc 상위 20개.
- **테스트 시나리오**:
  - 정상(Happy): 태그 N개 있음 → 상위 20.
  - 실패(Failure): 태그 0개 → 200 + `tags: []`.
  - 추가 실패: 캐시 만료 + DB 일시 오류 → 500 또는 캐시 fallback.
- **단위: ✅**
- **통합: ✅**
- **E2E: N/A** (UI는 R-F-06 글 목록 골든패스에 포함되어 별도 E2E 불필요)

### R-F-17: 로그아웃 (클라이언트 전용)

- **우선순위**: P1
- **Acceptance**: Given Member가 Settings 페이지의 "click here to logout"을 누를 When 클라이언트가 localStorage 토큰을 삭제하면 Then Member 상태가 종료되고 `/#/`로 이동하며 헤더가 unauth로 전환된다.
- **테스트 시나리오**:
  - 정상(Happy): logout → 헤더 전환 + 다음 API 호출 토큰 미포함.
  - 실패(Failure): localStorage 접근 실패(시크릿 모드 등) → 폴백 메시지 + 메모리 토큰 폐기.
- **단위: ✅**
- **통합: N/A** (서버 호출 없음)
- **E2E: ✅** (gstack 헤더 전환 확인)

## 3. 비기능 요구사항

### R-N-01: 성능 — 글 목록·상세 응답시간

- **우선순위**: P1
- **Acceptance**: Given dev profile에서 100건 시드 데이터가 있을 When GET `/api/articles?limit=10`를 요청하면 Then p95 ≤ 1000ms로 응답한다 (단일 인스턴스 기준).
- **테스트 시나리오**:
  - 정상(Happy): 평균 latency 측정 → p95 < 1000ms.
  - 실패(Failure): N+1 쿼리 회귀로 latency 2000ms 초과 → DB query log + alerting.
- **단위: N/A**
- **통합: ✅** (testcontainers + k6 마이크로 부하)
- **E2E: N/A**

### R-N-02: 보안 — JWT 발급·검증·만료

- **우선순위**: P0
- **Acceptance**: Given JWT가 만료된 클라이언트가 인증 필요 API를 호출할 When 서버가 401을 응답하면 Then 클라이언트는 토큰을 삭제하고 `/#/login`으로 리다이렉트한다.
- **테스트 시나리오**:
  - 정상(Happy): 유효 토큰 → 인증 통과.
  - 실패(Failure): 만료/위변조 토큰 → 401 + 클라이언트 폴백.
- **단위: ✅** (토큰 발급/검증 함수)
- **통합: ✅** (만료된 토큰으로 보호 엔드포인트 호출)
- **E2E: ✅** (만료 시 리다이렉트 시각 확인)

### R-N-03: 보안 — 비밀번호 해싱·저장

- **우선순위**: P0
- **Acceptance**: Given password가 평문으로 수신될 When 서버가 bcrypt(또는 argon2) 해시 후 저장하면 Then DB에는 평문 비밀번호가 0건이다.
- **테스트 시나리오**:
  - 정상(Happy): 가입 후 DB 조회 → bcrypt 해시 패턴.
  - 실패(Failure): 평문 저장 회귀 → 통합 테스트 fail (DB 컬럼 정규식 검증).
- **단위: ✅**
- **통합: ✅**
- **E2E: N/A**

### R-N-04: 접근성 — WCAG 2.1 AA

- **우선순위**: P2
- **Acceptance**: Given 핵심 5 화면(Home/Login/Register/Editor/Article)을 axe-core로 스캔할 When CI가 검사를 실행하면 Then 색대비·키보드 트랩·라벨 부재 위반이 0건이어야 한다.
- **테스트 시나리오**:
  - 정상(Happy): axe-core CI 통과.
  - 실패(Failure): 색대비 위반 발견 → AI 게이트 5축 BLOCK.
- **단위: N/A**
- **통합: N/A**
- **E2E: ✅** (gstack `/qa` 골든패스에 axe-core 통합)

### R-N-05: 가용성 — dev/stg/prod 3 profile 부팅 (ADR-0037 v1.1)

- **우선순위**: P0
- **Acceptance**: Given fresh checkout 상태에서 LOCAL.md §3 명령을 profile별로 실행할 When dev·stg·prod 3 profile을 부팅하면 Then 각 profile에서 ready 신호 도달 + 부팅 에러 0건이어야 한다.
- **테스트 시나리오**:
  - 정상(Happy): 3 profile 모두 부팅 성공 → AI 게이트 6번째 축 PASS.
  - 실패(Failure): `.env.stg.example` 누락 또는 migration 회귀 → 부팅 실패 + PR BLOCK.
  - 추가 실패: 부팅 자산(LOCAL.md·migrations·lockfile) 1개 profile만 갱신, 나머지 누락 → AI 게이트 6번째 축 BLOCK(ADR-0040).
- **단위: N/A**
- **통합: ✅** (부팅 자산 정합 lint)
- **E2E: ✅** (LOCAL.md §3 실 부팅)

### R-N-06: 관측 — 구조적 로깅 + 요청 ID

- **우선순위**: P2
- **Acceptance**: Given 모든 API 요청이 들어올 When 응답 시점에 미들웨어가 동작하면 Then `{request_id, method, path, status, latency_ms, user_id?}` JSON 로그 1줄을 출력하며 PII는 마스킹한다.
- **테스트 시나리오**:
  - 정상(Happy): 요청 1건 → 로그 1줄 + request_id 헤더 echo.
  - 실패(Failure): password 같은 PII가 로그에 raw로 등장 → 통합 테스트 fail.
- **단위: ✅**
- **통합: ✅**
- **E2E: N/A**

### R-N-07: 호환성 — 브라우저 지원

- **우선순위**: P2
- **Acceptance**: Given 핵심 흐름이 최신 Chrome / Firefox / Safari (각 2개 메이저 버전)에서 동작할 When gstack `/qa`가 모든 브라우저에서 골든패스를 실행하면 Then 모두 PASS여야 하며 IE는 미지원으로 명시한다.
- **테스트 시나리오**:
  - 정상(Happy): Chromium 기반 E2E PASS.
  - 실패(Failure): Safari-specific localStorage 동작 차이로 로그인 회귀 → 통합 테스트 fail + 호환성 매트릭스 갱신.
- **단위: N/A**
- **통합: N/A**
- **E2E: ✅**

## 4. 인터페이스 요구사항

- **API**: REST/JSON, base `/api`. 인증은 `Authorization: Token <jwt>` 헤더(RealWorld 관례 — Bearer 아님). CORS: dev/stg/prod 각 frontend origin allow-list.
- **에러 페이로드**: `{errors: {<field>: ["msg", ...]}}` — RealWorld 공식 컨벤션. validation·401·403·404·422·500 모두 동일 shape.
- **페이지네이션**: `limit`(default 10, max 100) + `offset`(default 0).
- **시간 포맷**: ISO 8601 UTC (`2026-05-19T12:34:56.000Z`).
- **클라이언트 라우팅**: hash-based (`/#/...`) — RealWorld 공식 spec 명시. SSR 없음.
- **외부 데이터**: 없음. 본 프로젝트는 자체 DB 1택.

## 5. 도메인 모델

```
User(id, email, username, password_hash, bio, image, created_at, updated_at)
Article(id, slug, title, description, body, author_id → User, created_at, updated_at)
Tag(id, name)
ArticleTag(article_id, tag_id)      -- M:N
Comment(id, body, article_id → Article, author_id → User, created_at, updated_at)
Favorite(user_id → User, article_id → Article)              -- 복합키
Follow(follower_id → User, followee_id → User)              -- 복합키
```

> 정본 ERD는 Gate C(`/implementation-planner --mode=hld`)에서 확정. 본 §5는 큰 그림.

## 6. Open Questions

- `limit` upper bound (RealWorld 공식 데모는 명시 없음. 본 프로젝트는 max 100 권고).
- slug 충돌 시 suffix 정책 (`-2`, `-3` 점진 / UUID4 4자리 / hash) — Gate C에서 결정.
- password 복잡도 (최소 8자 / 영문+숫자 / NIST 권고 따르기 등) — Gate C에서 결정.
- `priority:high` 라벨 hotfix 시나리오 정의 (운영 후).
- 토큰 만료시간 (15min access + 7d refresh / 24h single token) — Gate C에서 결정.
