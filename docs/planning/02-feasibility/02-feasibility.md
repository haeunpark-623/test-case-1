---
doc_type: feasibility
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

# Conduit (RealWorld Clone) — Feasibility

<!-- Gate A — 본 산출은 1장 분량 권고 (ADR-0013). 01-project-brief의 목표·리스크를
     "기술·시장·비용·대안" 4축으로 검토하여 추천 결론을 낸다. -->

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-19 | woosung.ahn@bespinglobal.com | 초안 (/flow-init Gate A) |

## 1. 시장·환경 검토

- **외부 표준 확립도**: RealWorld 스펙은 2017년 이후 안정 유지. CodebaseShow 기준 150+ 구현물이 동일 API/UI에 합치 — 후발 참여자 비용↓.
- **외부 reference 가용성**: 공식 데모(https://demo.realworld.io), 공식 Postman 컬렉션, 공식 frontend 라우트·컴포넌트 목록이 무료 공개. 합치 검증 자동화 가능.
- **본 조직 내부 수요**: agent-toolkit의 D-06 PR 게이트·AI 게이트 6축·3 profile 부팅 검증·branch 전략(ADR-0044) 등을 회귀 검증할 "살아 있는" 풀스택 케이스가 필요. RealWorld는 SNS 도메인 표준이라 폭이 적당하다(엔드포인트 ~19 / 화면 ~5).
- **경쟁/대안 도메인**: todo-앱(과소), e-commerce(과대, 결제 PCI 부담), social-feed(RealWorld과 동치) 중 RealWorld가 "공식 인수 기준 + 구현물 풍부"라는 비대칭 이점이 있다.

## 2. 기술 타당성

- **API 합치 검증**: 공식 Postman 컬렉션(Newman CLI로 헤드리스 실행 가능) — CI 회귀 자동화 즉시 가능.
- **UI 합치 검증**: RealWorld는 Bootstrap 4 테마 HTML/CSS를 공식 배포. 본 프로젝트는 stylesheet 솔루션 1택(ADR-0038, 12-scaffolding §8 — Tailwind 또는 CSS Modules 권고)으로 동등 시각 결과 재현. gstack `/qa`로 골든패스 실증.
- **AI 게이트 6축 충족**:
  - 1축 contract 일치: change-contract → SRS R-ID/PRD F-ID 합치.
  - 2축 단위 테스트: vitest/pytest/junit 표준 stack.
  - 3축 통합 테스트: testcontainers 또는 docker compose 기반 DB up.
  - 4축 E2E: Postman/Newman + gstack `/qa` 골든패스.
  - 5축 브라우저 골든패스(ADR-0011) + stylesheet 확인(ADR-0038): RealWorld가 Bootstrap 4 시각 정본 제공 — 검증 기준 명확.
  - 6축 3 profile 부팅(ADR-0037 v1.1) + 부팅 자산 동기(ADR-0040): `.env.{dev,stg,prod}.example`·LOCAL.md §3·migrations·lockfile — 일반 SDLC 패턴, 무리 없음.
- **기술적 미정 사항**: 백엔드/프론트엔드/DB/인프라 stack은 Gate C(/implementation-planner --mode=hld)에서 1택. 본 단계에서는 "어떤 stack이라도 RealWorld 합치 가능"으로 확인.
- **GitHub Actions 로컬 검증(ADR-0047)**: act(nektos/act) 또는 manual reproduction. 일반 Linux 컨테이너 호환 workflow면 act로 충분.

## 3. 비용·리소스 추정

- **인력**: 풀스택 시니어 1명 + agent-toolkit 운영자 1명(시간 부분 투입). 본 환경에서는 Claude 에이전트가 generator, 사용자가 reviewer/approver 역할.
- **기간**: 5주 × ~3 스프린트 = 15 working days net. 01-project-brief §6 일정 기준.
- **외부 비용**: 거의 없음 — 공개 데모 API·공식 Postman 컬렉션·Bootstrap 4 CSS 모두 무료. CI는 GitHub Actions 무료 한도 내. 호스팅은 Vercel/Railway/자체 VM 중 무료~소액 (1만원/월 이내) 옵션 있음.
- **toolkit 회귀 비용 절감 기대치**: 본 프로젝트가 살아 있는 회귀 케이스로 자리 잡으면, toolkit ADR 신설 시마다 본 repo에서 PR 회귀 1회로 검증 가능. 별도 dummy 프로젝트 매번 작성 비용 절감.

## 4. 기대 효과

- **단기**: agent-toolkit의 D-06 게이트 6축·branch 전략·3 profile 부팅 자산 동기를 풀스택 도메인에서 실증. 룰의 BLOCK 케이스 확인.
- **중기**: 신규 멤버 온보딩 시 본 repo로 toolkit 학습 — RealWorld 스펙은 잘 알려져 있어 "도메인은 이해되어 있고, toolkit 사용법만 익히면 된다"는 학습 곡선이 가파르다.
- **장기**: toolkit ADR 회귀 케이스로 영구 유지. 새 stack(예: Rust+Axum) 검증 시 본 SRS/PRD/WBS를 그대로 재사용하여 stack-only 회귀 가능.

## 5. 검토된 대안

| 대안 | 장점 | 단점 | 선택 여부 |
|---|---|---|---|
| **A. RealWorld 풀스택 1택 (본 추천)** | 외부 표준·reference 풍부·검증 자동화 가능·도메인 학습 비용↓ | RealWorld 자체 한계(이미지 업로드 없음 등) | ✅ |
| B. Todo MVC 풀스택 | 가장 단순·빠름 | 너무 단순해 D-06 게이트 6축 회귀 케이스로 빈약(통합·E2E 시나리오 부족) | ❌ |
| C. 자체 도메인(예: 내부 timesheet) | 내부 직접 가치 | 도메인 설계 비용↑·외부 reference 없음·toolkit과 도메인이 동시 변화 시 회귀 noise | ❌ |
| D. E-commerce 클론 | 풍부한 시나리오(결제·재고·배송) | 결제 PCI·세금 등 부수 비용↑·인력 1명으로 5주 비현실 | ❌ |

## 6. 추천

**대안 A (RealWorld 풀스택 1택) 추천**. 근거:

1. 외부 표준이 안정·합치 검증이 자동화 가능 — 본 프로젝트의 사용처(toolkit 회귀)에 정확히 부합.
2. 비용 거의 없음·기간 5주 내 MVP 가능.
3. AI 게이트 6축 모두 외부 reference 기준이 있어 BLOCK 케이스 판단이 명확.
4. 향후 stack 변경 회귀 시에도 SRS/PRD 재사용 가능 — 영구 자산화.

**Gate A 승인 요청**: 본 산출 + 01-project-brief를 함께 검토 후 `/flow-design`으로 진행.
