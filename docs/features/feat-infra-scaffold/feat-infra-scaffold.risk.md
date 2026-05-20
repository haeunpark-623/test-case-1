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

# feat-infra-scaffold — Feature Risk

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — mode=add base scaffold. Low/Med 4건 식별, High 0건 |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
|---|---|---|---|---|
| F-RISK-01 | Docker base image 함정 — UID 1000 충돌 / corepack hang | 3 | 2 | Med |
| F-RISK-02 | `.env.*` 평문 시크릿 실수 commit | 4 | 1 | Med |
| F-RISK-03 | pnpm lockfile 결정성 — 도입자별 pnpm 버전 차이 | 2 | 2 | Low |
| F-RISK-04 | docker-compose stg/prod build 시간 + 디스크 사용 | 2 | 3 | Low |

High 등급 0건. 단계적 롤아웃 N/A.

## 2. 리스크 상세

### F-RISK-01: Docker base image 함정 (ADR-0042)

- **카테고리**: 외부 의존
- **트리거 신호**: `docker build` 시 `useradd: UID 1000 is not unique` 에러 또는 corepack 단계에서 `pnpm install` hang
- **완화 전략**:
  - node:22-alpine 기본 제공 `node` 사용자(UID 1000) 그대로 사용 — `RUN useradd --uid 1000` 추가 금지
  - Dockerfile에 `RUN corepack enable && corepack prepare pnpm@9.15.4 --activate` 명시 — `--activate`로 서명 확인을 build 단계에 끌어옴
  - `package.json packageManager: "pnpm@9.15.4"`와 정합
- **검증 방법**: plan §4 단계 C에서 `docker-compose up --build` 시점에 build log 확인. corepack hang 시 즉시 fail (TTY 없음). LOCAL.md §1.5.4·§5.5 troubleshooting 절차 참조.

### F-RISK-02: 평문 시크릿 실수 commit

- **카테고리**: 보안
- **트리거 신호**: 도입자가 `.env.dev` 등 실 시크릿 파일을 PR에 포함. `git status` untracked 미표시 실패. CLAUDE.md 보안 절대 규칙 1·2·4 위반.
- **완화 전략**:
  - `.gitignore`에 `frontend/.env.{dev,stg,prod}` + `backend/.env.{dev,stg,prod}` 패턴 추가 (commit 1)
  - settings.json PreToolUse 훅이 `.env.*` Write 시도 자동 BLOCK (CLAUDE.md 보안 절대 규칙 5)
  - `.example` 파일에는 placeholder만 (`JWT_SECRET=dev-secret-min-32-chars-aaaaaaaaaa` 등 — 실 32+ 자리지만 운영용 무효 값)
  - P9 code-review가 PR diff에서 시크릿 패턴 grep (`secret=[a-zA-Z0-9]{16,}` 등)
- **검증 방법**: 자동 — `.gitignore` 패턴 grep + AC-07 git status 수동 확인 + code-review

### F-RISK-03: pnpm lockfile 결정성

- **카테고리**: 외부 의존
- **트리거 신호**: 도입자가 pnpm 9 미설치 / 다른 메이저 버전 사용 시 `pnpm install --frozen-lockfile` 실패 또는 lockfile 변동
- **완화 전략**:
  - `package.json packageManager: "pnpm@9.15.4"` 명시 (corepack이 자동 다운로드)
  - LOCAL.md §1에 `corepack enable && corepack prepare pnpm@9.15.4 --activate` 안내
  - CI 도입(이슈 #4) 후엔 `pnpm/action-setup` action으로 버전 강제
- **검증 방법**: 자동 — AC-01 `pnpm install --frozen-lockfile` exit 0 + lockfile diff 0줄

### F-RISK-04: docker-compose stg/prod build 시간

- **카테고리**: 외부 의존
- **트리거 신호**: 매 PR마다 3 profile 부팅 검증 시 stg/prod build (multi-stage) 30~60초 + 디스크 사용 증가
- **완화 전략**:
  - dev profile은 build 미포함 (소스 마운트 hot reload)
  - stg/prod도 build 캐시 layer 활용 — `COPY pnpm-lock.yaml package.json ./` → `RUN pnpm install` 분리로 의존성 캐시
  - Dockerfile multi-stage로 최종 이미지 < 250MB
  - 본 이슈 PR 검증은 1회만 — 후속 PR은 자산 변경 시에만 재 build (ADR-0037 변경 trigger 기반)
- **검증 방법**: plan §4 단계 C에서 build 시간 stderr 측정. 60초 초과 시 retro 항목으로 기록

## 3. High 등급 단계적 롤아웃

해당 없음. 본 이슈는 mode=add base scaffold이고 식별된 High 리스크 0건. 단계적 롤아웃 N/A.

## 4. 데이터 영속성 변경

해당 없음. 본 이슈는 DB schema·migration 미실행 (Prisma 디렉토리 골격만). 외부 DB·파일시스템·캐시 영구 상태 변경 0건. dev volume도 docker-compose down -v로 안전 폐기 가능.

## 5. 15-risk.md 갱신 항목

15-risk.md §3·§4(외부 의존·보안 카테고리)는 이미 시스템 차원에서 본 4 카테고리를 포괄. 본 이슈 F-RISK-01~04는 *feature scope* 한정 — 시스템 차원 15-risk.md 갱신 불요.

후속 ADR-0042 함정이 본 PR에서 실제 발현 시(F-RISK-01) → `docs/planning/adr/0042-*.md` retro 절에 본 PR 사례 추가 (선택).

## 참조

- 상류: `feat-infra-scaffold.{contract,plan,eng-review,acceptance}.md`
- 시스템 차원: `docs/planning/15-risk/15-risk.md` §3·§4
- 정책: ADR-0042 (Docker base image 함정), CLAUDE.md 보안 절대 규칙
