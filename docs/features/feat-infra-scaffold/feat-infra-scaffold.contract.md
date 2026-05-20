---
doc_type: feature-contract
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

# feat-infra-scaffold — Change Contract

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — 부팅 자산 박제 contract. §0 Referenced-IDs 5행 충족 (ADR-0018) |

## 0. 참조 정본 ID (Referenced-IDs)

> ADR-0018 — 본 §0가 P4 implementation-planner의 selective read 입력. 후속 plan은 본 표의 ID에 해당하는 정본만 읽는다.

| 종류 | 정본 위치 | 영향 ID |
|---|---|---|
| R-ID (요구) | `docs/planning/04-srs/04-srs.md` | R-N-05 (3-profile 부팅 가능성), R-N-06 (lint + tsc --noEmit + 단위 테스트 통과) |
| F-ID (기능) | `docs/planning/05-prd/05-prd.md` | (none) — 본 이슈는 후속 F-01~F-08 모두의 *기반 인프라*이므로 직접 매핑 없음. WBS 14-wbs §4 추적성에 "infra 기반" 행으로 표기 |
| 영향 모듈 | `docs/planning/07-hld/07-hld.md` §1 + `08-lld-module-spec/08-lld-module-spec.md` | M-BE-INFRA (Fastify 서버 부트스트랩 골격), M-BE-DB (Prisma 클라이언트 골격, schema 본격 채움은 후속), M-FE-SHELL (Vite + React 부트스트랩 골격), M-SHARED-TYPES (workspace 골격) |
| 영향 엔드포인트 | `docs/planning/09-lld-api-spec/09-lld-api-spec.md` | (none) — 본 이슈는 라우트 미부착. backend server.ts는 `/health` placeholder만 노출 (후속 BE 이슈가 19 endpoint 부착) |
| 적용 컨벤션 절 | `docs/planning/11-coding-conventions/11-coding-conventions.md` + `12-scaffolding/typescript.md` | 11 §1 명명 (`@conduit/*` 패키지명) · §2 에러 PREFIX (placeholder server.ts에서 `INFRA_` PREFIX 적용) · §5 Lint 표 (ESLint + Prettier) / 12 §1 디렉토리 트리 · §2 패키지 명명 · §3 디자인 패턴 (Layered) · §6 환경 변수 표 · §7 부팅 자산 표 · §8 스타일링 솔루션 (Bootstrap 4 + CSS Modules — 본 이슈는 import 골격만, 적용은 fe-shell-router) |

## 1. 변경 의도

기존 `docs/planning/12-scaffolding/typescript.md` §6·§7 + `LOCAL.md` §3·§4가 *문서로* 박제한 부팅 자산 명세를 실제 파일로 구현해 fresh checkout 상태에서 dev/stg/prod 3 profile 모두 부팅 가능한 base scaffold를 박제한다. 이로써 후속 22개 이슈의 부팅 자산 누락 회귀를 사전 차단하고 AI 게이트 6번째 축(3-profile boot)이 매 PR마다 정상 lint를 수행할 수 있게 된다.

## 2. Before / After

| 항목 | Before | After |
|---|---|---|
| 루트 자산 inventory | `.claude/`, `.git/`, `.github/`, `.gitattributes`, `.gitignore`, `CLAUDE.md`, `LOCAL.md`, `README.md`, `agent-toolkit/`, `devtoolkit.config.yaml`, `docs/`, `scripts/` | + `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `docker-compose.{dev,stg,prod}.yml`, `Caddyfile`, `frontend/`, `backend/`, `packages/types/` |
| pnpm workspace 정의 | 부재 | `pnpm-workspace.yaml`이 `frontend`, `backend`, `packages/*` 3 workspace 선언. root `package.json packageManager: "pnpm@9.15.4"` |
| frontend workspace | 부재 | `frontend/package.json` `@conduit/frontend` + Vite 5 + React 18 + Bootstrap 4 + CSS Modules import 골격 + scripts `{dev, build, preview:stg, preview:prod}` |
| backend workspace | 부재 | `backend/package.json` `@conduit/backend` + Fastify 4 + Prisma 5 + dotenv-cli + scripts `{dev, build, start:stg, start:prod, prisma:push:dev, prisma:migrate:{init,stg,prod}, seed:dev}` |
| shared types workspace | 부재 | `packages/types/package.json` `@conduit/types` 골격 (`export {}` placeholder) |
| 환경 변수 템플릿 | 부재 | `frontend/.env.{dev,stg,prod}.example` (3종, `VITE_API_BASE_URL` 등) + `backend/.env.{dev,stg,prod}.example` (3종, `DATABASE_URL`·`JWT_SECRET`·`PORT`·`NODE_ENV`·`CORS_ORIGIN`·`LOG_LEVEL`) = 총 6벌 (§1.5.1 (e)) |
| 컨테이너 정의 | 부재 | `docker-compose.dev.yml` (db + api + web HMR) + `docker-compose.stg.yml` (build + Caddy) + `docker-compose.prod.yml` (build + Caddy + secret 외부 주입 placeholder) + `Caddyfile` (stg/prod reverse proxy) + `backend/Dockerfile` (node:22-alpine multi-stage, USER node — ADR-0042) + `frontend/Dockerfile` (build → Caddy static serve) |
| backend src 골격 | 부재 | `backend/src/server.ts` (Fastify listen + `/health` 200 + profile별 ready 로그 `[fastify] listening on :PORT profile=<p>`) |
| frontend src 골격 | 부재 | `frontend/src/main.tsx` (createRoot) + `frontend/src/App.tsx` (placeholder `<h1>Conduit</h1>` + Bootstrap 4 import 골격) + `frontend/index.html` (Vite entry) + `frontend/vite.config.ts` |
| .gitignore | install.sh가 카피한 v0.1 (agent-toolkit 표준) | + `node_modules/`, `dist/`, `*.tsbuildinfo`, `.env.dev`, `.env.stg`, `.env.prod`, `frontend/.env.{dev,stg,prod}`, `backend/.env.{dev,stg,prod}`, `pnpm-debug.log`, `*.local` (평문 시크릿 파일은 절대 commit 금지 — 보안 절대 규칙 1·4) |
| pnpm lockfile | 부재 | `pnpm-lock.yaml` (root, pnpm 9.15.4 생성) — 본 이슈 PR diff에 포함 |
| 부팅 가능성 | 실패 (자산 부재 → `pnpm install` 자체 불가) | dev: `docker compose -f docker-compose.dev.yml --env-file backend/.env.dev up` → 3 service ready / stg/prod: docker-compose 통합 부팅 OK |
| AI 게이트 6번째 축 | lint 미실행 가능 (자산 부재로 N/A) | PASS (3 profile fresh boot + 에러 0건) |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
|---|---|---|
| `docs/planning/12-scaffolding/typescript.md` §6 환경 변수 표 | 본 이슈가 §6 표의 키(`VITE_API_BASE_URL`·`DATABASE_URL`·`JWT_SECRET`·`PORT`·`NODE_ENV`·`CORS_ORIGIN`·`LOG_LEVEL`·`SPRING_…` 등 N/A 12 키)를 `.env.{dev,stg,prod}.example`로 박제 | 본 이슈 PR에서 12-scaffolding §6 표와 6벌 `.example` 파일 정합 lint 통과해야 함. AI 게이트 6축이 lint |
| `docs/planning/12-scaffolding/typescript.md` §7 부팅 자산 표 | 본 이슈가 §7 8행 표의 모든 자산(`.env.example`·migrations·lockfile·setup scripts·부팅 명령·컨테이너 정의)을 실제 파일로 박제 | §7과 본 이슈 PR diff 정합 |
| `LOCAL.md` §3 dev/stg/prod 부팅 명령 | 본 이슈가 §3의 명령들(`pnpm --filter @conduit/backend dev` 등)이 실제 동작 가능하도록 `package.json scripts` 정의 | §3 명령 ↔ root + workspace `package.json scripts` 정합 |
| `LOCAL.md` §4 부팅 자산 표 | §7 표의 사용자 facing 사본 | §3과 동일 — 본 이슈에서 표 갱신 없음, 명령만 동작 |
| 후속 이슈 #3 `infra-prisma-init` | `backend/prisma/schema.prisma` + migrations 작성 | 본 이슈는 `backend/prisma/` 디렉토리만 골격 생성 (schema 본격 채움 N/A) |
| 후속 이슈 #4 `infra-ci-workflow` | `.github/workflows/ci.yml` 작성 | 본 이슈에서 부재 — PR Manual verification §"GitHub Actions 워크플로 로컬 검증"은 "`.github/workflows/` PR 트리거 워크플로 0개 — N/A" 사유 명시 (ADR-0047 N/A 케이스) |
| 후속 이슈 #7 `fe-shell-router` | React Router HashRouter + Header/Footer + Bootstrap 4 + CSS Modules 본격 적용 | 본 이슈는 `frontend/src/App.tsx` placeholder + `frontend/src/main.css` (Bootstrap 4 import 1줄) 골격만 |
| 후속 이슈 #5 `be-auth-signup` 외 BE 18 endpoint | Fastify 라우트 부착 | 본 이슈는 `backend/src/server.ts`에 `/health` 200 1개 placeholder 라우트만 |
| `.gitignore` | install.sh 카피본에 신규 패턴 추가 | 본 이슈 PR diff |
| 보안 절대 규칙 1·2·4 | `.env.{dev,stg,prod}` 평문 파일 commit 금지 | `.gitignore` 패턴 + `.example`만 commit + PreToolUse 훅이 자동 차단 |

## 4. Backward Compatibility

- **Breaking**: no
- **마이그레이션 필요**: no

기존 동작이 없는 신규 base scaffold (변경 전: 빈 workspace 골격). 외부 호출자·API·DB schema·UI 모두 미존재 상태에서 본 이슈가 *최초* 박제하므로 backward compatibility 우려 없음. 후속 이슈가 본 이슈의 명명·디렉토리 구조를 *전제*로 작성되므로 본 이슈 머지 후엔 자체가 안정 base.

## 5. Rollback 전략

- **revert 가능**: yes
- **rollback 절차**:
  1. PR `git revert <merge-commit-sha>` (ADR-0044 squash merge 기본이므로 단일 커밋 revert로 완전 복원)
  2. 후속 이슈 #3·#4·#5·#7 등이 본 이슈 산출에 의존하므로 본 이슈 revert 시 그 이슈들도 자동 BLOCK (의존성 자명)
  3. 작업 도중 발견 시: `git restore .` + 작업 브랜치 폐기 + 새 브랜치 `feat/infra-scaffold-issue-2-v2`로 재시도
- **데이터 손상 위험**: none — 본 이슈는 DB schema·migration 미실행 (Prisma 디렉토리 골격만). 외부 DB 영향 0건. `docker-compose down -v`로 dev DB 볼륨 폐기 시에도 dev 환경 한정이라 운영 데이터 영향 없음

## 6. 비목표

본 contract 적용 범위 *밖*:
- Prisma `schema.prisma` 실제 모델 (User·Article·Comment·Tag·Favorite·Follow 6 entity) → 이슈 #3
- `.github/workflows/ci.yml` (act 호환 단계, AI 게이트 호출) → 이슈 #4
- 실제 라우트 19 endpoint → BE 이슈 6개
- HashRouter 라우팅 + 9 화면 + Bootstrap 4 본격 사용 → 이슈 #7 + 후속 FE 이슈 6개
- 시크릿 실 값 → `.example`은 placeholder만 (보안 절대 규칙 2)
- Newman 19·k6·axe-core 셋업 → 이슈 #23 `release-readiness`
- 멀티 워크스페이스 빌드 cache 튜닝 (Turbo·Nx) → 도입 N/A (`pnpm -r`이 본 stack에서 충분)
