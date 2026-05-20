---
doc_type: scaffolding
version: v0.2 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-19
gate: C
related:
  R-ID: [R-N-05]
  F-ID: []
  supersedes: null
---

# Conduit (RealWorld Clone) — Scaffolding

> **Stack**: TypeScript 5.5 + Node.js 20 + Fastify 4 (BE) + React 18 + Vite 5 (FE) + Prisma 5 + PostgreSQL 16 + pnpm 9 workspaces. ADR-0001.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-19 | woosung.ahn@bespinglobal.com | 재생성 (/flow-design re-run, Phase 2/4) — §6 12 env 키 × 3 profile + §7 8 자산 행 + §8 매핑 보존. LOCAL.md §4와 동기 (ADR-0040) |
| v0.1 | 2026-05-19 | woosung.ahn@bespinglobal.com | 초안 — TypeScript stack 디렉토리·빌드·부팅 자산·스타일링 |

## 1. 디렉토리 트리

```
conduit/                                # repo root
├── .github/
│   └── workflows/
│       ├── ci.yml                      # lint + typecheck + unit + integration + Newman + gstack
│       └── deploy.yml                  # 운영 단계 추가
├── .claude/                            # agent-toolkit
├── docs/
│   └── planning/                       # 01~15 산출 + adr/
├── frontend/                           # workspace @conduit/frontend
│   ├── public/
│   │   └── index.html                  # Bootstrap 4 CSS link + #root
│   ├── src/
│   │   ├── main.tsx                    # React 18 entrypoint (stylesheet import)
│   │   ├── App.tsx                     # M-FE-SHELL
│   │   ├── pages/                      # Home·Login·Register·Settings·Editor·Article·Profile
│   │   ├── components/                 # ArticleCard·CommentList·FollowButton·...
│   │   ├── stores/auth.ts              # M-FE-AUTH-STORE (zustand)
│   │   ├── lib/
│   │   │   ├── api.ts                  # M-FE-API
│   │   │   ├── markdown.ts             # M-FE-MD
│   │   │   └── errors.ts
│   │   ├── styles/                     # CSS Modules + global.css
│   │   └── types/                      # @conduit/types re-export
│   ├── .env.dev.example
│   ├── .env.stg.example
│   ├── .env.prod.example
│   ├── index.html                      # Vite root
│   ├── vite.config.ts
│   ├── package.json                    # name: @conduit/frontend
│   └── tsconfig.json
├── backend/                            # workspace @conduit/backend
│   ├── prisma/
│   │   ├── schema.prisma               # User·Article·Comment·Tag·ArticleTag·Favorite·Follow
│   │   ├── migrations/                 # stg/prod release (LOCAL.md §1.5.2 (a))
│   │   └── seed.ts                     # 50 articles, 10 users, 20 tags
│   ├── src/
│   │   ├── server.ts                   # M-BE-INFRA
│   │   ├── app.ts                      # plugin 등록
│   │   ├── plugins/                    # cors·auth·logger·errorHandler·requestId
│   │   ├── routes/                     # users·user·profiles·articles·comments·tags
│   │   ├── services/                   # authService·userService·articleService·...
│   │   ├── lib/                        # jwt·bcrypt·slug·error-codes
│   │   └── prisma/client.ts            # M-BE-DB
│   ├── .env.dev.example
│   ├── .env.stg.example
│   ├── .env.prod.example
│   ├── Dockerfile                      # multi-stage (deps → build → runtime)
│   ├── package.json                    # name: @conduit/backend
│   └── tsconfig.json
├── packages/
│   └── types/                          # @conduit/types — M-SHARED-TYPES
│       ├── src/index.ts
│       ├── package.json                # name: @conduit/types
│       └── tsconfig.json
├── tests/
│   ├── postman/conduit.postman_collection.json   # RealWorld 공식 vendored
│   └── gstack/                          # gstack /qa fixtures
├── docker-compose.dev.yml
├── docker-compose.stg.yml
├── docker-compose.prod.yml
├── Caddyfile                            # web 컨테이너용
├── pnpm-workspace.yaml                  # packages: [frontend, backend, packages/*]
├── pnpm-lock.yaml
├── package.json                         # root scripts
├── tsconfig.base.json                   # 공통 strict + paths
├── .eslintrc.cjs
├── .prettierrc.json
├── .editorconfig
├── .gitignore
├── LICENSE
├── LOCAL.md                             # 본 §5·§7과 동기 (ADR-0040)
├── README.md
└── CLAUDE.md                            # agent-toolkit
```

## 2. 패키지 명명 규칙

- **monorepo root**: `conduit` (npm 미공개·로컬만).
- **workspace prefix**: `@conduit/*`
  - `@conduit/frontend`, `@conduit/backend`, `@conduit/types`
- **내부 alias** (tsconfig paths):
  - backend: `@/services/*`, `@/lib/*`, `@/prisma/*`
  - frontend: `@/components/*`, `@/pages/*`, `@/stores/*`, `@/lib/*`
- **테스트 fixture 디렉토리**: `__fixtures__/`.
- **DB schema**: Prisma model PascalCase 단수 / 컬럼 snake_case (`@map`).
- **API base**: `/api`.

## 3. 디자인 패턴 결정

- **선택 패턴 (BE)**: **Layered** (route → service → repository[=Prisma client]).
- **선택 패턴 (FE)**: **Layered** (pages → components → hooks → stores/lib).
- **이유**: RealWorld 도메인은 SNS 표준이라 경계 명확. DDD bounded context 불필요. Atomic 컴포넌트는 8 primitive 수준이라 over-engineering. Layered가 코드 이동·테스트 진입점·온보딩 모두 최선.
- **모듈 경계 정합**: §4 + 08-lld-module-spec 15 모듈에 1:1. Layered + 도메인별 vertical slicing.

## 4. 모듈 경계 (08-lld-module-spec와 fan-out)

| 모듈 (08) | 디렉토리 / 파일 | 외부 import 허용 |
|---|---|---|
| M-BE-AUTH | `backend/src/routes/users.ts` + `services/authService.ts` + `lib/{jwt,bcrypt}.ts` | (route 직접 import 금지) |
| M-BE-USER | `backend/src/routes/{user,profiles}.ts` + `services/{userService,followService}.ts` | (route 직접 import 금지) |
| M-BE-ARTICLE | `backend/src/routes/articles.ts` + `services/{articleService,favoriteService}.ts` + `lib/slug.ts` | (route 직접 import 금지) |
| M-BE-COMMENT | `backend/src/routes/comments.ts` + `services/commentService.ts` | (route 직접 import 금지) |
| M-BE-TAG | `backend/src/routes/tags.ts` + `services/tagService.ts` | (route 직접 import 금지) |
| M-BE-INFRA | `backend/src/{server,app}.ts` + `plugins/*` | `services/*` |
| M-BE-DB | `backend/src/prisma/client.ts` + `prisma/schema.prisma` | `services/*`만 |
| M-FE-SHELL | `frontend/src/App.tsx` + `Layout.tsx` + `Header.tsx` + `Footer.tsx` + `AuthGuard.tsx` + `router.tsx` | `pages/*` |
| M-FE-AUTH | `frontend/src/pages/{Login,Register,Settings}.tsx` + `forms/AuthForm.tsx` | router |
| M-FE-ARTICLE | `frontend/src/pages/{Home,Article,Editor}.tsx` + `components/{ArticleCard,FeedTabs,Pagination,FavoriteButton}.tsx` | router + `components/*` |
| M-FE-PROFILE | `frontend/src/pages/Profile.tsx` + `components/{ProfileTabs,FollowButton}.tsx` | router |
| M-FE-COMMENT | `frontend/src/components/{CommentForm,CommentList,CommentCard}.tsx` | `pages/Article.tsx`만 |
| M-FE-API | `frontend/src/lib/{api,errors}.ts` | 전체 FE |
| M-FE-AUTH-STORE | `frontend/src/stores/auth.ts` | 전체 FE |
| M-FE-MD | `frontend/src/lib/markdown.ts` | `pages/Article.tsx`만 |
| M-SHARED-TYPES | `packages/types/src/index.ts` | `@conduit/frontend`·`@conduit/backend` |

## 5. 빌드·실행

> **정본 (SoT)**: 본 §5. LOCAL.md §3은 유저 facing 가이드 (ADR-0040 매 PR 동기).

### 5.1 dev profile (hot reload)

```bash
pnpm install --frozen-lockfile
cp frontend/.env.dev.example frontend/.env.dev
cp backend/.env.dev.example backend/.env.dev
# (등 6벌 — workspace × profile)

# 옵션 A — workspace 직접 (각 1터미널, 권장)
docker compose -f docker-compose.dev.yml up -d db
pnpm --filter @conduit/backend prisma:push:dev
pnpm --filter @conduit/backend seed:dev
pnpm --filter @conduit/backend dev                # tsx watch → :4000
pnpm --filter @conduit/frontend dev               # vite → :5173

# 옵션 B — docker-compose 통합
docker compose -f docker-compose.dev.yml --env-file backend/.env.dev up
```

ready: `[fastify] listening on :4000 profile=dev` + `VITE v5.x ready in Xms → http://localhost:5173`.

### 5.2 stg profile (빌드 산출물)

```bash
pnpm --filter @conduit/types build
pnpm --filter @conduit/backend build              # tsc → dist/
pnpm --filter @conduit/frontend build             # vite build → dist/

# 옵션 A
docker compose -f docker-compose.stg.yml up -d db
pnpm --filter @conduit/backend prisma:migrate:stg
pnpm --filter @conduit/backend start:stg
pnpm --filter @conduit/frontend preview:stg       # vite preview --port 4173

# 옵션 B (canonical for AI 게이트 6축)
docker compose -f docker-compose.stg.yml --env-file backend/.env.stg up --build
```

ready: `[fastify] listening on :4000 profile=stg` + `Caddy serving HTTPS on :443` (옵션 B).

### 5.3 prod profile

```bash
# 빌드 5.2와 동일
docker compose -f docker-compose.prod.yml --env-file backend/.env.prod up --build
# 또는 옵션 A
pnpm --filter @conduit/backend prisma:migrate:prod
pnpm --filter @conduit/backend start:prod
pnpm --filter @conduit/frontend preview:prod
```

NODE_ENV=production이라 stack trace 미포함 (R-N-02·E_INF_INTERNAL).

### 5.4 테스트

```bash
pnpm lint
pnpm typecheck
pnpm test:unit                                     # vitest --coverage (≥80%)
pnpm test:int                                      # vitest + testcontainers
pnpm test:e2e:api                                  # Newman + RealWorld 공식
pnpm test:e2e:ui                                   # gstack /qa
pnpm test:a11y                                     # axe-core (gstack 내)
```

### 5.5 GitHub Actions 로컬 (ADR-0047)

```bash
# .actrc 자동 적용: catthehacker/ubuntu:act-latest runner + .env.act 시크릿
cp .env.act.example .env.act          # 사전 준비
act -n -W .github/workflows/ci.yml    # dry-run
act pull_request -W .github/workflows/ci.yml   # 실 실행
# 회사망 SSL 차단 시 LOCAL.md §5.7 참조
# act 미사용 fallback — manual reproduction (5.4 명령 + Prisma + docker-compose 순차)
```

LOCAL.md §5.5 정본과 매 PR 동기 (ADR-0040).

## 6. 환경 변수 / 설정 분리

> ADR-0037 v1.1 — profile 3분기 컬럼 강제.

| 키 | dev | stg | prod | 노출 위치 |
|---|---|---|---|---|
| `DATABASE_URL` | `postgresql://conduit:conduit@localhost:5432/conduit_dev` | `postgresql://conduit:conduit@db:5432/conduit_stg` | `postgresql://conduit:<secret>@db:5432/conduit_prod` | `backend/.env.<profile>` |
| `JWT_SECRET` | `dev-secret-min-32-chars-aaaaaaaaaa` | `stg-secret-min-32-chars-bbbbbbbbbb` | `<from secret manager, min 32 chars>` | `backend/.env.<profile>` |
| `JWT_EXP_SECONDS` | `604800` (7d) | `604800` | `604800` | `backend/.env.<profile>` |
| `PORT` | `4000` | `4000` | `4000` | `backend/.env.<profile>` |
| `NODE_ENV` | `development` | `production` | `production` | `backend/.env.<profile>` |
| `LOG_LEVEL` | `debug` | `info` | `warn` | `backend/.env.<profile>` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | `https://stg.conduit.example.com` | `https://conduit.example.com` | `backend/.env.<profile>` |
| `POSTGRES_USER` | `conduit` | `conduit` | `<secret>` | compose `db` |
| `POSTGRES_PASSWORD` | `conduit` | `conduit` | `<secret>` | compose `db` |
| `POSTGRES_DB` | `conduit_dev` | `conduit_stg` | `conduit_prod` | compose `db` |
| `VITE_API_BASE_URL` | `http://localhost:4000/api` | `https://stg.conduit.example.com/api` | `https://conduit.example.com/api` | `frontend/.env.<profile>` |
| `VITE_APP_TITLE` | `Conduit (dev)` | `Conduit (stg)` | `Conduit` | `frontend/.env.<profile>` |

> **단일 환경 운영 N/A**: 본 프로젝트는 3 profile 모두 실 사용.

## 7. 부팅 자산 (Runnability Assets)

> ADR-0037 v1.1/v1.2/v1.3 + ADR-0040. LOCAL.md §4와 매 PR 동기. 본 프로젝트 분류: **LOCAL.md §1.5.2 (a) 분리형** — Prisma `db push`(dev) + `migrate deploy`(stg/prod).

| 자산 | 경로 (profile별) | 변경 trigger 이슈 유형 | 갱신 책임 |
|---|---|---|---|
| 환경 변수 템플릿 | `frontend/.env.{dev,stg,prod}.example` (3종) + `backend/.env.{dev,stg,prod}.example` (3종) — workspace별 분리 (LOCAL.md §1.5.1 (e), 총 6종) | 새 환경 변수 도입 | 변수 도입 이슈 PR 작성자 |
| 스키마 적용 (dev iteration) | `backend/package.json scripts.prisma:push:dev = "dotenv -e .env.dev -- prisma db push --skip-generate"` | dev schema 변경 | 모델 변경 이슈 |
| DB migrations (stg/prod release) | `backend/prisma/migrations/<timestamp>__<name>/migration.sql` + `scripts.prisma:migrate:{stg,prod} = "dotenv -e .env.<p> -- prisma migrate deploy"` | 운영 release migration | 운영 release 이슈 |
| lockfile | `pnpm-lock.yaml` (단일 — pnpm workspace는 root 1개) | 의존성 추가/변경 | 의존성 이슈 |
| 설치/seed scripts | `backend/package.json scripts.{setup,seed:dev,seed:stg,seed:prod}` + `backend/prisma/seed.ts` + 루트 `package.json scripts.setup` | seed 변경 | seed 이슈 |
| 부팅 명령 | 본 §5 + 루트 `LOCAL.md §3` + `package.json scripts.{dev,start:{stg,prod},build}` | 명령 변경 | 명령 변경 이슈 |
| LOCAL.md | 루트 `LOCAL.md` (ADR-0040 — 부팅 자산 1종) | 부팅 자산 변경 시 동기 | 부팅 자산 변경 이슈 |
| 컨테이너 정의 | `docker-compose.{dev,stg,prod}.yml` (3종) + `backend/Dockerfile` + `Caddyfile` | infra·이미지·proxy 변경 | infra 이슈 |

> **AI 게이트 6축 (R-N-05)**: 본 자산 1개라도 diff 시 LOCAL.md §3·§4 + 본 §6·§7 동기 갱신 lint. 한쪽만 변경 시 BLOCK.

## 8. 스타일링 솔루션

> ADR-0038. 10-lld §3 토큰이 본 §8 entrypoint에 매핑.

| 항목 | 결정 |
|---|---|
| 솔루션 | **Bootstrap 4 CSS (RealWorld 시각 정본) + CSS Modules (override)** |
| 이유 | RealWorld 정본이 Bootstrap 4. 별 framework 도입은 회귀 위험. CSS Modules는 scope CSS만 담당. styled-components/emotion은 SSR 미사용 SPA에서 over-engineering. |
| 의존성 | `frontend/package.json devDependencies`: `bootstrap@^4.6.2`, `@types/bootstrap`(필요 시). `dependencies`: 없음 — CSS만 import (JS Bootstrap 미사용, React 자체 구현). CSS Modules는 Vite 기본 지원 — 추가 의존성 0건. |
| entrypoint 적용 | `frontend/src/main.tsx` 상단 — ```ts\nimport 'bootstrap/dist/css/bootstrap.min.css';\nimport '@/styles/global.css'; // 토큰 + Bootstrap override\nimport '@/styles/fonts.css'; // Source Sans Pro + Titillium Web Google Font\n``` — global.css가 10 §3 토큰을 `:root` 변수 선언. 컴포넌트는 `import styles from './ArticleCard.module.css'`. |
| 디자인 토큰 매핑 | 10-lld-screen-design §3 토큰 → `frontend/src/styles/global.css` `:root { ... }` + CSS Modules `var(--color-primary)`. 매핑: Color 8 / Typography 7 / Spacing 6 / primitives 8 → `.btn-primary`, `.input`, `.card-article`, `.tag-pill`, `.banner`, `.nav-pills` 등. Bootstrap 4 reset/grid 그대로 + 토큰 override. |
