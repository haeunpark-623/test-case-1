---
doc_type: adr
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-19
gate: C
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-04, R-F-05, R-F-06, R-F-07, R-F-08, R-F-09, R-F-10, R-F-11, R-F-12, R-F-13, R-F-14, R-F-15, R-F-16, R-F-17, R-N-01, R-N-02, R-N-03, R-N-05]
  F-ID: []
  supersedes: null
---

# ADR 0001 — Stack Decision (TypeScript Full-Stack + Fastify + React + Prisma + Postgres + Docker Compose)

**상태**: Draft
**결정일**: 2026-05-19
**작성**: woosung.ahn@bespinglobal.com

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-19 | woosung.ahn@bespinglobal.com | 초안 (/flow-design Gate C) — 01-project-brief §8 Open Questions 4축 + ADR-0038 stylesheet 1택 |

## 1. 컨텍스트

01-project-brief §8은 Gate C에서 4축 stack(BE·FE·DB·Infra) + ADR-0038에 따른 stylesheet 솔루션을 1택해야 한다고 명시했다. 본 프로젝트의 사용처는 두 가지:

1. **RealWorld 외부 reference 합치** — 150+ 공식 reference 구현과 행동 동치성을 자동 회귀로 검증한다 (01 §4 KPI 1·2).
2. **agent-toolkit 게이트 회귀 케이스** — D-06 6축, branch 전략(ADR-0044), 3 profile 부팅(ADR-0037 v1.1) 등 toolkit 룰을 풀스택 도메인에서 *살아 있는* 회귀로 검증한다.

따라서 stack 선택은 (a) RealWorld reference가 풍부할 것, (b) toolkit 룰(특히 6축 부팅·branch·typecheck)이 모두 native 적용 가능할 것, (c) BE/FE 단일 언어로 schema drift를 차단할 것, (d) 학습/유지보수 비용이 낮을 것이라는 4 기준을 만족해야 한다.

## 2. 결정

본 프로젝트의 1택 stack을 다음과 같이 확정한다 (06-architecture §Stack Decision과 동일):

- **언어**: TypeScript 5.5+ (BE·FE 통합)
- **프레임워크 (BE)**: Fastify 4
- **프레임워크 (FE)**: React 18 + Vite 5 + React Router 6 (hash routing)
- **ORM / DB**: Prisma 5 + PostgreSQL 16
- **인증**: JWT(HS256) + `Authorization: Token <jwt>` 헤더 (RealWorld 관례)
- **Stylesheet**: Bootstrap 4 CSS (RealWorld 시각 정본) + CSS Modules (컴포넌트 scope override)
- **Markdown**: marked 12 + DOMPurify 3
- **Infra**: Docker Compose × 3 profile + 단일 VM(prod) + Caddy reverse proxy
- **CI 로컬 검증**: act (ADR-0047 정합)

## 3. 검토된 대안

### 대안 A — Node + Express + JS + Mongoose + MongoDB + Vercel (RealWorld reference 다수)

- **장점**: RealWorld reference 분포에서 가장 흔함 → 유사 코드 참고 풍부. Express는 진입 장벽 낮음.
- **단점**: (1) JS는 TS 도입 안 하면 schema drift 회귀 발생 빈도 높음 — 본 프로젝트 cross-cutting 우선순위와 충돌. (2) Mongo는 RealWorld 도메인 M:N(태그·즐겨찾기·팔로우) 모델링이 어색 + ACID 보장 약함. (3) Vercel은 *frontend hosting*에는 좋지만 backend Express + Mongo는 별 호스팅이 필요 → 풀스택 1 compose 통합이 깨짐.

### 대안 B — Spring Boot + Java + JPA + Postgres + Vue + Vite (Java backend stack 검증)

- **장점**: Spring Boot Flyway integration이 LOCAL.md §1.5.2 (b) 단일 메커니즘 회귀 케이스로 좋음 — ADR-0037 v1.3의 canonical 예.
- **단점**: (1) Vue는 RealWorld reference 분포가 React보다 적음. BE/FE가 *다른 언어*라 `@conduit/types` 같은 공유 타입 패키지 불가 → API contract drift 위험. (2) Java + Vue 풀스택은 도입자(woosung.ahn 1인)의 학습/유지보수 비용↑. (3) toolkit의 typescript stack scaffolding이 가장 성숙 — 첫 newProject로 Java를 선택하면 toolkit 회귀 case의 baseline이 흔들림.

### 채택안 — TypeScript + Fastify + React + Vite + Prisma + Postgres + Docker Compose

- 위 §2 명세 그대로.
- **선정 근거**:
  - **BE/FE 단일 언어** — `@conduit/types` 패키지로 R-F-* 페이로드 schema drift 차단. JWT/User/Article/Comment 등 RealWorld 모델이 양 layer 컴파일 시점에 정합.
  - **Fastify > Express** — schema validation 빌트인(JSON Schema·ajv). R-N-01(p95 ≤ 1000ms)·R-N-06(구조적 로깅 pino) 모두 native.
  - **React + Vite** — RealWorld frontend reference 분포 다수. Vite preview 모드는 LOCAL.md §1.5.3 SPA 정적 서버 함정을 native로 회피 (별 도구 설치 없음).
  - **Prisma + Postgres** — RealWorld 도메인 M:N 모델링 정합. dev iteration `db push` + 운영 `migrate deploy` 흐름이 LOCAL.md §1.5.2 (a) 분리형 canonical 예 (toolkit 회귀 case 가치 1).
  - **Bootstrap 4 + CSS Modules** — RealWorld 시각 정본 합치 + ADR-0038 stylesheet 솔루션 1택 요구. JS Bootstrap component는 미사용 (React 자체 구현).
  - **Docker Compose × 3 profile** — ADR-0037 v1.1의 3 profile 부팅 검증을 *동일 메커니즘*으로 강제 (env-file 차이만). AI 게이트 6축 검증이 자동.

## 4. 결과 (Consequences)

### 긍정

- BE/FE 공유 타입(@conduit/types)으로 API contract drift 컴파일 시점 차단.
- Fastify의 JSON Schema가 R-F-* 페이로드 검증·OpenAPI 자동 생성·테스트 fixture 생성을 통합.
- Prisma의 schema → 타입 자동 생성으로 DB 모델 변경 시 BE 타입 회귀 차단.
- Docker Compose × 3 profile이 AI 게이트 6축 검증 비용을 *동일 명령*으로 최소화.
- RealWorld reference 구현 분포(특히 TS+Fastify, TS+React)와 행동 동치 검증 자동화 — Newman + gstack.
- toolkit 6축 회귀 케이스로 *Prisma 분리형 (a) + workspace .env 분리 (e) + Docker base image 함정 (§1.5.4)*을 모두 살아 있는 사례로 확보.

### 부정 / 트레이드오프

- TypeScript는 빌드 단계가 필요해 dev hot reload 외에는 `pnpm build`가 선행되어야 함 (tsx watch로 dev 한정 우회).
- Bootstrap 4는 이미 5가 나왔지만 RealWorld 시각 정본이 4라 *호환성* 우선 (회귀 위험 회피). 향후 RealWorld가 5로 갱신하면 본 ADR 갱신 + 시각 회귀 PR 필요.
- Caddy + 단일 VM은 운영 단계에서 수평 확장 시 재설계 필요 — MVP 범위는 단일 인스턴스라 무리 없음.
- pnpm은 npm/yarn 대비 점유율 낮음 — newProject 도입자(특히 신규 멤버)는 corepack을 통한 버전 핀(§1.5.4 (2))을 익혀야 함.

### 영향 받는 문서

- 06-architecture §Stack Decision (본 결정의 1차 표출)
- 07-hld §1 (M-FE-* / M-BE-* 모듈 분해)
- 08-lld-module-spec (15 모듈 내부 구현)
- 09-lld-api-spec (Fastify schema + RealWorld 합치)
- 10-lld-screen-design §3 (Bootstrap 4 + CSS Modules 토큰 매핑)
- 11-coding-conventions (TS 5.5 strict + ESLint + Prettier + Vitest)
- 12-scaffolding/typescript.md (전체)
- 13-test-design/01-strategy §2 (도구 매트릭스 — Vitest·MSW·Newman·gstack)
- LOCAL.md (전체 — 본 결정으로 모든 placeholder 1택 확정)

## 5. 추적 / 재검토 시점

- **재검토 trigger 1**: RealWorld 공식 spec이 Bootstrap 5 또는 다른 시각 정본으로 갱신 시 — 본 ADR §2 stylesheet 결정 재검토.
- **재검토 trigger 2**: MVP v1.0 머지 직후 운영 단계 진입 — 수평 확장 필요 시 §2 Infra 결정 재검토 (k8s·서버리스 등).
- **재검토 trigger 3**: toolkit ADR 신설로 본 stack과 충돌(예: 새 부팅 자산 모델 도입) — 본 ADR을 같은 PR에서 갱신.
- **추적 지표**: AI 게이트 6축 BLOCK 빈도, Newman 합치율, coverage, dependency CVE 건수.
