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

# feat-infra-ci-workflow — Code Review

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — 4 commit diff 검토 |

## 0. Verdict

- **verdict**: PASS
- **reviewer**: @woosung.ahn@bespinglobal.com
- **review_at**: 2026-05-20

## 1. 컨트랙트 충실도

| Contract After 항목 | PR diff 위치 | 충족 |
|---|---|---|
| `.github/workflows/ci.yml` 추가 | Commit 1 | ✅ — 7+ step (services.db 포함) |
| `.actrc` + `.env.act.example` | Commit 1 | ✅ |
| `.gitignore`에 `.env.act` 무시 + `!.env.act.example` | Commit 1 | ✅ |
| LOCAL.md §5.5 act 사용법 보강 | Commit 2 | ✅ — sample 명령 + dry-run + 회사망 SSL §5.7 참조 |
| LOCAL.md §5.7 Prisma SSL troubleshooting | Commit 2 | ✅ — 4가지 우회 명시 |
| 12-scaffolding §5.5 동기 | Commit 3 | ✅ — ADR-0040 동기 |
| Prisma generate CI 자동 | ci.yml step | ✅ |
| docker-compose dev smoke (postgres service + backend boot) | ci.yml services + steps | ✅ |
| 기존 workflow 영향 없음 | 변경 없음 | ✅ |

9/9 ✅.

## 2. 테스트 커버리지

본 PR은 *workflow YAML* + 문서. 코드 변경 0. 기존 13 tests 회귀 없음 PASS 확인.

## 3. 보안 / 시크릿

- `.env.act` `.gitignore` 추가 ✅ — `!.env.act.example` 예외 명시
- ci.yml에 JWT_SECRET, DATABASE_URL 등 inline placeholder (CI runner 환경 한정, 운영용 아님)
- secret manager 사용은 `.github/workflows/deploy.yml` (별 이슈) 책임 — 본 이슈 scope 외
- code grep으로 시크릿 패턴 0건 (placeholder 외)

## 4. 가독성 / 단순성

- ci.yml 1 job (lint-and-test) — 단순 구조
- step 명시적 name 부여
- env block 최상단 — Node/pnpm 버전 핀
- postgres service healthcheck 명시
- LOCAL.md §5.7 4가지 우회 priority 명확 (CA 인증서 → mirror → TLS bypass → CI 의존)

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
|---|---|---|---|---|
| ci.yml docker-compose가 host docker daemon이 아닌 services.db 사용 | O | X — 표준 GitHub Actions 패턴 | O | 의도된 설계 — `docker compose up`보다 services.db가 더 간결·신뢰 |
| Prisma migrate deploy 단계는 migration files 의존 — 이슈 #3 머지 의존 | O | X — main에 이미 머지됨 | O | 정상 — base=main HEAD가 #3 머지본 |
| act 로컬 실 검증 미실행 (사용자 환경 위임) | O | X — PR Manual verification 명시 | O | 본 PR 자체가 첫 ci.yml — act 검증은 사용자 환경에서 본 PR 머지 *전* 또는 *후* 확인 |
| docker-compose smoke이 ci.yml에 없음 (대신 backend boot smoke 직접) | O | X — 더 간결 | O | services.db + backend boot가 동일 효과 + 빠름 |

3 in_scope, blocks_merge 0건.

## 6. NEEDS-WORK 항목

없음.
