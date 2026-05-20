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

# feat-infra-ci-workflow — Feature Brief

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — Sprint 1 #4. GitHub Actions ci.yml + act 로컬 검증 + LOCAL.md §5.5 박제 |

## 1. 한 줄 의도

PR 트리거 GitHub Actions workflow(`.github/workflows/ci.yml`)를 작성해 lint→typecheck→unit→build→Prisma generate/migrate→3 profile docker-compose smoke 시퀀스를 매 PR 자동 실행하고, `act` 호환 단계로 LOCAL.md §5.5 로컬 검증 절차를 박제하여 ADR-0047 양축 검증을 활성화한다.

## 2. 사용자 가치

이슈 #2·#3 PR이 사용자 환경 위임으로 처리한 docker smoke + DB seed + SSL 인증서 처리를 GitHub Actions runner(ubuntu-latest, 인증서 제약 없음)에서 *자동* 검증. 본 이슈 머지 후엔 모든 PR이 status check `ci.yml`을 거쳐야 머지 가능 — ADR-0047 6단계 양축이 자동 동작.

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| `.github/workflows/` | 디렉토리 없음 | `ci.yml` 추가 (PR 트리거) |
| AI 게이트 6번째 축 lint | 사용자 환경 위임 | GitHub Actions runner 자동 실행 |
| 로컬 검증 | 사용자 임의 명령 | `act pull_request -W .github/workflows/ci.yml` 박제 |
| `.actrc` | 없음 | act runner 이미지 + 환경 설정 |
| `.env.act.example` | 없음 | act secrets placeholder |
| LOCAL.md §5.5 | placeholder 명령 (이슈 #2 박제 v0.1 그대로) | 보강 — act 사용법·secret-file·troubleshooting |
| Prisma SSL 인증서 처리 | F-RISK-01 사용자 환경 의존 | CI runner는 인증서 제약 없음 — 자동 동작 |
| 3 profile docker smoke | 사용자 위임 | CI workflow `docker-compose up` 단계 |

## 4. 모드 자동 감지 결과

**mode=add** (자동 결정, 부정 시그널 0). slug `feat-infra-ci-workflow`. 브랜치 `feat/infra-ci-workflow-issue-4`.

## 5. 영향 범위

**신규**:
- `.github/workflows/ci.yml` — pull_request 트리거, 7 step 시퀀스
- `.actrc` — act 기본 옵션 (runner image, env-file, secret-file)
- `.env.act.example` — act용 dummy secrets (placeholder)

**갱신**:
- `LOCAL.md` §5.5 — act 사용법 보강 (현재 placeholder 명령에서 실 명령 + secret-file + Prisma SSL fallback 안내로 확장)

**박제 검증** (변경 없음):
- 이슈 #2 박제 `docker-compose.{dev,stg,prod}.yml` + `pnpm-lock.yaml`
- 이슈 #3 박제 `backend/prisma/schema.prisma` + migration + seed

## 6. 비목표

- branch protection 9개 규칙 적용 (별 사용자 액션 — GitHub Settings UI)
- deploy workflow (`.github/workflows/deploy.yml`) — 운영 단계 별 이슈
- Newman/k6/axe-core 통합 — `release-readiness` #23 책임
- gstack `/qa` CI 통합 — 별 ADR 필요
- act runner 사내 mirror — F-RISK-01 우회 사용자 환경 의존

## 7. Open Questions

- Q1: act 기본 runner image? → `catthehacker/ubuntu:act-latest` (act 권장)
- Q2: Prisma generate를 CI workflow에서 매 PR 실행? → **yes** — schema.prisma 변경 회귀 방지
- Q3: docker-compose 3 profile 모두 CI에서 실행? → dev만 (stg/prod build 시간 절약, full smoke은 release-readiness #23에서)
- Q4: act 로컬 실행 시 docker daemon 의존? → yes — 사용자 환경 Docker Desktop 필요. 미설치 시 manual reproduction fallback (LOCAL.md §5.5 명시)
- Q5: PR title lint workflow와 통합? → 별도 유지 (현 `issue-pr-title-lint` workflow는 이미 동작 중) — 본 PR은 ci.yml만 추가

## 참조

- 상류: GitHub Issue #4, ADR-0047 양축 검증, LOCAL.md §5.5
- 하류: contract → plan → ... → PR merge 후 *모든 후속 PR*에 status check 적용
