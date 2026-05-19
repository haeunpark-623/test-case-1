---
doc_type: architecture
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

# Conduit (RealWorld Clone) — System Architecture

<!-- ADR-0031: 06은 시스템 컨텍스트·Stack 결정·컨테이너 구조에 집중. 모듈 분해와 데이터 흐름은 07 HLD가 담는다. -->

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-19 | woosung.ahn@bespinglobal.com | 재생성 (/flow-design re-run, Phase 2/4) — 동일 입력(01~05) deterministic regeneration. Stack·모듈 ID·R-/F- 매핑 변경 없음 |
| v0.1 | 2026-05-19 | woosung.ahn@bespinglobal.com | 초안 (/flow-design Gate C) — Stack 1택 + 컨테이너 구조 + 시스템 컨텍스트 확정 |

## Stack Decision

> 01-project-brief §8 Open Questions + 02-feasibility §2 기술 타당성에서 미정으로 남긴 4축(BE·FE·DB·Infra) + stylesheet 솔루션(ADR-0038)을 본 단계에서 1택. 결정 근거는 `adr/0001-stack-decision.md` 참조.

| 항목 | 결정 | 근거 |
|---|---|---|
| 언어 | TypeScript 5.5+ (BE·FE 통합) | 단일 언어로 BE/FE 공용 타입(`@conduit/types`) 패키지화 → R-F-* 페이로드 schema drift 차단. |
| 프레임워크 (BE) | Fastify 4.x | Express 대비 빠른 응답·schema-first JSON 검증 빌트인. R-N-01(p95 ≤ 1000ms)·R-N-06(pino) 모두 native. |
| 프레임워크 (FE) | React 18 + Vite 5 | RealWorld frontend reference 다수가 React. Vite preview 모드로 LOCAL.md §1.5.3 SPA 함정 회피. |
| 라우터 (FE) | React Router 6 (hash routing) | RealWorld 공식 스펙이 `/#/...` hash 기반 강제 (04-srs §4). |
| ORM / DB Client | Prisma 5.x | dev `db push` + 운영 `migrate deploy` 분리(LOCAL.md §1.5.2 (a)). schema → 타입 자동 생성. |
| 데이터베이스 | PostgreSQL 16 | M:N(태그·즐겨찾기·팔로우) 정합 강제 + ACID. SQLite 대비 운영 동치성↑. |
| 인증 | JWT (HS256) + Authorization: Token <jwt> 헤더 | RealWorld 공식 관례(Bearer 아님). access token 단일, 만료 7d. |
| 스타일링 솔루션 (ADR-0038) | Bootstrap 4 CSS(공식 시각 정본) + CSS Modules(override) | RealWorld 시각 정본이 Bootstrap 4. 별 CSS framework 도입은 회귀 위험. 10-lld §3 토큰 → 12-scaffolding §8 매핑. |
| Markdown 렌더링 | marked 12.x + DOMPurify 3.x | 글 본문 렌더링(UC-04, R-F-08) + XSS sanitize(R-N-02 보안). |
| 인프라 | Docker Compose (dev/stg/prod 모두 동일 정의) + 단일 VM(prod) + Caddy reverse proxy | 01 §8 후보 중 단일 컨테이너+Caddy 채택. ADR-0037 v1.1 profile 3분기 부팅 검증을 compose `--env-file`로 동일 메커니즘 강제. |
| CI / GitHub Actions 로컬 검증 | act (nektos/act) + manual reproduction fallback (ADR-0047) | 매 PR 워크플로 로컬 검증 강제. |

> **모듈 분해 / 모듈 간 흐름 / 비기능 매핑은 본 문서에서 다루지 않는다 — 07 HLD §1·§2·§3 참조 (ADR-0031).**

## 1. 시스템 컨텍스트

```
       ┌──────────────────────────────────────────────────────────────────┐
       │                       External Actors                            │
       │   Visitor (no auth)    Member (JWT)    Project Sponsor / 운영자  │
       └──────┬─────────────────┬────────────────────────┬────────────────┘
              │ Browser                                  │ ops / CI
              ▼                                          ▼
    ┌────────────────────────────────────────────────────────────────────┐
    │                    Conduit System (본 프로젝트 경계)               │
    │   ┌────────────┐   HTTPS (Caddy TLS)   ┌────────────────────────┐  │
    │   │  React 18  │ ◄───────────────────► │ Fastify 4 (Node 20)    │  │
    │   │  Vite SPA  │   /api/* JSON         │  Authorization: Token  │  │
    │   │  hash-rt   │   CORS allow-list     │  19 RealWorld endpoints│  │
    │   └─────┬──────┘                       └──────────┬─────────────┘  │
    │         │                                         │ Prisma 5       │
    │         │                                ┌──────────────────────┐  │
    │         │                                │ PostgreSQL 16        │  │
    │         │                                │  Users / Articles    │  │
    │         │                                │  Tags / Comments     │  │
    │         │                                │  Favorites / Follows │  │
    │         │                                └──────────────────────┘  │
    │         │                                                          │
    │         └──── localStorage(JWT) ─────────────────────────────────► │
    └────────────────────────────────────────────────────────────────────┘
              ▲                                          ▲
        Bootstrap 4 CSS                          GitHub Actions
        (CDN or vendored)                        + act (로컬 ADR-0047)
```

- **외부 actor**: Visitor / Member / Project Sponsor. 인증은 email+password JWT 1택 (OAuth 비목표).
- **외부 의존**: Bootstrap 4 CSS (CDN/vendored), 공식 RealWorld Postman 컬렉션 (Newman 회귀). *결제·이메일·실시간·이미지 업로드 외부 서비스 없음.*
- **신뢰 경계**: HTTPS는 Caddy 종단. 내부 Fastify ↔ PostgreSQL은 단일 compose network. prod DB는 별 인스턴스 권장.
- **데이터 경계**: Fastify schema 검증 + Prisma type-safe + DOMPurify markdown sanitize. SQL injection은 ORM이, XSS는 sanitize가 차단.
- **시간**: ISO 8601 UTC 1택 (04-srs §4).

## 2. 컨테이너 구조

```
docker-compose.<profile>.yml  (profile ∈ {dev, stg, prod})
│
├── service: web         (image: caddy:2-alpine)
│     - 포트: 80, 443
│     - 역할: TLS 종단 + SPA 정적 파일 hosting + /api/* reverse proxy → api
│     - 환경 변수 출처: backend/.env.<profile>(CORS_ALLOWED_ORIGINS) + 자체 Caddyfile
│
├── service: api         (image: build from ./backend/Dockerfile)
│     - 포트: 4000 (compose 내부만, web 통해 외부)
│     - 역할: 19 RealWorld API + JWT 검증 + Prisma
│     - 환경 변수 출처: backend/.env.<profile> (DATABASE_URL, JWT_SECRET, PORT, NODE_ENV, LOG_LEVEL, CORS_ALLOWED_ORIGINS)
│     - depends_on: db (healthcheck)
│
├── service: frontend (build only, dev 한정 hot reload)
│     - dev: vite dev server :5173, web service는 /api/* proxy
│     - stg/prod: 빌드 산출물(`frontend/dist`)을 web 컨테이너 volume mount
│     - 환경 변수 출처: frontend/.env.<profile> (VITE_API_BASE_URL)
│
└── service: db          (image: postgres:16-alpine)
      - 포트: 5432 (compose 내부)
      - 볼륨: pgdata-<profile>
      - 환경 변수 출처: backend/.env.<profile> (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB)
      - healthcheck: pg_isready
```

- **배포 단위**: 단일 compose stack × 3 profile. dev hot reload / stg·prod 빌드 산출물 + secret manager.
- **공유 자원**: 없음 — 3 profile 완전 격리 (다른 network/volume).
- **수평 확장**: MVP는 단일 인스턴스. R-N-01 p95 ≤ 1000ms는 인덱스 + 단일 인스턴스로 충족 (피크 50 RPS 가정).
- **세션**: stateless — JWT만으로. Redis 미고려.

## 3. 외부 시스템 / 경계

- **Bootstrap 4 CSS**: CDN(개발/스테이지) 또는 vendored(prod 권장). 외부 호출 없음.
- **GitHub Actions / Container Registry**: 운영 CI/CD 경계. act(nektos/act)로 로컬 워크플로 검증.
- **DNS / Certbot**: prod에서 Caddy가 자동 TLS(ACME). 외부 CA 통신은 Caddy 내부.
- **Newman / Postman**: CI에서 공식 Postman 컬렉션을 헤드리스 실행. 컬렉션 JSON vendored.
- **외부 사용자 데이터 송수신**: 없음 — 자체 DB 1택. 분석/광고 픽셀 도입 안 함.
