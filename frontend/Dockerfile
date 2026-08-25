# MonoRepo 根目录作为 Docker build context（见 deploy/docker-compose.yml）
# ─── 阶段 1: 构建 ───
FROM node:20-slim AS builder
WORKDIR /workspace

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/package.json
RUN pnpm install --frozen-lockfile --filter @martin-portfolio/web...

COPY tsconfig.base.json ./
COPY frontend ./frontend
WORKDIR /workspace/frontend
RUN pnpm build

# ─── 阶段 2: nginx 托管 ───
FROM nginx:alpine AS runner

# 拷构建产物
COPY --from=builder /workspace/frontend/dist /usr/share/nginx/html

# 拷 nginx 配置（反代 /api 到后端）
COPY --from=builder /workspace/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
