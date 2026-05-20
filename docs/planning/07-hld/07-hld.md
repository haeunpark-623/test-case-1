---
doc_type: hld
version: v0.2 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-19
gate: C
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-04, R-F-05, R-F-06, R-F-07, R-F-08, R-F-09, R-F-10, R-F-11, R-F-12, R-F-13, R-F-14, R-F-15, R-F-16, R-F-17, R-N-01, R-N-02, R-N-03, R-N-04, R-N-05, R-N-06, R-N-07]
  F-ID: []
  supersedes: null
---

# Conduit (RealWorld Clone) — High-Level Design (HLD)

<!-- ADR-0031: 06 Architecture에서 분리. §1 모듈 분해 + §2 모듈 간 데이터 흐름 + §3 비기능 대응. -->

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-19 | woosung.ahn@bespinglobal.com | 재생성 (/flow-design re-run, Phase 2/4) — 동일 입력 deterministic regeneration. 15 모듈 ID 보존 → 08·09·10·12·14 fan-out 유지 |
| v0.1 | 2026-05-19 | woosung.ahn@bespinglobal.com | 초안 (/flow-design Gate C) — 모듈 분해 + 데이터 흐름 + 비기능 대응 |

## 1. 핵심 모듈 / 컴포넌트

> 본 표가 LLD(08·09·10) fan-out 원천. 모듈 ID는 08 §1 "07 HLD §1 참조"에서 그대로 인용 (ADR-0031).

| 모듈 | 책임 | 의존 | 08에서 상세 |
|---|---|---|---|
| **M-BE-AUTH** | 회원가입·로그인·JWT 발급/검증·bcrypt 해싱. R-F-01·02·17·N-02·N-03. | M-BE-USER, M-BE-INFRA | ✅ 08 §1 module=M-BE-AUTH |
| **M-BE-USER** | 프로필 조회·수정·팔로우 관계. R-F-03·04·05. | M-BE-DB, M-BE-INFRA | ✅ 08 §1 module=M-BE-USER |
| **M-BE-ARTICLE** | 글 CRUD·목록·피드·즐겨찾기·slug 발급. R-F-06·07·08·09·10·11·12. | M-BE-USER, M-BE-TAG, M-BE-DB | ✅ 08 §1 module=M-BE-ARTICLE |
| **M-BE-COMMENT** | 댓글 CRUD. R-F-13·14·15. | M-BE-USER, M-BE-ARTICLE, M-BE-DB | ✅ 08 §1 module=M-BE-COMMENT |
| **M-BE-TAG** | 태그 마스터 + 인기 태그 집계. R-F-16. | M-BE-DB | ✅ 08 §1 module=M-BE-TAG |
| **M-BE-INFRA** | Fastify app·미들웨어·에러 페이로드·CORS·pino 로깅·request ID. cross-cutting. | (없음) | ✅ 08 §1 module=M-BE-INFRA |
| **M-BE-DB** | Prisma client 싱글톤·트랜잭션·마이그레이션 진입점. | M-BE-INFRA | ✅ 08 §1 module=M-BE-DB |
| **M-FE-SHELL** | App shell — Header/Footer/Router(hash)/AuthGuard/Layout. | M-FE-AUTH-STORE, M-FE-API | ✅ 08 §1 module=M-FE-SHELL |
| **M-FE-AUTH** | Login·Register·Settings 화면 + 폼 검증 + JWT 저장. UC-01·02·11. | M-FE-API, M-FE-AUTH-STORE | ✅ 08 §1 module=M-FE-AUTH |
| **M-FE-ARTICLE** | Home·Article 상세·Editor·즐겨찾기. UC-03·04·05·06·07·08. | M-FE-API, M-FE-MD | ✅ 08 §1 module=M-FE-ARTICLE |
| **M-FE-PROFILE** | Profile 보기·팔로우 토글. UC-09·12. | M-FE-API | ✅ 08 §1 module=M-FE-PROFILE |
| **M-FE-COMMENT** | 댓글 폼·리스트·삭제. UC-10. | M-FE-API | ✅ 08 §1 module=M-FE-COMMENT |
| **M-FE-API** | fetch wrapper(Authorization 자동·401 처리·errors 파싱). cross-cutting. | M-FE-AUTH-STORE | ✅ 08 §1 module=M-FE-API |
| **M-FE-AUTH-STORE** | JWT + 현재 사용자 인메모리 + localStorage sync. R-F-17. | (없음) | ✅ 08 §1 module=M-FE-AUTH-STORE |
| **M-FE-MD** | marked + DOMPurify wrapper. 글 본문 한정. | (없음) | ✅ 08 §1 module=M-FE-MD |
| **M-SHARED-TYPES** | @conduit/types — Article·User·Comment·Profile·ErrorPayload. | (없음) | ✅ 08 §1 module=M-SHARED-TYPES |

총 15 모듈 (BE 7 + FE 7 + Shared 1).

## 2. 모듈 간 데이터 흐름

### 2.1 회원가입 (UC-01) — R-F-01

```
User ── /#/register submit ──► M-FE-AUTH ── POST /api/users ──► M-FE-API ──► M-BE-INFRA ──► M-BE-AUTH ── bcrypt ──► M-BE-USER ── Prisma ──► M-BE-DB ── PostgreSQL
                                                                                                                                                       │
                                                              ◄────── JWT(HS256) + 201 user ──────────────────────────────────────────────────────────┘
M-FE-AUTH-STORE.setToken → localStorage → M-FE-SHELL 헤더 전환
```

### 2.2 글 목록 + 인기 태그 (UC-06) — R-F-06 + R-F-16

```
M-FE-SHELL ── Home open ──► M-FE-ARTICLE ──┬─ GET /api/articles?limit=10 ──► M-BE-ARTICLE ──► Prisma include (author/tagList/favoritesCount) ── M-BE-DB
                                           └─ GET /api/tags ──► M-BE-TAG ──► Prisma groupBy count desc ── M-BE-DB
                                                                                                              │
                                              ◄────── 200 {articles, tags} ─────────────────────────────────┘
```

### 2.3 글 상세 + 댓글 (UC-04·10) — R-F-08 + R-F-13·14

```
M-FE-ARTICLE ──┬─ GET /api/articles/:slug ──► M-BE-ARTICLE ── Prisma ── M-BE-DB
               └─ GET /api/articles/:slug/comments ──► M-BE-COMMENT ── Prisma ── M-BE-DB
M-FE-MD 본문 sanitize → 렌더 / M-FE-COMMENT 카드 렌더

[댓글 작성]
M-FE-COMMENT submit ──► M-FE-API(JWT) ──► M-BE-INFRA verify ──► M-BE-COMMENT ── Prisma ── M-BE-DB
                                                              ◄── 201 comment ─┘
```

### 2.4 즐겨찾기 + 팔로우 (UC-08·09) — R-F-05·12

```
[Favorite]
M-FE-ARTICLE click ──► M-FE-API(JWT) ──► POST/DELETE /api/articles/:slug/favorite ──► M-BE-ARTICLE ── Prisma upsert/delete ── M-BE-DB
M-FE-ARTICLE optimistic UI → 서버 응답으로 reconcile

[Follow]
M-FE-PROFILE click ──► M-FE-API(JWT) ──► POST/DELETE /api/profiles/:username/follow ──► M-BE-USER ── Prisma upsert (self-follow 403) ── M-BE-DB
```

### 2.5 인증 만료 처리 (R-N-02)

```
M-BE-INFRA verifyJWT ── 만료/위변조 ──► 401 + {errors:{body:["unauthorized"]}}
M-FE-API catch 401 ──► M-FE-AUTH-STORE.clear() ──► M-FE-SHELL.navigate('/#/login')
```

### 2.6 부팅 흐름 (R-N-05)

```
docker compose -f docker-compose.<profile>.yml --env-file backend/.env.<profile> up
   │
   ├── db (postgres:16-alpine) ──► healthcheck pg_isready
   ├── api (Fastify) ──► Prisma migrate deploy (stg/prod) 또는 db push (dev)
   │       ▼ "listening :4000 profile=<profile>"
   ├── frontend dev: vite :5173 / stg·prod: build → /usr/share/caddy mount
   └── web (caddy) ──► reverse_proxy /api/* → api:4000 + static SPA
           ▼ "serving HTTPS on :443"
```

## 3. 비기능 대응

| 비기능 R-ID | 대응 전략 | 상세 |
|---|---|---|
| R-N-01 (성능 p95 ≤ 1000ms) | DB 인덱스 + Prisma include 최소화 + Fastify schema 빠른 경로 | `Article(slug)` unique + `Article(author_id, created_at desc)` 복합 + `_count` 1쿼리. N+1 회귀는 k6 + Prisma query log assertion (13/04-performance). |
| R-N-02 (JWT 발급/검증/만료) | M-BE-AUTH 서명/검증 + M-FE-API 401 핸들러 + M-FE-AUTH-STORE clear | HS256 + JWT_SECRET min 32자 + exp 7d. 만료 → 401 → 클라이언트 토큰 삭제 + /#/login (2.5절). |
| R-N-03 (비밀번호 해싱) | bcrypt cost=12 + DB 컬럼 패턴 회귀 통합 | M-BE-AUTH의 hash/compare. password_hash 컬럼 정규식 `^\$2[aby]\$` (13/02-catalog R-N-03). |
| R-N-04 (접근성 WCAG 2.1 AA) | axe-core CI + 핵심 5 화면 골든패스 통합 | gstack `/qa` 안에서 axe-core 자동 실행. AI 게이트 5축. |
| R-N-05 (3 profile 부팅) | docker-compose × 3 profile + LOCAL.md §3 동기 + .env.{p}.example 6종 | ADR-0037 v1.1 + ADR-0040. 12-scaffolding §7 + LOCAL.md §3·§4 매 PR 동기. AI 게이트 6축 BLOCK. |
| R-N-06 (구조적 로깅 + request ID) | M-BE-INFRA pino logger + onRequest hook | `{request_id, method, path, status, latency_ms, user_id?}` JSON. PII 마스킹. |
| R-N-07 (브라우저 호환) | Vite target=es2020 + Bootstrap 4 reset + 브라우저 매트릭스 | Chrome/Firefox/Safari × 2 메이저. gstack `/qa` 매트릭스 회귀. |

## 4. 외부 인터페이스 윤곽

- **HTTP API**: `/api/*` base, JSON, 19 endpoint. 인증 `Authorization: Token <jwt>` (RealWorld 관례).
- **에러 페이로드**: `{errors: {<field>: ["msg", ...]}}` 단일 shape.
- **CORS**: profile별 frontend origin allow-list.
- **외부 SDK**: 없음.
- **CI**: GitHub Actions PR 트리거 — lint + typecheck + unit + integration + Newman + gstack. act 로컬 동치 (ADR-0047).
