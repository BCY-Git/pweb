# ─── 阶段 1: 构建 ───
FROM node:20-slim AS builder
WORKDIR /app

# 先拷依赖清单，利用 Docker 层缓存
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src/
RUN npx prisma generate
RUN npm run build

# 生产依赖（剔除 devDependencies）
RUN npm ci --omit=dev

# ─── 阶段 2: 运行 ───
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# 仅拷必要产物
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

# 数据库文件挂载点（持久化）
VOLUME ["/app/prisma"]

EXPOSE 3000

# 启动时执行迁移并 seed，然后起服务
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
