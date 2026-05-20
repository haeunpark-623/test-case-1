# Conduit frontend — multi-stage build → Caddy static serve
# Base: node:22-alpine for build, caddy:2-alpine for runtime
# LOCAL.md §1.5.4 (1) — 베이스 이미지 사전 점유 사용자 그대로

FROM node:22-alpine AS deps
WORKDIR /workspace
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/types/package.json ./packages/types/
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile --filter @conduit/frontend... --filter @conduit/types

FROM node:22-alpine AS build
WORKDIR /workspace
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /workspace/frontend/node_modules ./frontend/node_modules
COPY tsconfig.base.json ./
COPY packages/types ./packages/types
COPY frontend ./frontend
ARG VITE_MODE=prod
RUN pnpm --filter @conduit/frontend build

FROM caddy:2-alpine AS runtime
# caddy:2-alpine의 비루트 사용자 그대로 (nobody 자동 fallback)
COPY --from=build /workspace/frontend/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80 443
