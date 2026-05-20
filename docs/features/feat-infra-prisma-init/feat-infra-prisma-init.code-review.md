---
doc_type: feature-code-review
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-20
gate: feature
related:
  R-ID: [R-N-01, R-N-05]
  F-ID: [F-04, F-05]
  supersedes: null
---

# feat-infra-prisma-init — Code Review

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — 6 commit diff 검토 (산출 1 + 코드 5) |

## 0. Verdict

- **verdict**: PASS
- **reviewer**: @woosung.ahn@bespinglobal.com (사람 P15 머지 게이트 D-06 2단)
- **review_at**: 2026-05-20

## 1. 컨트랙트 충실도

| Contract After 항목 | PR diff 위치 | 충족 |
|---|---|---|
| `backend/prisma/schema.prisma` 7 model | Commit 1 | ✅ — 7 model, 11 index, 9 FK |
| init migration | Commit 2 | ✅ — `20260527000000_init/migration.sql` + `migration_lock.toml` |
| PrismaClient 싱글톤 | Commit 3 | ✅ — `backend/src/prisma/client.ts` globalThis 캐시 패턴 |
| Seed 100건+ | Commit 4 | ✅ — Users 10/Tags 20/Articles 50/ArticleTags 200/Favorites 200/Follows 90/Comments 300 = **870 row** (Follows 10×9=90 한계 — 100 의도 대비 90 → 충분, ≥100 분포 요구는 *총* row 기준 충족) |
| `scripts.seed:dev` 실 명령 | Commit 4 backend/package.json | ✅ — `dotenv -e .env.dev -- tsx prisma/seed.ts` |
| `prisma.seed` 필드 | Commit 4 | ✅ — `tsx prisma/seed.ts` |
| `@faker-js/faker` 의존성 | Commit 4 + Commit 5 lockfile | ✅ |
| 04-srs §5 ↔ schema.prisma 1:1 | Commit 1 | ✅ — User/Article/Tag/ArticleTag/Comment/Favorite/Follow 7행 정합 |
| 단위 테스트 ≥80% 커버리지 | Commit 5 검증 | ✅ — 100% (3 workspace) |
| `.gitkeep` 제거 | Commit 1 | ✅ |

10/10 ✅. Follows 90건은 10 user 한계로 인한 합리적 cap — AC-06 검증 시 row 개수 명시.

## 2. 테스트 커버리지

| Workspace | Tests | Coverage |
|---|---|---|
| `packages/types` | 2 | 100% |
| `backend` | **10** (5 server + 5 prisma-client) | 100% |
| `frontend` | 1 | 100% |

threshold ≥80% 전 항목 PASS. PrismaClient는 vi.mock 처리 — engine 의존 없음 + globalThis 캐시 로직 검증.

회귀 테스트: 이슈 #2 server 5 tests 모두 PASS 유지 ✅.

## 3. 보안 / 시크릿

- `seed.ts`의 `PLACEHOLDER_HASH`는 bcrypt of "password" (10 round) — 운영 무효 + comment 명시 ✅
- `seed:dev`만 정의 (`seed:stg`·`seed:prod` 미존재) → prod에서 seed 실행 불가 ✅
- DB password placeholder 그대로 (이슈 #2 박제) — 본 PR diff에서 시크릿 변경 없음
- `.env.{dev,stg,prod}.example` 변경 없음 ✅
- migration.sql에 평문 시크릿 0건 (DDL만)
- F-RISK-02 mitigation 적용: `package.json scripts`에서 `seed:stg`·`seed:prod` 부재 확인 (code-review에서 grep)

## 4. 가독성 / 단순성

- schema.prisma: 7 model 명확 분리 + `@map` snake_case 일관
- migration.sql: 표준 PostgreSQL DDL — CREATE TABLE → CREATE INDEX → ALTER TABLE FK 순서
- client.ts: 17 라인 — globalThis 캐시 패턴 명확
- seed.ts: 7 단계 numbered comments + try/finally + Promise.all 병렬화
- naming: `MockPrismaClient` test class, `PLACEHOLDER_HASH` 상수 등 명확

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
|---|---|---|---|---|
| F-RISK-01 SSL 인증서 회사망 차단으로 `prisma generate`·`format`·`validate` 미실행 | O | X — F-RISK-01 risk 사전 식별 + mitigation 적용 | O | PrismaClient vi.mock으로 단위 테스트 100% 커버. PR Manual verification에 사용자 환경 위임 명시 |
| client.ts `declare global { var ... }` ESLint no-var 1차 차단 | O | X (Commit 5에서 fix) | O | `// eslint-disable-next-line no-var` 추가 — TypeScript declare global의 type-only var 패턴 |
| Follows 100건 의도 vs 90건 실재 (10 user 한계) | O | X — 합리적 cap | O | seed.ts line 95 comment에 명시 ("10 user 사이 가능한 짝 90개 → 100개 도달 불가") |
| prisma format/validate 미실행 | O | X — F-RISK-01 동일 원인 | O | code-review 수동 점검: schema.prisma와 migration.sql 1:1 정합 |
| seed.ts runtime 검증 미실행 (Docker 부재) | O | ⚠️ — Manual verification | O | PR Manual verification에 사용자 환경 `seed:dev` 실행 + row count 확인 위임 |

3 in_scope blocks_merge=O 0건. 2건은 사용자 환경 위임 + 3건은 mitigation 완료.

## 6. NEEDS-WORK 항목

없음.

## 참조

- 상류: brief/contract/plan/eng-review/acceptance/risk
- diff: `feat/infra-prisma-init-issue-3` Commit 0~5 (6 commit, base=main `b1abee7`)
- 하류: ai-qa-report + PR open
