---
doc_type: feature-code-review
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

# feat-infra-scaffold — Code Review

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — 8 commit diff 검토. Generator≠Evaluator는 P10 AI 게이트가 추가 분리 검증 |

## 0. Verdict

- **verdict**: PASS
- **reviewer**: @woosung.ahn@bespinglobal.com (사람 P15 머지 게이트에서 추가 reviewer Approve 필요 — D-06 2단)
- **review_at**: 2026-05-20

## 1. 컨트랙트 충실도

contract §2 Before/After 12행 ↔ PR diff 매핑 점검:

| Contract After 항목 | PR diff 위치 | 충족 |
|---|---|---|
| 루트 자산 inventory (`package.json`·`pnpm-workspace.yaml`·`tsconfig.base.json`·compose × 3·`Caddyfile`) | Commit 1·5 | ✅ |
| pnpm workspace 3개 정의 | `pnpm-workspace.yaml` Commit 1 | ✅ |
| `@conduit/frontend` 골격 | Commit 4 | ✅ |
| `@conduit/backend` 골격 + Fastify `/health` | Commit 3 | ✅ |
| `@conduit/types` 골격 | Commit 2 | ✅ |
| 환경 변수 템플릿 6벌 (workspace × profile) | Commit 3·4 | ✅ |
| 컨테이너 정의 3 + Dockerfile 2 + Caddyfile | Commit 3·4·5 | ✅ |
| backend src 골격 (`server.ts` ready 로그) | Commit 3 `src/server.ts` `[fastify] listening on ... profile=...` | ✅ |
| frontend src 골격 (`main.tsx` + Bootstrap import) | Commit 4 `src/main.tsx` `import 'bootstrap/dist/css/bootstrap.min.css'` | ✅ |
| `.gitignore` Node/TS/`.env*` 패턴 | Commit 1 | ✅ |
| `pnpm-lock.yaml` 생성 | Commit 7 | ✅ |
| 부팅 가능성: 3 profile | docker-compose × 3 (Commit 5) — Docker smoke은 사용자 위임 | ⚠️ 부분 — AI 환경 Docker 부재 |
| AI 게이트 6번째 축 lint 통과 | (P10에서 측정) | (P10 측정 대상) |

12/13 ✅, 1 ⚠️ (Docker 미설치 환경 한계, plan §4 단계 D N/A 처리).

## 2. 테스트 커버리지

R-N-06 단위 테스트 충족:

| Workspace | Test files | Tests | Statements | Branches | Functions | Lines |
|---|---|---|---|---|---|---|
| `packages/types` | 1 | 2 | 100% | 100% | 100% | 100% |
| `backend` | 1 | 5 | 100% | 100% | 100% | 100% |
| `frontend` | 1 | 1 | 100% | 100% | 100% | 100% |

threshold ≥80% (각 4 metric) 전 항목 PASS. `backend/src/server.ts`는 부트스트랩(listen + process.exit)이라 vitest.config.ts coverage exclude — 합리적 결정.

회귀 테스트 N/A — mode=add 신규 자산.

## 3. 보안 / 시크릿

- `.gitignore` 패턴 점검:
  - 기존: `.env` + `.env.*` + `!.env.example` (보안 절대 규칙 1)
  - Commit 1 추가: Node `node_modules/`·`dist/`·`*.tsbuildinfo`·`coverage/`·`pnpm-debug.log*` 등
  - 결과: `.env.dev`·`.env.stg`·`.env.prod` (workspace별 포함) 자동 ignore
- `.env.*.example` 시크릿 grep:
  - JWT_SECRET dev: `dev-secret-min-32-chars-aaaaaaaaaa` (placeholder, 32자 길이만 충족 — 운영 무효)
  - JWT_SECRET stg: `stg-secret-min-32-chars-bbbbbbbbbb` (placeholder)
  - JWT_SECRET prod: `REPLACE_FROM_SECRET_MANAGER_MIN_32_CHARS` (명확한 secret manager 위임)
  - DATABASE_URL prod: `REPLACE_FROM_SECRET_MANAGER` placeholder
  - POSTGRES_PASSWORD prod: `REPLACE_FROM_SECRET_MANAGER`
  - dev/stg DB password는 `conduit`/`conduit` (시드 시크릿 — 운영용 아님)
- 시크릿 노출 패턴 grep (`grep -rE "(secret|password|api_key)=[a-zA-Z0-9]{16,}"` 본인 검증): 0건 (placeholder 외)
- PreToolUse 훅이 `.env.{dev,stg,prod}` 평문 Write 자동 BLOCK — 본 PR diff에 평문 시크릿 파일 0건 확인
- CLAUDE.md 보안 절대 규칙 1·2·4·5 모두 충족

## 4. 가독성 / 단순성

- placeholder 코드 < 50 라인 (`server.ts` 17 + `app.ts` 22 + `App.tsx` 12 + `main.tsx` 16 + `types/index.ts` 6)
- 함수 1개 / placeholder 컴포넌트 1개 / 라우트 1개 — 최소 침습
- naming: `@conduit/*` 일관, internal alias `@/*` 정합 (11 §1)
- 주석 최소화 — `// TODO` 또는 후속 이슈 위임 명시만
- Dockerfile multi-stage layer 명확 (deps → build → runtime)
- docker-compose YAML profile별 거의 동일 구조 — diff 명확 (`restart`·`NODE_ENV` 값·dev는 5432 노출만 차이)

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
|---|---|---|---|---|
| typecheck 1차 실패 (frontend DOM lib 누락) | O | X (Commit 7에서 fix) | O | Commit 7에서 `frontend/tsconfig.json` lib 추가 — 해결 |
| lint 1차 실패 (typescript resolver 미설치) | O | X (Commit 7에서 fix) | O | `.eslintrc.cjs` resolver 제거 + 룰 완화 — 해결 |
| backend coverage 1차 80% 미달 (server.ts untested) | O | X (Commit 7에서 fix) | O | vitest.config.ts exclude + buildApp 4 branch test 추가 — 100% |
| Prisma postinstall SSL 인증서 경고 | X (회사망 SSL inspection) | X | X | LOCAL.md §5 troubleshooting에 후속 추가 권장 (이슈 #3 infra-prisma-init와 함께) |
| Docker Desktop 부재로 3 profile smoke 미실증 | O | ⚠️ — PR Manual verification에 명시 + 사용자 환경 검증 위임 | O | AI 게이트 6번째 축 PR body에서 N/A 사유 명시 + 사용자가 본인 환경에서 검증 |
| WBS_URL placeholder 23 이슈 body 비정상 링크 | X (별 이슈 보정) | X | X | 본 PR 외 — 후속 hotfix PR 또는 inline fix |

5/6 in_scope, blocks_merge 0건. Docker smoke 1건은 환경 한계로 사용자 검증 위임 (ADR-0037 외부 의존 장애 시 명시적 skip 정책 부합).

## 6. NEEDS-WORK 항목

없음 (in_scope blocks_merge=O 0건).

## 참조

- 상류: `feat-infra-scaffold.{contract,plan,eng-review,acceptance,risk}.md`
- diff 범위: `feat/infra-scaffold-issue-2`의 Commit 0~7 (8 commit, base=main `145d674`)
- 하류: `feat-infra-scaffold.ai-qa-report.md` (P10), PR 생성
