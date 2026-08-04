# ─── 阶段 1: 构建 ───
FROM node:20-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src/
COPY public ./public/
RUN npm run build

# ─── 阶段 2: nginx 托管 ───
FROM nginx:alpine AS runner

# 拷构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 拷 nginx 配置（反代 /api 到后端）
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
