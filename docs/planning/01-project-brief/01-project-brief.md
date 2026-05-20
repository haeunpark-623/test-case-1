---
doc_type: brief
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-19
gate: A
related:
  R-ID: []
  F-ID: []
  supersedes: null
---

# Conduit (RealWorld Clone) — Project Brief

<!-- 본 산출은 https://realworld-docs.netlify.app/introduction/ 기반.
     RealWorld는 "다양한 프론트엔드·백엔드 조합으로 같은 Medium.com 클론을 만든다"는
     커뮤니티 표준 스펙이다. 본 프로젝트는 그 스펙을 충족하는 단일 풀스택 구현물(Conduit)을 만든다. -->

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-19 | woosung.ahn@bespinglobal.com | 초안 (/flow-init Gate A) |

## 1. 한 줄 정의

**Conduit** — RealWorld 표준 API/UI 스펙을 충족하는 Medium.com 클론 풀스택 애플리케이션. 사용자가 글을 쓰고·읽고·태그하고·팔로우하는 기본 SNS 블로깅 흐름을 제공한다.

## 2. 배경 / 문제 정의

- **배경**: 풀스택 학습·검증용 데모는 흔히 "todo 앱" 수준에 머문다. RealWorld 스펙은 인증·CRUD·관계·피드·검색·페이지네이션 등 실서비스에 가까운 도메인을 담은 표준을 제시한다.
- **문제**: 본 조직 내부에 풀스택 SDLC(요구→설계→구현→검증→배포→운영) 토이 도메인이 없어, 새 toolchain·convention·gate 정책의 회귀 검증과 신규 멤버 온보딩이 매번 단발적이다.
- **해결**: 잘 정의된 외부 표준(RealWorld)에 맞춰 Conduit을 구현하면, ①도메인 설계 비용을 최소화하고 ②외부 reference 구현 150+ 개와 행동 동치성을 비교 검증하며 ③툴킷(`agent-toolkit`)·게이트(A/B/C)·AI 게이트 6축의 살아 있는 회귀 케이스를 확보한다.

## 3. 핵심 사용자 / 이해관계자

- **End User (Reader)**: 글을 읽고 태그·작가로 탐색, 마음에 들면 즐겨찾기/팔로우.
- **End User (Author)**: 글을 작성·수정·삭제, 자기 글에 달린 댓글을 관리.
- **Visitor (비로그인)**: 글 목록·상세·태그·작가 프로필을 회원 가입 없이 둘러본다.
- **Project Sponsor (내부)**: 본 조직의 toolchain·gate 정책 책임자(woosung.ahn@bespinglobal.com 외 1인). RealWorld 스펙 합치를 인수 기준으로 본다.
- **개발/검수자**: agent-toolkit 게이트 A/B/C·AI 게이트 6축을 검증할 엔지니어.

## 4. 목표 (성공 정의)

| KPI | 측정 방법 | 목표값 | 달성 시점 |
|---|---|---|---|
| RealWorld API spec 합치율 | 공식 Postman 컬렉션 + Newman 자동 회귀 | 100% (필수 엔드포인트 19개 전부 PASS) | MVP v1.0 머지 시점 |
| RealWorld Frontend spec 합치율 | 공식 라우트·컴포넌트 체크리스트 + gstack `/qa` 골든패스 | 100% (라우트 8개·핵심 화면 5개 PASS) | MVP v1.0 머지 시점 |
| 테스트 라인 커버리지 (BE + FE 통합) | vitest --coverage / pytest-cov / jacoco 등 stack별 | ≥ 80% | MVP v1.0 머지 시점 |
| AI 게이트 6축 통과율 (PR 단위) | qa-test --ai 자동 산출 (D-06 1단) | 100% (FAIL 시 PR 차단) | MVP v1.0 도달까지의 모든 PR |
| dev/stg/prod 3 profile 부팅 검증 | LOCAL.md §3 명령으로 fresh checkout에서 ready 신호 + 에러 0건 | 3 profile 모두 통과 | 매 PR (ADR-0037 v1.1) |

## 5. 비목표 (Out of Scope)

- **모바일 네이티브 앱**: RealWorld 모바일 스펙은 별도이며 본 프로젝트는 웹 풀스택 1택으로 한정. RWD(반응형 웹)는 포함.
- **결제·구독·광고**: 원본 Medium.com과 달리 무료·익명·무광고. 결제/구독 시스템 없음.
- **소셜 로그인 (OAuth)**: 본 MVP는 email+password JWT 1택. Google/GitHub OAuth는 차기.
- **이미지 업로드 / 첨부 파일**: 기사 본문은 Markdown text + 외부 이미지 URL only. 파일 업로드 없음 (RealWorld 공식 스펙도 동일).
- **실시간 알림 / WebSocket**: 폴링 기반 새로고침. WebSocket·SSE 없음.
- **다국어 (i18n)**: en-US 1택. 한국어는 docs/PR/주석 한정, UI는 영문.
- **관리자(Admin) 백오피스**: 별도 admin UI 없음. DB 직접 접근으로 운영.

## 6. 일정 (대략)

- Gate A 통과: 2026-05-19 (본 산출 + 02-feasibility 검토 후)
- Gate B 통과: 2026-05-21 목표 (03·04·05 산출 합의)
- Gate C 통과: 2026-05-26 목표 (06~13 설계 산출 + 코딩 규약 합의)
- WBS·sprint-bootstrap: 2026-05-27 목표 (14·15 + GitHub Milestone/Issue 등록)
- MVP v1.0 머지: 2026-06-30 목표 (5주 스프린트 × ~3 sprint, 19 API 엔드포인트 + 핵심 5 화면 합치)

> 산정 근거: RealWorld는 외부 reference 구현이 풍부해 도메인 모델 비용이 낮음. 시간 대부분은 toolchain/gate 정합 검증과 AI 게이트 6축 충족에 투입된다.

## 7. 리스크 (초기 식별)

- **R-EARLY-01 — RealWorld 공식 spec 모호 영역 (필드 정의·에러 페이로드 등)**: 공식 문서가 일부 필드/에러 케이스를 미명시. 02-feasibility §1·§2에서 reference 구현(특히 Node Express + React) 1~2개 본으로 대조하여 결정. 대응 시점: Gate A.
- **R-EARLY-02 — UI/FE 검증 비용**: AI 게이트 5번째 축(브라우저 골든패스)이 매 PR마다 gstack `/qa` 호출을 강제. FE 회귀가 잦으면 검증 시간이 누적. 대응: 페이지·컴포넌트별 골든패스 시나리오를 03-user-scenarios에 미리 못 박아 자동 회귀화.
- **R-EARLY-03 — 3 profile 부팅 자산 동기 누락**: ADR-0037 v1.1 + ADR-0040으로 `.env.{dev,stg,prod}.example`·migrations·LOCAL.md §3가 매 PR 동기 갱신 강제. 누락 시 PR BLOCK. 대응: 12-scaffolding §5 + LOCAL.md §3을 Gate C에서 SoT로 일찍 확정.
- **R-EARLY-04 — 외부 reference와 행동 차이 발견 시 회귀**: 본 구현이 RealWorld 공식 Postman + frontend 체크리스트는 통과하지만, "동일 사용자 경험"에서 미세 차이가 날 수 있음. 대응: 04-srs §2 R-ID에 reference 구현 동치성 시나리오를 Happy/Failure 모두 명시.

## 8. Open Questions

- 본 프로젝트의 백엔드 언어/프레임워크 1택 (Gate C에서 확정. 후보: Node+Express+TS / Python+FastAPI / Java+Spring Boot 중 1).
- 본 프로젝트의 프론트엔드 언어/프레임워크 1택 (Gate C 확정. 후보: React+Vite+TS / Vue+Vite+TS / SvelteKit 중 1).
- 데이터베이스 1택 (Gate C 확정. 후보: PostgreSQL / SQLite / MariaDB).
- 인프라 1택 (Gate C 확정. 후보: 단일 컨테이너 + Caddy / Vercel + Railway / 자체 VM).
- `priority:high` 라벨로 처리할 hotfix 시나리오를 RealWorld 도메인에서 어떻게 정의할지 (운영 단계 결정).
