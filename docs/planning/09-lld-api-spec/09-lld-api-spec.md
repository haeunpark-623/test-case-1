---
doc_type: api-spec
version: v0.2 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-19
gate: C
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-04, R-F-05, R-F-06, R-F-07, R-F-08, R-F-09, R-F-10, R-F-11, R-F-12, R-F-13, R-F-14, R-F-15, R-F-16, R-N-01, R-N-02, R-N-06]
  F-ID: [F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08]
  supersedes: null
---

# Conduit (RealWorld Clone) — API Spec (LLD — 외부 인터페이스)

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-19 | woosung.ahn@bespinglobal.com | 재생성 (/flow-design re-run, Phase 2/4) — 19 endpoint × (메서드·경로·F-/R-ID) 매트릭스 보존, Newman 컬렉션 회귀 baseline 유지 |
| v0.1 | 2026-05-19 | woosung.ahn@bespinglobal.com | 초안 (/flow-design Gate C) — 19 RealWorld 엔드포인트 |

## 1. 개요

- **Base URL**: `/api` (예: `https://conduit.example.com/api/articles`).
- **포맷**: JSON. UTF-8. 시간 ISO 8601 UTC.
- **인증**: `Authorization: Token <jwt>` 헤더 (RealWorld 관례 — Bearer 아님). JWT HS256 + exp 7d.
- **에러 페이로드**: 모든 4xx/5xx — `{errors: {<field>: ["msg", ...]}}`.
- **페이지네이션**: `limit`(default 10, max 100), `offset`(default 0). 초과 시 422.
- **CORS**: profile별 origin allow-list.
- **호환성 기준**: 공식 RealWorld Postman + frontend reference. 본 spec 100% 합치.

## 2. 엔드포인트 목록

| 메서드 | 경로 | 목적 | F-ID | R-ID |
|---|---|---|---|---|
| POST | /api/users | 회원가입 + JWT | F-01 | R-F-01 |
| POST | /api/users/login | 로그인 + JWT | F-01 | R-F-02 |
| GET | /api/user | 현재 사용자 조회 | F-02 | R-F-03 |
| PUT | /api/user | 현재 사용자 수정 | F-02 | R-F-03 |
| GET | /api/profiles/:username | 프로필 조회 | F-02 | R-F-04 |
| POST | /api/profiles/:username/follow | 팔로우 | F-02 | R-F-05 |
| DELETE | /api/profiles/:username/follow | 언팔로우 | F-02 | R-F-05 |
| GET | /api/articles | 글 목록 | F-05 | R-F-06 |
| GET | /api/articles/feed | 개인 피드 | F-06 | R-F-07 |
| GET | /api/articles/:slug | 글 상세 | F-04 | R-F-08 |
| POST | /api/articles | 글 작성 | F-03 | R-F-09 |
| PUT | /api/articles/:slug | 글 수정 | F-03 | R-F-10 |
| DELETE | /api/articles/:slug | 글 삭제 | F-04 | R-F-11 |
| POST | /api/articles/:slug/favorite | 즐겨찾기 add | F-04 | R-F-12 |
| DELETE | /api/articles/:slug/favorite | 즐겨찾기 remove | F-04 | R-F-12 |
| GET | /api/articles/:slug/comments | 댓글 목록 | F-07 | R-F-14 |
| POST | /api/articles/:slug/comments | 댓글 작성 | F-07 | R-F-13 |
| DELETE | /api/articles/:slug/comments/:id | 댓글 삭제 | F-07 | R-F-15 |
| GET | /api/tags | 인기 태그 | F-08 | R-F-16 |

총 19 엔드포인트.

## 3. 엔드포인트 상세

### POST /api/users

- **목적**: 회원가입 + JWT 발급 (R-F-01, F-01).
- **인증**: 불필요.
- **Request**: `{"user":{"username":"jane","email":"jane@example.com","password":"secret12"}}`. username `^[A-Za-z0-9_-]{1,32}$`, email RFC5322 lite, password ≥ 8자.
- **Response 200**: 실제 201. `{"user":{"email":"...","username":"...","bio":null,"image":null,"token":"<jwt>"}}`.
- **Response 4xx/5xx**:
  | 상태 | 조건 | 페이로드 |
  |---|---|---|
  | 422 | 검증 실패 / 중복 | `{"errors":{"email":["has already been taken"]}}` 등 |
  | 500 | DB 장애 | `{"errors":{"body":["internal error"]}}` |
- **테스트 시나리오**: 13/02-catalog R-F-01.

### POST /api/users/login

- **목적**: 로그인 + JWT (R-F-02, F-01).
- **인증**: 불필요.
- **Request**: `{"user":{"email":"jane@example.com","password":"secret12"}}`.
- **Response 200**: `{"user":{"email":"...","username":"...","bio":"...","image":null,"token":"<jwt>"}}`.
- **Response 4xx/5xx**:
  | 상태 | 조건 | 페이로드 |
  |---|---|---|
  | 422 | 잘못된 자격증명 (미존재 email 포함, user-enum 방지) | `{"errors":{"email or password":["is invalid"]}}` |
- **테스트 시나리오**: 13/02-catalog R-F-02.

### GET /api/user

- **목적**: 현재 사용자 조회 (R-F-03, F-02).
- **인증**: 필수.
- **Request**: body 없음.
- **Response 200**: `{"user":{"email":"...","username":"...","bio":"...","image":null,"token":"<jwt>"}}`.
- **Response 4xx/5xx**:
  | 상태 | 조건 | 페이로드 |
  |---|---|---|
  | 401 | JWT 누락/만료/위변조 | `{"errors":{"body":["unauthorized"]}}` |
- **테스트 시나리오**: 13/02-catalog R-F-03.

### PUT /api/user

- **목적**: 현재 사용자 수정 (R-F-03, F-02). 모든 필드 optional.
- **인증**: 필수.
- **Request**: `{"user":{"email":"...","bio":"...","image":"...","username":"...","password":"..."}}`.
- **Response 200**: `{"user":{...}}` (갱신 후).
- **Response 4xx/5xx**:
  | 상태 | 조건 | 페이로드 |
  |---|---|---|
  | 401 | JWT 미인증 | unauthorized |
  | 422 | email 중복 / username 중복 / password 짧음 | `{"errors":{"email":["has already been taken"]}}` 등 |
- **테스트 시나리오**: 13/02-catalog R-F-03.

### GET /api/profiles/:username

- **목적**: 프로필 조회 (R-F-04, F-02).
- **인증**: optional. 비로그인 viewer는 `following=false`.
- **Request**: path `:username`.
- **Response 200**: `{"profile":{"username":"alice","bio":"...","image":null,"following":true}}`.
- **Response 4xx/5xx**:
  | 상태 | 조건 | 페이로드 |
  |---|---|---|
  | 404 | 미존재 username | `{"errors":{"profile":["not found"]}}` |
- **테스트 시나리오**: 13/02-catalog R-F-04.

### POST /api/profiles/:username/follow

- **목적**: 팔로우 (R-F-05, F-02).
- **인증**: 필수.
- **Request**: body 없음.
- **Response 200**: `{"profile":{...,"following":true}}`.
- **Response 4xx/5xx**:
  | 상태 | 조건 | 페이로드 |
  |---|---|---|
  | 401 | 미인증 | unauthorized |
  | 403 | self-follow 시도 | `{"errors":{"body":["cannot follow yourself"]}}` |
  | 404 | 미존재 | `{"errors":{"profile":["not found"]}}` |
- **idempotent**: 이미 팔로우 상태에서 POST 재호출 → 200 + 불변.
- **테스트 시나리오**: 13/02-catalog R-F-05.

### DELETE /api/profiles/:username/follow

- **목적**: 언팔로우 (R-F-05, F-02).
- **인증**: 필수.
- **Request**: body 없음.
- **Response 200**: `{"profile":{...,"following":false}}`.
- **Response 4xx/5xx**:
  | 상태 | 조건 | 페이로드 |
  |---|---|---|
  | 401 | 미인증 | unauthorized |
  | 404 | 미존재 | profile not found |
- **idempotent**: 이미 언팔로우 상태에서 DELETE → 200 + 불변.
- **테스트 시나리오**: 13/02-catalog R-F-05.

### GET /api/articles

- **목적**: 글 목록 (R-F-06, F-05). Global Feed 데이터 원.
- **인증**: optional.
- **Request**: query `tag?, author?, favorited?, limit=10, offset=0`.
- **Response 200**:
  ```json
  {
    "articles": [
      { "slug":"...", "title":"...", "description":"...", "body":"...",
        "tagList":["dragons"], "createdAt":"...", "updatedAt":"...",
        "favorited":false, "favoritesCount":42,
        "author": { "username":"jane", "bio":"...", "image":null, "following":false } }
    ],
    "articlesCount": 100
  }
  ```
- **Response 4xx/5xx**:
  | 상태 | 조건 | 페이로드 |
  |---|---|---|
  | 422 | limit > 100 | `{"errors":{"limit":["must be <= 100"]}}` |
  | 500 | DB 장애 | internal error |
- **성능**: R-N-01 — p95 ≤ 1000ms. DB 인덱스 + `_count` 1쿼리.
- **테스트 시나리오**: 13/02-catalog R-F-06.

### GET /api/articles/feed

- **목적**: 개인 피드 (R-F-07, F-06).
- **인증**: 필수.
- **Request**: query `limit=10, offset=0`.
- **Response 200**: `{"articles":[...],"articlesCount":N}`.
- **Response 4xx/5xx**:
  | 상태 | 조건 | 페이로드 |
  |---|---|---|
  | 401 | 미인증 | unauthorized |
- **테스트 시나리오**: 13/02-catalog R-F-07.

### GET /api/articles/:slug

- **목적**: 글 상세 (R-F-08, F-04).
- **인증**: optional.
- **Request**: path `:slug`.
- **Response 200**: `{"article":{...}}` (목록 shape 단건).
- **Response 4xx/5xx**:
  | 상태 | 조건 | 페이로드 |
  |---|---|---|
  | 404 | 미존재/삭제 | `{"errors":{"article":["not found"]}}` |
- **테스트 시나리오**: 13/02-catalog R-F-08.

### POST /api/articles

- **목적**: 글 작성 (R-F-09, F-03).
- **인증**: 필수.
- **Request**: `{"article":{"title":"...","description":"...","body":"...","tagList":["dragons"]}}`.
- **Response 200**: 실제 201 `{"article":{...}}` (slug 포함).
- **Response 4xx/5xx**:
  | 상태 | 조건 | 페이로드 |
  |---|---|---|
  | 401 | 미인증 | unauthorized |
  | 422 | title 또는 body 누락 | `{"errors":{"title":["can't be blank"]}}` 등 |
- **테스트 시나리오**: 13/02-catalog R-F-09.

### PUT /api/articles/:slug

- **목적**: 글 수정 (R-F-10, F-03). 작성자 본인만.
- **인증**: 필수.
- **Request**: `{"article": partial}` (title 변경 시 slug 재계산).
- **Response 200**: `{"article":{...}}`.
- **Response 4xx/5xx**:
  | 상태 | 조건 | 페이로드 |
  |---|---|---|
  | 401 | 미인증 | unauthorized |
  | 403 | 타인 글 | `{"errors":{"body":["forbidden"]}}` |
  | 404 | slug 미존재 | article not found |
  | 422 | 빈 본문 | validation msg |
- **테스트 시나리오**: 13/02-catalog R-F-10.

### DELETE /api/articles/:slug

- **목적**: 글 삭제 (R-F-11, F-04). 작성자 본인만.
- **인증**: 필수.
- **Request**: body 없음.
- **Response 200**: 실제 204.
- **Response 4xx/5xx**:
  | 상태 | 조건 | 페이로드 |
  |---|---|---|
  | 401 | 미인증 | unauthorized |
  | 403 | 타인 글 | forbidden |
  | 404 | 미존재 | not found |
- **부수효과**: 댓글·Favorite·ArticleTag cascade 삭제.
- **테스트 시나리오**: 13/02-catalog R-F-11.

### POST /api/articles/:slug/favorite

- **목적**: 즐겨찾기 add (R-F-12, F-04).
- **인증**: 필수.
- **Request**: body 없음.
- **Response 200**: `{"article":{...,"favorited":true,"favoritesCount":N+1}}`.
- **Response 4xx/5xx**:
  | 상태 | 조건 | 페이로드 |
  |---|---|---|
  | 401 | 미인증 | unauthorized |
  | 404 | slug 미존재 | not found |
- **idempotent**: 이미 favorited → 200 + count 불변.
- **테스트 시나리오**: 13/02-catalog R-F-12.

### DELETE /api/articles/:slug/favorite

- **목적**: 즐겨찾기 remove (R-F-12, F-04).
- **인증**: 필수.
- **Request**: body 없음.
- **Response 200**: `{"article":{...,"favorited":false,"favoritesCount":N-1}}`.
- **Response 4xx/5xx**:
  | 상태 | 조건 | 페이로드 |
  |---|---|---|
  | 401 | 미인증 | unauthorized |
  | 404 | slug 미존재 | not found |
- **idempotent**: 이미 unfavorited → 200 + 불변.
- **테스트 시나리오**: 13/02-catalog R-F-12.

### GET /api/articles/:slug/comments

- **목적**: 댓글 목록 (R-F-14, F-07).
- **인증**: optional.
- **Request**: path `:slug`.
- **Response 200**: `{"comments":[{"id":1,"createdAt":"...","updatedAt":"...","body":"...","author":{...}}]}`.
- **Response 4xx/5xx**:
  | 상태 | 조건 | 페이로드 |
  |---|---|---|
  | 404 | slug 미존재 | article not found |
- **테스트 시나리오**: 13/02-catalog R-F-14.

### POST /api/articles/:slug/comments

- **목적**: 댓글 작성 (R-F-13, F-07).
- **인증**: 필수.
- **Request**: `{"comment":{"body":"..."}}`.
- **Response 200**: 실제 201 `{"comment":{...}}`.
- **Response 4xx/5xx**:
  | 상태 | 조건 | 페이로드 |
  |---|---|---|
  | 401 | 미인증 | unauthorized |
  | 404 | slug 미존재 | article not found |
  | 422 | 빈 body | `{"errors":{"body":["can't be blank"]}}` |
- **테스트 시나리오**: 13/02-catalog R-F-13.

### DELETE /api/articles/:slug/comments/:id

- **목적**: 댓글 삭제 (R-F-15, F-07). 작성자 본인만.
- **인증**: 필수.
- **Request**: body 없음.
- **Response 200**: 실제 204.
- **Response 4xx/5xx**:
  | 상태 | 조건 | 페이로드 |
  |---|---|---|
  | 401 | 미인증 | unauthorized |
  | 403 | 타인 댓글 | forbidden |
  | 404 | comment id 미존재 | comment not found |
- **테스트 시나리오**: 13/02-catalog R-F-15.

### GET /api/tags

- **목적**: 인기 태그 (R-F-16, F-08).
- **인증**: 불필요.
- **Request**: query 없음.
- **Response 200**: `{"tags":["dragons","training","ai"]}` — 단순 count desc 상위 20.
- **Response 4xx/5xx**:
  | 상태 | 조건 | 페이로드 |
  |---|---|---|
  | 500 | DB 장애 | `{"errors":{"body":["internal error"]}}` (fallback 빈 배열) |
- **테스트 시나리오**: 13/02-catalog R-F-16.

## 4. Webhook / 콜백

본 시스템은 outbound webhook을 제공하지 않는다. 미래 알림 도입 시 별 ADR.

## 5. Rate Limit / Quota

- **현 MVP**: 미적용. 단일 인스턴스 + 내부 데모.
- **운영 도입 권고**:
  - 익명: 60 req/min/IP.
  - 인증: 600 req/min/user.
  - POST /api/users (가입): 5 req/hour/IP.
- **구현 후보**: `@fastify/rate-limit` + Redis (운영 단계).
- **응답 헤더**: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` (IETF draft).
