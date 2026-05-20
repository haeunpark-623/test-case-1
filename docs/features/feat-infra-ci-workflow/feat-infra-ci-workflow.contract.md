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

# feat-infra-ci-workflow — Change Contract

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — ADR-0047 양축 검증 활성화 contract |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
|---|---|---|
| R-ID (요구) | `docs/planning/04-srs/04-srs.md` | R-N-05 (3 profile 부팅), R-N-06 (lint + tsc + 단위 테스트) |
| F-ID (기능) | `docs/planning/05-prd/05-prd.md` | (none) — 본 이슈는 *CI 인프라*. F-01~F-08 모두의 회귀 보장 기반 |
| 영향 모듈 | `docs/planning/07-hld/07-hld.md` §1 | M-BE-INFRA + M-FE-SHELL + M-BE-DB (CI workflow가 모든 module의 검증을 통합 호출) |
| 영향 엔드포인트 | `docs/planning/09-lld-api-spec/09-lld-api-spec.md` | (none) |
| 적용 컨벤션 절 | `docs/planning/11-coding-conventions/11-coding-conventions.md` + `12-scaffolding/typescript.md` | 12 §5.5 GitHub Actions 로컬 (act 명령) · 11 §5 Lint 표 |

## 1. 변경 의도

PR 트리거 GitHub Actions workflow(`.github/workflows/ci.yml`) 작성으로 매 PR 자동 양축 검증(ADR-0047) 활성화. 후속 모든 PR이 status check를 거치며 AI 게이트 6축 + sprint contract 인수 자동화.

## 2. Before / After

| 항목 | Before | After |
|---|---|---|
| `.github/workflows/` 디렉토리 | 부재 | `ci.yml` 1개 |
| PR 트리거 workflow 수 | 1 (기존 `issue-pr-title-lint`) | 2 (+ `ci`) |
| CI step 시퀀스 | 없음 | 7 step — checkout / pnpm setup / install / lint / typecheck / test:unit / docker-compose smoke (dev) |
| Prisma generate CI | 미실행 | `pnpm --filter @conduit/backend exec prisma generate` (CI runner 인증서 제약 없음) |
| docker-compose dev smoke | 사용자 위임 | CI runner 자동 (`docker compose up` + `curl /health`) |
| act 로컬 검증 | LOCAL.md placeholder | `.actrc` + `.env.act.example` + LOCAL.md §5.5 보강 |
| AI 게이트 6번째 축 lint | "사용자 환경 위임" 메모 | "CI workflow 자동 실행 + act 로컬 검증" — 정상 상태 |
| Manual verification ADR-0047 | "N/A workflows 부재" 사유 | "act `pull_request -W .github/workflows/ci.yml` 실행 결과 첨부" |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
|---|---|---|
| `LOCAL.md` §5.5 | placeholder 명령 → act 실행 절차로 확장 | 본 PR diff에 LOCAL.md 갱신 |
| 모든 후속 PR | `ci.yml` status check 자동 트리거 | 본 PR 머지 후 모든 PR이 자동 검증 (현재 #25·#26은 본 PR 이전이라 영향 없음, 다음 #5부터 적용) |
| 이슈 #5 be-auth-signup 등 BE 5 이슈 | Prisma generate + integration test가 CI에서 동작 (사용자 환경 위임 → CI 자동) | 본 PR 머지 후 부담 감소 |
| 이슈 #23 release-readiness | CI에 Newman/k6/axe-core 추가 | 본 이슈는 base ci.yml, #23이 확장 |
| `issue-pr-title-lint` 기존 workflow | 영향 없음 | 그대로 유지 |
| F-RISK-01 SSL 인증서 (#3 발견) | CI runner는 인증서 제약 없음 — F-RISK-01 자동 해결 | LOCAL.md §5 troubleshooting에 "회사망에서 prisma generate 실패 시 CI 의존 가능" 보강 |

## 4. Backward Compatibility

- **Breaking**: no
- **마이그레이션 필요**: no

신규 workflow 추가. 기존 `issue-pr-title-lint` workflow 변경 없음. PR/머지 흐름 자체는 동일 — status check 추가만.

## 5. Rollback 전략

- **revert 가능**: yes
- **rollback 절차**:
  1. `git revert <merge-commit-sha>` — `.github/workflows/ci.yml` 삭제
  2. 후속 PR이 일시적 status check 부재 상태로 회귀 — 머지는 가능하지만 자동 검증 미실행
  3. LOCAL.md §5.5 placeholder 상태로 복귀
- **데이터 손상 위험**: none — workflow YAML 변경만, 실 코드 0건

## 6. 비목표

- branch protection 9 규칙 UI 설정 (사용자 액션)
- deploy workflow
- gstack `/qa` CI 통합
- Newman/k6/axe-core
- act 사내 mirror 우회
