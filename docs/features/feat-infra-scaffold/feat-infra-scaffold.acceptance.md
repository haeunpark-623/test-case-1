---
doc_type: feature-acceptance
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

# feat-infra-scaffold — Acceptance Criteria

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — 이슈 #2 AC + DoD 4행 P10 AI 게이트 정합 |

## 1. 인수 기준 (Given/When/Then)

### AC-01: 의존성 설치 정상

- **R-ID**: R-N-06
- **Given**: fresh checkout 상태 (clone 직후, `node_modules/` 부재)
- **When**: `pnpm install --frozen-lockfile` 실행
- **Then**: exit code 0 + `node_modules/` 생성 + `frontend`·`backend`·`packages/types` 3 workspace 모두 `node_modules/.pnpm`에서 resolve. pnpm-lock.yaml 무변경 (frozen).
- **측정 방법**: 자동 테스트 — plan §4 단계 A 첫 줄

### AC-02: 타입 체크 + lint PASS

- **R-ID**: R-N-06
- **Given**: AC-01 완료 후
- **When**: `pnpm -r run typecheck && pnpm -r run lint` 실행
- **Then**: 양 명령 exit code 0. 3 workspace 모두 PASS. `tsc --noEmit` 에러 0건 + ESLint 에러 0건.
- **측정 방법**: 자동 테스트 — plan §4 단계 A 2·3줄

### AC-03: 단위 테스트 ≥80% 커버리지

- **R-ID**: R-N-06
- **Given**: AC-02 완료 후
- **When**: `pnpm -r run test:unit` 실행
- **Then**: vitest 통과 + 커버리지 ≥ 80% (line/branch/function). 3 workspace의 placeholder 테스트(server.test/App.test/types.test) 모두 통과.
- **측정 방법**: 자동 테스트 — plan §4 단계 B

### AC-04: dev profile 부팅 + ready 신호

- **R-ID**: R-N-05
- **Given**: `frontend/.env.dev` + `backend/.env.dev` 카피 완료
- **When**: `docker compose -f docker-compose.dev.yml --env-file backend/.env.dev up -d` 실행 + 30초 대기
- **Then**: 3 service(db·api·web) 모두 healthy. `curl -fsS http://localhost:4000/health` → `200 {"status":"ok","profile":"dev"}`. backend 로그에 `[fastify] listening on :4000 profile=dev` 존재. `docker compose down` 후 잔여 컨테이너/네트워크 0.
- **측정 방법**: 자동 테스트 — plan §4 단계 C dev

### AC-05: stg profile 부팅 + ready 신호

- **R-ID**: R-N-05
- **Given**: `frontend/.env.stg` + `backend/.env.stg` 카피 완료
- **When**: `docker compose -f docker-compose.stg.yml --env-file backend/.env.stg up -d --build` 실행 + 45초 대기 (build 포함)
- **Then**: Caddy + backend + db 모두 healthy. `curl -fsS http://localhost:4000/health` → 200. backend 로그 `profile=stg`. `docker compose down`.
- **측정 방법**: 자동 테스트 — plan §4 단계 C stg

### AC-06: prod profile 부팅 + ready 신호

- **R-ID**: R-N-05
- **Given**: `frontend/.env.prod` + `backend/.env.prod` 카피 완료
- **When**: `docker compose -f docker-compose.prod.yml --env-file backend/.env.prod up -d --build` 실행 + 45초 대기
- **Then**: Caddy HTTPS + backend(NODE_ENV=production) + db 모두 healthy. `curl -fsS http://localhost:4000/health` → 200. backend 로그 `profile=prod`. `docker compose down`.
- **측정 방법**: 자동 테스트 — plan §4 단계 C prod

### AC-07: 보안 절대 규칙 — 평문 시크릿 미커밋

- **R-ID**: R-N-06
- **Given**: `.gitignore`에 `.env.{dev,stg,prod}` 패턴 추가 + workspace별 `.env.<profile>` 패턴 추가
- **When**: `git status` 실행 (도입자가 `.env.dev` 등 평문 시크릿 파일 생성한 상태)
- **Then**: 평문 `.env.<profile>` 파일은 untracked 미표시 (gitignore 적용). `.example` 파일만 tracked. PR diff에 시크릿 값 노출 0건.
- **측정 방법**: 수동 확인 — code-review에서 검토

### AC-08: 12-scaffolding §6·§7 + LOCAL.md §3·§4 동기 박제

- **R-ID**: R-N-05
- **Given**: 본 PR diff에 부팅 자산 신규 7종 추가 (env templates × 6 + lockfile + docker-compose × 3 + Dockerfile × 2 + Caddyfile)
- **When**: AI 게이트 6번째 축 lint 실행
- **Then**: 12-scaffolding/typescript.md §6 env 표 12 키 모두 `.env.<workspace>.<profile>.example`에 1행씩 존재. §7 8 자산 표의 모든 행이 실제 파일 존재. LOCAL.md §3·§4 명령 그대로 실행 가능. 한쪽만 변경 시 BLOCK.
- **측정 방법**: 자동 테스트 — AI 게이트 6번째 축 lint script

## 2. Definition of Done (D-06)

- [ ] **단위 테스트**: `pnpm -r run test:unit` PASS + 커버리지 ≥ 80% (AC-03)
- [ ] **AI 게이트**: D-06 1단 — 6축 모두 PASS (contract OK·unit OK·integration N/A·E2E smoke OK·browser+stylesheet OK·3-profile boot OK)
- [ ] **Test Plan 4블록**: PR body의 Test Plan 4블록(자동/수동/회귀/E2E) 모두 명시. mode=add 회귀 N/A 사유 명시
- [ ] **tested 라벨**: D-06 2단 — 휴먼 게이트 PASS 후 부착 (ADR-0046 v1.2 폐지로 `tested` 라벨 자체 없음 — `pr-body-checkboxes` status check 머지 게이트가 자동 발행)
- [ ] **Approve**: PR ≥ 1 Approve (Generator≠Evaluator — code-review reviewer agent 분리, P9)
- [ ] **CI green**: GitHub Actions workflow yml 부재 (이슈 #4 책임). 본 이슈 PR는 ADR-0047 N/A 사유 명시로 통과. CI 도입 후엔 본 항목 정상 적용.
- [ ] **3-profile 부팅 증거**: dev/stg/prod 각 `curl /health` 200 응답 log (`docs/features/feat-infra-scaffold/boot-evidence/{dev,stg,prod}.log`) 첨부
- [ ] **12-scaffolding/LOCAL.md 동기 lint PASS** (AC-08)

## 3. 비기능 인수

- **부팅 속도**: dev profile up → ready 30초 이내, stg/prod (build 포함) 45초 이내. (참고치 — strict gate 아님)
- **Docker 이미지 크기**: backend prod `node:22-alpine` multi-stage 후 < 250MB (대략치). 본 PR에서는 측정만, 강제 X.
- **lockfile 결정성**: `pnpm install --frozen-lockfile` 재실행 시 lockfile 변동 0줄.
- **보안 PreToolUse 훅**: `.env.dev`·`.env.stg`·`.env.prod` Write 시도 시 settings.json 훅이 자동 BLOCK 동작 확인 (수동 확인).

## 4. 회귀 인수

mode=add 신규 자산. 기존 동작 없음 → 회귀 인수 N/A.

본 이슈 머지 후 *후속 이슈가 본 자산을 회귀 base로* 사용. 회귀 추적은 후속 이슈 PR에서 본 자산 변경 여부 lint.

## 참조

- 상류: `feat-infra-scaffold.{contract,plan,eng-review}.md`
- AI 게이트 매핑: 본 §1 AC-01~AC-08 → P10 `qa-test --ai` 6축 입력
- 휴먼 게이트 매핑: 본 §2 D-06 → P14 `qa-test --human` + P15 머지
