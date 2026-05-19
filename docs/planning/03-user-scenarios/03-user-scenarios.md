---
doc_type: user-scenarios
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

# Conduit (RealWorld Clone) — 사용자 시나리오

<!-- Gate B — 페르소나 1개 표 + UC-NN 사용자 흐름을 정의한다.
     04-srs R-ID·05-prd F-ID가 본 UC에 매핑됨. -->

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-19 | woosung.ahn@bespinglobal.com | 초안 (/flow-init Gate B) |

## 1. 페르소나

| 페르소나 | 역할 | 환경 / 컨텍스트 | 주요 목표 |
|---|---|---|---|
| Visitor (비로그인 방문자) | 글을 읽고 탐색만 함 | 데스크톱·모바일 브라우저, 비로그인 | 글 목록·상세·태그·작가 프로필 둘러보기. 마음에 들면 가입. |
| Member (로그인 사용자) | RealWorld는 Reader·Author 권한을 통합한 단일 사용자 역할 | 로그인 상태, JWT를 localStorage에 보관 | 글 쓰기·읽기·즐겨찾기·팔로우·댓글 등 모든 SNS 활동 |
| (참고) Admin | 본 MVP 범위 외 | — | 별도 백오피스 UI 없음 (01-project-brief §5 비목표) |

> **권한 정책**: RealWorld 공식 스펙은 Member 단일 역할. 글·댓글의 수정·삭제는 *작성자 본인만* 가능 (서버측 인증 + 클라이언트 버튼 노출 제어).

## 2. 사용자 여정 (큰 그림)

```
[Visitor]
   │ 첫 방문 → /#/ (Global Feed)
   │ 글 목록 탐색 / 태그 필터 / 작가 프로필 조회
   ▼
   회원가입 (/#/register) ─ POST /api/users
   ▼
[Member 전환]
   │ 로그인 상태 — Header가 New Article / Settings / 프로필 링크로 전환
   │
   ├── Read 흐름: 글 상세 → 댓글 읽기/작성 → 즐겨찾기 → 팔로우
   ├── Write 흐름: New Article → /#/editor → Publish → /#/article/:slug
   ├── Curate 흐름: Your Feed (팔로우한 사용자 글) ↔ Global Feed
   └── Maintain 흐름: Settings → 프로필 수정 / Logout
```

여정의 끝은 정해져 있지 않음 — Member는 글 작성·소비·관계 형성 사이클을 반복.

## 3. Use Case

### UC-01: Visitor → Member (회원가입)

- **Actor**: Visitor
- **선행**: 미가입 / 미로그인
- **흐름**:
  1. Visitor가 `/#/register`로 이동
  2. username·email·password 입력 후 Sign up 클릭
  3. 서버가 POST `/api/users` 처리 → JWT 발급
  4. 클라이언트가 localStorage에 토큰 저장, Member 헤더로 전환
- **후행**: `/#/`로 리다이렉트, Member 상태
- **실패 흐름**: email 중복 / username 중복 / password 짧음 → 422 + 폼 위 에러 리스트 표출
- **연관**: R-AUTH-01

### UC-02: Member 로그인

- **Actor**: 미로그인 상태의 기존 Member
- **선행**: 가입 완료
- **흐름**: `/#/login` → email + password → POST `/api/users/login` → JWT 발급·저장 → `/#/`로 리다이렉트
- **실패 흐름**: 인증 실패 → 422 + "email or password is invalid" 표출
- **연관**: R-AUTH-02

### UC-03: 글 작성·발행

- **Actor**: Member
- **선행**: 로그인
- **흐름**:
  1. Header "New Article" → `/#/editor`
  2. title / description / body(markdown) / tagList 입력
  3. Publish → POST `/api/articles` → slug 발급
  4. `/#/article/:slug`로 리다이렉트
- **실패 흐름**: title/body 누락 → 422 + 폼 에러 / 인증 만료 → 401 → `/#/login`으로 리다이렉트
- **연관**: R-ART-01

### UC-04: 글 읽기

- **Actor**: Visitor 또는 Member
- **흐름**: `/#/article/:slug` → GET `/api/articles/:slug` + GET `/api/articles/:slug/comments` 병렬 → markdown 렌더링·댓글 표시
- **실패 흐름**: 잘못된 slug → 404 → "Article not found" 메시지
- **연관**: R-ART-02, R-CMT-02

### UC-05: 글 수정·삭제

- **Actor**: Member (작성자 본인만)
- **선행**: 본인이 쓴 글 상세 페이지에서 Edit/Delete 버튼이 노출됨
- **수정 흐름**: Edit → `/#/editor/:slug` → 수정 → PUT `/api/articles/:slug`
- **삭제 흐름**: Delete 클릭 → 확인 → DELETE `/api/articles/:slug` → `/#/`로 리다이렉트
- **실패 흐름**: 타인 글 수정 시도 → 서버 403 거부 / 본 페이지에는 Edit 버튼 자체가 미노출 (이중 방어)
- **연관**: R-ART-03, R-ART-04

### UC-06: 글 목록 탐색 (Global Feed + 태그 필터)

- **Actor**: Visitor 또는 Member
- **흐름**:
  1. `/#/` 진입 → Global Feed 탭 default → GET `/api/articles?limit=10&offset=0`
  2. 사이드바에서 popular tag 클릭 → tab이 "# tagname"으로 추가 → GET `/api/articles?tag=:tag`
  3. 페이지네이션 클릭 → offset 갱신
- **실패 흐름**: 네트워크 실패 → 에러 메시지 + 재시도 버튼
- **연관**: R-ART-05, R-TAG-01

### UC-07: 개인 피드 (Your Feed)

- **Actor**: Member
- **선행**: 로그인 + 1명 이상 팔로우
- **흐름**: `/#/` → Your Feed 탭 → GET `/api/articles/feed?limit=10&offset=0`
- **실패 흐름**: 팔로우한 사용자 0명 → 빈 상태 메시지 "No articles are here... yet."
- **연관**: R-ART-06

### UC-08: 즐겨찾기 add/remove

- **Actor**: Member
- **흐름**: 글 카드 또는 글 상세의 favorite 버튼 클릭 → POST `/api/articles/:slug/favorite` (또는 DELETE)
- **실패 흐름**: 비로그인 클릭 시 `/#/login` 리다이렉트 (또는 버튼 자체 비활성)
- **연관**: R-FAV-01

### UC-09: 팔로우 / 언팔로우

- **Actor**: Member
- **흐름**: 다른 사용자 프로필 페이지 → Follow 버튼 → POST `/api/profiles/:username/follow` (또는 DELETE)
- **실패 흐름**: 자기 자신 팔로우 시도 → 서버 거부 (예외 / 또는 본인 프로필에는 Edit Profile 버튼만 노출)
- **연관**: R-USER-02

### UC-10: 댓글 읽기 / 작성 / 삭제

- **Actor**: 읽기 = Visitor·Member / 작성·삭제 = Member
- **흐름**:
  - 읽기: 글 상세 페이지 하단 → GET `/api/articles/:slug/comments`
  - 작성: 댓글 폼 → POST `/api/articles/:slug/comments`
  - 삭제: 본인 댓글의 trash 아이콘 → DELETE `/api/articles/:slug/comments/:id`
- **실패 흐름**: 빈 댓글 본문 → 422 + 폼 에러 / 타인 댓글 삭제 시도 → 서버 403
- **연관**: R-CMT-01, R-CMT-02, R-CMT-03

### UC-11: Settings (프로필 수정)

- **Actor**: Member
- **흐름**: `/#/settings` → image URL / username / bio / email / 새 password 입력 → Update → PUT `/api/user`
- **로그아웃 흐름**: 같은 페이지의 "Or click here to logout" → localStorage 토큰 삭제 → `/#/`로
- **실패 흐름**: email 중복 → 422 + 에러 / 인증 만료 → 401
- **연관**: R-AUTH-04, R-USER-01

### UC-12: 다른 사용자 프로필 보기

- **Actor**: Visitor 또는 Member
- **흐름**: `/#/profile/:username` → GET `/api/profiles/:username` + GET `/api/articles?author=:username` → My Articles 탭 default / Favorited Articles 탭 → GET `/api/articles?favorited=:username`
- **실패 흐름**: 존재하지 않는 username → 404 → "Profile not found"
- **연관**: R-USER-01, R-ART-05

## 4. 비기능 시나리오

- **성능**: 글 목록 페이지 첫 응답 ≤ 1초 (p95), 글 상세 ≤ 0.8초 (p95). 측정은 LOCAL.md §3 dev profile + Lighthouse / k6 부하 시나리오.
- **보안**: JWT 만료 시 401 → 클라이언트가 토큰 삭제 + `/#/login` 리다이렉트. 비밀번호는 bcrypt 해시. SQL/Markdown XSS 방지(서버측 sanitize).
- **접근성**: 키보드 만으로 모든 핵심 흐름(가입/로그인/글 작성/즐겨찾기) 도달 가능. WCAG 2.1 AA 색대비.
- **가용성**: dev/stg/prod 3 profile 모두 LOCAL.md §3 명령으로 fresh checkout에서 부팅 성공. 부팅 자산 동기 누락 시 PR BLOCK(ADR-0037 v1.1 + ADR-0040).
- **호환성**: 최신 Chrome / Firefox / Safari 2개 메이저 버전. IE 미지원.
- **로깅·관측**: 모든 API 요청에 요청 ID·user ID·status code 구조적 로그. PII는 마스킹.

## 5. Open Questions

- 글 본문 markdown 렌더링 라이브러리 1택 (예: marked / remark / markdown-it) — Gate C에서 결정.
- 글·댓글 슬러그 충돌 정책 (동일 title → 동일 slug 발생 시 suffix 부여 규칙) — Gate C에서 결정.
- 인기 태그 산정 기준 (단순 count vs 최근 7일 가중치) — RealWorld 공식 동작에 맞춰 단순 count 추정. 04-srs §2 R-TAG-01에서 확정.
- 페이지네이션 default limit(10/20) — RealWorld 공식 데모는 10. 본 프로젝트도 10 채택 예정.
