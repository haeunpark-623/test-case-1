---
doc_type: feature-brief
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-20
gate: feature
related:
  R-ID: [R-N-05, R-N-06]
  F-ID: [F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08]
  supersedes: null
---

# feat-infra-scaffold — Feature Brief

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — Sprint 1 이슈 #2. 12-scaffolding §6·§7 + LOCAL.md §3·§4 SoT의 실제 부팅 자산 파일 박제 |

## 1. 한 줄 의도

12-scaffolding/typescript.md §6·§7과 LOCAL.md §3·§4에 박제된 부팅 자산 명세를 실제 파일(pnpm workspace + `.env.{dev,stg,prod}.example` × 2 workspace + `docker-compose.{dev,stg,prod}.yml` × 3 + Caddyfile + Dockerfile)로 구현해 fresh checkout 상태에서 dev/stg/prod 3 profile이 모두 부팅 가능한 base scaffold를 박제한다.

## 2. 사용자 가치

이 이슈가 완료되면 *후속 23개 이슈*(infra-prisma-init, fe-shell-router, be-auth-signup 등)가 부팅 자산 없이 PR 차단되는 회귀를 막는다. 한 명의 신규 도입자가 LOCAL.md §2를 따라 `pnpm install && docker compose up`만 실행하면 3 profile 모두 ready 신호를 본다. AI 게이트 6번째 축(3-profile boot)이 본 이슈 이후부터 매 PR마다 정상 동작한다.

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| 루트 자산 | `CLAUDE.md`·`LOCAL.md`·`README.md`·`devtoolkit.config.yaml`·`.gitignore`·`docs/`·`agent-toolkit/`·`scripts/`·`.claude/` 만 존재 | `package.json`(root) + `pnpm-workspace.yaml` + `tsconfig.base.json` + `docker-compose.{dev,stg,prod}.yml` + `Caddyfile` 추가 |
| pnpm workspace | 미설정 | `@conduit/frontend` + `@conduit/backend` + `@conduit/types` 3 workspace + lockfile |
| 환경 변수 템플릿 | 없음 | `frontend/.env.{dev,stg,prod}.example` (3종) + `backend/.env.{dev,stg,prod}.example` (3종) = 총 6벌 (§1.5.1 (e)) |
| 컨테이너 정의 | 없음 | `docker-compose.{dev,stg,prod}.yml` × 3 + `Caddyfile` + `backend/Dockerfile` + `frontend/Dockerfile` |
| workspace src/ 골격 | 없음 | `frontend/src/main.tsx` + `backend/src/server.ts` + `packages/types/src/index.ts` placeholder (lint + tsc --noEmit 통과 최소 골격) |
| LOCAL.md §3·§4 | v0.2 작성됨 (SoT 박제) | 변경 없음 — 본 이슈는 §3·§4가 가리키는 *파일 실체* 생성 |
| 12-scaffolding §6·§7 | v0.2 작성됨 (SoT 박제) | 변경 없음 — 동일 |
| 부팅 가능성 | 실패 (자산 부재) | dev/stg/prod 3 profile 모두 ready 신호 + 에러 0건 |

## 4. 모드 자동 감지 결과

- **mode=add** (자동 결정, ADR-0032 §2 규칙 4)
- 감지 trace:
  - bug 시그널: ❌ 0건 (`type:bug` 라벨 부재, "에러"/"안 돼" 키워드 부재)
  - design 시그널: ❌ 0건 (UI/시각/token/리브랜딩/다크모드 키워드 부재)
  - modify 시그널: ❌ 0건 (이슈 본문 Contract 변경 전: "빈 workspace 골격" = 신규 작성, 기존 동작 변경 없음)
  - 부정 시그널 0건 → 규칙 4 기본값 add 자동 결정
- slug 접두: `feat-` / 폴더: `docs/features/feat-infra-scaffold/` / 브랜치: `feat/infra-scaffold-issue-2`

## 5. 영향 범위

**파일 신규 (루트)**:
- `package.json` (root — workspace 정의 + packageManager `pnpm@9.15.4` 핀 + scripts.setup)
- `pnpm-workspace.yaml` (`frontend` + `backend` + `packages/*`)
- `tsconfig.base.json` (공유 strict + ESM target ES2022)
- `docker-compose.dev.yml` / `docker-compose.stg.yml` / `docker-compose.prod.yml`
- `Caddyfile` (stg/prod web 컨테이너 reverse proxy)

**파일 신규 (frontend)**:
- `frontend/package.json` (`@conduit/frontend` + Vite 5 + React 18 + scripts.{dev,build,preview:stg,preview:prod})
- `frontend/tsconfig.json` (extends ../tsconfig.base.json + JSX)
- `frontend/vite.config.ts` (port 5173 + base path)
- `frontend/index.html` (Vite entry)
- `frontend/src/main.tsx` + `frontend/src/App.tsx` (placeholder — 후속 fe-shell-router에서 교체)
- `frontend/.env.dev.example` / `.env.stg.example` / `.env.prod.example` (3종, VITE_API_BASE_URL)
- `frontend/Dockerfile` (multi-stage build + Caddy serve)

**파일 신규 (backend)**:
- `backend/package.json` (`@conduit/backend` + Fastify 4 + Prisma 5 + dotenv-cli + scripts.{dev,build,start:stg,start:prod,prisma:push:dev,prisma:migrate:{init,stg,prod},seed:dev})
- `backend/tsconfig.json` (extends ../tsconfig.base.json + outDir dist)
- `backend/src/server.ts` (placeholder — profile별 listen + ready log, 후속 be-auth-signup 등에서 라우트 부착)
- `backend/.env.dev.example` / `.env.stg.example` / `.env.prod.example` (3종, DATABASE_URL·JWT_SECRET·PORT·NODE_ENV)
- `backend/Dockerfile` (node:22-alpine multi-stage + USER node, ADR-0042)

**파일 신규 (packages/types)**:
- `packages/types/package.json` (`@conduit/types`, 후속 sm-shared-types에서 본격 채움)
- `packages/types/tsconfig.json`
- `packages/types/src/index.ts` (placeholder export {})

**갱신**:
- `.gitignore` 추가 — `node_modules/`, `dist/`, `*.tsbuildinfo`, `.env.{dev,stg,prod}`(평문 파일은 commit 금지), `pnpm-debug.log`, `frontend/dist/`, `backend/dist/`

**박제 검증** (변경 없음, lint만):
- `docs/planning/12-scaffolding/typescript.md` §6 환경 변수 표 + §7 부팅 자산 표
- `LOCAL.md` §3 부팅 명령 + §4 부팅 자산 표

**워크스페이스 외부**:
- `docs/planning/INDEX.md` — `docs/features/feat-infra-scaffold/` 항목 추가 (선택, /docs-update에서 처리)

## 6. 비목표

본 이슈에서 **하지 않는다**:
- Prisma `schema.prisma` 실제 모델 정의 — 후속 이슈 #3 `infra-prisma-init` 담당
- `seed.ts` 데이터 채움 — `infra-prisma-init` 담당
- `.github/workflows/ci.yml` 작성 — 후속 이슈 #4 `infra-ci-workflow` 담당
- 실제 라우트(`/api/users` 등) 구현 — 후속 BE 이슈들 담당
- React 컴포넌트 라우팅 (`HashRouter`) — 후속 이슈 `fe-shell-router` 담당
- Bootstrap 4 CSS / CSS Modules 실제 적용 — `fe-shell-router` 또는 첫 화면 이슈 담당
- 시크릿 값 채움 — `.env.{dev,stg,prod}.example`은 placeholder만 commit (보안 절대 규칙 1·2)

본 이슈의 placeholder 코드는 **lint + tsc --noEmit + 부팅 ready 신호** 통과를 위한 최소 골격만.

## 7. Open Questions

- Q1: `packages/types` workspace를 본 이슈에서 만들지, 후속 `sm-shared-types`(M-SHARED-TYPES)에서 만들지? → **본 이슈에서 빈 골격만 생성** 결정 (workspace 정의 자체가 pnpm-workspace.yaml에 있어야 `pnpm install`이 정상 동작하므로 골격은 필수)
- Q2: `frontend/Dockerfile`을 본 이슈에서 만들지, stg/prod 부팅 시점(`fe-shell-router` 이후)에 만들지? → **본 이슈에서 생성** (docker-compose.stg.yml이 frontend 컨테이너를 요구하므로 골격 Caddy 정적 서버만이라도 박제)
- Q3: GitHub Actions workflow yml 부재 시 ADR-0047 6단계 N/A 처리? → 본 이슈 PR에서는 N/A + 사유 명시 ("`.github/workflows/` 디렉토리 부재 — 후속 이슈 #4 infra-ci-workflow에서 생성"). 6단계 통과
- Q4: dev profile DB seed를 본 이슈에서 실행할지? → 비목표. Prisma schema 자체가 다음 이슈 책임이므로 seed도 후속

## 참조

- 상류:
  - GitHub Issue #2: `chore(infra): infra-scaffold — 12-scaffolding §6·§7 + LOCAL.md §3·§4 SoT 박제`
  - `docs/planning/12-scaffolding/typescript.md` §6·§7 (자산 SoT 정본, plan layer)
  - `LOCAL.md` §3·§4 (자산 사용자 facing 정본, ADR-0040)
  - `docs/planning/14-wbs/14-wbs.md` §2 Sprint 1 첫 이슈
  - `docs/planning/04-srs/04-srs.md` R-N-05 (3-profile 부팅) · R-N-06 (lint+tsc)
- 하류:
  - `feat-infra-scaffold.contract.md` (Before/After 정합 + Referenced-IDs §0)
  - `feat-infra-scaffold.plan.md` (구현 subtask 분해)
- 후속 이슈: #3 infra-prisma-init / #4 infra-ci-workflow / #7 fe-shell-router / #5 be-auth-signup
