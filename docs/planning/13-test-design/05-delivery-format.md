---
doc_type: test-design
version: v0.2 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-19
gate: C
related:
  R-ID: []
  F-ID: []
  supersedes: null
---

# Conduit (RealWorld Clone) — Test Design / Customer Delivery Format

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-19 | woosung.ahn@bespinglobal.com | 재생성 (/flow-design re-run, Phase 2/4) |
| v0.1 | 2026-05-19 | woosung.ahn@bespinglobal.com | 초안 |

## 1. 산출 범위 (단위·통합·E2E 시나리오)

- **고객/관계자 납품 대상**: 본 프로젝트는 외부 고객 납품이 아니라 *toolkit 회귀 케이스*. "고객"은 본 조직 내부 toolchain 운영자.
- **납품 산출**:
  - 단위·통합 — Vitest lcov + HTML coverage (`coverage/index.html`) + JSON summary.
  - E2E (API) — Newman HTML/JSON report (`tests/reports/newman-<date>.html`).
  - E2E (UI) — gstack `/qa` HTML + 스크린샷 (`docs/features/<slug>/screenshots/`).
  - 부팅 검증 — AI 게이트 6축 자동 보고서 (PR body 통합).

## 2. 포맷·도구 (HTML/XLSX/Allure 등)

- **HTML 1택**: vitest lcov + Newman HTML + gstack HTML. XLSX/Allure 미도입 (운영 단계 ADR).
- **CI artifact**: GitHub Actions `actions/upload-artifact` 30d 보관.
- **PR body 통합**: D-06 Test Plan 4블록 — `/qa-test --human` 자동 생성.
- **외부 가독성 (Sponsor)**: `docs/features/<slug>/test-report.md` 1장 (feature별).

## 3. 시나리오 ID 채번 규칙

- **시나리오 ID 채번**:
  - 단위: `TC-<MODULE>-<NN>` — `TC-AUTH-01`, `TC-ART-12`.
  - 통합: `IT-<MODULE>-<NN>` — `IT-USERS-01`.
  - E2E (API): `E2E-API-<NN>` — Newman request id와 1:1.
  - E2E (UI): `E2E-UC-<NN>` — 03 UC-NN과 1:1.
  - UC ID prefix: `UC-`, `SC-`, `TC-`, `IT-`, `E2E-` 5종.
- **번호 부여**: 모듈 내 차순. 삭제·skip은 *deprecated* + 사유 + 후속 ID.

## 4. 전달 시점 (스프린트 종료·릴리스·고객 요청)

- **전달 시점**:
  - **매 PR**: D-06 Test Plan 4블록 + CI artifact.
  - **스프린트 종료**: `docs/planning/retro/sprint-NN-test-summary.md` (수동, retro skill).
  - **릴리스 (MVP v1.0+)**: `docs/releases/v<x.y.z>-test-report.md`에 Newman + axe-core 박제.
  - **고객 요청 (임시)**: CI artifact 30d가 1차 source.
- **승인**: D-06 휴먼 게이트 (`/qa-test --human`) → `tested` 라벨 → 머지 가능.
