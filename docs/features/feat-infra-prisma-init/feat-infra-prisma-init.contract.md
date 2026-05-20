---
doc_type: feature-contract
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

# feat-infra-prisma-init — Change Contract

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — Prisma schema 7 모델 + migration init + seed 100건 contract. §0 5행 충족 (ADR-0018) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
|---|---|---|
| R-ID (요구) | `docs/planning/04-srs/04-srs.md` | R-N-01 (성능 — k6 입력), R-N-05 (3-profile 부팅 — DB 적용 가능성) |
| F-ID (기능) | `docs/planning/05-prd/05-prd.md` | F-04 (글 작성·수정·삭제 데이터 기반), F-05 (즐겨찾기·팔로우 데이터 기반) — 본 이슈는 *데이터 layer*만 |
| 영향 모듈 | `docs/planning/07-hld/07-hld.md` §1 + `08-lld-module-spec/08-lld-module-spec.md` | M-BE-DB (Prisma client + schema + migrations + seed), M-BE-INFRA (server.ts에 Prisma client lifecycle 등록 — 본 이슈는 client 모듈만, 등록은 후속 BE 이슈) |
| 영향 엔드포인트 | `docs/planning/09-lld-api-spec/09-lld-api-spec.md` | (none) — 본 이슈는 라우트 미부착. backend 19 endpoint 모두 후속 BE 5 이슈가 부착 |
| 적용 컨벤션 절 | `docs/planning/11-coding-conventions/11-coding-conventions.md` + `12-scaffolding/typescript.md` | 11 §1 명명 (Prisma model PascalCase 단수 + 컬럼 snake_case `@map`) · §2 에러 PREFIX (Prisma client용 `DB_` PREFIX placeholder, 본격 사용은 BE 이슈) / 12 §1 디렉토리 (backend/prisma/) · §4 M-BE-DB 모듈 경계 (`prisma/client.ts` + `schema.prisma`) · §7 부팅 자산 표 (분리형 (a) — push:dev / migrate:stg-prod) |

## 1. 변경 의도

이슈 #2 머지로 박제된 `backend/` workspace 골격 위에 04-srs §5 도메인 모델 7개를 Prisma schema로 박제하고, 최초 init migration 파일 + seed 100건을 적재해 후속 BE 5 이슈(`be-auth-signup`·`be-user-me`·`be-article-crud`·`be-article-list`·`be-tag-popular`)의 데이터 layer 의존성을 해소한다.

## 2. Before / After

| 항목 | Before (이슈 #2 머지 후) | After |
|---|---|---|
| `backend/prisma/` 디렉토리 | `.gitkeep`만 | `schema.prisma` + `migrations/20260527000000_init/{migration.sql,migration_lock.toml}` + `seed.ts` |
| Prisma 모델 정의 | 0개 | **7개** — User · Article · Tag · ArticleTag · Comment · Favorite · Follow |
| 인덱스 | 0개 | 11개 — User.email/username unique · Article.slug unique + author_id + created_at · Tag.name unique · ArticleTag (article_id, tag_id) 복합 unique · Favorite (user_id, article_id) 복합 PK · Follow (follower_id, followee_id) 복합 PK · Comment.article_id + author_id |
| `backend/src/prisma/client.ts` | 없음 | PrismaClient 싱글톤 export (Node hot reload 다중 인스턴스 방지 패턴) |
| Seed 데이터 | 없음 | 10 users + 20 tags + 50 articles + 200 article_tags + 200 favorites + 100 follows + 300 comments = **약 880 row** (R-N-01 k6 입력) |
| `backend/package.json scripts.seed:dev` | placeholder `echo 'seed added by infra-prisma-init #3'` | `dotenv -e .env.dev -- tsx prisma/seed.ts` |
| `backend/package.json prisma.seed` | 부재 | `tsx prisma/seed.ts` (Prisma CLI 통합) |
| devDependencies | (이슈 #2 박제 그대로) | + `@faker-js/faker@^8.4.1` |
| 단위 테스트 | backend 5 tests | + Prisma client export 테스트 (lazy load + DATABASE_URL fallback + close) — 약 3 tests 추가 |
| dev iteration | `pnpm --filter @conduit/backend prisma:push:dev` 명령 박제됐으나 schema 부재로 실 동작 X | 명령 *실제 동작* — `prisma db push --skip-generate`가 7 테이블 생성 |
| stg/prod migration | `prisma migrate deploy` 명령 박제됐으나 migrations 디렉토리 비어 적용할 파일 없음 | `migrations/20260527000000_init/migration.sql` 적용 가능 |
| 부팅 가능성 (이슈 #2 AC-04~06) | DB 컨테이너만 healthy → backend api는 Prisma client 없이도 부팅 가능했음 (`/health` route만) | 동일 — 본 이슈는 Prisma 추가만, server.ts 변경 없음. `/health`는 여전히 200 |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
|---|---|---|
| 이슈 #2 박제 `backend/prisma/.gitkeep` | 본 이슈에서 삭제 + schema.prisma·migrations·seed.ts로 대체 | git rm + 새 파일 commit |
| 이슈 #2 박제 `backend/package.json scripts.seed:dev` | placeholder echo → 실 명령으로 갱신 | 갱신 |
| 이슈 #2 박제 `backend/package.json prisma:push:dev` 명령 | 그대로 사용 (schema가 생기니 실 동작) | 변경 없음 |
| 이슈 #2 박제 `backend/.env.{dev,stg,prod}.example DATABASE_URL` | 그대로 사용 (값 변경 없음) | 변경 없음 |
| 후속 이슈 #5 `be-auth-signup` | `backend/src/prisma/client.ts` import + `User.create` 호출 | 본 이슈에서 client.ts export 박제 — 후속 이슈가 import 만 |
| 후속 이슈 #6~#11 BE 라우트 | 동일 패턴 — client import + 각자 모델 CRUD | 본 이슈가 base layer |
| 후속 이슈 #4 `infra-ci-workflow` | CI에서 `prisma generate` + `prisma migrate deploy` 단계 추가 | 본 이슈는 명령만 정의, CI 통합은 #4 |
| 후속 이슈 #23 `release-readiness` k6 | seed 100건 데이터 사용 | 본 이슈가 입력 데이터 박제 |
| `docs/planning/04-srs/04-srs.md` §5 도메인 모델 | schema.prisma와 1:1 정합 lint | 본 PR diff에서 sync 확인 |
| LOCAL.md §1.5.2 (a) 분리형 / §2 4단계 | 본 이슈 PR 머지 후 사용자가 `pnpm --filter @conduit/backend prisma:push:dev && seed:dev` 실 실행 가능 | LOCAL.md 갱신 없음 — 기존 명령 그대로 동작 |
| Prisma SSL 인증서 이슈 (이슈 #2에서 발견) | `prisma generate` 회사망 SSL inspection으로 실패 가능 | LOCAL.md §5 troubleshooting에 후속 추가 (별 minor commit) |

## 4. Backward Compatibility

- **Breaking**: no
- **마이그레이션 필요**: no

기존 동작이 없는 신규 base data layer (변경 전: 빈 DB + `.gitkeep`만). 외부 호출자·API·UI 모두 미존재 상태에서 본 이슈가 *최초* 박제. 후속 이슈가 본 schema 의존.

다만 *주의*: 향후 BE 이슈가 schema 변경 필요 시 `prisma migrate dev` 으로 새 migration 추가 (기존 init은 그대로). breaking schema 변경은 별 ADR.

## 5. Rollback 전략

- **revert 가능**: yes
- **rollback 절차**:
  1. PR `git revert <merge-commit-sha>` (squash 단일 커밋)
  2. dev DB는 `docker compose -f docker-compose.dev.yml down -v` 후 재시작 시 빈 상태로 복귀 (volume 폐기)
  3. stg/prod DB는 본 PR이 첫 migration이므로 별도 down migration 불필요 — `prisma migrate reset --force` 또는 DB drop·재생성
  4. 후속 이슈가 본 schema 의존 시 그 이슈도 자동 BLOCK (의존성 자명)
- **데이터 손상 위험**: low — dev/stg/prod 모두 본 이슈가 *최초* migration이므로 기존 데이터 보존 우려 없음. 단 stg/prod DB에 이미 seed 적용 후 rollback 시 seed 데이터 손실 (의도된 동작 — 본 이슈 revert = seed 자체 폐기)

## 6. 비목표

- API 라우트 / JWT 발급 / bcrypt → 후속 BE 이슈
- Article slug 생성 / 본문 sanitize → 후속 BE 이슈
- k6 부하 테스트 → #23
- Prisma generate CI 통합 → #4
- 멀티 tenancy / soft delete / Outbox 패턴 → 본 프로젝트 스코프 외 (필요 시 별 ADR)
- 일부 nullable 필드(bio, image) default 값 — Prisma schema의 `@default("")` 또는 nullable 그대로 (RealWorld 공식 spec과 일관)
