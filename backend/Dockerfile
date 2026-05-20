# Conduit backend — multi-stage build
# Base: node:22-alpine (사전 점유 비루트 사용자 'node' UID 1000 사용 — LOCAL.md §1.5.4 (1))

FROM node:22-alpine AS deps
WORKDIR /workspace
# corepack pnpm 9.15.4 버전 핀 (LOCAL.md §1.5.4 (2) — hang 방지 위해 --activate)
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/types/package.json ./packages/types/
COPY backend/package.json ./backend/
RUN pnpm install --frozen-lockfile --filter @conduit/backend... --filter @conduit/types

FROM node:22-alpine AS build
WORKDIR /workspace
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /workspace/backend/node_modules ./backend/node_modules
COPY tsconfig.base.json ./
COPY packages/types ./packages/types
COPY backend ./backend
RUN pnpm --filter @conduit/backend build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# node:22-alpine 사전 점유 'node' 사용자 (UID 1000) 사용 — useradd 추가 금지 (ADR-0042)
USER node
COPY --from=build --chown=node:node /workspace/backend/dist ./dist
COPY --from=build --chown=node:node /workspace/backend/package.json ./package.json
COPY --from=deps  --chown=node:node /workspace/node_modules ./node_modules
COPY --from=deps  --chown=node:node /workspace/backend/node_modules ./backend_node_modules
EXPOSE 4000
CMD ["node", "dist/server.js"]
