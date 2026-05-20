---
doc_type: feature-risk
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

# feat-infra-prisma-init — Feature Risk

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — Prisma data layer base. Low/Med 4건 식별, High 0 |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
|---|---|---|---|---|
| F-RISK-01 | Prisma `generate` SSL 인증서 회사망 차단 (이슈 #2 발견) | 3 | 3 | Med |
| F-RISK-02 | seed password_hash placeholder가 실 운영 환경에 노출 | 4 | 1 | Med |
| F-RISK-03 | migration.sql 수동 작성 vs `prisma migrate dev` 자동 산출 차이 | 2 | 2 | Low |
| F-RISK-04 | seed 880 row vs k6 부하 테스트 입력 충분성 | 2 | 2 | Low |

High 0건. 단계적 롤아웃 N/A.

## 2. 리스크 상세

### F-RISK-01: Prisma `generate` SSL 인증서 회사망 차단

- **카테고리**: 외부 의존
- **트리거 신호**: `pnpm --filter @conduit/backend exec prisma generate` 실행 시 `request to https://binaries.prisma.sh/.../query_engine.dll.node.gz.sha256 failed, reason: unable to get local issuer certificate` 에러. 이슈 #2 commit 7에서 이미 발현 (postinstall 단계).
- **완화 전략**:
  - 환경 변수 `NODE_TLS_REJECT_UNAUTHORIZED=0` 임시 회피 (개발 환경만, 운영 금지)
  - 회사 CA 인증서를 `NODE_EXTRA_CA_CERTS` 환경 변수로 지정
  - `PRISMA_ENGINES_MIRROR` 환경 변수로 사내 mirror 사용 (가용 시)
  - LOCAL.md §5 troubleshooting "Prisma generate SSL 인증서" 항목 추가 (별 minor commit 또는 본 PR에 포함)
  - CI(이슈 #4) GitHub Actions runner는 회사망 제약 없음 — 본 이슈 머지 후 CI에서 정상 동작 기대
- **검증 방법**: 사용자 환경 prisma generate 실행 → 성공 시 OK, 실패 시 위 4 mitigation 중 1택 적용

### F-RISK-02: seed password_hash placeholder 운영 노출

- **카테고리**: 보안
- **트리거 신호**: dev/stg seed에 박제된 placeholder bcrypt (`$2b$10$92IXUNp...` = "password")가 prod DB에 적재될 위험. 또는 seed 자체가 prod에서 실행될 위험.
- **완화 전략**:
  - `backend/package.json scripts.seed:dev`만 정의 (`seed:stg`·`seed:prod` 미정의)
  - prod migration 흐름(`prisma migrate deploy`)은 seed 자동 실행 안 함 — 명시적 호출 필요
  - 본 PR comment에 "seed는 dev 전용. stg/prod는 별 seed 전략 필요" 명시
  - 후속 BE 이슈 `be-auth-signup` #5에서 실 회원가입 flow 박제 시 placeholder 사용 0건 확인
  - CLAUDE.md 보안 절대 규칙 1·2 (시크릿 commit 금지) 위반 가능성 — `seed.ts` 안 placeholder 명시 comment 추가
- **검증 방법**: code-review에서 `package.json scripts` grep + seed.ts placeholder 명시 comment 확인

### F-RISK-03: 수동 migration.sql vs Prisma 자동 산출 차이

- **카테고리**: 호환성
- **트리거 신호**: 본 이슈에서 `prisma migrate dev --name init` 실 실행이 Docker 없는 환경에서 어렵다면 migration.sql을 수동 작성. 향후 `prisma migrate dev`로 자동 산출되는 SQL과 미세 차이(컬럼 순서·index 명명) 발생.
- **완화 전략**:
  - Docker 사용 가능한 환경에서 `prisma migrate dev --name init` 한 번 실행 후 산출 파일 그대로 commit (자동 산출 우선)
  - 자동 산출 불가 시 수동 작성하되 schema.prisma와 1:1 정합 (모든 model · column · relation · index 명시)
  - 이슈 #4 CI에 `prisma migrate diff --from-empty --to-schema-datamodel schema.prisma --script` 으로 정합성 lint 추가
- **검증 방법**: AC-05 `prisma migrate deploy` 성공 = migration.sql이 schema와 정합 증명

### F-RISK-04: seed 880 row vs k6 입력 충분성

- **카테고리**: 성능
- **트리거 신호**: Sprint 2 k6 부하 테스트(R-N-01 글 목록 p95 ≤ 500ms) 실행 시 50 articles이 부족할 수 있음. RealWorld 글 목록은 페이지네이션 limit 20 — 페이지 2~3개 분량.
- **완화 전략**:
  - seed 50 articles + 200 article_tags + 200 favorites + 300 comments = 글당 평균 4 tags + 4 favs + 6 comments → 통계적으로 충분
  - k6 부하 테스트 시 200 동시 사용자가 50 articles에 접근 — 캐시 hit 비중이 크므로 적정 분포
  - 부족 판단 시 `release-readiness` #23에서 seed 증량 (별 이슈, 본 이슈 scope 외)
- **검증 방법**: Sprint 2 k6 실측 후 p95 측정 — 본 이슈에서는 명시적 보장 안 함

## 3. High 등급 단계적 롤아웃

해당 없음. High 0건.

## 4. 데이터 영속성 변경

본 이슈가 **데이터 영속성 최초 박제**. 다음 사항 확인:

- dev DB: `docker compose -f docker-compose.dev.yml up -d db`로 빈 상태 + `prisma db push` → 7 테이블 생성. `down -v`로 안전 폐기.
- stg DB: 본 PR 머지 후 첫 `prisma migrate deploy` 실행 = 7 테이블 + `_prisma_migrations` 1행. 이후 schema 변경은 별 migration 파일 추가.
- prod DB: 위와 동일. 단 password·DATABASE_URL은 secret manager 출처 강제.

**rollback 시 데이터 손상 위험**: low — 본 이슈가 첫 migration이므로 down migration 자체가 없음. 손상 가능 대상은 *본 이슈로 막 적재된* seed 880 row(stg/prod의 경우)뿐, 운영 데이터 0건.

## 5. 15-risk.md 갱신 항목

15-risk.md §3·§4(외부 의존·보안) 시스템 카테고리가 본 이슈 4건 모두 포괄. 시스템 차원 갱신 불요.

F-RISK-01 SSL 인증서 이슈는 LOCAL.md §5 troubleshooting 보강 (별 minor PR 권장).
