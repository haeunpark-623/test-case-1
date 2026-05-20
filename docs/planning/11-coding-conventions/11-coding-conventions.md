---
doc_type: coding-conventions
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

# Conduit (RealWorld Clone) — Coding Conventions

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-19 | woosung.ahn@bespinglobal.com | 재생성 (/flow-design re-run, Phase 2/4) — 에러 PREFIX 7도메인 + lint 매트릭스 보존 |
| v0.1 | 2026-05-19 | woosung.ahn@bespinglobal.com | 초안 (/flow-design Gate C) — TypeScript 5.5 + React 18 + Fastify 4 + Prisma 5 |

## 1. 명명 규칙

| 항목 | 규칙 | 예 |
|---|---|---|
| 파일명 — TS 모듈 | kebab-case `.ts` | `article-service.ts`, `auth-store.ts` |
| 파일명 — React 컴포넌트 | PascalCase `.tsx` | `ArticleCard.tsx`, `FollowButton.tsx` |
| 파일명 — 테스트 | source.test.ts | `article-service.test.ts` |
| 파일명 — 통합 테스트 | source.int.test.ts | `routes/users.int.test.ts` |
| 파일명 — 타입 선언 | `types.ts` 또는 도메인별 | `article-types.ts` |
| 디렉토리 | kebab-case | `backend/src/services/` |
| 변수 / 함수 | camelCase | `articleService`, `verifyJwt()` |
| React 컴포넌트 / Hook | PascalCase / `useXxx` | `<ArticleCard>`, `useAuth()` |
| 클래스 / 타입 | PascalCase | `class ArticleService`, `interface Article` |
| 상수 (모듈 scope) | UPPER_SNAKE_CASE | `JWT_EXP_SECONDS`, `DEFAULT_PAGE_LIMIT` |
| Enum 값 | PascalCase | `enum Role { Member, Visitor }` |
| Boolean | is/has/should 접두 | `isOwner`, `hasFavorited` |
| Prisma model | PascalCase 단수 | `User`, `Article`, `ArticleTag` |
| DB 컬럼 | snake_case | `password_hash`, `created_at` |
| API 경로 | kebab-case + RESTful 명사 | `/api/articles/:slug/favorite` |
| API 페이로드 키 | camelCase (RealWorld 합치) | `favoritesCount`, `tagList`, `createdAt` |
| 환경 변수 | UPPER_SNAKE_CASE | `DATABASE_URL`, `JWT_SECRET`, `VITE_API_BASE_URL` |
| feature 브랜치 | `<mode>/<slug>-issue-<N>` (ADR-0044) | `feat/article-list-issue-12` |
| 커밋 | Conventional Commits (en, present) | `feat(article): list with tag filter` |
| 이슈 라벨 | `area:<x>`, `priority:<x>`, `status:<x>` | `area:auth`, `priority:high`, `status:in-progress` |

## 2. 에러 코드 PREFIX/SUFFIX

> RealWorld 공식 API는 상태코드 + `{errors: {<field>: ["msg"]}}` shape만 표준화. 본 프로젝트는 *내부 식별자*를 PREFIX로 부착해 로그/디버깅. 사용자 노출 메시지는 RealWorld 합치 유지.

| 도메인 | PREFIX | 예 |
|---|---|---|
| Auth | `E_AUTH_` | `E_AUTH_INVALID_CREDENTIALS`, `E_AUTH_TOKEN_EXPIRED`, `E_AUTH_DUPLICATE_EMAIL` |
| User | `E_USER_` | `E_USER_NOT_FOUND`, `E_USER_CANNOT_FOLLOW_SELF`, `E_USER_EMAIL_TAKEN` |
| Article | `E_ART_` | `E_ART_NOT_FOUND`, `E_ART_FORBIDDEN`, `E_ART_TITLE_BLANK`, `E_ART_BODY_BLANK` |
| Comment | `E_CMT_` | `E_CMT_NOT_FOUND`, `E_CMT_BODY_BLANK`, `E_CMT_FORBIDDEN` |
| Tag | `E_TAG_` | `E_TAG_DB_FAIL` |
| Validation | `E_VAL_` | `E_VAL_LIMIT_EXCEEDED`, `E_VAL_SCHEMA_MISMATCH` |
| Infrastructure | `E_INF_` | `E_INF_DB_CONNECT`, `E_INF_CORS_BLOCKED`, `E_INF_INTERNAL` |

코드 사용 규칙:
- 서버 throw: `class AppError extends Error { code: string; status: number; details: Record<string, string[]> }`. `errorHandler` plugin이 `code`를 로그에 기록, 사용자에게는 RealWorld 합치 메시지만.
- 코드 추가는 `backend/src/lib/error-codes.ts`의 enum/const map에 등록. 임시 문자열 throw 금지.
- 클라이언트는 status code + `errors` payload만 분기 (code 의존 금지).

## 3. 언어 관용구

**TypeScript 5.5+ (양 layer 공통)**
- `strict: true` + `noUncheckedIndexedAccess: true`. `any` 0건 (`unknown` 사용).
- 모듈: ESM (`"type": "module"`). `.js` 확장자 imports.
- `as const`로 readonly. `satisfies`로 타입 + 추론 동시.
- Discriminated union으로 상태/에러 (`type Result<T> = { ok: true; data: T } | { ok: false; error: AppError }`).
- 함수형: 변이 최소화. Array spread/`map`/`filter`. for-of는 `await` 시퀀스에만.
- async/await 1택. Promise chain 금지 (fire-and-forget logger 예외).
- 모듈은 named export 1택 (default 금지 — 트리쉐이킹·rename 안정성).

**Fastify (BE)**
- 라우트는 `app.register(plugin)` 패턴. 각 도메인 1 plugin (`usersPlugin`, `articlesPlugin`).
- schema validation은 JSON Schema (Fastify native, ajv). zod는 FE 폼 전용.
- 비동기 핸들러는 throw로 에러 표현. 전역 `setErrorHandler`가 `AppError` → RealWorld payload 변환.
- DB는 `services/*Service.ts`에 격리. 라우트 핸들러는 *얇은* 어댑터.

**React 18 (FE)**
- 함수 컴포넌트 + Hook 1택.
- 상태: zustand (Auth + Article cache). Redux 미도입.
- 데이터 페칭: 자체 `useApi` + AbortController.
- 라우팅: React Router 6 + HashRouter.
- Effect 비동기: IIFE 감싸기.
- 폼: react-hook-form + zod resolver. 서버 422 → `setError`.

**Prisma 5**
- 단일 schema (`backend/prisma/schema.prisma`). model PascalCase 단수.
- 트랜잭션은 `prisma.$transaction([...])` 또는 interactive.
- `include` 깊이 ≤ 2. 깊은 join은 raw SQL + 단위 테스트 보호.

## 4. 주석 정책

- **기본**: 주석 안 쓴다. 이름이 자명하다면.
- **써야 할 때 (WHY 한정)**: 비자명한 비즈니스 룰, 외부 spec 호환 강제, 의도된 함정 회피 (예: bcrypt cost=12 — R-N-03 timing).
- **금지**: 코드 설명 주석, TODO without owner+issue, "added for X feature" history 주석.
- **JSDoc**: 외부 export(`@conduit/types`)의 public type/function에만.
- **파일 헤더**: 금지.
- **TODO**: `// TODO(<issue-N>): <what>` 형식만.

## 5. Lint·포맷

| 도구 | 룰셋 | 자동 강제 |
|---|---|---|
| ESLint 9 | `@typescript-eslint/recommended-type-checked`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-import` | `pnpm lint` + pre-commit + CI `lint` job |
| Prettier 3 | default + `printWidth: 100`, `singleQuote: true`, `semi: true`, `trailingComma: all` | `pnpm format` + pre-commit (husky) + CI --check |
| TypeScript 5.5 | `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true` | `pnpm typecheck` + CI tsc --noEmit |
| Stylelint 16 | `stylelint-config-standard` + CSS Modules | `pnpm lint:css` + CI |
| EditorConfig | `indent_style=space, indent_size=2, end_of_line=lf, charset=utf-8, insert_final_newline=true, trim_trailing_whitespace=true` | IDE + pre-commit |
| markdownlint | `md*` (line-length disabled — 산출 문서는 가드 외) | `pnpm lint:md` |
| Newman (CI) | RealWorld 공식 Postman 회귀 | CI `e2e:api` job |

## 6. Import 정책

- **named export 1택**.
- **모듈 경로**:
  - 외부: `import { Foo } from 'pkg'`
  - 내부 절대 (tsconfig paths): `@/services/articleService` (backend) · `@/components/ArticleCard` (frontend)
  - 공유: `@conduit/types`
  - 상대: 같은 디렉토리 형제만. `../../` 2단 이상 금지.
- **순서** (`eslint-plugin-import/order`):
  1. node builtin (`node:fs`)
  2. 외부 (`fastify`, `react`)
  3. 내부 절대 (`@/...`, `@conduit/types`)
  4. 상대 (`./...`)
  - 각 그룹 빈 줄 1.
- **type-only**: `import type { Foo } from '...'` 권장.
- **circular import**: eslint-plugin-import `no-cycle` BLOCK.
