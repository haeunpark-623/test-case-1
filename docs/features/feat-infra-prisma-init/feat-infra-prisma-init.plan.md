---
doc_type: feature-plan
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

# feat-infra-prisma-init — Implementation Plan

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — contract §0 selective read 기반 5 commit DAG |

## 1. 커밋 시퀀스 (DAG)

| # | 커밋 | 영향 파일 | 테스트 추가 | 회귀 위험 |
|---|---|---|---|---|
| 1 | `chore(infra): Prisma schema.prisma 7 모델 + 인덱스 (#3)` | `backend/prisma/schema.prisma` (generator + datasource + 7 model + 11 index/unique) | `prisma format` + `prisma validate` 통과 (수동 점검) | None — schema 정의만 |
| 2 | `chore(infra): Prisma init migration + lock (#3)` | `backend/prisma/migrations/20260527000000_init/migration.sql` (수동 작성, PostgreSQL DDL) + `backend/prisma/migrations/migration_lock.toml` | (테스트 없음 — DDL) | None — schema와 1:1 정합 |
| 3 | `chore(infra): Prisma client 싱글톤 + 단위 테스트 (#3)` | `backend/src/prisma/client.ts` (PrismaClient 싱글톤 + globalThis hot reload 패턴) + `backend/src/__tests__/prisma-client.test.ts` (3 tests) | vitest 3 tests — lazy load · DATABASE_URL fallback · 싱글톤 동일 인스턴스 | Low — placeholder, BE 라우트 미부착 |
| 4 | `chore(infra): seed.ts 100건 + @faker-js/faker 의존성 + scripts.seed:dev (#3)` | `backend/prisma/seed.ts` (10u + 20t + 50a + 200at + 200f + 100follow + 300c) + `backend/package.json scripts.seed:dev` + `prisma.seed` + `devDependencies.@faker-js/faker` | seed 실행 시 row 개수 검증 (manual smoke — Docker 없으면 사용자 위임) | Low — seed 데이터만 |
| 5 | `chore(infra): pnpm install + lockfile 갱신 + 검증 (#3)` | `pnpm-lock.yaml` (갱신 — faker 추가) | `pnpm -r typecheck && lint && test:unit` 모두 PASS | Low |

## 2. 의존성 그래프

```
Commit 1 (schema.prisma)
   ▼
Commit 2 (init migration) — schema 정합 SQL
   ▼
Commit 3 (client.ts) — schema가 있어야 PrismaClient 타입 가능
   ▼
Commit 4 (seed.ts + faker) — client + schema 모두 필요
   ▼
Commit 5 (lockfile + 검증) — 1~4 종합
```

선형 의존성, 병렬 가능 0, conflict 위험 0.

후속 이슈 의존성:
- 본 이슈 → `be-auth-signup` #5 등 BE 5 이슈가 `client.ts` import + 각 모델 CRUD

## 3. 테스트 매핑

| 커밋 | 테스트 추가 위치 | 시나리오 |
|---|---|---|
| Commit 1 | (테스트 없음 — schema 정의) | `prisma format && prisma validate` exit 0 (수동) |
| Commit 2 | (테스트 없음 — DDL) | migration.sql 문법 검증 (PostgreSQL 16 호환). `psql -f migration.sql` dry-run 또는 `prisma migrate diff` (수동) |
| Commit 3 | `backend/src/__tests__/prisma-client.test.ts` | 3 tests: ① 싱글톤 인스턴스 동일성 (두 번 import → 같은 ref) · ② DATABASE_URL 미설정 시 throw 또는 lazy resolve · ③ 명시적 close 호출 |
| Commit 4 | (테스트 없음 — seed runtime, DB 필요) | seed.ts 실행 후 `SELECT count(*) FROM "User"` 등 row 개수 검증 (manual smoke, Docker 없으면 사용자 위임) |
| Commit 5 | (재실행 검증) | `pnpm -r typecheck && lint && test:unit` 전 workspace PASS + 본 이슈 추가 3 tests 포함 커버리지 ≥80% 유지 |

커버리지: backend 추가 라인 < 80 (client.ts 30 + seed.ts 산정 외). client.ts 100% 커버 + seed.ts는 runtime 스크립트라 vitest exclude.

## 4. 빌드·실행 검증 단계

> AI 게이트 6축 — 본 이슈는 ui_changed=false (BE-only). 6번째 축은 backend dev 서버 부팅 + DB schema 적용 가능성 확인.

```bash
# 단계 A — 의존성 + 정적 검증
pnpm install --frozen-lockfile  # faker 추가 반영
pnpm -r typecheck               # 3 workspace PASS
pnpm -r lint                    # 3 workspace PASS

# 단계 B — Prisma schema 정합 (DB 불필요)
pnpm --filter @conduit/backend exec prisma format
pnpm --filter @conduit/backend exec prisma validate
pnpm --filter @conduit/backend exec prisma generate  # client 코드 생성

# 단계 C — 단위 테스트
pnpm -r test:unit               # backend 8 tests (5 server + 3 client), 100% 커버

# 단계 D — DB 통합 smoke (Docker 필요, 사용자 위임)
cp backend/.env.dev.example backend/.env.dev
docker compose -f docker-compose.dev.yml up -d db
sleep 10  # postgres 준비
pnpm --filter @conduit/backend prisma:push:dev   # 7 테이블 생성
pnpm --filter @conduit/backend seed:dev          # 880 row 적재
psql "$DATABASE_URL" -c "SELECT 'users=' || count(*) FROM \"User\" UNION ALL SELECT 'articles=' || count(*) FROM \"Article\";"  # 검증
docker compose -f docker-compose.dev.yml down -v  # 정리

# 단계 E — GitHub Actions 로컬 검증 (ADR-0047) — N/A
# `.github/workflows/` 디렉토리 PR 트리거 워크플로 0개 (이슈 #4 책임)
```

기대 결과:
- 단계 A·B·C 모두 exit 0
- 단계 D `users=10` + `articles=50` 등 row 검증 (Docker 사용자 환경)
- 단계 E N/A 사유 명시 후 통과

## 5. 점진 합의 / 결정 발생 항목

- **ADR 작성 필요**: no — 04-srs §5 도메인 모델과 LOCAL.md §1.5.2 (a) 분리형 박제, 12-scaffolding §4 M-BE-DB 모듈 경계 정합. 신규 결정 없음.
- 사전 합의 사항:
  - Prisma version `^5.18.0` (이슈 #2 박제 그대로)
  - migration directory `backend/prisma/migrations/` (12-scaffolding §1)
  - seed runtime `tsx` (이슈 #2 박제 devDependency)
  - faker `^8.4.1` (안정 메이저)
  - seed 데이터량 — Users 10 · Articles 50 · Tags 20 · 관계 row ~720 = 총 880 row (R-N-01 k6 입력으로 충분, > 100 분포 명시)
  - password_hash placeholder = `$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi` (bcrypt 10 round of `password` — be-auth-signup #5에서 로그인 테스트용)
- 결정 발생 시 갱신 위치: 본 §5 + 필요 시 `docs/planning/adr/`

## 참조

- 상류: `feat-infra-prisma-init.contract.md` §0·§2·§3
- 입력 정본 (selective read): contract §0 5행 — R-N-01/R-N-05, M-BE-DB/M-BE-INFRA, 11/12 컨벤션 절
- 하류: `feat-infra-prisma-init.{acceptance,risk,eng-review}.md` (P5·P6·P7)
