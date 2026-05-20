---
doc_type: feature-risk
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-20
gate: feature
related:
  R-ID: [R-N-05, R-N-06]
  F-ID: []
  supersedes: null
---

# feat-infra-ci-workflow — Feature Risk

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — CI workflow Med 1 / Low 2 |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
|---|---|---|---|---|
| F-RISK-01 | ci.yml 실행 시간 초과 → PR 머지 지연 | 3 | 2 | Med |
| F-RISK-02 | act 로컬 명령이 GitHub Actions와 미세 차이 | 2 | 2 | Low |
| F-RISK-03 | docker-compose CI smoke 실패로 후속 PR 일괄 차단 | 3 | 1 | Low |

High 0건.

## 2. 리스크 상세

### F-RISK-01: CI 실행 시간 초과

- **카테고리**: 성능
- **트리거 신호**: ci.yml 총 실행 시간 > 10분 → 개발 iteration 지연
- **완화 전략**: pnpm cache (actions/cache@v4) + docker layer cache 활용. Prisma generate engine 다운로드 캐시. dev smoke만 (stg/prod 제외)
- **검증 방법**: 본 PR open 후 GitHub Actions UI에서 실 시간 측정

### F-RISK-02: act 로컬 vs GitHub Actions 미세 차이

- **카테고리**: 호환성
- **트리거 신호**: act에서 PASS하지만 GitHub에서 FAIL (또는 역)
- **완화 전략**: act `catthehacker/ubuntu:act-latest` runner image 사용 (GitHub Actions runner와 가까움). 차이 발견 시 LOCAL.md §5.5 troubleshooting 누적
- **검증 방법**: act dry-run + GitHub Actions 실 실행 결과 매번 비교 (본 PR이 첫 사례)

### F-RISK-03: docker-compose CI smoke 실패로 후속 PR 차단

- **카테고리**: 외부 의존
- **트리거 신호**: ci.yml docker-compose step이 일시적 hiccup으로 fail → 후속 PR 머지 차단
- **완화 전략**: continue-on-error 적용 검토 (단, AI 게이트 6번째 축 의미 약화 — 미적용). step에 retry 명시 (3회). Docker hub rate limit 회피 위해 image pull cache.
- **검증 방법**: CI 안정성 관찰 (1주 미만)

## 3. High 등급 단계적 롤아웃

해당 없음.

## 4. 데이터 영속성 변경

없음 — CI workflow YAML만.

## 5. 15-risk.md 갱신 항목

15-risk.md 시스템 카테고리 포괄. 본 이슈 feature scope 한정.
