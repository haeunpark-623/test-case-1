---
doc_type: feature-acceptance
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

# feat-infra-prisma-init — Acceptance Criteria

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — 이슈 #3 AC + DoD |

## 1. 인수 기준 (Given/When/Then)

### AC-01: `prisma format && prisma validate` PASS

- **R-ID**: R-N-05
- **Given**: `backend/prisma/schema.prisma` 7 model 작성 완료
- **When**: `pnpm --filter @conduit/backend exec prisma format && prisma validate` 실행
- **Then**: 양 명령 exit 0. format 변경 0줄 (이미 정규화). validate 에러 0건.
- **측정 방법**: 자동 테스트

### AC-02: schema 7 모델 + 인덱스 정합

- **R-ID**: R-N-05
- **Given**: 04-srs §5 도메인 모델 7행 (User·Article·Tag·ArticleTag·Comment·Favorite·Follow)
- **When**: `grep -E "^model " backend/prisma/schema.prisma | wc -l` 실행
- **Then**: 7. 각 model의 컬럼이 §5 정의와 1:1 매칭 (PascalCase model + snake_case `@map`).
- **측정 방법**: 자동 테스트 — schema grep + 수동 정합 확인 (code-review에서)

### AC-03: PrismaClient 싱글톤 + 단위 테스트 PASS

- **R-ID**: R-N-05, R-N-06
- **Given**: `backend/src/prisma/client.ts` 작성 완료
- **When**: `pnpm --filter @conduit/backend test:unit` 실행
- **Then**: 모든 vitest 통과 (기존 5 + client 3 = 8 tests). 커버리지 ≥ 80% 유지. client 싱글톤은 두 번 import 시 같은 reference.
- **측정 방법**: 자동 테스트

### AC-04: dev DB schema 적용 (분리형 a — db push)

- **R-ID**: R-N-05
- **Given**: dev profile DB 컨테이너 실행 중 (`docker compose -f docker-compose.dev.yml up -d db`)
- **When**: `pnpm --filter @conduit/backend prisma:push:dev` 실행
- **Then**: exit 0. PostgreSQL DB에 7 테이블 생성 — `psql -c "\dt"` 결과 User·Article·Tag·ArticleTag·Comment·Favorite·Follow 7개.
- **측정 방법**: 자동 테스트 — Docker 사용자 환경 위임 (Docker Desktop 부재 시)

### AC-05: stg/prod DB schema 적용 (분리형 a — migrate deploy)

- **R-ID**: R-N-05
- **Given**: stg/prod profile DB 컨테이너 실행 중 + `backend/prisma/migrations/20260527000000_init/` 박제됨
- **When**: `pnpm --filter @conduit/backend prisma:migrate:stg && prisma:migrate:prod` 실행
- **Then**: 양 명령 exit 0. `_prisma_migrations` 메타 테이블에 1행(20260527000000_init applied) 기록. 7 테이블 생성.
- **측정 방법**: 자동 테스트 — Docker 사용자 환경 위임

### AC-06: seed 100건+ 적재

- **R-ID**: R-N-01, R-N-05
- **Given**: AC-04 완료 (dev DB schema 적용됨)
- **When**: `pnpm --filter @conduit/backend seed:dev` 실행
- **Then**: exit 0. `SELECT count(*) FROM "User"` = 10. `Article` = 50. `Tag` = 20. `ArticleTag` = 200. `Favorite` = 200. `Follow` = 100. `Comment` = 300. 총 880 row.
- **측정 방법**: 자동 테스트 — Docker 사용자 환경 위임 (`psql -c "select 'users=' || count(*) ..."` 한 줄 검증)

### AC-07: lint + typecheck PASS (회귀 없음)

- **R-ID**: R-N-06
- **Given**: 본 PR diff 적용 후
- **When**: `pnpm -r typecheck && pnpm -r lint` 실행
- **Then**: 3 workspace 모두 exit 0. 본 이슈 추가 코드(client.ts + seed.ts + prisma-client.test.ts)도 ESLint + tsc 모두 PASS.
- **측정 방법**: 자동 테스트

### AC-08: 04-srs §5 ↔ schema.prisma 1:1 정합

- **R-ID**: R-N-05
- **Given**: 04-srs §5 7 모델 + schema.prisma 7 model
- **When**: code-review에서 정합성 grep + 수동 점검
- **Then**: 모든 모델 이름·컬럼·관계가 04-srs §5와 일치. 추가 모델 0건, 누락 0건, 컬럼 변형(rename 등) 0건.
- **측정 방법**: 수동 확인 — code-review §1에서 점검

## 2. Definition of Done (D-06)

- [ ] **단위 테스트**: `pnpm -r test:unit` PASS + 커버리지 ≥ 80% (backend 8 tests)
- [ ] **AI 게이트**: D-06 1단 — 6축 모두 PASS/N/A
- [ ] **Test Plan 4블록**: PR body 4 sub-section 모두 명시
- [ ] **tested 라벨**: ADR-0046 v1.2 폐지, `pr-body-checkboxes` status check 자동 발행 (workflow 미존재 시 사용자 사인오프로 대체)
- [ ] **Approve**: ≥ 1
- [ ] **CI green**: ADR-0047 N/A 사유 (workflow 부재) 통과
- [ ] **DB smoke 증거** (Docker 사용자 환경): `psql -c "..."` row 개수 결과 PR comment 첨부 OR Manual verification 사용자 사인오프

## 3. 비기능 인수

- **Prisma generate 시간**: 첫 generate < 30초 (SSL 인증서 이슈 발생 시 LOCAL.md §5 troubleshooting 참조)
- **migration.sql 라인 수**: ~ 80 라인 (7 table + 11 index + 4 FK)
- **seed.ts 실행 시간**: 880 row 적재 < 10초 (Postgres 16 alpine 로컬)

## 4. 회귀 인수

mode=add 신규 자산. 기존 동작 없음 — 회귀 N/A.

다만 이슈 #2에서 박제한 `backend/src/__tests__/server.test.ts` (5 tests)가 본 PR diff에서도 그대로 PASS해야 함 (회귀 0건 확인). 본 이슈는 server.ts 미변경.

## 참조

- 상류: contract·plan·eng-review
- AI 게이트 매핑: 본 §1 AC-01~08 → P10 6축 입력
- 휴먼 게이트 매핑: 본 §2 DoD → P14·P15
