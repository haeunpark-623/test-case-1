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

# feat-infra-ci-workflow — Implementation Plan

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — 3 commit DAG |

## 1. 커밋 시퀀스 (DAG)

| # | 커밋 | 영향 파일 | 테스트 추가 | 회귀 위험 |
|---|---|---|---|---|
| 1 | `chore(infra): .github/workflows/ci.yml + .actrc + .env.act.example (#4)` | `.github/workflows/ci.yml`, `.actrc`, `.env.act.example` | YAML 문법 lint (수동) | Low — 신규 workflow |
| 2 | `docs(infra): LOCAL.md §5.5 act 사용법 보강 + Prisma SSL troubleshooting (#4)` | `LOCAL.md` §5.5 보강 + §5 (Prisma generate SSL 항목 추가) | (테스트 없음 — 문서) | None |
| 3 | (선택) act dry-run 결과 박제 commit — `act -n` 결과를 PR comment로 첨부 | (파일 없음 — comment) | act -n exit 0 | None |

선형 의존성. 3 commit이지만 commit 3은 PR comment로 대체 (선택).

## 2. 의존성 그래프

```
Commit 1 (ci.yml + actrc) — 본 이슈 핵심
   ▼
Commit 2 (LOCAL.md §5.5 보강) — Commit 1의 명령 참조
   ▼
(Commit 3 — act -n 결과 PR comment, 선택)
```

후속 영향:
- 본 이슈 → 모든 후속 PR이 ci.yml status check 통과 필요
- 본 이슈 → branch protection (별 사용자 액션) — GitHub Settings UI에서 required status checks=ci 추가

## 3. 테스트 매핑

| 커밋 | 테스트 추가 위치 | 시나리오 |
|---|---|---|
| Commit 1 | (자체 검증) | `yq` 또는 `actionlint`로 YAML 문법 검증 (수동). `act -n -W .github/workflows/ci.yml` dry-run exit 0 |
| Commit 2 | (테스트 없음 — 문서) | LOCAL.md §5.5 명령이 act 실 호출과 정합 (code-review에서 점검) |

본 이슈는 *workflow 자체 검증*이 핵심. 단위 테스트는 기존 (이슈 #2·#3) 자동 PASS 유지.

## 4. 빌드·실행 검증 단계

```bash
# 단계 A — 기존 검증 회귀 없음
pnpm install --frozen-lockfile
pnpm -r typecheck && pnpm -r lint && pnpm -r test:unit  # 기존 13 tests PASS

# 단계 B — ci.yml YAML 문법 검증
# actionlint 미설치 시 수동 검토 + GitHub 측 검증
yq '.jobs' .github/workflows/ci.yml  # parsing OK

# 단계 C — act dry-run (사용자 환경)
act -n -W .github/workflows/ci.yml
# 또는 docker daemon 부재 시 manual reproduction

# 단계 D — GitHub Actions 실 실행 (PR open 시 자동)
# PR 머지 전 status check 결과 확인 — push 후 GitHub UI 또는 `gh pr checks 27`
```

## 5. 점진 합의 / 결정 발생 항목

- **ADR 작성 필요**: no — ADR-0047이 이미 양축 검증 정책 박제. 본 이슈는 구현만.
- 사전 합의:
  - act runner image = `catthehacker/ubuntu:act-latest`
  - CI runner = `ubuntu-latest`
  - Node version 20 (12-scaffolding §1)
  - pnpm version 9.15.4 (이슈 #2 박제)
  - PostgreSQL 16-alpine (이슈 #3)
  - secrets `.env.act` (gitignored, `.example`만 commit)
