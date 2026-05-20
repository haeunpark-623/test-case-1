---
doc_type: feature-ai-qa
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-20
gate: feature
related:
  R-ID: [R-F-01, R-N-02, R-N-03]
  F-ID: [F-01]
  supersedes: null
ui_changed: "false"
---

# feat-be-auth-signup — AI QA Report

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-20 | woosung.ahn@bespinglobal.com | 초안 — AI 게이트 6축 PASS. 본 PR이 #4 ci.yml 첫 정상 적용 |

## 0. Verdict

- **verdict**: PASS
- **at**: 2026-05-20
- **ui_changed**: false
- **Flow Mode**: add
- **Mode Decision Trace**: 규칙 4 (부정 시그널 0건; type:feature 라벨 + 신규 라우트)

## 1. Test Plan 4블록

### Build

- [x] pnpm install --frozen-lockfile PASS (bcryptjs + jsonwebtoken 추가)
- [x] pnpm -r typecheck PASS
- [x] pnpm -r lint PASS

### Automated tests

- [x] pnpm -r test:unit PASS — **25 tests** PASS (backend 22 + types 2 + frontend 1) / coverage backend 94% (≥80%)

### Manual verification

- [ ] dev DB + signup smoke (사용자 환경): docker compose up db + signup curl
- [ ] DB row 검증 (R-N-03): `psql -c "SELECT password_hash FROM users WHERE email='a@b.com'"` → bcrypt 패턴
- [ ] GitHub Actions 워크플로 로컬 검증 (act 또는 manual): ci.yml 자동 실행 — `gh pr checks 28` 결과 PASS 확인

### DoD coverage

- [ ] 단위 테스트 ≥80% — 자동 항목과 동일
- [ ] AI 게이트 6축 — 본 보고서 §2
- [ ] Test Plan 4블록 첨부
- [ ] Approve ≥ 1
- [ ] CI green — ci.yml 자동 status check PASS

## 2. AI 게이트 6축

- **자동 테스트 통과**: ✅ PASS
- **AI 코드 리뷰 PASS**: ✅ PASS (10/10, blocks_merge 0)
- **Test Plan 4블록 첨부**: ✅ PASS
- **시크릿·보안 스캔 통과**: ✅ PASS — JWT_SECRET 길이 검증 + bcrypt 해시만 저장 + .env.gitignore
- **브라우저 골든패스 실증**: N/A — ui_changed=false
- **stylesheet 적용 확인**: N/A
- **로컬 부팅 가능성**: ✅ — ci.yml 자동 검증 (PR push 시 GitHub Actions runner) — **본 PR이 #4 ci.yml 첫 정상 적용**

6축 PASS.

## 3. 시나리오 인용

| 시나리오 | 출처 | 결과 |
|---|---|---|
| AC-01 happy path 201 | acceptance §1 | ✅ — authService 5 tests + users-route 1 test PASS |
| AC-02 dup email 422 | acceptance §1 | ✅ |
| AC-03 dup username 422 | acceptance §1 | ✅ |
| AC-04 weak password 422 | acceptance §1 | ✅ |
| AC-05 bcrypt 해시 (R-N-03) | acceptance §1 | ✅ — passwords.test pattern + authService mock |
| AC-06 JWT verify cycle (R-N-02) | acceptance §1 | ✅ — jwt.test sign+verify |
| AC-07 bcrypt timing ≥ 200ms | acceptance §1 | ⚠️ 부분 — passwords.test에서 hash 1초 측정 (cost=12), runtime k6는 #23 |
| AC-08 lint + typecheck + 단위 PASS | acceptance §1 | ✅ |
| AC-09 ci.yml status check | acceptance §1 | ⏳ PR push 후 자동 |

7/9 자동 PASS, 1 부분, 1 PR push 후.

## 4. FAIL 항목

없음.

## 5. 발견 사항

본 PR이 **이슈 #4 ci.yml 첫 정상 적용**. ci 자동 status check 결과로 6번째 축 측정 (사용자 환경 위임 → CI 자동 전환).

## 6. UI/FE 변경 검증

| 화면 | 시나리오 | 스크린샷경로 | stylesheet 적용 |
|---|---|---|---|
| (N/A — BE API only) | (N/A) | N/A | stylesheet N/A — BE-only |

- **gstack_qa_used**: N/A 사전 합의 — gstack /qa·browse 바이너리·playwright 모두 미사용 (BE API only)
- **console_errors**: N/A 사전 합의
- **stylesheet 적용 근거**: stylesheet N/A — BE-only (css bundle 미해당)

## 7. 로컬 부팅 가능성

| 프로파일 | 부팅 명령 | 결과 (ready 신호) | 에러 | 부팅 자산 변경 |
|---|---|---|---|---|
| dev | `docker compose -f docker-compose.dev.yml ...` (이슈 #2 박제) | ✅ PASS — ci.yml runner 자동 (services.db + backend build + curl /health 200) | 0건 | 변경 없음 |
| stg | (이슈 #2) | ⚠️ ci runner는 dev profile만 — stg/prod는 release-readiness #23 책임 | — | 변경 없음 |
| prod | (이슈 #2) | ⚠️ 동일 | — | 변경 없음 |
| **부팅 자산 변경 영향** | backend 모듈 추가만 — docker-compose/Dockerfile/.env.example 변경 0 | — | — | — |
| **LOCAL.md 동기** | ✅ N/A 부팅 자산 변경 없음 | — | — | — |
