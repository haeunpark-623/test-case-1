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

# Conduit (RealWorld Clone) — Test Design / Regression Test Policy

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-19 | woosung.ahn@bespinglobal.com | 재생성 (/flow-design re-run, Phase 2/4) |
| v0.1 | 2026-05-19 | woosung.ahn@bespinglobal.com | 초안 |

## 1. 회귀 범위

- **외부 합치 회귀 (최상위)**: RealWorld 공식 Postman 컬렉션 19 endpoint 전건. KPI 1=100%. 어떤 회귀라도 PR BLOCK.
- **단위·통합 회귀**: 매 PR `pnpm test:unit` + `pnpm test:int` 전건. flake 즉시 격리.
- **UI 회귀**: gstack `/qa` 5 화면 골든패스 (AI 게이트 5축).
- **부팅 회귀**: 3 profile 부팅 + 자산 정합 lint (AI 게이트 6축).
- **시각 회귀 (선택)**: Bootstrap 4 정본 pixel diff. MVP 수동 + 운영 단계 Percy/Chromatic 검토.

## 2. 자동화 정책

- **CI**: `.github/workflows/ci.yml`. PR open/push 매 트리거.
- **순서**: lint → typecheck → unit → integration → Newman → gstack → coverage → AI 게이트 6축.
- **병렬화**: unit + integration + Newman matrix 병렬. gstack 직렬.
- **로컬 검증 (ADR-0047)**: `act pull_request -W .github/workflows/ci.yml --secret-file .env.act`.
- **flaky 정책**: 1회 fail 후 1회 재시도 (`--retry=1`). 2회 fail BLOCK. flaky → 별 이슈 + `flaky:true` 라벨 (no skip).

## 3. 회귀 트리거

- **매 PR**: 1·2 전체 자동.
- **매 nightly**: Newman 전건을 prod 빌드 대상 (smoke).
- **stack 변경 PR (ADR 동반)**: 회귀 정책 + 01-strategy 도구 재검토.
- **부팅 자산 변경 PR**: 12-scaffolding §6·§7 + LOCAL.md §3·§4 diff 시 AI 게이트 6축 lint (한쪽만 변경 BLOCK).
- **외부 reference 변경 알림 (수동)**: RealWorld 공식 spec/Postman 갱신 시 PR로 흡수 + Newman vendoring.
