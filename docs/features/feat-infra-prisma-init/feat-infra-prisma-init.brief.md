---
doc_type: feature-brief
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

# feat-infra-prisma-init — Feature Brief

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — Sprint 1 이슈 #3. Prisma schema 7 모델 + migration 분리형 + seed 100건 + client 싱글톤 |

## 1. 한 줄 의도

04-srs §5 도메인 모델 7개(User·Article·Tag·ArticleTag·Comment·Favorite·Follow)를 Prisma `schema.prisma`로 박제하고 `migration dev --name init`으로 최초 migration 파일 생성 + `seed.ts` 100건(10 users + 50 articles + 20 tags + 200 article_tags + 200 favorites + 100 follows + 300 comments)을 적재해 R-N-01 k6 부하 테스트 입력을 준비한다.

## 2. 사용자 가치

후속 BE 5 이슈(be-auth-signup·be-user-me·be-article-crud·be-tag-popular·be-article-list)가 Prisma client + 실데이터 없이 BLOCK되는 회귀를 막는다. Sprint 2의 k6 부하 테스트(R-N-01 글 목록 p95 ≤ 500ms)는 seed 100건 입력으로 즉시 측정 가능. dev iteration은 `db push --skip-generate`로 빠른 schema 동기, stg/prod는 `migrate deploy`로 정식 파일 기반 (LOCAL.md §1.5.2 (a) 분리형).

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 (이슈 #2 머지 후 main) | 변경 후 |
| --- | --- | --- |
| backend/prisma/ | `.gitkeep`만 (이슈 #2 골격) | `schema.prisma` + `migrations/20260527000000_init/migration.sql` + `seed.ts` + `src/prisma/client.ts` (싱글톤) |
| Prisma 모델 | 0개 | **7개** — User · Article · Tag · ArticleTag · Comment · Favorite · Follow |
| 인덱스 | 없음 | User.email/username (unique) · Article.slug (unique) · Article.author_id · Article.created_at · Tag.name (unique) · ArticleTag (article_id, tag_id) 복합 unique · Favorite (user_id, article_id) 복합 PK · Follow (follower_id, followee_id) 복합 PK · Comment.article_id · Comment.author_id |
| Seed 데이터 | 없음 | **100건+ 분포** — Users 10 · Tags 20 · Articles 50 · ArticleTags 200 · Favorites 200 · Follows 100 · Comments 300 |
| Prisma client 사용 | 없음 | `backend/src/prisma/client.ts` 싱글톤 import 가능 |
| 단위 테스트 | `backend` 5 tests | + Prisma client export 테스트 (lazy load + DATABASE_URL fallback) |
| dev iteration 명령 | `pnpm --filter @conduit/backend prisma:push:dev` 박제됨 | 같은 명령 *실제 동작* — schema가 있으니 테이블 생성 |
| migration 정식 흐름 | 정의됐으나 파일 없음 | 최초 init migration 박제 |

## 4. 모드 자동 감지 결과

- **mode=add** (자동 결정, ADR-0032 §2 규칙 4)
- 감지 trace: bug=0, design=0, modify=0 (Contract Before "빈 DB" = 신규)
- slug 접두: `feat-` / 폴더: `docs/features/feat-infra-prisma-init/` / 브랜치: `feat/infra-prisma-init-issue-3`

## 5. 영향 범위

**파일 신규 (backend/prisma/)**:
- `backend/prisma/schema.prisma` — generator client + datasource postgresql + 7 model
- `backend/prisma/migrations/20260527000000_init/migration.sql` — `prisma migrate dev --name init` 산출 (수동 작성, postgresql DDL)
- `backend/prisma/migrations/migration_lock.toml` — provider lock
- `backend/prisma/seed.ts` — 10 users + 50 articles + 20 tags + relations + comments
- `backend/src/prisma/client.ts` — `PrismaClient` 싱글톤 (Node hot reload 시 다중 인스턴스 방지)
- `backend/src/__tests__/prisma-client.test.ts` — lazy load · DATABASE_URL fallback · close

**갱신 (backend/package.json)**:
- `scripts.seed:dev` — `dotenv -e .env.dev -- tsx prisma/seed.ts` (이슈 #2에선 placeholder `echo`)
- `prisma` 필드 — `seed: tsx prisma/seed.ts`
- devDependencies: `@faker-js/faker@^8.4.1` (테스트 데이터 생성, 결정적 seed)

**갱신 없음** (이슈 #2 박제 그대로 사용):
- `backend/.env.{dev,stg,prod}.example` — `DATABASE_URL` 그대로
- `docker-compose.{dev,stg,prod}.yml` — db service 그대로
- `LOCAL.md` §3·§4·§1.5.2 (a) 분리형 — 그대로 적용

## 6. 비목표

- 실제 API 라우트(`/api/users`·`/api/articles` 등) — 후속 BE 5 이슈 책임
- 인증/JWT 토큰 발급 로직 — `be-auth-signup` #5 책임
- 비밀번호 해싱(bcrypt) — `be-auth-signup` 책임 (본 이슈 seed는 placeholder `$2b$10$...` 해시 사용)
- Article slug 생성 알고리즘 — `be-article-crud` 책임
- k6 부하 테스트 스크립트 — `release-readiness` #23 책임
- Prisma `generate` CI 통합 — `infra-ci-workflow` #4 책임

## 7. Open Questions

- Q1: Prisma `previewFeatures` 활성화? → **미활성** (안정 기능만)
- Q2: seed password_hash 어떤 값으로? → 모든 user 동일 placeholder `$2b$10$...` (10 round bcrypt) — be-auth-signup #5에서 실 인증 시드 별도
- Q3: ArticleTag explicit vs implicit M:N? → **explicit** (`ArticleTag` model 명시 — 인덱싱·쿼리 명확성)
- Q4: SSL 인증서 이슈로 `prisma generate` 실패 시? → backend setup script에 `prisma generate --schema=prisma/schema.prisma` 명시 + LOCAL.md troubleshooting 항목 추가 (이슈 #2 발견)
- Q5: seed faker locale? → en (RealWorld 공식 데이터셋과 일관)

## 참조

- 상류: GitHub Issue #3, `04-srs/04-srs.md` §5, `12-scaffolding/typescript.md` §4 M-BE-DB, `LOCAL.md` §1.5.2 (a), `14-wbs/14-wbs.md` Sprint 1
- 하류: contract → plan → eng-review → acceptance → risk → code-review → ai-qa-report
- 후속 이슈: #5 be-auth-signup / 등 BE 라우트 5건
