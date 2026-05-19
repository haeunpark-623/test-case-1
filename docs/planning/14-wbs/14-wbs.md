---
doc_type: wbs
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-19
gate: operations
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-04, R-F-05, R-F-06, R-F-07, R-F-08, R-F-09, R-F-10, R-F-11, R-F-12, R-F-13, R-F-14, R-F-15, R-F-16, R-F-17, R-N-01, R-N-02, R-N-03, R-N-04, R-N-05, R-N-06, R-N-07]
  F-ID: [F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08]
  supersedes: null
---

# Conduit (RealWorld Clone) — WBS

<!-- /flow-wbs Phase 3/4 산출 2/2. ADR-0031 1수준 +1 재할당 14. 스프린트(Milestone) → 이슈(1~3d) 2계층 분해. 이슈 8필드 강제 + §7 sprint-bootstrap YAML(ADR-0045 v1.1). -->

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-19 | woosung.ahn@bespinglobal.com | 초안 (/flow-wbs Phase 3/4) — 3 스프린트 × 23 이슈. R-F-01~17 + R-N-01~07 + F-01~08 추적성 100%. §7 sprint-bootstrap YAML 박제 |

## 0. 개요

- **MVP 목표 (01-project-brief §6)**: 2026-06-30 머지. 5주 × 3 sprint.
- **분해 방식**: Sprint(Milestone) → Issue(1~3 working day). 이슈는 BE/FE/Infra 영역 1택으로 ownership 명확화.
- **이슈 수**: 23개 (S1=8, S2=8, S3=7).
- **인수 기준 정합**: 매 이슈 §3 8필드 (유형/영역/우선순위/Effort/Acceptance/Contract Before·After/DoD).
- **추적성**: §4 매트릭스에 R-F-01~17 + R-N-01~07 + F-01~08 모두 cover.
- **리스크 매핑**: §5에 15-risk RISK-01~11 → 영향 받는 sprint/issue.
- **외부 의존**: RealWorld 공식 Postman 컬렉션 + Bootstrap 4 CSS + Prisma migration.
- **branch 전략 (ADR-0044)**: 단일 trunk=main + `<mode>/<slug>-issue-<N>` + squash merge. 본 wbs의 issue slug 그대로 branch slug.

## 1. 스프린트 일람

| Sprint | 기간 | 목표(Outcome) | 주요 R-ID/F-ID | 이슈 수 |
|---|---|---|---|---|
| Sprint 1 | 2026-05-27 ~ 2026-06-09 | 기반·인증·인프라. 3 profile 부팅 + AI 게이트 6축 가동 + 인증 flow 통과 | F-01 / R-F-01·02·03·17 / R-N-02·03·05·06 | 8 |
| Sprint 2 | 2026-06-10 ~ 2026-06-19 | 글·태그·프로필·즐겨찾기 + FE API/sanitize 인프라 | F-02·F-03·F-04·F-05·F-06·F-08 / R-F-04~12·16 / R-N-01 | 8 |
| Sprint 3 | 2026-06-20 ~ 2026-06-30 | FE 5 화면 골든패스 + 댓글 + 릴리스 준비. KPI 4건 PASS | F-02·F-03·F-04·F-05·F-06·F-07 / R-F-13·14·15 / R-N-04·07 | 7 |

## 2. 스프린트 상세

### Sprint 1 — 기반·인증·인프라

#### Milestone: Sprint 1

- **기간**: 2026-05-27 ~ 2026-06-09 (2주, 10 working days)
- **목표**: 12-scaffolding §6·§7 + LOCAL.md §3 SoT 박제 → AI 게이트 6번째 축(부팅) PASS 상태. 인증 flow 통과로 토큰 발급/검증 회귀 자동화.
- **종료 조건**: 8 이슈 모두 머지 + Newman 인증 부분 19/19 중 5건(가입·로그인·me·me 수정·logout 클라이언트) PASS + 3 profile 부팅 모두 OK.

##### Issue: infra-scaffold

- **유형**: chore
- **영역**: infra
- **우선순위**: P0
- **Estimated Effort**: 2d
- **Acceptance Criteria**: Given fresh checkout 상태에서 12-scaffolding §6·§7 + LOCAL.md §3·§4 SoT가 박제되었을 When `pnpm install && pnpm -r build`을 실행하면 Then dev/stg/prod 3 profile 모두 ready 신호 + 에러 0건이며 AI 게이트 6번째 축 lint가 PASS이다.
- **Contract Before**: 빈 workspace 골격. `.env.example` 없음. pnpm workspace 미설정.
- **Contract After**: `package.json` workspace(`@conduit/frontend|backend|types`) + pnpm 9 lockfile + `.env.{dev,stg,prod}.example` × 2 workspace (총 6 파일) + `docker-compose.{dev,stg,prod}.yml` × 3 + Caddy reverse proxy 설정 + LOCAL.md §3 profile별 부팅 명령 박제.
- **DoD Checklist**:
  - [ ] 12-scaffolding §6·§7 표 동기
  - [ ] LOCAL.md §3 dev/stg/prod 명령 박제 + ready 신호 명시
  - [ ] AI 게이트 6번째 축 PASS (3 profile 부팅 + 자산 7행 정합)
  - [ ] 단위 테스트 (lint 통과 + tsc --noEmit) PASS
- **R-ID/F-ID 매핑**: R-N-05, R-N-06 / F-01~08 (전 feature가 의존)
- **테스트 시나리오**: 정상=3 profile fresh boot 모두 OK. 실패=`.env.stg.example` 누락 시 AI 게이트 6축 stderr BLOCK 메시지 출력.
- **의존성**: Blocked-by=없음 / Blocks=모든 후속 이슈

##### Issue: infra-prisma-init

- **유형**: chore
- **영역**: infra
- **우선순위**: P0
- **Estimated Effort**: 1d
- **Acceptance Criteria**: Given Prisma schema가 04-srs §5 도메인 모델(User/Article/Tag/ArticleTag/Comment/Favorite/Follow)을 반영했을 When `pnpm --filter @conduit/backend prisma migrate dev`을 실행하면 Then 모든 테이블이 생성되고 seed 100건이 적재되어 R-N-01 k6 부하 테스트 입력이 준비된다.
- **Contract Before**: 빈 DB. migration 폴더 없음.
- **Contract After**: `prisma/schema.prisma` + `prisma/migrations/{20260527000000_init}/` + `prisma/seed.ts` 100 article × N user. Prisma client 싱글톤 export.
- **DoD Checklist**:
  - [ ] Prisma schema 7 모델 + 인덱스
  - [ ] migration 폴더 분리형 (LOCAL.md 패턴 (a))
  - [ ] seed 100건
  - [ ] 단위 테스트 (Prisma client 싱글톤 export PASS)
- **R-ID/F-ID 매핑**: R-N-01, R-N-05 / F-04, F-05
- **테스트 시나리오**: 정상=migration + seed → 글 100건 SELECT count = 100. 실패=schema typo로 migrate fail → BLOCKED PR.
- **의존성**: Blocked-by=infra-scaffold / Blocks=모든 be-* 이슈

##### Issue: infra-ci-workflow

- **유형**: chore
- **영역**: infra
- **우선순위**: P0
- **Estimated Effort**: 1d
- **Acceptance Criteria**: Given `.github/workflows/ci.yml` + LOCAL.md §5 act 명령이 박제되었을 When PR open 시 GitHub Actions가 트리거되고 동시에 로컬에서 `act pull_request -W .github/workflows/ci.yml --secret-file .env.act`을 실행하면 Then 양축에서 lint→typecheck→unit→integration→Newman→gstack→AI 게이트 6축 모두 PASS이다.
- **Contract Before**: `.github/workflows/` 없음.
- **Contract After**: `.github/workflows/ci.yml` + `.actrc` + `.env.act.example` + LOCAL.md §5 act 절차.
- **DoD Checklist**:
  - [ ] ci.yml lint+typecheck+unit+integration+Newman 7 step
  - [ ] act 로컬 명령 LOCAL.md §5 박제
  - [ ] AI 게이트 6번째 축 워크플로 lint 통합
  - [ ] 단위 테스트 (act dry-run PASS)
- **R-ID/F-ID 매핑**: R-N-05, R-N-06 / F-01~08
- **테스트 시나리오**: 정상=act + GitHub 양축 PASS. 실패=Manual verification 체크 누락 PR → ADR-0047 §4 BLOCK.
- **의존성**: Blocked-by=infra-scaffold / Blocks=release-readiness

##### Issue: be-auth-signup

- **유형**: feature
- **영역**: backend
- **우선순위**: P0
- **Estimated Effort**: 2d
- **Acceptance Criteria**: Given 미가입 visitor가 valid username·email·password를 POST `/api/users` body로 전송했을 When M-BE-AUTH가 처리하면 Then 201 + `{user: {token, ...}}`를 반환하며 DB는 bcrypt 해시만 저장하고 평문 password 0건이다.
- **Contract Before**: 라우트 없음. M-BE-AUTH 모듈 미생성.
- **Contract After**: `routes/users.post.ts` + `services/auth.ts` (signup/jwt/bcrypt) + 단위 8건 + 통합 4건 + Newman fixture 추가.
- **DoD Checklist**:
  - [ ] POST /api/users 201 + 토큰 발급
  - [ ] email/username 중복 422 (errors shape)
  - [ ] bcrypt cost=12 + timing ≥ 200ms
  - [ ] 단위 테스트 ≥ 5건 + 통합 ≥ 2건
- **R-ID/F-ID 매핑**: R-F-01, R-N-02, R-N-03 / F-01
- **테스트 시나리오**: 정상=valid 가입 → 201. 실패=중복 email → 422. 보안=bcrypt 해시 패턴 확인.
- **의존성**: Blocked-by=infra-prisma-init / Blocks=be-auth-login, fe-auth-screens

##### Issue: be-auth-login

- **유형**: feature
- **영역**: backend
- **우선순위**: P0
- **Estimated Effort**: 1d
- **Acceptance Criteria**: Given 기존 Member가 valid email·password를 POST `/api/users/login`에 전송했을 When M-BE-AUTH가 검증하면 Then 200 + 토큰을 반환하며 잘못된 자격증명에는 422 + "email or password is invalid" 통일 메시지를 반환한다.
- **Contract Before**: 로그인 라우트 없음.
- **Contract After**: `routes/users.login.post.ts` + JWT verify middleware + 단위 5건 + 통합 3건.
- **DoD Checklist**:
  - [ ] POST /api/users/login 200 + 토큰
  - [ ] 잘못된 자격 422 통일 메시지 (enum 방지)
  - [ ] 만료된 토큰 401
  - [ ] 단위 ≥ 4건 + 통합 ≥ 2건
- **R-ID/F-ID 매핑**: R-F-02, R-N-02 / F-01
- **테스트 시나리오**: 정상=valid → 200. 실패=잘못된 pw → 422. 보안=만료 토큰 → 401.
- **의존성**: Blocked-by=be-auth-signup / Blocks=be-user-me, fe-auth-screens

##### Issue: be-user-me

- **유형**: feature
- **영역**: backend
- **우선순위**: P0
- **Estimated Effort**: 1d
- **Acceptance Criteria**: Given Member JWT 헤더가 있을 When GET/PUT `/api/user`을 호출하면 Then 본인 user 객체를 반환하고 PUT은 email/username/bio/image/password 부분 갱신을 지원한다.
- **Contract Before**: /api/user 라우트 없음.
- **Contract After**: `routes/user.get.ts` + `routes/user.put.ts` + M-BE-USER `update()` + 통합 3건.
- **DoD Checklist**:
  - [ ] GET /api/user 200
  - [ ] PUT /api/user 200 + 부분 갱신
  - [ ] email 중복 변경 422
  - [ ] 단위 ≥ 3건 + 통합 ≥ 2건
- **R-ID/F-ID 매핑**: R-F-03 / F-01, F-02
- **테스트 시나리오**: 정상=bio 갱신 → 200. 실패=email 중복 → 422. 보안=토큰 만료 → 401.
- **의존성**: Blocked-by=be-auth-login / Blocks=fe-auth-screens

##### Issue: fe-shell-router

- **유형**: feature
- **영역**: frontend
- **우선순위**: P0
- **Estimated Effort**: 2d
- **Acceptance Criteria**: Given 사용자가 `/#/` 또는 `/#/login` 등을 열 When M-FE-SHELL Router가 라우팅하면 Then Header(브랜드+인증 분기 메뉴) + Footer + Bootstrap 4 CSS가 로드되고 AuthGuard가 보호 라우트(/#/editor·/#/settings)에서 미인증 시 `/#/login`으로 리다이렉트한다.
- **Contract Before**: `index.html` only. Router 없음.
- **Contract After**: `main.tsx` + `App.tsx` (HashRouter + 9 라우트) + `components/Header.tsx` + `components/Footer.tsx` + Bootstrap 4 CSS import + AuthGuard + 단위 4건.
- **DoD Checklist**:
  - [ ] 9 라우트 모두 매치
  - [ ] Bootstrap 4 CDN + CSS Modules 동거 (ADR-0038)
  - [ ] AuthGuard 보호 라우트 리다이렉트
  - [ ] axe-core R-N-04 위반 0건
  - [ ] 단위 ≥ 4건 + gstack /qa 골든패스 통과
- **R-ID/F-ID 매핑**: R-N-04 / F-01
- **테스트 시나리오**: 정상=router 매치 + Header 인증 분기. 실패=미인증 /#/editor → /#/login. 시각=axe-core PASS.
- **의존성**: Blocked-by=infra-scaffold / Blocks=fe-auth-screens, fe-api-client, fe-article-home, fe-article-detail, fe-editor, fe-profile-view, fe-comments

##### Issue: fe-auth-screens

- **유형**: feature
- **영역**: frontend
- **우선순위**: P0
- **Estimated Effort**: 2d
- **Acceptance Criteria**: Given M-FE-AUTH가 Login·Register·Settings 3 화면을 렌더링할 When 사용자가 폼을 제출하면 Then JWT가 localStorage에 저장·삭제되고 Header가 즉시 전환되며 422 errors는 폼 위 빨간 리스트로 표출된다.
- **Contract Before**: 3 화면 placeholder만.
- **Contract After**: `pages/Login.tsx` + `pages/Register.tsx` + `pages/Settings.tsx` + `stores/auth.ts` (M-FE-AUTH-STORE) + 단위 5건 + gstack /qa 가입·로그인·logout 골든패스.
- **DoD Checklist**:
  - [ ] 가입 → 자동 로그인 → Header 전환
  - [ ] logout → localStorage 삭제 + 헤더 전환 (R-F-17)
  - [ ] 422 errors 리스트 표출
  - [ ] axe-core R-N-04 PASS
  - [ ] 단위 ≥ 4건 + gstack /qa PASS + 스크린샷 첨부
- **R-ID/F-ID 매핑**: R-F-01, R-F-02, R-F-03, R-F-17, R-N-02, R-N-04 / F-01
- **테스트 시나리오**: 정상=가입·로그인·logout 사이클. 실패=중복 email → 폼 에러. UI=gstack 스크린샷.
- **의존성**: Blocked-by=fe-shell-router, be-auth-signup, be-auth-login, be-user-me / Blocks=fe-article-home

### Sprint 2 — 글·태그·프로필·즐겨찾기 + FE 인프라

#### Milestone: Sprint 2

- **기간**: 2026-06-10 ~ 2026-06-19 (1.5주, 8 working days)
- **목표**: BE 글/태그/프로필/즐겨찾기 API 12 endpoint 완성 + FE API wrapper + markdown sanitize 인프라. Newman 19/19 중 15건 PASS.
- **종료 조건**: 8 이슈 머지 + k6 마이크로 부하 p95 < 1000ms PASS.

##### Issue: be-article-crud

- **유형**: feature
- **영역**: backend
- **우선순위**: P0
- **Estimated Effort**: 3d
- **Acceptance Criteria**: Given Member JWT가 있을 When POST/GET/PUT/DELETE `/api/articles[/:slug]`를 호출하면 Then 슬러그 자동 발급(title 기반 + 충돌 시 -2/-3 suffix)과 함께 article CRUD가 동작하며 작성자 본인 외에는 PUT/DELETE에서 403을 반환한다.
- **Contract Before**: /api/articles 라우트 없음.
- **Contract After**: `routes/articles.{post,get,put,delete}.ts` + `services/article.ts` (slug 발급) + 단위 8건 + 통합 5건.
- **DoD Checklist**:
  - [ ] POST 201 + slug 발급
  - [ ] GET 200 + author/tagList/favoritesCount/favorited
  - [ ] PUT 본인만 200, 타인 403
  - [ ] DELETE 본인만 204, 타인 403
  - [ ] 단위 ≥ 6건 + 통합 ≥ 4건
- **R-ID/F-ID 매핑**: R-F-08, R-F-09, R-F-10, R-F-11 / F-03, F-04
- **테스트 시나리오**: 정상=CRUD 전 사이클. 실패=미존재 slug → 404, 타인 글 PUT → 403.
- **의존성**: Blocked-by=be-user-me / Blocks=be-favorite, be-comments-crud, fe-editor, fe-article-detail

##### Issue: be-article-list

- **유형**: feature
- **영역**: backend
- **우선순위**: P0
- **Estimated Effort**: 2d
- **Acceptance Criteria**: Given 누구든 GET `/api/articles?limit=10&offset=0[&tag=&author=&favorited=]`을 호출할 When M-BE-ARTICLE 목록 핸들러가 응답하면 Then 200 + `{articles, articlesCount}`을 반환하고 k6 마이크로 부하 p95 ≤ 1000ms이며 Prisma 호출당 쿼리 수 ≤ 2이다.
- **Contract Before**: 목록 핸들러 미구현.
- **Contract After**: `routes/articles.get.ts` (list mode) + `services/article-list.ts` + Prisma include depth 2 + k6 스크립트 `tests/perf/articles-list.k6.js` + 통합 4건.
- **DoD Checklist**:
  - [ ] 200 + 페이지네이션 limit/offset
  - [ ] tag/author/favorited 필터
  - [ ] k6 p95 < 1000ms (R-N-01)
  - [ ] Prisma 호출당 쿼리 수 ≤ 2 (N+1 회귀 차단)
  - [ ] 단위 ≥ 4건 + 통합 ≥ 3건
- **R-ID/F-ID 매핑**: R-F-06, R-N-01 / F-05
- **테스트 시나리오**: 정상=10건 카드. 실패=limit > 100 → 422. 성능=k6 마이크로 부하.
- **의존성**: Blocked-by=be-article-crud / Blocks=fe-article-home

##### Issue: be-feed-list

- **유형**: feature
- **영역**: backend
- **우선순위**: P1
- **Estimated Effort**: 1d
- **Acceptance Criteria**: Given 로그인 Member JWT가 있을 When GET `/api/articles/feed?limit=10&offset=0`을 호출하면 Then 본인이 팔로우하는 사용자들의 글만 최신순으로 반환하며 팔로우 0명은 빈 배열을 반환한다.
- **Contract Before**: /api/articles/feed 미구현.
- **Contract After**: `routes/articles.feed.get.ts` + 통합 3건.
- **DoD Checklist**:
  - [ ] 200 + 팔로우 사용자 글만
  - [ ] 팔로우 0명 → []
  - [ ] 비로그인 401
  - [ ] 단위 ≥ 3건 + 통합 ≥ 2건
- **R-ID/F-ID 매핑**: R-F-07 / F-06
- **테스트 시나리오**: 정상=팔로우 2명 글 8건. 실패=비로그인 → 401.
- **의존성**: Blocked-by=be-profile-follow / Blocks=fe-article-home

##### Issue: be-favorite

- **유형**: feature
- **영역**: backend
- **우선순위**: P1
- **Estimated Effort**: 1d
- **Acceptance Criteria**: Given Member가 글 카드/상세에서 favorite을 누를 When POST/DELETE `/api/articles/:slug/favorite`을 호출하면 Then `{article: {..., favorited, favoritesCount}}`을 idempotent하게 반환하며 비로그인 클릭은 401이다.
- **Contract Before**: favorite 라우트 미구현.
- **Contract After**: `routes/articles.favorite.{post,delete}.ts` + 통합 3건.
- **DoD Checklist**:
  - [ ] POST → favorited=true + count+1
  - [ ] DELETE → favorited=false + count-1
  - [ ] POST 재호출 idempotent (200, count 불변)
  - [ ] 단위 ≥ 3건 + 통합 ≥ 2건
- **R-ID/F-ID 매핑**: R-F-12 / F-04
- **테스트 시나리오**: 정상=토글. 실패=비로그인 → 401. idempotent=재호출 count 불변.
- **의존성**: Blocked-by=be-article-crud / Blocks=fe-article-detail

##### Issue: be-profile-follow

- **유형**: feature
- **영역**: backend
- **우선순위**: P1
- **Estimated Effort**: 2d
- **Acceptance Criteria**: Given 누구든 GET `/api/profiles/:username`을 호출할 When 200 + `{profile: {username, bio, image, following}}`을 반환하며 Member가 POST/DELETE follow를 호출하면 following 토글이 적용된다.
- **Contract Before**: /api/profiles 라우트 없음.
- **Contract After**: `routes/profiles.{get,follow.post,follow.delete}.ts` + M-BE-USER follow 메서드 + 통합 4건.
- **DoD Checklist**:
  - [ ] GET 200 + following 필드 (비로그인=false)
  - [ ] POST follow → following=true
  - [ ] DELETE follow → following=false
  - [ ] 자기 자신 follow 시도 → 403
  - [ ] 단위 ≥ 4건 + 통합 ≥ 3건
- **R-ID/F-ID 매핑**: R-F-04, R-F-05 / F-02
- **테스트 시나리오**: 정상=follow 토글. 실패=미존재 username → 404, self-follow → 403.
- **의존성**: Blocked-by=be-user-me / Blocks=be-feed-list, fe-profile-view

##### Issue: be-tag-popular

- **유형**: feature
- **영역**: backend
- **우선순위**: P2
- **Estimated Effort**: 1d
- **Acceptance Criteria**: Given 누구든 GET `/api/tags`을 호출할 When M-BE-TAG가 count desc 상위 20 태그를 집계하면 Then 200 + `{tags: ["string", ...]}`을 반환한다.
- **Contract Before**: /api/tags 미구현.
- **Contract After**: `routes/tags.get.ts` + Prisma groupBy 쿼리 + 통합 2건.
- **DoD Checklist**:
  - [ ] 200 + 상위 20 태그
  - [ ] 태그 0개 → []
  - [ ] 단위 ≥ 2건 + 통합 ≥ 1건
- **R-ID/F-ID 매핑**: R-F-16 / F-05, F-08
- **테스트 시나리오**: 정상=상위 20. 실패=DB 오류 → 500 + 캐시 fallback.
- **의존성**: Blocked-by=infra-prisma-init / Blocks=fe-article-home

##### Issue: fe-api-client

- **유형**: feature
- **영역**: frontend
- **우선순위**: P0
- **Estimated Effort**: 1d
- **Acceptance Criteria**: Given M-FE-API fetch wrapper가 모든 API 호출을 위임받을 When 요청 시 JWT를 `Authorization: Token <jwt>` 헤더로 자동 첨부하고 401 응답에는 토큰 삭제 + `/#/login` 리다이렉트하면 Then 모든 fe-* 페이지가 동일 에러/인증 처리 정책을 공유한다.
- **Contract Before**: 각 페이지가 fetch 직접 호출.
- **Contract After**: `api/client.ts` (request/response interceptor) + `stores/auth.ts` 연동 + 단위 6건.
- **DoD Checklist**:
  - [ ] Authorization 자동 첨부
  - [ ] 401 → 토큰 삭제 + 리다이렉트
  - [ ] errors 페이로드 파싱 → throw
  - [ ] 단위 ≥ 5건
- **R-ID/F-ID 매핑**: R-N-02 / F-01~F-08
- **테스트 시나리오**: 정상=요청 + 토큰 첨부. 실패=401 → 리다이렉트. 안전=errors 파싱.
- **의존성**: Blocked-by=fe-shell-router / Blocks=fe-article-home, fe-article-detail, fe-editor, fe-profile-view, fe-comments

##### Issue: fe-md-sanitize

- **유형**: feature
- **영역**: frontend
- **우선순위**: P0
- **Estimated Effort**: 1d
- **Acceptance Criteria**: Given M-FE-MD가 marked + DOMPurify wrapper로 글 본문을 렌더링할 When `<script>`·`onerror`·`javascript:` URL·`<iframe>` 등 XSS 페이로드가 입력되면 Then 모두 sanitize되어 출력 DOM에 남지 않고 정상 markdown은 그대로 렌더링된다.
- **Contract Before**: markdown 렌더링 없음.
- **Contract After**: `lib/markdown.ts` + DOMPurify config + 단위 8건 (XSS 매트릭스).
- **DoD Checklist**:
  - [ ] 정상 markdown 렌더
  - [ ] `<script>` 제거
  - [ ] `onerror` 속성 제거
  - [ ] `javascript:` URL 제거
  - [ ] `<iframe>` 제거
  - [ ] 단위 ≥ 6건 (XSS 매트릭스)
- **R-ID/F-ID 매핑**: R-F-08, R-N-02 / F-04
- **테스트 시나리오**: 정상=markdown 렌더. 보안=XSS 페이로드 모두 차단.
- **의존성**: Blocked-by=fe-shell-router / Blocks=fe-article-detail

### Sprint 3 — FE 골든패스 + 댓글 + 릴리스

#### Milestone: Sprint 3

- **기간**: 2026-06-20 ~ 2026-06-30 (1.5주, 8 working days)
- **목표**: FE 9 라우트 골든패스 모두 PASS + 댓글 + 릴리스 KPI 4건 PASS.
- **종료 조건**: 7 이슈 머지 + Newman 19/19 PASS + axe-core PASS + 3 profile 부팅 PASS + tested 라벨.

##### Issue: fe-article-home

- **유형**: feature
- **영역**: frontend
- **우선순위**: P0
- **Estimated Effort**: 2d
- **Acceptance Criteria**: Given 누구든 `/#/`을 열 When M-FE-ARTICLE Home이 GET /api/articles + GET /api/tags를 동시 호출하면 Then Global Feed + Your Feed 탭 + 글 카드 10건 + 사이드바 popular tags + 페이지 번호가 표시되고 태그 클릭 시 필터 탭이 추가된다.
- **Contract Before**: Home 라우트 placeholder만.
- **Contract After**: `pages/Home.tsx` + `components/ArticleCard.tsx` + `components/TagSidebar.tsx` + `components/Pagination.tsx` + 단위 5건 + gstack /qa 골든패스.
- **DoD Checklist**:
  - [ ] Global/Your Feed 탭 전환
  - [ ] 카드 10건 + 페이지네이션
  - [ ] popular tag pill 클릭 → tag query 부착
  - [ ] axe-core PASS
  - [ ] 단위 ≥ 4건 + gstack /qa PASS + 스크린샷
- **R-ID/F-ID 매핑**: R-F-06, R-F-07, R-F-16, R-N-01, R-N-04 / F-05, F-06, F-08
- **테스트 시나리오**: 정상=Home 렌더. 실패=네트워크 에러 → 토스트. UI=gstack 스크린샷.
- **의존성**: Blocked-by=fe-api-client, fe-auth-screens, be-article-list, be-feed-list, be-tag-popular / Blocks=release-readiness

##### Issue: fe-article-detail

- **유형**: feature
- **영역**: frontend
- **우선순위**: P0
- **Estimated Effort**: 2d
- **Acceptance Criteria**: Given 누구든 `/#/article/:slug`을 열 When M-FE-ARTICLE Detail이 GET /api/articles/:slug + M-FE-MD sanitize 렌더링을 처리하면 Then markdown 본문 + author + createdAt + favoritesCount + favorite/delete 버튼이 표시되고 본인 글에만 Edit/Delete 버튼이 노출된다.
- **Contract Before**: 글 상세 placeholder.
- **Contract After**: `pages/Article.tsx` + favorite 버튼 + delete 버튼 + 단위 4건 + gstack /qa 골든패스.
- **DoD Checklist**:
  - [ ] markdown 본문 sanitize 렌더
  - [ ] favorite 토글 → 카운트 갱신
  - [ ] 본인 글만 Edit/Delete
  - [ ] axe-core PASS
  - [ ] 단위 ≥ 3건 + gstack /qa PASS
- **R-ID/F-ID 매핑**: R-F-08, R-F-11, R-F-12 / F-04
- **테스트 시나리오**: 정상=글 + favorite. 실패=미존재 slug → 404 UI. 보안=XSS 페이로드 sanitize.
- **의존성**: Blocked-by=fe-api-client, fe-md-sanitize, be-article-crud, be-favorite / Blocks=fe-comments, release-readiness

##### Issue: fe-editor

- **유형**: feature
- **영역**: frontend
- **우선순위**: P0
- **Estimated Effort**: 2d
- **Acceptance Criteria**: Given Member가 `/#/editor` 또는 `/#/editor/:slug`에서 title/description/body/tagList를 입력할 When Publish를 누르면 Then 신규는 201 + `/#/article/:slug`로 이동하고 수정은 200 + 변경 반영되며 빈 본문은 422 폼 에러로 표출된다.
- **Contract Before**: 에디터 placeholder.
- **Contract After**: `pages/Editor.tsx` (new + edit 모드) + tag 입력 + 단위 5건 + gstack /qa 골든패스.
- **DoD Checklist**:
  - [ ] new 모드 → POST → slug 발급 + redirect
  - [ ] edit 모드 → PUT → 갱신 반영
  - [ ] tag 입력 (Enter 추가, x 제거)
  - [ ] 422 에러 폼 표출
  - [ ] axe-core PASS
  - [ ] 단위 ≥ 4건 + gstack /qa PASS + 스크린샷
- **R-ID/F-ID 매핑**: R-F-09, R-F-10 / F-03
- **테스트 시나리오**: 정상=publish + 수정. 실패=title 누락 → 422.
- **의존성**: Blocked-by=fe-api-client, be-article-crud / Blocks=release-readiness

##### Issue: fe-profile-view

- **유형**: feature
- **영역**: frontend
- **우선순위**: P1
- **Estimated Effort**: 1d
- **Acceptance Criteria**: Given 누구든 `/#/profile/:username` 또는 `/#/profile/:username/favorites`을 열 When M-FE-PROFILE이 프로필 + 글 목록(My Articles / Favorited 탭) + Follow/Unfollow 버튼을 렌더링하면 Then 자기 자신은 Edit Profile 버튼만 표시되고 타인은 Follow 토글이 표시된다.
- **Contract Before**: 프로필 placeholder.
- **Contract After**: `pages/Profile.tsx` + `components/ProfileHeader.tsx` + tab 라우트 + 단위 4건.
- **DoD Checklist**:
  - [ ] My Articles / Favorited 탭
  - [ ] Follow/Unfollow 토글 → following 변화
  - [ ] 자기 프로필은 Edit Profile 버튼
  - [ ] axe-core PASS
  - [ ] 단위 ≥ 3건 + gstack /qa PASS
- **R-ID/F-ID 매핑**: R-F-04, R-F-05 / F-02
- **테스트 시나리오**: 정상=프로필 + 탭. 실패=미존재 username → 404 UI.
- **의존성**: Blocked-by=fe-api-client, be-profile-follow / Blocks=release-readiness

##### Issue: be-comments-crud

- **유형**: feature
- **영역**: backend
- **우선순위**: P1
- **Estimated Effort**: 2d
- **Acceptance Criteria**: Given 누구든 GET 또는 Member가 POST/DELETE `/api/articles/:slug/comments[/:id]`을 호출할 When M-BE-COMMENT가 처리하면 Then GET=200, POST=201, DELETE=204 (본인만, 타인 403)을 반환하며 모두 errors shape 정합이다.
- **Contract Before**: 댓글 라우트 없음.
- **Contract After**: `routes/articles.comments.{get,post,delete}.ts` + 통합 4건.
- **DoD Checklist**:
  - [ ] GET 200 + 최신순
  - [ ] POST 201
  - [ ] DELETE 본인만 204, 타인 403
  - [ ] 빈 본문 → 422
  - [ ] 단위 ≥ 4건 + 통합 ≥ 3건
- **R-ID/F-ID 매핑**: R-F-13, R-F-14, R-F-15 / F-07
- **테스트 시나리오**: 정상=CRUD 사이클. 실패=타인 댓글 삭제 → 403.
- **의존성**: Blocked-by=be-article-crud / Blocks=fe-comments, release-readiness

##### Issue: fe-comments

- **유형**: feature
- **영역**: frontend
- **우선순위**: P1
- **Estimated Effort**: 1d
- **Acceptance Criteria**: Given 글 상세 하단에 M-FE-COMMENT 폼 + 리스트가 마운트될 When Member가 본문 입력 후 Post를 누르면 Then 201 + 카드 즉시 추가되며 비로그인은 "Sign in to add comments" 링크가 폼 자리에 표시된다.
- **Contract Before**: 댓글 컴포넌트 없음.
- **Contract After**: `components/CommentForm.tsx` + `components/CommentList.tsx` + 단위 3건 + gstack /qa.
- **DoD Checklist**:
  - [ ] GET 댓글 카드 N개
  - [ ] POST → 201 + 카드 추가
  - [ ] DELETE 본인만 trash 아이콘
  - [ ] 비로그인 → Sign in 링크
  - [ ] 단위 ≥ 3건 + gstack /qa PASS
- **R-ID/F-ID 매핑**: R-F-13, R-F-14, R-F-15 / F-07
- **테스트 시나리오**: 정상=댓글 CRUD. 실패=비로그인 → 링크. 보안=타인 댓글 trash 미노출.
- **의존성**: Blocked-by=fe-article-detail, be-comments-crud / Blocks=release-readiness

##### Issue: release-readiness

- **유형**: chore
- **영역**: infra
- **우선순위**: P0
- **Estimated Effort**: 1d
- **Acceptance Criteria**: Given 모든 22 이슈가 머지된 상태에서 KPI 4건(API 100% / FE 100% / coverage ≥80% / 6축 PASS)을 측정할 When 릴리스 준비 검증 절차를 실행하면 Then Newman 19/19 PASS + axe-core PASS + 3 profile 부팅 PASS + sprint retro 박제로 MVP v1.0 머지 준비가 완료된다.
- **Contract Before**: 릴리스 검증 절차 없음.
- **Contract After**: `docs/releases/v1.0-test-report.md` + Newman 전건 capture + axe-core report + `docs/planning/retro/sprint-3-retro.md`.
- **DoD Checklist**:
  - [ ] Newman 19 endpoint PASS
  - [ ] axe-core 5 화면 PASS
  - [ ] 3 profile 부팅 PASS
  - [ ] coverage ≥ 80%
  - [ ] retro 박제
- **R-ID/F-ID 매핑**: R-N-04, R-N-05, R-N-06, R-N-07 / F-01~F-08
- **테스트 시나리오**: 정상=4 KPI PASS. 실패=Newman 1건 fail → BLOCK + hotfix.
- **의존성**: Blocked-by=fe-article-home, fe-article-detail, fe-editor, fe-profile-view, fe-comments, be-comments-crud, infra-ci-workflow / Blocks=(MVP v1.0 머지)

## 3. 의존성 그래프

```
infra-scaffold ──┬─► infra-prisma-init ──┬─► be-auth-signup ──► be-auth-login ──► be-user-me ──┬─► be-profile-follow ──► be-feed-list
                 ├─► infra-ci-workflow                                                          └─► be-article-crud ──┬─► be-favorite
                 └─► fe-shell-router ──┬─► fe-auth-screens                                                            ├─► be-comments-crud
                                       ├─► fe-api-client ──┬─► fe-article-home ──► release-readiness                  ├─► fe-editor
                                       └─► fe-md-sanitize ─┴─► fe-article-detail ──┬─► fe-comments                    └─► fe-article-detail
                                                                                   └─► (favorite UI)
                       (be-tag-popular ──► fe-article-home)
                       (be-profile-follow ──► fe-profile-view)

순환 없음. DAG. 모든 경로 release-readiness 수렴.
```

## 4. 추적성 매트릭스

| R-ID | F-ID | Sprint | Issue Slug |
|---|---|---|---|
| R-F-01 | F-01 | S1 | be-auth-signup, fe-auth-screens |
| R-F-02 | F-01 | S1 | be-auth-login, fe-auth-screens |
| R-F-03 | F-01, F-02 | S1 | be-user-me, fe-auth-screens |
| R-F-04 | F-02 | S2, S3 | be-profile-follow, fe-profile-view |
| R-F-05 | F-02 | S2, S3 | be-profile-follow, fe-profile-view |
| R-F-06 | F-05 | S2, S3 | be-article-list, fe-article-home |
| R-F-07 | F-06 | S2, S3 | be-feed-list, fe-article-home |
| R-F-08 | F-04 | S2, S3 | be-article-crud, fe-md-sanitize, fe-article-detail |
| R-F-09 | F-03 | S2, S3 | be-article-crud, fe-editor |
| R-F-10 | F-03 | S2, S3 | be-article-crud, fe-editor |
| R-F-11 | F-04 | S2, S3 | be-article-crud, fe-article-detail |
| R-F-12 | F-04 | S2, S3 | be-favorite, fe-article-detail |
| R-F-13 | F-07 | S3 | be-comments-crud, fe-comments |
| R-F-14 | F-07 | S3 | be-comments-crud, fe-comments |
| R-F-15 | F-07 | S3 | be-comments-crud, fe-comments |
| R-F-16 | F-05, F-08 | S2, S3 | be-tag-popular, fe-article-home |
| R-F-17 | F-01 | S1 | fe-auth-screens |
| R-N-01 | F-05 | S2 | be-article-list |
| R-N-02 | F-01 | S1, S2 | be-auth-signup, be-auth-login, fe-api-client, fe-md-sanitize |
| R-N-03 | F-01 | S1 | be-auth-signup |
| R-N-04 | F-01, F-05 | S1, S3 | fe-shell-router, fe-auth-screens, fe-article-home, fe-article-detail, fe-editor, fe-profile-view, release-readiness |
| R-N-05 | F-01~F-08 | S1, S3 | infra-scaffold, infra-prisma-init, infra-ci-workflow, release-readiness |
| R-N-06 | F-01~F-08 | S1, S3 | infra-scaffold, infra-ci-workflow, release-readiness |
| R-N-07 | F-01~F-08 | S3 | release-readiness |

> R-F-01~17 + R-N-01~07 + F-01~F-08 모두 1개 이상 이슈 cover (100%).

## 5. 리스크 매핑

| 15-risk Risk-ID | 영향 받는 Sprint/Issue | 대응 이슈 |
|---|---|---|
| RISK-01 (spec 모호) | S1: be-auth-signup, S2: be-article-list | Newman fixture 박제 + reference 응답 캡처 |
| RISK-02 (3 profile 부팅 자산) | 전 Sprint 매 PR | infra-scaffold (SoT) + AI 게이트 6축 자동 |
| RISK-03 (UI 골든패스 회귀) | S1·S3 모든 FE 이슈 | gstack /qa 5 골든패스 박제 + data-testid |
| RISK-04 (Bootstrap+CSS Modules 시각) | S1: fe-shell-router / S3: fe-article-home·fe-editor | 10 §3 디자인 토큰 양축 매핑 |
| RISK-05 (N+1) | S2: be-article-list, be-feed-list / S3: be-comments-crud | Prisma query log assertion + k6 매 PR |
| RISK-06 (JWT/bcrypt 보안) | S1: be-auth-signup, be-auth-login | 단위·통합 매트릭스 R-N-02·N-03 + gitleaks |
| RISK-07 (일정 압박) | 전 Sprint | sprint retro + F-08 후행 |
| RISK-08 (Prisma migration) | S1: infra-prisma-init / S2·S3 schema 변경 | migration 분리형 + 6축 lint |
| RISK-09 (XSS sanitize) | S2: fe-md-sanitize / S3: fe-article-detail | DOMPurify 단위 매트릭스 |
| RISK-10 (GitHub Actions PR 검증) | 전 Sprint 매 PR | infra-ci-workflow + LOCAL.md §5 act |
| RISK-11 (외부 reference 갱신) | 운영 단계 | vendoring + 분기별 흡수 |

## 6. 일정

- **S1**: 2026-05-27 (water) → 2026-06-09 (tuesday). 2 weeks · 10 working days · 8 이슈 = ~11d 합산 → 1인 carry-over 1d 허용.
- **S2**: 2026-06-10 (water) → 2026-06-19 (friday). 1.5 weeks · 8 working days · 8 이슈 = ~11d 합산 → 1인 carry-over 1.5d 허용 또는 RISK-07 발동.
- **S3**: 2026-06-20 (saturday: 영업일 X) → 2026-06-30 (tuesday). 1.5 weeks · 8 working days · 7 이슈 = ~11d 합산.
- **버퍼**: S3 마지막 1일은 release-readiness만으로 명시 → 22 이슈는 6월 27일까지 마감 목표.

> 모든 이슈는 동일 trunk(main)에서 `<mode>/<slug>-issue-<N>` 분기 + squash merge (ADR-0044).

## 7. sprint-bootstrap 입력

```yaml
project:
  name: "Conduit (RealWorld Clone)"
  repo: "{{REPO_NAME}}"
  default_branch: main
  branch_protection_required: true   # ADR-0044 9 규칙 적용 (요청자 ≥1, dismiss stale, required status checks=AI 게이트 + CI, no force push, no admin bypass)
  labels:
    status: ["status:todo", "status:in-progress", "status:in-review", "status:blocked"]
    type: ["type:feature", "type:bug", "type:chore", "type:docs", "type:test"]
    area: ["area:frontend", "area:backend", "area:infra"]
    priority: ["priority:high", "priority:p0", "priority:p1", "priority:p2"]
    flag: ["flaky:true", "tested"]

sprints:
  - name: "Sprint 1 — 기반·인증·인프라"
    milestone: "Sprint 1"
    due: "2026-06-09"
    issues:
      - title: "infra-scaffold: 12-scaffolding §6·§7 + LOCAL.md §3·§4 SoT 박제"
        slug: "infra-scaffold"
        labels: ["status:todo", "type:chore", "area:infra", "priority:p0"]
        body: |
          ## 매핑
          R-ID: R-N-05, R-N-06
          F-ID: F-01~F-08 (전 feature가 의존)

          ## 유형 / 영역 / 우선순위
          chore / infra / P0 — Estimated Effort: 2d

          ## Acceptance Criteria
          Given fresh checkout 상태에서 12-scaffolding §6·§7 + LOCAL.md §3·§4 SoT가 박제되었을 When `pnpm install && pnpm -r build`을 실행하면 Then dev/stg/prod 3 profile 모두 ready 신호 + 에러 0건이며 AI 게이트 6번째 축 lint가 PASS이다.

          ## Contract
          변경 전: 빈 workspace 골격. `.env.example` 없음. pnpm workspace 미설정.
          변경 후: `package.json` workspace(`@conduit/frontend|backend|types`) + pnpm 9 lockfile + `.env.{dev,stg,prod}.example` × 2 workspace + `docker-compose.{dev,stg,prod}.yml` × 3 + Caddy 설정 + LOCAL.md §3 부팅 명령.

          ## DoD Checklist
          - [ ] 12-scaffolding §6·§7 표 동기
          - [ ] LOCAL.md §3 dev/stg/prod 명령 + ready 신호
          - [ ] AI 게이트 6번째 축 PASS
          - [ ] 단위 테스트 (lint + tsc --noEmit) PASS

          ## 테스트 시나리오
          - 정상: 3 profile fresh boot 모두 OK
          - 실패: `.env.stg.example` 누락 시 6축 stderr BLOCK

          ## 의존성
          Blocked-by: (없음)
          Blocks: infra-prisma-init, infra-ci-workflow, fe-shell-router, be-auth-signup

          ---
          WBS 정본: {{WBS_URL}}

      - title: "infra-prisma-init: Prisma schema + migrations(분리형) + seed 100건"
        slug: "infra-prisma-init"
        labels: ["status:todo", "type:chore", "area:infra", "priority:p0"]
        body: |
          ## 매핑
          R-ID: R-N-01, R-N-05
          F-ID: F-04, F-05

          ## 유형 / 영역 / 우선순위
          chore / infra / P0 — Estimated Effort: 1d

          ## Acceptance Criteria
          Given Prisma schema가 04-srs §5 도메인 모델을 반영했을 When `pnpm --filter @conduit/backend prisma migrate dev`을 실행하면 Then 모든 테이블 + seed 100건이 적재되어 R-N-01 k6 부하 테스트 입력이 준비된다.

          ## Contract
          변경 전: 빈 DB. migration 폴더 없음.
          변경 후: `prisma/schema.prisma` + `prisma/migrations/20260527000000_init/` + `prisma/seed.ts` + Prisma client 싱글톤.

          ## DoD Checklist
          - [ ] schema 7 모델 + 인덱스
          - [ ] migration 분리형 (LOCAL.md (a))
          - [ ] seed 100건
          - [ ] 단위 테스트 (Prisma client export) PASS

          ## 테스트 시나리오
          - 정상: migrate + seed → 글 100건
          - 실패: schema typo → migrate fail

          ## 의존성
          Blocked-by: infra-scaffold
          Blocks: be-auth-signup, be-user-me, be-article-crud, be-tag-popular

          ---
          WBS 정본: {{WBS_URL}}

      - title: "infra-ci-workflow: .github/workflows/ci.yml + act + LOCAL.md §5"
        slug: "infra-ci-workflow"
        labels: ["status:todo", "type:chore", "area:infra", "priority:p0"]
        body: |
          ## 매핑
          R-ID: R-N-05, R-N-06
          F-ID: F-01~F-08

          ## 유형 / 영역 / 우선순위
          chore / infra / P0 — Estimated Effort: 1d

          ## Acceptance Criteria
          Given `.github/workflows/ci.yml` + LOCAL.md §5 act 명령이 박제되었을 When PR open 시 GitHub Actions + 로컬 act 양축이 동일 lint→typecheck→unit→integration→Newman→gstack→6축 시퀀스를 실행하면 Then 양축 모두 PASS이다.

          ## Contract
          변경 전: `.github/workflows/` 없음.
          변경 후: `.github/workflows/ci.yml` + `.actrc` + `.env.act.example` + LOCAL.md §5 act 절차.

          ## DoD Checklist
          - [ ] ci.yml 7 step
          - [ ] act 로컬 명령 LOCAL.md §5 박제
          - [ ] AI 게이트 6번째 축 워크플로 lint 통합
          - [ ] 단위 테스트 (act dry-run) PASS

          ## 테스트 시나리오
          - 정상: act + GitHub 양축 PASS
          - 실패: Manual verification 체크 누락 → ADR-0047 BLOCK

          ## 의존성
          Blocked-by: infra-scaffold
          Blocks: release-readiness

          ---
          WBS 정본: {{WBS_URL}}

      - title: "be-auth-signup: POST /api/users + bcrypt + JWT"
        slug: "be-auth-signup"
        labels: ["status:todo", "type:feature", "area:backend", "priority:p0"]
        body: |
          ## 매핑
          R-ID: R-F-01, R-N-02, R-N-03
          F-ID: F-01

          ## 유형 / 영역 / 우선순위
          feature / backend / P0 — Estimated Effort: 2d

          ## Acceptance Criteria
          Given 미가입 visitor가 valid username·email·password를 POST `/api/users` body로 전송했을 When M-BE-AUTH가 처리하면 Then 201 + `{user: {token, ...}}`를 반환하며 DB는 bcrypt 해시만 저장한다.

          ## Contract
          변경 전: 라우트 없음. M-BE-AUTH 미생성.
          변경 후: `routes/users.post.ts` + `services/auth.ts` + 단위 8건 + 통합 4건 + Newman fixture.

          ## DoD Checklist
          - [ ] POST /api/users 201 + 토큰
          - [ ] email/username 중복 422
          - [ ] bcrypt cost=12 + timing ≥ 200ms
          - [ ] 단위 ≥ 5 + 통합 ≥ 2

          ## 테스트 시나리오
          - 정상: valid 가입 → 201
          - 실패: 중복 email → 422
          - 보안: bcrypt 해시 패턴

          ## 의존성
          Blocked-by: infra-prisma-init
          Blocks: be-auth-login, fe-auth-screens

          ---
          WBS 정본: {{WBS_URL}}

      - title: "be-auth-login: POST /api/users/login + JWT verify"
        slug: "be-auth-login"
        labels: ["status:todo", "type:feature", "area:backend", "priority:p0"]
        body: |
          ## 매핑
          R-ID: R-F-02, R-N-02
          F-ID: F-01

          ## 유형 / 영역 / 우선순위
          feature / backend / P0 — Estimated Effort: 1d

          ## Acceptance Criteria
          Given 기존 Member가 valid email·password를 POST `/api/users/login`에 전송했을 When M-BE-AUTH가 검증하면 Then 200 + 토큰 반환, 잘못된 자격증명은 422 + 통일 메시지를 반환한다.

          ## Contract
          변경 전: 로그인 라우트 없음.
          변경 후: `routes/users.login.post.ts` + JWT verify middleware + 단위 5건 + 통합 3건.

          ## DoD Checklist
          - [ ] POST /api/users/login 200
          - [ ] 잘못된 자격 422 통일 메시지
          - [ ] 만료된 토큰 401
          - [ ] 단위 ≥ 4 + 통합 ≥ 2

          ## 테스트 시나리오
          - 정상: valid → 200
          - 실패: 잘못된 pw → 422
          - 보안: 만료 토큰 → 401

          ## 의존성
          Blocked-by: be-auth-signup
          Blocks: be-user-me, fe-auth-screens

          ---
          WBS 정본: {{WBS_URL}}

      - title: "be-user-me: GET/PUT /api/user"
        slug: "be-user-me"
        labels: ["status:todo", "type:feature", "area:backend", "priority:p0"]
        body: |
          ## 매핑
          R-ID: R-F-03
          F-ID: F-01, F-02

          ## 유형 / 영역 / 우선순위
          feature / backend / P0 — Estimated Effort: 1d

          ## Acceptance Criteria
          Given Member JWT가 있을 When GET/PUT `/api/user`을 호출하면 Then 본인 user 객체 반환하고 PUT은 email/username/bio/image/password 부분 갱신을 지원한다.

          ## Contract
          변경 전: /api/user 라우트 없음.
          변경 후: `routes/user.{get,put}.ts` + M-BE-USER update() + 통합 3건.

          ## DoD Checklist
          - [ ] GET 200
          - [ ] PUT 200 + 부분 갱신
          - [ ] email 중복 → 422
          - [ ] 단위 ≥ 3 + 통합 ≥ 2

          ## 테스트 시나리오
          - 정상: bio 갱신 → 200
          - 실패: email 중복 → 422
          - 보안: 토큰 만료 → 401

          ## 의존성
          Blocked-by: be-auth-login
          Blocks: fe-auth-screens, be-profile-follow

          ---
          WBS 정본: {{WBS_URL}}

      - title: "fe-shell-router: App shell + Header/Footer + HashRouter + AuthGuard"
        slug: "fe-shell-router"
        labels: ["status:todo", "type:feature", "area:frontend", "priority:p0"]
        body: |
          ## 매핑
          R-ID: R-N-04
          F-ID: F-01

          ## 유형 / 영역 / 우선순위
          feature / frontend / P0 — Estimated Effort: 2d

          ## Acceptance Criteria
          Given 사용자가 `/#/` 또는 `/#/login` 등을 열 When M-FE-SHELL Router가 라우팅하면 Then Header + Footer + Bootstrap 4 CSS 로드 + AuthGuard 보호 라우트 리다이렉트가 모두 동작한다.

          ## Contract
          변경 전: `index.html` only. Router 없음.
          변경 후: `main.tsx` + `App.tsx` (HashRouter 9 라우트) + Header/Footer + Bootstrap 4 CSS import + AuthGuard + 단위 4건.

          ## DoD Checklist
          - [ ] 9 라우트 매치
          - [ ] Bootstrap 4 + CSS Modules 동거 (ADR-0038)
          - [ ] AuthGuard 동작
          - [ ] axe-core PASS
          - [ ] 단위 ≥ 4 + gstack /qa PASS

          ## 테스트 시나리오
          - 정상: router 매치 + Header 분기
          - 실패: 미인증 /#/editor → /#/login
          - 시각: axe-core PASS

          ## 의존성
          Blocked-by: infra-scaffold
          Blocks: fe-auth-screens, fe-api-client, fe-article-home, fe-article-detail, fe-editor, fe-profile-view, fe-comments

          ---
          WBS 정본: {{WBS_URL}}

      - title: "fe-auth-screens: Login/Register/Settings + R-F-17 logout"
        slug: "fe-auth-screens"
        labels: ["status:todo", "type:feature", "area:frontend", "priority:p0"]
        body: |
          ## 매핑
          R-ID: R-F-01, R-F-02, R-F-03, R-F-17, R-N-02, R-N-04
          F-ID: F-01

          ## 유형 / 영역 / 우선순위
          feature / frontend / P0 — Estimated Effort: 2d

          ## Acceptance Criteria
          Given M-FE-AUTH가 3 화면을 렌더링할 When 사용자가 폼을 제출하면 Then JWT localStorage 저장·삭제 + Header 즉시 전환 + 422 errors 폼 표출이 동작한다.

          ## Contract
          변경 전: 3 화면 placeholder.
          변경 후: Login/Register/Settings pages + `stores/auth.ts` (M-FE-AUTH-STORE) + 단위 5건 + gstack /qa.

          ## DoD Checklist
          - [ ] 가입 → 자동 로그인 → 헤더 전환
          - [ ] logout (R-F-17) → 토큰 삭제 + 헤더 전환
          - [ ] 422 errors 표출
          - [ ] axe-core PASS
          - [ ] 단위 ≥ 4 + gstack /qa PASS + 스크린샷

          ## 테스트 시나리오
          - 정상: 가입·로그인·logout 사이클
          - 실패: 중복 email → 폼 에러
          - UI: gstack 스크린샷

          ## 의존성
          Blocked-by: fe-shell-router, be-auth-signup, be-auth-login, be-user-me
          Blocks: fe-article-home

          ---
          WBS 정본: {{WBS_URL}}

  - name: "Sprint 2 — 글·태그·프로필·즐겨찾기 + FE 인프라"
    milestone: "Sprint 2"
    due: "2026-06-19"
    issues:
      - title: "be-article-crud: POST/GET/PUT/DELETE /api/articles[/:slug] + slug 발급"
        slug: "be-article-crud"
        labels: ["status:todo", "type:feature", "area:backend", "priority:p0"]
        body: |
          ## 매핑
          R-ID: R-F-08, R-F-09, R-F-10, R-F-11
          F-ID: F-03, F-04

          ## 유형 / 영역 / 우선순위
          feature / backend / P0 — Estimated Effort: 3d

          ## Acceptance Criteria
          Given Member JWT When POST/GET/PUT/DELETE `/api/articles[/:slug]`을 호출하면 Then slug 자동 발급(title 기반 + suffix) + CRUD 동작 + 작성자 본인 외 PUT/DELETE 403이다.

          ## Contract
          변경 전: /api/articles 라우트 없음.
          변경 후: `routes/articles.{post,get,put,delete}.ts` + `services/article.ts` (slug) + 단위 8 + 통합 5.

          ## DoD Checklist
          - [ ] POST 201 + slug
          - [ ] GET 200 + author/tagList/favoritesCount
          - [ ] PUT 본인만 200, 타인 403
          - [ ] DELETE 본인만 204, 타인 403
          - [ ] 단위 ≥ 6 + 통합 ≥ 4

          ## 테스트 시나리오
          - 정상: CRUD 사이클
          - 실패: 미존재 slug → 404, 타인 글 PUT → 403

          ## 의존성
          Blocked-by: be-user-me
          Blocks: be-favorite, be-comments-crud, fe-editor, fe-article-detail

          ---
          WBS 정본: {{WBS_URL}}

      - title: "be-article-list: GET /api/articles + 필터·페이지네이션 + k6"
        slug: "be-article-list"
        labels: ["status:todo", "type:feature", "area:backend", "priority:p0"]
        body: |
          ## 매핑
          R-ID: R-F-06, R-N-01
          F-ID: F-05

          ## 유형 / 영역 / 우선순위
          feature / backend / P0 — Estimated Effort: 2d

          ## Acceptance Criteria
          Given 누구든 GET `/api/articles?limit=10&offset=0[&tag=&author=&favorited=]`을 호출할 When 목록 핸들러가 응답하면 Then 200 + `{articles, articlesCount}` + k6 p95 ≤ 1000ms + Prisma 호출당 쿼리 수 ≤ 2이다.

          ## Contract
          변경 전: 목록 핸들러 미구현.
          변경 후: `routes/articles.get.ts` (list) + Prisma include depth 2 + k6 `tests/perf/articles-list.k6.js` + 통합 4건.

          ## DoD Checklist
          - [ ] 200 + limit/offset
          - [ ] tag/author/favorited 필터
          - [ ] k6 p95 < 1000ms
          - [ ] Prisma 호출당 쿼리 ≤ 2
          - [ ] 단위 ≥ 4 + 통합 ≥ 3

          ## 테스트 시나리오
          - 정상: 10건 카드
          - 실패: limit > 100 → 422
          - 성능: k6 마이크로 부하

          ## 의존성
          Blocked-by: be-article-crud
          Blocks: fe-article-home

          ---
          WBS 정본: {{WBS_URL}}

      - title: "be-feed-list: GET /api/articles/feed"
        slug: "be-feed-list"
        labels: ["status:todo", "type:feature", "area:backend", "priority:p1"]
        body: |
          ## 매핑
          R-ID: R-F-07
          F-ID: F-06

          ## 유형 / 영역 / 우선순위
          feature / backend / P1 — Estimated Effort: 1d

          ## Acceptance Criteria
          Given 로그인 Member JWT When GET `/api/articles/feed?limit=10&offset=0`을 호출하면 Then 팔로우 사용자 글만 최신순 반환, 팔로우 0명은 빈 배열을 반환한다.

          ## Contract
          변경 전: /api/articles/feed 미구현.
          변경 후: `routes/articles.feed.get.ts` + 통합 3건.

          ## DoD Checklist
          - [ ] 200 + 팔로우 사용자 글만
          - [ ] 팔로우 0명 → []
          - [ ] 비로그인 401
          - [ ] 단위 ≥ 3 + 통합 ≥ 2

          ## 테스트 시나리오
          - 정상: 팔로우 2명 글 8건
          - 실패: 비로그인 → 401

          ## 의존성
          Blocked-by: be-profile-follow
          Blocks: fe-article-home

          ---
          WBS 정본: {{WBS_URL}}

      - title: "be-favorite: POST/DELETE /api/articles/:slug/favorite"
        slug: "be-favorite"
        labels: ["status:todo", "type:feature", "area:backend", "priority:p1"]
        body: |
          ## 매핑
          R-ID: R-F-12
          F-ID: F-04

          ## 유형 / 영역 / 우선순위
          feature / backend / P1 — Estimated Effort: 1d

          ## Acceptance Criteria
          Given Member When POST/DELETE `/api/articles/:slug/favorite`을 호출하면 Then `{article: {..., favorited, favoritesCount}}`을 idempotent하게 반환하며 비로그인 클릭은 401이다.

          ## Contract
          변경 전: favorite 라우트 미구현.
          변경 후: `routes/articles.favorite.{post,delete}.ts` + 통합 3건.

          ## DoD Checklist
          - [ ] POST → favorited=true + count+1
          - [ ] DELETE → favorited=false + count-1
          - [ ] POST 재호출 idempotent
          - [ ] 단위 ≥ 3 + 통합 ≥ 2

          ## 테스트 시나리오
          - 정상: 토글
          - 실패: 비로그인 → 401
          - idempotent: 재호출 count 불변

          ## 의존성
          Blocked-by: be-article-crud
          Blocks: fe-article-detail

          ---
          WBS 정본: {{WBS_URL}}

      - title: "be-profile-follow: GET /api/profiles/:username + POST/DELETE follow"
        slug: "be-profile-follow"
        labels: ["status:todo", "type:feature", "area:backend", "priority:p1"]
        body: |
          ## 매핑
          R-ID: R-F-04, R-F-05
          F-ID: F-02

          ## 유형 / 영역 / 우선순위
          feature / backend / P1 — Estimated Effort: 2d

          ## Acceptance Criteria
          Given 누구든 GET `/api/profiles/:username` When 프로필 조회하면 Then 200 + `{profile: {username, bio, image, following}}` 반환, Member의 POST/DELETE follow는 토글 적용이다.

          ## Contract
          변경 전: /api/profiles 라우트 없음.
          변경 후: `routes/profiles.{get,follow.post,follow.delete}.ts` + M-BE-USER follow + 통합 4건.

          ## DoD Checklist
          - [ ] GET 200 + following 필드
          - [ ] POST follow → true
          - [ ] DELETE → false
          - [ ] self-follow → 403
          - [ ] 단위 ≥ 4 + 통합 ≥ 3

          ## 테스트 시나리오
          - 정상: follow 토글
          - 실패: 미존재 username → 404, self-follow → 403

          ## 의존성
          Blocked-by: be-user-me
          Blocks: be-feed-list, fe-profile-view

          ---
          WBS 정본: {{WBS_URL}}

      - title: "be-tag-popular: GET /api/tags"
        slug: "be-tag-popular"
        labels: ["status:todo", "type:feature", "area:backend", "priority:p2"]
        body: |
          ## 매핑
          R-ID: R-F-16
          F-ID: F-05, F-08

          ## 유형 / 영역 / 우선순위
          feature / backend / P2 — Estimated Effort: 1d

          ## Acceptance Criteria
          Given 누구든 GET `/api/tags` When M-BE-TAG가 count desc 상위 20을 집계하면 Then 200 + `{tags: ["string", ...]}`을 반환한다.

          ## Contract
          변경 전: /api/tags 미구현.
          변경 후: `routes/tags.get.ts` + Prisma groupBy + 통합 2건.

          ## DoD Checklist
          - [ ] 200 + 상위 20
          - [ ] 태그 0개 → []
          - [ ] 단위 ≥ 2 + 통합 ≥ 1

          ## 테스트 시나리오
          - 정상: 상위 20
          - 실패: DB 오류 → 500 + 캐시 fallback

          ## 의존성
          Blocked-by: infra-prisma-init
          Blocks: fe-article-home

          ---
          WBS 정본: {{WBS_URL}}

      - title: "fe-api-client: fetch wrapper + Authorization + 401 handler"
        slug: "fe-api-client"
        labels: ["status:todo", "type:feature", "area:frontend", "priority:p0"]
        body: |
          ## 매핑
          R-ID: R-N-02
          F-ID: F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08

          ## 유형 / 영역 / 우선순위
          feature / frontend / P0 — Estimated Effort: 1d

          ## Acceptance Criteria
          Given M-FE-API fetch wrapper When 모든 API 호출을 위임받으면 Then JWT `Authorization: Token <jwt>` 자동 첨부 + 401 응답에는 토큰 삭제 + /#/login 리다이렉트가 동작한다.

          ## Contract
          변경 전: 각 페이지가 fetch 직접 호출.
          변경 후: `api/client.ts` + interceptor + `stores/auth.ts` 연동 + 단위 6건.

          ## DoD Checklist
          - [ ] Authorization 자동 첨부
          - [ ] 401 → 토큰 삭제 + 리다이렉트
          - [ ] errors 페이로드 파싱
          - [ ] 단위 ≥ 5

          ## 테스트 시나리오
          - 정상: 요청 + 토큰 첨부
          - 실패: 401 → 리다이렉트
          - 안전: errors 파싱

          ## 의존성
          Blocked-by: fe-shell-router
          Blocks: fe-article-home, fe-article-detail, fe-editor, fe-profile-view, fe-comments

          ---
          WBS 정본: {{WBS_URL}}

      - title: "fe-md-sanitize: marked + DOMPurify wrapper"
        slug: "fe-md-sanitize"
        labels: ["status:todo", "type:feature", "area:frontend", "priority:p0"]
        body: |
          ## 매핑
          R-ID: R-F-08, R-N-02
          F-ID: F-04

          ## 유형 / 영역 / 우선순위
          feature / frontend / P0 — Estimated Effort: 1d

          ## Acceptance Criteria
          Given M-FE-MD가 marked + DOMPurify wrapper로 글 본문을 렌더링할 When XSS 페이로드(`<script>`, `onerror`, `javascript:`, `<iframe>`)가 입력되면 Then 모두 sanitize되어 출력 DOM에 남지 않는다.

          ## Contract
          변경 전: markdown 렌더링 없음.
          변경 후: `lib/markdown.ts` + DOMPurify config + 단위 8건 (XSS 매트릭스).

          ## DoD Checklist
          - [ ] 정상 markdown 렌더
          - [ ] `<script>` 제거
          - [ ] `onerror` 제거
          - [ ] `javascript:` URL 제거
          - [ ] `<iframe>` 제거
          - [ ] 단위 ≥ 6

          ## 테스트 시나리오
          - 정상: markdown 렌더
          - 보안: XSS 페이로드 차단

          ## 의존성
          Blocked-by: fe-shell-router
          Blocks: fe-article-detail

          ---
          WBS 정본: {{WBS_URL}}

  - name: "Sprint 3 — FE 골든패스 + 댓글 + 릴리스"
    milestone: "Sprint 3"
    due: "2026-06-30"
    issues:
      - title: "fe-article-home: Home + Global/Your Feed + tag 사이드바 + 페이지네이션"
        slug: "fe-article-home"
        labels: ["status:todo", "type:feature", "area:frontend", "priority:p0"]
        body: |
          ## 매핑
          R-ID: R-F-06, R-F-07, R-F-16, R-N-01, R-N-04
          F-ID: F-05, F-06, F-08

          ## 유형 / 영역 / 우선순위
          feature / frontend / P0 — Estimated Effort: 2d

          ## Acceptance Criteria
          Given 누구든 `/#/`을 열 When M-FE-ARTICLE Home이 GET /api/articles + GET /api/tags를 호출하면 Then Global/Your Feed 탭 + 카드 10건 + 사이드바 popular tags + 페이지 번호가 표시되고 태그 클릭 시 필터 탭이 추가된다.

          ## Contract
          변경 전: Home placeholder.
          변경 후: `pages/Home.tsx` + `components/{ArticleCard,TagSidebar,Pagination}.tsx` + 단위 5건 + gstack /qa.

          ## DoD Checklist
          - [ ] Global/Your Feed 탭
          - [ ] 카드 10건 + 페이지네이션
          - [ ] popular tag pill → tag query
          - [ ] axe-core PASS
          - [ ] 단위 ≥ 4 + gstack /qa PASS + 스크린샷

          ## 테스트 시나리오
          - 정상: Home 렌더
          - 실패: 네트워크 에러 → 토스트
          - UI: gstack 스크린샷

          ## 의존성
          Blocked-by: fe-api-client, fe-auth-screens, be-article-list, be-feed-list, be-tag-popular
          Blocks: release-readiness

          ---
          WBS 정본: {{WBS_URL}}

      - title: "fe-article-detail: 글 상세 + favorite + delete"
        slug: "fe-article-detail"
        labels: ["status:todo", "type:feature", "area:frontend", "priority:p0"]
        body: |
          ## 매핑
          R-ID: R-F-08, R-F-11, R-F-12
          F-ID: F-04

          ## 유형 / 영역 / 우선순위
          feature / frontend / P0 — Estimated Effort: 2d

          ## Acceptance Criteria
          Given 누구든 `/#/article/:slug`을 열 When M-FE-ARTICLE Detail이 GET /api/articles/:slug + M-FE-MD sanitize 렌더링을 처리하면 Then markdown 본문 + author + favoritesCount + favorite/delete 버튼이 표시되고 본인 글에만 Edit/Delete가 노출된다.

          ## Contract
          변경 전: 상세 placeholder.
          변경 후: `pages/Article.tsx` + favorite/delete 버튼 + 단위 4건 + gstack /qa.

          ## DoD Checklist
          - [ ] markdown sanitize 렌더
          - [ ] favorite 토글 → 카운트 갱신
          - [ ] 본인만 Edit/Delete
          - [ ] axe-core PASS
          - [ ] 단위 ≥ 3 + gstack /qa PASS

          ## 테스트 시나리오
          - 정상: 글 + favorite
          - 실패: 미존재 slug → 404 UI
          - 보안: XSS sanitize

          ## 의존성
          Blocked-by: fe-api-client, fe-md-sanitize, be-article-crud, be-favorite
          Blocks: fe-comments, release-readiness

          ---
          WBS 정본: {{WBS_URL}}

      - title: "fe-editor: /#/editor + /#/editor/:slug"
        slug: "fe-editor"
        labels: ["status:todo", "type:feature", "area:frontend", "priority:p0"]
        body: |
          ## 매핑
          R-ID: R-F-09, R-F-10
          F-ID: F-03

          ## 유형 / 영역 / 우선순위
          feature / frontend / P0 — Estimated Effort: 2d

          ## Acceptance Criteria
          Given Member가 /#/editor 또는 /#/editor/:slug에서 입력할 When Publish 누르면 Then 신규는 201 + /#/article/:slug로 이동, 수정은 200 + 변경 반영, 빈 본문은 422 폼 에러를 표출한다.

          ## Contract
          변경 전: 에디터 placeholder.
          변경 후: `pages/Editor.tsx` (new + edit) + tag 입력 + 단위 5건 + gstack /qa.

          ## DoD Checklist
          - [ ] new → POST + slug + redirect
          - [ ] edit → PUT + 갱신
          - [ ] tag 입력 (Enter add, x remove)
          - [ ] 422 에러 표출
          - [ ] axe-core PASS
          - [ ] 단위 ≥ 4 + gstack /qa PASS + 스크린샷

          ## 테스트 시나리오
          - 정상: publish + 수정
          - 실패: title 누락 → 422

          ## 의존성
          Blocked-by: fe-api-client, be-article-crud
          Blocks: release-readiness

          ---
          WBS 정본: {{WBS_URL}}

      - title: "fe-profile-view: 프로필 + Follow 토글 + My/Favorited 탭"
        slug: "fe-profile-view"
        labels: ["status:todo", "type:feature", "area:frontend", "priority:p1"]
        body: |
          ## 매핑
          R-ID: R-F-04, R-F-05
          F-ID: F-02

          ## 유형 / 영역 / 우선순위
          feature / frontend / P1 — Estimated Effort: 1d

          ## Acceptance Criteria
          Given 누구든 /#/profile/:username 또는 /favorites When M-FE-PROFILE이 프로필 + 탭 + Follow 버튼을 렌더링하면 Then 자기 자신은 Edit Profile, 타인은 Follow 토글이 표시된다.

          ## Contract
          변경 전: 프로필 placeholder.
          변경 후: `pages/Profile.tsx` + `components/ProfileHeader.tsx` + tab + 단위 4건.

          ## DoD Checklist
          - [ ] My/Favorited 탭
          - [ ] Follow 토글 → following 변화
          - [ ] 자기 프로필 Edit Profile
          - [ ] axe-core PASS
          - [ ] 단위 ≥ 3 + gstack /qa PASS

          ## 테스트 시나리오
          - 정상: 프로필 + 탭
          - 실패: 미존재 username → 404 UI

          ## 의존성
          Blocked-by: fe-api-client, be-profile-follow
          Blocks: release-readiness

          ---
          WBS 정본: {{WBS_URL}}

      - title: "be-comments-crud: GET/POST/DELETE /api/articles/:slug/comments[/:id]"
        slug: "be-comments-crud"
        labels: ["status:todo", "type:feature", "area:backend", "priority:p1"]
        body: |
          ## 매핑
          R-ID: R-F-13, R-F-14, R-F-15
          F-ID: F-07

          ## 유형 / 영역 / 우선순위
          feature / backend / P1 — Estimated Effort: 2d

          ## Acceptance Criteria
          Given 누구든 GET 또는 Member의 POST/DELETE `/api/articles/:slug/comments[/:id]` When M-BE-COMMENT가 처리하면 Then GET 200, POST 201, DELETE 204 (본인만, 타인 403)이며 errors shape 정합이다.

          ## Contract
          변경 전: 댓글 라우트 없음.
          변경 후: `routes/articles.comments.{get,post,delete}.ts` + 통합 4건.

          ## DoD Checklist
          - [ ] GET 200 + 최신순
          - [ ] POST 201
          - [ ] DELETE 본인만 204, 타인 403
          - [ ] 빈 본문 422
          - [ ] 단위 ≥ 4 + 통합 ≥ 3

          ## 테스트 시나리오
          - 정상: CRUD 사이클
          - 실패: 타인 댓글 삭제 → 403

          ## 의존성
          Blocked-by: be-article-crud
          Blocks: fe-comments, release-readiness

          ---
          WBS 정본: {{WBS_URL}}

      - title: "fe-comments: 댓글 폼/리스트/삭제 UI"
        slug: "fe-comments"
        labels: ["status:todo", "type:feature", "area:frontend", "priority:p1"]
        body: |
          ## 매핑
          R-ID: R-F-13, R-F-14, R-F-15
          F-ID: F-07

          ## 유형 / 영역 / 우선순위
          feature / frontend / P1 — Estimated Effort: 1d

          ## Acceptance Criteria
          Given 글 상세 하단에 M-FE-COMMENT 폼/리스트가 마운트될 When Member가 본문 입력 + Post 누르면 Then 201 + 카드 즉시 추가, 비로그인은 "Sign in to add comments" 링크가 폼 자리에 표시된다.

          ## Contract
          변경 전: 댓글 컴포넌트 없음.
          변경 후: `components/{CommentForm,CommentList}.tsx` + 단위 3건 + gstack /qa.

          ## DoD Checklist
          - [ ] GET 카드 N개
          - [ ] POST → 201 + 카드 추가
          - [ ] DELETE 본인만 trash
          - [ ] 비로그인 → Sign in 링크
          - [ ] 단위 ≥ 3 + gstack /qa PASS

          ## 테스트 시나리오
          - 정상: 댓글 CRUD
          - 실패: 비로그인 → 링크
          - 보안: 타인 댓글 trash 미노출

          ## 의존성
          Blocked-by: fe-article-detail, be-comments-crud
          Blocks: release-readiness

          ---
          WBS 정본: {{WBS_URL}}

      - title: "release-readiness: Newman 19 + axe-core + 3 profile boot + retro"
        slug: "release-readiness"
        labels: ["status:todo", "type:chore", "area:infra", "priority:p0"]
        body: |
          ## 매핑
          R-ID: R-N-04, R-N-05, R-N-06, R-N-07
          F-ID: F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08

          ## 유형 / 영역 / 우선순위
          chore / infra / P0 — Estimated Effort: 1d

          ## Acceptance Criteria
          Given 모든 22 이슈가 머지된 상태에서 KPI 4건(API 100% / FE 100% / coverage ≥80% / 6축 PASS)을 측정할 When 릴리스 검증 절차를 실행하면 Then Newman 19/19 PASS + axe-core PASS + 3 profile 부팅 PASS + retro 박제로 MVP v1.0 머지 준비 완료다.

          ## Contract
          변경 전: 릴리스 검증 절차 없음.
          변경 후: `docs/releases/v1.0-test-report.md` + Newman 전건 + axe-core report + `docs/planning/retro/sprint-3-retro.md`.

          ## DoD Checklist
          - [ ] Newman 19 PASS
          - [ ] axe-core 5 화면 PASS
          - [ ] 3 profile 부팅 PASS
          - [ ] coverage ≥ 80%
          - [ ] retro 박제

          ## 테스트 시나리오
          - 정상: 4 KPI PASS
          - 실패: Newman 1건 fail → BLOCK + hotfix

          ## 의존성
          Blocked-by: fe-article-home, fe-article-detail, fe-editor, fe-profile-view, fe-comments, be-comments-crud, infra-ci-workflow
          Blocks: (MVP v1.0 머지)

          ---
          WBS 정본: {{WBS_URL}}
```

## 8. Open Questions

- sprint 1 시작 직전(2026-05-27) `priority:high` hotfix 시나리오 정의 — 운영 단계 결정 가능 영역 (01 brief §7 R-EARLY).
- Sprint 2 carry-over 발생 시 P2(`be-tag-popular`) 또는 P1(`be-feed-list`) 중 어떤 것을 미루는 정책 — sprint 1 retro에서 결정.
- release-readiness 직전에 외부 RealWorld Postman 컬렉션 갱신 발견 시 흡수 절차 (RISK-11 대응).
