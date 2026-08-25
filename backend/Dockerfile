# MonoRepo 根目录作为 Docker build context（见 deploy/docker-compose.yml）
# ─── 阶段 1: 构建 ───
FROM node:20-slim AS builder
WORKDIR /workspace

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 先拷工作区清单，利用 Docker 层缓存
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/package.json
RUN pnpm install --frozen-lockfile --filter @martin-portfolio/api...

COPY tsconfig.base.json ./
COPY backend ./backend
WORKDIR /workspace/backend
RUN pnpm prisma:generate
RUN pnpm build

# 仅导出 API 与其生产依赖，避免把整个 MonoRepo 带入运行镜像
WORKDIR /workspace
RUN pnpm --filter @martin-portfolio/api deploy --prod /app

# ─── 阶段 2: 运行 ───
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# pnpm deploy 已收集 API 源码、构建产物、Prisma schema 与生产依赖
COPY --from=builder /app ./

# 数据库文件挂载点（持久化）
VOLUME ["/app/prisma"]

EXPOSE 3000

# 启动时执行迁移并 seed，然后起服务
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/main.js"]
