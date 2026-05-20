---
doc_type: prd
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-19
gate: B
related:
  R-ID: []
  F-ID: []
  supersedes: null
---

# Conduit (RealWorld Clone) — PRD

<!-- Gate B — 사용자 가치 + 기능(F-NN) + MVP Cut. F-NN은 04-srs의 R-F-NN/R-N-NN을
     사용자 경험 묶음으로 재구성한 것. 각 F-NN에 R-ID 매핑·테스트 시나리오·3축 결정 필수. -->

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-19 | woosung.ahn@bespinglobal.com | 초안 (/flow-init Gate B) |

## 1. 제품 개요

**Conduit**은 RealWorld 표준 스펙(https://realworld-docs.netlify.app)을 충족하는 Medium.com 풀스택 클론이다. 사용자는 글을 쓰고·읽고·즐겨찾기 하고·작가를 팔로우하며·태그로 탐색한다. 본 제품 자체가 RealWorld 합치를 인수 기준으로 한다 — 즉 외부 reference 구현 150+ 개와 행동 동치가 KPI.

- **사용 환경**: 데스크톱 + 모바일 웹 브라우저. 네이티브 앱 없음.
- **사용자 진입 경로**: 직접 URL · 검색엔진 · 작가 프로필 링크.
- **수익 모델**: 없음(데모/학습용).
- **운영 범위**: 본 조직 내부 + 공개 demo URL 1개 (Gate C에서 인프라 1택 시 확정).

## 2. 사용자 가치

- **Visitor**: 회원 가입 없이도 글·작가·태그를 탐색할 수 있다. SNS의 진입 장벽 최소화.
- **Member-Reader**: Your Feed로 자기 관심 작가의 글만 빠르게 본다. 노이즈 차단.
- **Member-Author**: Markdown으로 글을 작성하고 태그·코멘트·즐겨찾기 피드백을 즉시 받는다. 콘텐츠 출판 사이클이 분 단위.
- **Project Sponsor (내부 toolchain 운영자)**: agent-toolkit 게이트 A/B/C·AI 게이트 6축·branch 전략(ADR-0044)·3 profile 부팅(ADR-0037 v1.1)이 살아 있는 풀스택 도메인에서 회귀 검증된다. 새 ADR 도입 시 본 repo PR로 BLOCK 케이스 확인.

## 3. 기능

### F-01: 인증 (회원가입/로그인/로그아웃)

- **MVP Cut**: ✅ 포함
- **우선순위**: P0
- **사용자 스토리**:
  - As a Visitor, I want to register with username/email/password so that I can become a Member and start writing.
  - As a Member, I want to log in so that I can resume my session across devices.
  - As a Member, I want to log out so that my JWT no longer authorizes requests.
- **Acceptance**:
  - Given valid 입력값이 있을 When Sign up을 누를 When 폼이 제출되면 Then 201 + 토큰 발급 + Member 헤더로 전환된다.
  - Given 기존 자격 증명이 있을 When Sign in을 누를 When 로그인 요청이 처리되면 Then 200 + 토큰 + `/#/`로 이동한다.
  - Given Member가 Settings의 logout을 누를 When localStorage 토큰을 삭제하면 Then 즉시 비로그인 헤더로 전환된다.
- **R-ID 매핑**: R-F-01, R-F-02, R-F-17, R-N-02, R-N-03
- **테스트 시나리오**:
  - 정상(Happy path): 가입 → 자동 로그인 → Settings logout → 헤더 전환 → 재 로그인.
  - 실패(Failure path): 중복 email 가입 시도 → 422 + 폼 에러 / 잘못된 password 로그인 시도 → 422 + invalid 메시지.
- **단위: ✅**
- **통합: ✅**
- **E2E: ✅** (gstack `/qa` 골든패스 — 가입·로그인·로그아웃)

### F-02: 프로필 & 팔로우

- **MVP Cut**: ✅ 포함
- **우선순위**: P0
- **사용자 스토리**:
  - As a Member, I want to update my bio/image/email so that other users see my latest identity.
  - As a Visitor or Member, I want to view another user's profile so that I can see their articles and decide whether to follow.
  - As a Member, I want to follow/unfollow other users so that my Your Feed reflects my interests.
- **Acceptance**:
  - Given Settings 폼에서 bio를 변경 When PUT `/api/user`을 호출하면 Then 200 + Header 프로필 영역에 즉시 반영된다.
  - Given `/#/profile/:username` 열고 Follow When POST `/api/profiles/:username/follow`을 호출하면 Then 버튼이 Unfollow로 전환되고 Your Feed에 해당 사용자 글이 포함된다.
- **R-ID 매핑**: R-F-03, R-F-04, R-F-05
- **테스트 시나리오**:
  - 정상(Happy): bio 수정 → 즉시 반영 / 팔로우 토글 → Your Feed 변화.
  - 실패(Failure): 자기 자신 팔로우 시도 → UI 사전 차단(Edit Profile 버튼만 노출) + 서버측 403 거부 / email 중복 변경 → 422.
- **단위: ✅**
- **통합: ✅**
- **E2E: ✅**

### F-03: 글 에디터 (작성/수정)

- **MVP Cut**: ✅ 포함
- **우선순위**: P0
- **사용자 스토리**:
  - As a Member, I want to publish a markdown article with title/description/tags so that other users can read it.
  - As an article author, I want to edit my own article so that I can correct mistakes.
- **Acceptance**:
  - Given `/#/editor`에서 title/description/body/tagList 입력 When Publish를 누르면 Then 201 + `/#/article/:slug`로 이동한다.
  - Given 본인 글 상세에서 Edit When `/#/editor/:slug`에서 수정 후 Publish를 누르면 Then 200 + 변경이 반영된다.
- **R-ID 매핑**: R-F-09, R-F-10
- **테스트 시나리오**:
  - 정상(Happy): 신규 글 → publish → slug 발급 / 본인 글 수정 → 반영.
  - 실패(Failure): title 누락 → 422 폼 에러 / 타인 글 수정 시도 → 403 거부 또는 본 페이지에 Edit 버튼 미노출.
- **단위: ✅**
- **통합: ✅**
- **E2E: ✅**

### F-04: 글 상세 & 즐겨찾기 & 삭제

- **MVP Cut**: ✅ 포함
- **우선순위**: P0
- **사용자 스토리**:
  - As a Visitor or Member, I want to read an article rendered from markdown so that I can consume content.
  - As a Member, I want to favorite/unfavorite articles so that I can express appreciation and increment favoritesCount.
  - As an article author, I want to delete my article so that it disappears from all feeds.
- **Acceptance**:
  - Given `/#/article/:slug` 열기 When GET을 호출하면 Then markdown 렌더링 + author / createdAt / favoritesCount가 표시된다.
  - Given favorite 버튼 클릭 When POST/DELETE를 호출하면 Then 상태 토글 + 카운트가 갱신된다.
  - Given 본인 글 상세의 Delete 클릭 When DELETE를 호출하면 Then 204 + `/#/`로 이동하며 목록에서 사라진다.
- **R-ID 매핑**: R-F-08, R-F-11, R-F-12
- **테스트 시나리오**:
  - 정상(Happy): 글 읽기 / 즐겨찾기 토글 / 본인 글 삭제.
  - 실패(Failure): 미존재 slug → 404 / 비로그인 favorite 시도 → 401 또는 로그인 페이지 리다이렉트 / 타인 글 삭제 시도 → 403 거부.
- **단위: ✅**
- **통합: ✅**
- **E2E: ✅**

### F-05: 글 목록 (Home + 태그 필터 + 페이지네이션)

- **MVP Cut**: ✅ 포함
- **우선순위**: P0
- **사용자 스토리**:
  - As a Visitor or Member, I want to browse all articles paginated so that I can discover new content.
  - As a Visitor or Member, I want to filter by tag so that I can narrow down to my interest.
- **Acceptance**:
  - Given `/#/` 진입 When GET `/api/articles?limit=10&offset=0`을 호출하면 Then 카드 10개 + articlesCount가 표시된다.
  - Given 사이드바 popular tag를 클릭 When Tab "#tagname"이 추가되고 tag query가 부착되면 Then 해당 태그 글만 표시된다.
  - Given 페이지 하단 번호를 클릭 When offset이 갱신되면 Then 다음 페이지 카드가 표시된다.
- **R-ID 매핑**: R-F-06, R-F-16, R-N-01
- **테스트 시나리오**:
  - 정상(Happy): default 목록 / 태그 필터 / 페이지 전환.
  - 실패(Failure): 잘못된 limit 값 → 422 또는 cap / 네트워크 에러 → 에러 토스트 + 재시도.
- **단위: ✅**
- **통합: ✅**
- **E2E: ✅**

### F-06: 개인 피드 (Your Feed)

- **MVP Cut**: ✅ 포함
- **우선순위**: P1
- **사용자 스토리**:
  - As a Member, I want a feed of articles only from users I follow so that my home page is personalized.
- **Acceptance**:
  - Given 로그인 + 1명 이상 팔로우 When `/#/` 진입 후 Your Feed 탭에서 GET `/api/articles/feed`을 호출하면 Then 팔로우 사용자 글만 최신순으로 표시된다.
- **R-ID 매핑**: R-F-07
- **테스트 시나리오**:
  - 정상(Happy): 팔로우 2명 글 8개 → 통합 표출.
  - 실패(Failure): 팔로우 0명 → 빈 상태 메시지 "No articles are here... yet." / 비로그인 → Your Feed 탭 자체 미노출.
- **단위: ✅**
- **통합: ✅**
- **E2E: ✅**

### F-07: 댓글 (작성·읽기·삭제)

- **MVP Cut**: ✅ 포함
- **우선순위**: P1
- **사용자 스토리**:
  - As a Visitor or Member, I want to read comments on an article so that I can see the discussion.
  - As a Member, I want to post comments so that I can join the discussion.
  - As a comment author, I want to delete my own comment so that I can correct mistakes.
- **Acceptance**:
  - Given 글 상세 하단 When GET `/api/articles/:slug/comments`을 호출하면 Then 댓글 카드 N개가 표시된다.
  - Given Member가 댓글 폼에 본문 입력 후 Post When POST를 호출하면 Then 201 + UI에 즉시 추가된다.
  - Given 본인 댓글의 trash 아이콘 When DELETE를 호출하면 Then 204 + 카드가 제거된다.
- **R-ID 매핑**: R-F-13, R-F-14, R-F-15
- **테스트 시나리오**:
  - 정상(Happy): 댓글 작성·읽기·삭제 전 사이클.
  - 실패(Failure): 빈 본문 → 422 폼 에러 / 비로그인 → 폼 대신 "Sign in to add comments" 링크 / 타인 댓글 삭제 시도 → 403 거부.
- **단위: ✅**
- **통합: ✅**
- **E2E: ✅**

### F-08: 인기 태그 사이드바

- **MVP Cut**: ✅ 포함
- **우선순위**: P2
- **사용자 스토리**:
  - As a Visitor or Member, I want to see popular tags so that I can quickly jump into a topic.
- **Acceptance**:
  - Given Home `/#/` 진입 When GET `/api/tags`을 호출하면 Then 사이드바에 상위 N개 태그 pill이 표시되고 클릭 시 F-05 태그 필터로 분기된다.
- **R-ID 매핑**: R-F-16
- **테스트 시나리오**:
  - 정상(Happy): 태그 N개 → 사이드바 렌더링.
  - 실패(Failure): 태그 0개 → 빈 상태 / GET 실패 → 사이드바 fallback 메시지(데이터 부재로 처리, 본문 글 목록 동작은 영향 없음).
- **단위: ✅**
- **통합: ✅**
- **E2E: N/A** (F-05 골든패스에 사이드바 클릭 흐름 포함되어 별도 E2E 없음)

## 4. MVP Cut 요약

| F-ID | MVP | 비고 |
|---|---|---|
| F-01 | ✅ 포함 | RealWorld 인증 핵심. P0. |
| F-02 | ✅ 포함 | 프로필 + 팔로우. Your Feed 전제. P0. |
| F-03 | ✅ 포함 | 에디터. P0. |
| F-04 | ✅ 포함 | 글 상세 / 즐겨찾기 / 삭제. P0. |
| F-05 | ✅ 포함 | Home 목록 + 태그 필터 + 페이지네이션. P0. |
| F-06 | ✅ 포함 | Your Feed. F-02 의존. P1. |
| F-07 | ✅ 포함 | 댓글. P1. |
| F-08 | ✅ 포함 | 인기 태그 사이드바. P2. |
| (참고) 모바일 앱 | ❌ 제외 | 01-project-brief §5 비목표. 차기. |
| (참고) OAuth 소셜 로그인 | ❌ 제외 | 비목표. JWT email+password 1택. |
| (참고) 이미지 업로드 | ❌ 제외 | RealWorld 공식 스펙도 없음(외부 URL only). |
| (참고) i18n | ❌ 제외 | en-US 1택. |

> **MVP 전체 ✅**: RealWorld 합치율 100%가 본 프로젝트의 인수 기준이므로 F-01~08 모두 포함. 어느 하나라도 빠지면 외부 reference 합치 검증 자동화가 깨진다.

## 5. UX 원칙 / 화면 구성 큰 그림

- **시각 정본**: RealWorld 공식 Bootstrap 4 hand-crafted theme. 본 프로젝트는 stylesheet 솔루션 1택(ADR-0038, 12-scaffolding §8 — Tailwind 또는 CSS Modules 우선 검토)으로 동등 시각을 재현. AI 게이트 5번째 축 하위 체크 "stylesheet 적용 확인" 강제.
- **레이아웃**: Header(브랜드 conduit / Home / 인증 분기 메뉴) + 메인 영역 + Footer(브랜드 + Thinkster 크레딧). 모든 화면 공통.
- **9개 라우트**:
  - `/#/` (Home) — Feed 탭 + 글 카드 + 사이드바 태그.
  - `/#/login`, `/#/register` (인증) — 센터 폼.
  - `/#/settings` (프로필 수정 + 로그아웃).
  - `/#/editor`, `/#/editor/:slug` (에디터).
  - `/#/article/:slug` (글 상세).
  - `/#/profile/:username`, `/#/profile/:username/favorites` (프로필).
- **상태 표시 컨벤션**: 빈 상태 메시지·에러 메시지는 RealWorld 공식 demo 문구 그대로 재현. 토스트/모달 추가는 차기.
- **반응형**: Bootstrap 4 grid 기본. 480px / 768px / 1200px 3 breakpoint.

## 6. 의존성 / 외부 시스템

- **외부 표준**: RealWorld 공식 API spec + frontend 라우트 spec + Bootstrap 4 theme CSS. 본 프로젝트의 모든 시각·API 동작 정본.
- **외부 검증 도구**: 공식 Postman 컬렉션(Newman CLI 회귀), axe-core(접근성), gstack `/qa`(브라우저 골든패스), `act`(GitHub Actions 로컬 검증, ADR-0047).
- **외부 코드 의존**: Bootstrap 4 CSS(CDN 또는 npm), markdown 렌더링 라이브러리 1택(Gate C).
- **내부 의존**: agent-toolkit(`.claude/commands/`, `.claude/schemas/`, `.claude/scripts/`). 본 프로젝트는 toolkit 회귀 케이스를 겸한다.
- **호스팅·인프라**: 후보 Vercel / Railway / 자체 VM — Gate C에서 1택.

## 7. Open Questions

- popular tag 사이드바 상위 N (10? 20? RealWorld demo 추정치 + 결정).
- 댓글 페이지네이션 여부 (RealWorld 공식은 전건 반환 — 본 프로젝트도 동일 추정).
- 글 본문 markdown 렌더링 라이브러리 1택 (Gate C에서 stack에 맞춰 결정).
- 시각 정합 검증 자동화 도구 (visual regression — Percy / Chromatic / playwright-visual 중 차기 검토).
- 페이지네이션의 클라이언트 측 캐싱 정책 (Gate C 결정).
