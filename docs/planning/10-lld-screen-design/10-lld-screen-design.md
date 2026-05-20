---
doc_type: screen-design
version: v0.2 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-19
gate: C
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-04, R-F-05, R-F-06, R-F-07, R-F-08, R-F-09, R-F-10, R-F-11, R-F-12, R-F-13, R-F-14, R-F-15, R-F-16, R-F-17, R-N-04, R-N-07]
  F-ID: [F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08]
  supersedes: null
---

# Conduit (RealWorld Clone) — Screen Design (LLD — UI)

> 시각 정본: RealWorld 공식 데모(https://demo.realworld.io) + 공식 Bootstrap 4 hand-crafted theme. 본 LLD는 그 시각을 우리 stack(React + Vite + Bootstrap 4 CSS + CSS Modules)에 매핑.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-19 | woosung.ahn@bespinglobal.com | 재생성 (/flow-design re-run, Phase 2/4) — S-01~09 화면 ID + 디자인 토큰 4종 보존 → 12 §8 매핑 유지 |
| v0.1 | 2026-05-19 | woosung.ahn@bespinglobal.com | 초안 (/flow-design Gate C) — 9 라우트 + 디자인 토큰 |

## 1. 화면 인벤토리

| ID | 화면명 | 진입 트리거 | F-ID 매핑 |
|---|---|---|---|
| S-01 | Home (Global / Your Feed) | `/#/` 직접·로고·Home 메뉴 | F-05, F-06, F-08 |
| S-02 | Login | Header Sign in·`/#/login` | F-01 |
| S-03 | Register | Header Sign up·`/#/register` | F-01 |
| S-04 | Settings | Header username·`/#/settings` | F-01 (logout), F-02 |
| S-05 | Editor (new) | Header New Article·`/#/editor` | F-03 |
| S-06 | Editor (edit) | Article 상세 Edit·`/#/editor/:slug` | F-03 |
| S-07 | Article (글 상세) | 카드 클릭·`/#/article/:slug` | F-04, F-07 |
| S-08 | Profile — My Articles | Header username·`/#/profile/:username` | F-02, F-05 |
| S-09 | Profile — Favorited | S-08 탭·`/#/profile/:username/favorites` | F-02, F-05 |

총 9 화면.

## 2. 화면 상세

### S-01: Home (Global / Your Feed)

- **목적**: Visitor·Member의 첫 도착. 글 카드 + 인기 태그 사이드바.
- **상태**: 비로그인 / 로그인 (Your Feed 탭) / 로딩 / 빈 / 에러 5상태.
- **F-ID 매핑**: F-05, F-06, F-08.
- **R-ID**: R-F-06, R-F-07, R-F-16, R-N-01.
- **와이어프레임**:
  ```
  ┌──────────────────────────────────────────────────────────────┐
  │ [conduit]    Home   Sign in   Sign up        (또는 username) │
  ├──────────────────────────────────────────────────────────────┤
  │           ┌─ Banner: "conduit / A place to share..."        │
  ├──────────────────────────────────────────────────────────────┤
  │ ┌── Your Feed | Global Feed | # tag ────────┐  Popular Tags │
  │ │  [author] @date          ♡ 42  → Article   │  ┌──────────┐│
  │ │  Title (h1)                                │  │ dragons  ││
  │ │  Description                               │  │ training ││
  │ │  Read more...   #dragons #training         │  │ ai       ││
  │ │  ... (cards × 10)  [1] [2] [3] ...         │  └──────────┘│
  │ └────────────────────────────────────────────┘              │
  ├──────────────────────────────────────────────────────────────┤
  │ conduit. © Thinkster. Code & design licensed under MIT.     │
  └──────────────────────────────────────────────────────────────┘
  ```
- **인터랙션**: 탭 클릭 → 쿼리 갱신. ♡ → optimistic toggle (비로그인 → /#/login). 카드 클릭 → S-07. 태그 클릭 → "#tag" 탭. 페이지네이션 → offset.
- **빈 상태**: Your Feed 0건 — "No articles are here... yet.".
- **에러**: GET 실패 → 토스트 + Retry.

### S-02: Login

- **목적**: 기존 Member 로그인.
- **상태**: idle / submitting / error.
- **F-ID 매핑**: F-01.
- **R-ID**: R-F-02, R-N-02.
- **와이어프레임**:
  ```
  ┌──────────────────── [Header] ──────────────────┐
  │                Sign in                         │
  │       Need an account? (link → S-03)           │
  │   ┌─ errors (422 → bullet list) ──────┐        │
  │   │ • email or password is invalid    │        │
  │   └────────────────────────────────────┘        │
  │   [ email                          ]           │
  │   [ password                       ]           │
  │                       [ Sign in ]              │
  └────────────────────────────────────────────────┘
  ```
- **인터랙션**: Sign in → POST /api/users/login → 200 시 토큰 저장 + /#/ / 422 시 errors 표출.

### S-03: Register

- **목적**: Visitor → Member.
- **상태**: idle / submitting / error.
- **F-ID 매핑**: F-01.
- **R-ID**: R-F-01, R-N-03.
- **와이어프레임**:
  ```
  ┌──────────────────── [Header] ──────────────────┐
  │                Sign up                         │
  │       Have an account? (link → S-02)           │
  │   ┌─ errors ──────────────────────────────┐    │
  │   │ • email has already been taken        │    │
  │   └───────────────────────────────────────┘    │
  │   [ Your Name                      ]           │
  │   [ Email                          ]           │
  │   [ Password                       ]           │
  │                       [ Sign up ]              │
  └────────────────────────────────────────────────┘
  ```
- **인터랙션**: Sign up → POST /api/users → 201 → /#/ / 422 → errors.

### S-04: Settings

- **목적**: 본인 프로필 수정 + 로그아웃.
- **상태**: idle / submitting / error (422).
- **F-ID 매핑**: F-01 (logout), F-02 (수정).
- **R-ID**: R-F-03, R-F-17.
- **와이어프레임**:
  ```
  ┌──────────────────── [Header] ──────────────────┐
  │                Your Settings                   │
  │   ┌─ errors ─────────────────────────────┐     │
  │   [ URL of profile picture       ]             │
  │   [ Your Name                    ]             │
  │   [ Short bio about you (text)   ]             │
  │   [ Email                        ]             │
  │   [ New Password (선택)          ]             │
  │                       [ Update Settings ]      │
  │   ─────────────────────────────────────────    │
  │   Or click here to logout.                     │
  └────────────────────────────────────────────────┘
  ```
- **인터랙션**: Update → PUT /api/user → 헤더 즉시 반영. Logout → localStorage 삭제 + /#/.

### S-05: Editor (new article)

- **목적**: 새 글 작성.
- **상태**: idle / submitting / error.
- **F-ID 매핑**: F-03.
- **R-ID**: R-F-09.
- **와이어프레임**:
  ```
  ┌──────────────────── [Header] ──────────────────┐
  │   ┌─ errors ───────────────────────────┐       │
  │   [ Article Title                   ]          │
  │   [ What's this article about?      ]          │
  │   [ Write your article (in markdown) ]         │
  │   [                                  ]         │
  │   [ Enter tags (Enter to add)       ]          │
  │   #dragons #training (chips)                   │
  │                  [ Publish Article ]           │
  └────────────────────────────────────────────────┘
  ```
- **인터랙션**: 태그 Enter → chip. Publish → POST /api/articles → 201 → /#/article/:slug.

### S-06: Editor (edit article)

- **목적**: 본인 글 수정.
- **상태**: loading(초기) / idle / submitting / error / 403(타인 글).
- **F-ID 매핑**: F-03.
- **R-ID**: R-F-10.
- **와이어프레임**: S-05 + 기존 값 prefill.
- **인터랙션**: Publish → PUT /api/articles/:slug → 200 → S-07 (slug 변경 시 새 URL).

### S-07: Article (글 상세)

- **목적**: 글 본문 + 작가 + 즐겨찾기·팔로우·삭제·수정 + 댓글.
- **상태**: loading / loaded / 404 / 본인-글 분기.
- **F-ID 매핑**: F-04, F-07.
- **R-ID**: R-F-08, R-F-11, R-F-12, R-F-13, R-F-14, R-F-15, R-F-05.
- **와이어프레임**:
  ```
  ┌──────────────────── [Header] ──────────────────┐
  │ Banner (dark)                                  │
  │   Title (h1)                                   │
  │   [avatar] @author  @date                      │
  │             [ + Follow ]  [ ♡ Favorite (count) ]                 │
  │   (본인: [ Edit Article ] [ Delete Article ])  │
  ├──────────────────────────────────────────────────────────┤
  │   Article body — markdown sanitized 렌더                   │
  │   #dragons #training                                       │
  │   ─── Author actions repeat ───                            │
  ├──────────────────────────────────────────────────────────┤
  │   Comments (centered, max 720px)                           │
  │   [ Write a comment... (textarea) ]                        │
  │   [avatar] me     [ Post Comment ]                         │
  │   (비로그인: Sign in to add comments)                      │
  │   ┌─ comment card ─────────────────────────┐               │
  │   │ body...                                │               │
  │   │ [avatar] @author @date   🗑 (본인만)    │               │
  │   └────────────────────────────────────────┘               │
  └──────────────────────────────────────────────────────────┘
  ```
- **인터랙션**: Follow 토글 / Favorite 토글 / Edit → S-06 / Delete → 확인 → DELETE → S-01 / Comment Post → 즉시 prepend / 본인 댓글 🗑 → DELETE → 카드 제거.

### S-08: Profile — My Articles

- **목적**: 사용자 프로필 + 본인이 쓴 글 목록.
- **상태**: loading / loaded / 404 / 본인-여부 분기 (본인 Edit Profile, 타인 Follow).
- **F-ID 매핑**: F-02, F-05.
- **R-ID**: R-F-04, R-F-05, R-F-06.
- **와이어프레임**:
  ```
  ┌──────────────────── [Header] ──────────────────┐
  │ User info banner                               │
  │   [avatar 96×96]                                │
  │   username                                      │
  │   bio (italic, muted)                           │
  │                  [ + Follow username ]          │
  │   (본인: [ ⚙ Edit Profile Settings ])             │
  ├──────────────────────────────────────────────────────────┤
  │   ┌── My Articles | Favorited Articles ────┐             │
  │   │  [article card] ... 동일                  │             │
  │   │  [pagination]                             │             │
  │   └─────────────────────────────────────────┘             │
  └──────────────────────────────────────────────────────────┘
  ```
- **인터랙션**: Follow → POST /api/profiles/:username/follow → Unfollow 토글. 탭 → S-09.

### S-09: Profile — Favorited Articles

- **목적**: 같은 사용자의 즐겨찾기 글.
- **상태**: S-08과 동일.
- **F-ID 매핑**: F-02, F-05.
- **R-ID**: R-F-06 (favorited 필터).
- **와이어프레임**: S-08 + 탭 활성화만 다름. GET `/api/articles?favorited=:username`.
- **인터랙션**: S-08과 동일.

## 3. 디자인 시스템 / 토큰

> RealWorld 공식 시각은 Bootstrap 4 hand-crafted theme. 10 §3 토큰 → 12-scaffolding §8 styling 솔루션과 schema-level 연결 (ADR-0038).

### Color

| 토큰 | 값 | 용도 |
|---|---|---|
| `--color-primary` | `#5cb85c` (Bootstrap success) | conduit 브랜드 + 주요 CTA |
| `--color-secondary` | `#373a3c` (Bootstrap dark gray) | 본문·Header bg |
| `--color-neutral-0` | `#ffffff` | 기본 배경 |
| `--color-neutral-100` | `#f3f3f3` | section divider·card bg |
| `--color-neutral-500` | `#818a91` | muted text·meta |
| `--color-danger` | `#b85c5c` | Delete·error |
| `--color-banner-bg` | `#333` | Home·Article banner |
| `--color-banner-text` | `#ffffff` | banner heading |

Primary·secondary·neutral 3종 + danger + banner — Bootstrap 4 정본 합치.

### Typography

| 토큰 | 값 | 용도 |
|---|---|---|
| `--font-family-base` | `"Source Sans Pro", "Helvetica Neue", Arial, sans-serif` | 본문 |
| `--font-family-brand` | `"Titillium Web", sans-serif` | 로고·banner |
| `--font-size-xs` | `0.8rem` | meta·footer |
| `--font-size-sm` | `0.9rem` | tag pill |
| `--font-size-base` | `1rem` | 본문 |
| `--font-size-lg` | `1.5rem` | Article title in card |
| `--font-size-xl` | `2rem` | 페이지 heading |
| `--font-size-display` | `3rem` | Home banner heading |

7단 (3단 BLOCK 충족).

### Spacing

| 토큰 | 값 | 용도 |
|---|---|---|
| `--space-0` | `0` | reset |
| `--space-1` | `0.25rem` (4px) | inline gap |
| `--space-2` | `0.5rem` (8px) | input padding·chip gap |
| `--space-3` | `1rem` (16px) | block gap |
| `--space-4` | `1.5rem` (24px) | section spacing |
| `--space-5` | `3rem` (48px) | banner padding |

6단 (4단 BLOCK 충족) — Bootstrap 4 매핑.

### Component primitives

| 토큰 | 컴포넌트 | 상태 variant |
|---|---|---|
| `--btn-primary` | Button (Sign in/up·Publish·Post) | default / hover / disabled / submitting |
| `--btn-outline-primary` | Button outline (Follow·Favorite 비활성) | default / hover / active |
| `--btn-outline-danger` | Delete (Article·Comment) | default / hover / confirming |
| `--input` | Form control | default / focus / error / disabled |
| `--card` | Article card | default / hover |
| `--tag-pill` | Tag pill | default / outline / active |
| `--banner` | Page banner | default (dark + brand font) |
| `--nav-pills` | Feed/Profile Tabs | default / active |

8 primitive (3 BLOCK 충족). entrypoint stylesheet → 12-scaffolding §8.

## 4. 접근성

- **R-N-04 (WCAG 2.1 AA)**: 색대비 ≥ 4.5:1. focus ring visible. axe-core 통합.
- **키보드 트랩 0건**: 모달 없음(Delete inline 2단). Enter 제출 + Esc reset.
- **label**: 모든 input `aria-label` 또는 `<label htmlFor>`. Settings는 placeholder + 명시 label.
- **alt text**: avatar `<img alt="@username">`. 빈 alt 0건.
- **자동 검증**: gstack `/qa` axe-core 통합. 위반 → AI 게이트 5축 BLOCK.

## 5. Open Questions

- avatar default 이미지 호스트 (https://api.realworld.io default URL vs 자체).
- Article 카드 hover 시 link decoration.
- 모바일 ≤ 480px 사이드바 위치 (현재 collapse).
- Editor 자동 저장 (현 MVP 명시 Publish 1택).
