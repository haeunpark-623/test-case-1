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

# feat-infra-ci-workflow — Acceptance Criteria

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — ci.yml + act AC + DoD |

## 1. 인수 기준 (Given/When/Then)

### AC-01: ci.yml YAML 문법 정합

- **R-ID**: R-N-05
- **Given**: `.github/workflows/ci.yml` 작성 완료
- **When**: GitHub Actions가 PR open 시 workflow 파싱
- **Then**: 문법 에러 0건. 7 step 모두 인식. trigger=pull_request 정확.
- **측정 방법**: 자동 테스트 — GitHub Actions tab에 workflow 표시

### AC-02: ci.yml step 시퀀스 정합

- **R-ID**: R-N-05, R-N-06
- **Given**: PR open 후 GitHub Actions runner 실행 시작
- **When**: ci.yml 실행
- **Then**: 7 step exit 0 — checkout · pnpm setup · pnpm install --frozen-lockfile · pnpm -r lint · pnpm -r typecheck · pnpm -r test:unit · docker-compose dev smoke (`docker compose up -d db` + Prisma generate + push + seed + curl /health)
- **측정 방법**: 자동 테스트 — GitHub Actions UI 또는 `gh pr checks <PR>`

### AC-03: act 로컬 명령 박제

- **R-ID**: R-N-05
- **Given**: LOCAL.md §5.5 + `.actrc` + `.env.act.example` 박제
- **When**: 사용자가 `act pull_request -W .github/workflows/ci.yml --secret-file .env.act` 실행
- **Then**: act가 ubuntu runner 컨테이너 spin up + ci.yml step 동일 시퀀스 실행. exit 0.
- **측정 방법**: 수동 확인 (Docker 사용자 환경)

### AC-04: Prisma generate CI 자동 동작

- **R-ID**: R-N-06
- **Given**: ci.yml에 `pnpm --filter @conduit/backend exec prisma generate` 단계 포함
- **When**: GitHub Actions runner에서 step 실행
- **Then**: exit 0. `node_modules/.prisma/client/` 생성. SSL 인증서 에러 없음 (runner는 인증서 제약 없음).
- **측정 방법**: 자동 테스트

### AC-05: docker-compose dev smoke 자동

- **R-ID**: R-N-05
- **Given**: ci.yml에 `docker compose -f docker-compose.dev.yml --env-file backend/.env.dev up -d` 단계
- **When**: runner에서 실행
- **Then**: `curl http://localhost:4000/health` 200. cleanup `docker compose down -v` exit 0.
- **측정 방법**: 자동 테스트

### AC-06: LOCAL.md §5.5 보강

- **R-ID**: R-N-06
- **Given**: LOCAL.md §5.5 갱신 (act 사용법 + Prisma SSL fallback)
- **When**: 사용자가 LOCAL.md §5.5 절차 따라 act 실행
- **Then**: 명령 그대로 동작. 회사망 SSL 차단 시 fallback 안내 적용.
- **측정 방법**: 수동 확인 — code-review에서 점검

### AC-07: 기존 workflow 영향 없음

- **R-ID**: R-N-06
- **Given**: 기존 `issue-pr-title-lint` workflow 그대로
- **When**: 본 PR open
- **Then**: lint-title status check 정상 동작 (이전 PR과 동일). 본 PR에 추가로 `ci` status check 등장.
- **측정 방법**: 자동 테스트 — `gh pr checks 27`

## 2. Definition of Done (D-06)

- [ ] **단위 테스트**: 기존 13 tests PASS 유지 (회귀 없음)
- [ ] **AI 게이트**: 6축 PASS/N/A — 본 PR부터 6번째 축이 *CI workflow 자동 실행 결과*로 측정
- [ ] **Test Plan 4블록**: 명시
- [ ] **tested 라벨**: ADR-0046 v1.2 폐지, pr-body-checkboxes status check로 대체
- [ ] **Approve**: ≥ 1
- [ ] **CI green**: ci.yml 자체 status check PASS — 본 PR이 첫 적용

## 3. 비기능 인수

- ci.yml step 총 실행 시간 < 10분
- act 로컬 실행 시간 < 15분 (Docker pull 포함)

## 4. 회귀 인수

mode=add. 기존 동작 없음 — 회귀 N/A.

다만 본 PR 이후 *모든 PR이 ci status check 필수* — 자동 lint/typecheck/test:unit/docker-compose smoke. 후속 PR의 회귀를 본 workflow가 catch.
