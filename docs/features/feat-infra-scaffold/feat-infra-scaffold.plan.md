---
doc_type: feature-plan
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-20
gate: feature
related:
  R-ID: [R-N-05, R-N-06]
  F-ID: []
  supersedes: null
---

# feat-infra-scaffold — Implementation Plan

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — contract §0 selective read 기반 7 subtask DAG |

## 1. 커밋 시퀀스 (DAG)

> 각 행이 1 commit. 커밋 메시지 conventional commits + `#2` 이슈 참조. Subtask 7건 → 7 commit. ADR-0044 squash merge라 최종 머지 시 1개 영구 commit으로 축약.

| # | 커밋 | 영향 파일 | 테스트 추가 | 회귀 위험 |
|---|---|---|---|---|
| 1 | `chore(infra): pnpm workspace root + tsconfig.base + .gitignore (#2)` | `package.json`(root), `pnpm-workspace.yaml`, `tsconfig.base.json`, `.gitignore` 갱신 | `pnpm install --dry-run`이 workspace 3개 인식 (수동 점검) | None — 신규 자산 |
| 2 | `chore(infra): packages/types workspace 골격 (#2)` | `packages/types/{package.json,tsconfig.json,src/index.ts}` | `pnpm --filter @conduit/types build` PASS | None — empty export |
| 3 | `chore(infra): backend workspace 골격 + Fastify /health (#2)` | `backend/{package.json,tsconfig.json,src/server.ts,src/app.ts,.env.{dev,stg,prod}.example,Dockerfile,prisma/.gitkeep}` | vitest `server.test.ts` — `/health` 200 응답 + ready 로그 매치 | Low — placeholder 라우트만 |
| 4 | `chore(infra): frontend workspace 골격 + Vite + Bootstrap import (#2)` | `frontend/{package.json,tsconfig.json,vite.config.ts,index.html,src/main.tsx,src/App.tsx,src/styles/global.css,.env.{dev,stg,prod}.example,Dockerfile}` | vitest `App.test.tsx` — `<h1>Conduit</h1>` 렌더 + bootstrap CSS import 흔적 | Low — placeholder 컴포넌트 |
| 5 | `chore(infra): docker-compose 3 profile + Caddyfile (#2)` | `docker-compose.dev.yml`, `docker-compose.stg.yml`, `docker-compose.prod.yml`, `Caddyfile` | dev profile 부팅 smoke (`docker compose -f docker-compose.dev.yml config` 유효 + service 3개) | Med — base image 함정 ADR-0042 (corepack 핀, USER node 사용) |
| 6 | `chore(infra): root lint + tsc scripts + ESLint/Prettier (#2)` | 루트 `package.json scripts.{lint,typecheck,test:unit,build}`, `.eslintrc.cjs`, `.prettierrc.json`, `.editorconfig`, `.eslintignore` | `pnpm lint` + `pnpm typecheck` 양 PASS | None — config only |
| 7 | `chore(infra): pnpm install + lockfile 생성 + 3 profile smoke (#2)` | `pnpm-lock.yaml` (생성), `node_modules/` (gitignored) | `pnpm install --frozen-lockfile` 통과 후 3 profile 부팅 smoke test (`docker compose -f docker-compose.dev.yml --env-file backend/.env.dev up -d` + `/health` 200 확인 + `docker compose down`) × 3 profile | Low — 모든 의존성 lock |

## 2. 의존성 그래프

```
Commit 1 (root workspace)
   ▼
Commit 2 (packages/types)        — root pnpm-workspace.yaml의 packages/* glob 필요
Commit 3 (backend)               — root tsconfig.base.json extends 필요 (Commit 1)
Commit 4 (frontend)              — root tsconfig.base.json + packages/types alias 필요 (Commit 1·2)
Commit 5 (docker-compose)        — Commit 3 backend/Dockerfile + Commit 4 frontend/Dockerfile 참조
Commit 6 (lint config)           — Commit 1~4의 src/ 위치 알아야 ESLint glob 정합
Commit 7 (lockfile + boot smoke) — Commit 1~6 모두 종합 검증
```

선형 의존성. 병렬 가능 commit 없음 (각 commit이 직전 산출에 의존). 파일별 변경 영역 서로 직교 — merge conflict 위험 0.

후속 이슈 의존성:
- 본 이슈 → `infra-prisma-init` (#3): `backend/prisma/schema.prisma` 작성 + migrations 디렉토리 채움
- 본 이슈 → `infra-ci-workflow` (#4): `.github/workflows/ci.yml` 작성
- 본 이슈 → `fe-shell-router` (#7): `frontend/src/App.tsx` placeholder를 HashRouter로 교체
- 본 이슈 → `be-auth-signup` (#5): `backend/src/server.ts` placeholder에 `/api/users` 라우트 부착

## 3. 테스트 매핑

> R-N-06 (lint + tsc + 단위 테스트) BLOCK 충족. mode=add 회귀 테스트 N/A (신규 자산).

| 커밋 | 테스트 추가 위치 | 시나리오 |
|---|---|---|
| Commit 1 | (테스트 없음 — config) | `pnpm install --dry-run`이 workspace 3개 인식 — 수동 verification (CI 미가용 단계) |
| Commit 2 | `packages/types/src/__tests__/index.test.ts` | `export {}` 컴파일 OK + `import {} from '@conduit/types'` resolved |
| Commit 3 | `backend/src/__tests__/server.test.ts` (vitest) | `GET /health → 200 { status: "ok", profile: process.env.NODE_ENV }` + ready 로그 stdout 매치 `[fastify] listening on :\d+ profile=` |
| Commit 4 | `frontend/src/__tests__/App.test.tsx` (vitest + @testing-library/react) | `<App/>` 렌더 시 `<h1>Conduit</h1>` 존재 + main.tsx에서 `bootstrap.min.css` import 존재 (정적 분석) |
| Commit 5 | (테스트 없음 — config) | `docker compose -f docker-compose.{dev,stg,prod}.yml config` 셋다 exit 0 + service 정의 정합 |
| Commit 6 | (테스트 없음 — config) | `pnpm lint` + `pnpm typecheck` 양 PASS |
| Commit 7 | (smoke E2E) | dev profile fresh boot — `docker compose -f docker-compose.dev.yml --env-file backend/.env.dev up -d` → 대기 → `curl http://localhost:4000/health` 200 → `docker compose down`. stg/prod도 동일 (build 단계 포함) |

커버리지: 본 이슈 코드 추가 라인 < 50 (대부분 config). vitest line/branch/function ≥ 80% 충족 자명 (server.ts·App.tsx의 placeholder는 단순 함수 1개씩, test가 100% 커버).

## 4. 빌드·실행 검증 단계

> AI 게이트 6축의 5번째(브라우저 골든패스 + stylesheet) + 6번째(3-profile 부팅) lint가 본 절을 직접 실행. ui_changed=false(placeholder 컴포넌트만)이므로 gstack `/qa` 미호출 OK — 후속 fe-shell-router에서 본격 호출. stylesheet 적용 확인은 main.tsx의 `import 'bootstrap/dist/css/bootstrap.min.css'` 1줄로 schema-level 충족 (ADR-0038).

```bash
# 단계 A — 의존성 설치 + 워크스페이스 검증
pnpm install --frozen-lockfile
pnpm -r run typecheck       # tsconfig 정합 — 3 workspace 모두 PASS 기대
pnpm -r run lint            # ESLint — 3 workspace 모두 PASS 기대

# 단계 B — 단위 테스트
pnpm -r run test:unit       # vitest — server.test + App.test + types.test (≥80% 커버)

# 단계 C — 3 profile 부팅 smoke
# dev
cp frontend/.env.dev.example  frontend/.env.dev
cp backend/.env.dev.example   backend/.env.dev
docker compose -f docker-compose.dev.yml --env-file backend/.env.dev up -d
sleep 30
curl -fsS http://localhost:4000/health | grep -q '"status":"ok"'
docker compose -f docker-compose.dev.yml down

# stg
cp frontend/.env.stg.example  frontend/.env.stg
cp backend/.env.stg.example   backend/.env.stg
docker compose -f docker-compose.stg.yml --env-file backend/.env.stg up -d --build
sleep 45
curl -fsS http://localhost:4000/health | grep -q '"status":"ok"'
docker compose -f docker-compose.stg.yml down

# prod
cp frontend/.env.prod.example  frontend/.env.prod
cp backend/.env.prod.example   backend/.env.prod
docker compose -f docker-compose.prod.yml --env-file backend/.env.prod up -d --build
sleep 45
curl -fsS http://localhost:4000/health | grep -q '"status":"ok"'
docker compose -f docker-compose.prod.yml down

# 단계 D — GitHub Actions 로컬 검증 (ADR-0047) — N/A
# 본 이슈는 `.github/workflows/` 디렉토리에 PR 트리거 워크플로 0개 (이슈 #4 책임). N/A 사유 명시로 통과.
```

기대 결과:
- 단계 A·B 모두 exit 0
- 단계 C 각 profile에서 `curl /health` 200 + JSON `{"status":"ok",...}`
- ready 로그에 `[fastify] listening on :4000 profile=dev|stg|prod` 표시
- `docker compose down` 후 컨테이너·네트워크 잔여물 0
- 단계 D는 N/A 사유 명시로 통과

## 5. 점진 합의 / 결정 발생 항목

- **ADR 작성 필요**: no
  - 본 이슈는 12-scaffolding §1·§5·§6·§7·§8 + ADR-0037·0038·0040·0041·0042·0044에서 *이미 결정된* 자산을 박제만 수행. 신규 결정 없음.
  - 만약 commit 5 docker-compose 작성 중 base image 함정(ADR-0042)이 LOCAL.md §1.5.4 안내와 다른 경로로 발견되면 *그 시점* 별도 ADR 작성 (확률 낮음, 함정 사전 안내가 ADR-0042로 충분히 박제됨).
- 사전 합의 사항 (본 이슈 PR comment에 명시):
  - corepack pnpm 버전 핀 = `9.15.4` (`package.json packageManager: "pnpm@9.15.4"`, ADR-0042 (2))
  - backend base image = `node:22-alpine` + `USER node` (ADR-0042 (1))
  - frontend stg/prod 정적 호스팅 = `Caddy` (LOCAL.md §6 외부 의존)
  - DB image = `postgres:16-alpine`
  - dev profile DB seed = **skip** (`infra-prisma-init` 책임)
  - JWT_SECRET `.example` 값 = `dev-secret-min-32-chars-aaaaaaaaaa` (32자 placeholder, HS256 길이 요건 충족, 실 값 아님)
- 결정 발생 시 갱신 위치: 본 §5 + 필요 시 `docs/planning/adr/NNNN-*.md`

## 참조

- 상류: `feat-infra-scaffold.contract.md` §0·§2·§3
- 입력 정본 (selective read): contract §0 5행에 명시된 R-N-05/R-N-06, M-BE-INFRA/M-BE-DB/M-FE-SHELL/M-SHARED-TYPES, 11/12 컨벤션 절
- 하류: `feat-infra-scaffold.acceptance.md` (P6) + `feat-infra-scaffold.risk.md` (P7) + `feat-infra-scaffold.eng-review.md` (P5)
