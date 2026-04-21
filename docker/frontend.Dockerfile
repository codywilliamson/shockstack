FROM node:25-alpine AS base
RUN npm install -g --force corepack && corepack enable
WORKDIR /app

FROM base AS development
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY frontend/package.json frontend/
COPY packages/ packages/
RUN pnpm install
COPY frontend/ frontend/
RUN pnpm --filter @shockstack/tokens build

FROM base AS build
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY frontend/package.json frontend/
COPY packages/ packages/
RUN pnpm install --frozen-lockfile
COPY frontend/ frontend/
RUN pnpm --filter @shockstack/tokens build
RUN pnpm --filter frontend build

FROM base AS production
RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup
COPY --from=build /app/frontend/dist /app/dist
COPY --from=build /app/frontend/package.json /app/
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
