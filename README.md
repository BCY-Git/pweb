# Martin's Portfolio

> 个人简历展示站 — 面试官点开链接即可快速了解我的能力与项目。

## 技术栈

- **后端**：NestJS 11 · TypeScript(strict) · Prisma · SQLite(过渡，可迁移 PostgreSQL) · Swagger · helmet
- **前端**：React 18 · TypeScript(strict) · Vite 6 · React Router 6 · Zustand · Framer Motion · lucide-react
- **工程化**：pnpm Workspace · ESLint · Prettier · Docker · GitHub Actions

## 目录结构

```
website/
├── package.json          # 根命令与运行时约束
├── pnpm-workspace.yaml   # MonoRepo 工作区定义
├── pnpm-lock.yaml        # 全仓唯一依赖锁文件
├── tsconfig.base.json    # 前后端共享的 TS 基线
├── backend/              # @martin-portfolio/api（NestJS + Prisma）
├── frontend/             # @martin-portfolio/web（React + Vite）
├── deploy/       docker-compose 部署
└── .github/      CI 工作流
```

## 快速开始

### 环境要求

- Node.js >= 20（见 `.nvmrc`）
- pnpm 11+（Corepack 会自动使用仓库锁定的版本）

### 安装与开发

```bash
# 安装全部工作区依赖（仅首次或锁文件变化后）
corepack enable
pnpm install

# 后端环境变量、数据库初始化
cp backend/.env.example backend/.env
pnpm --filter @martin-portfolio/api db:migrate
pnpm --filter @martin-portfolio/api db:seed

# 同时启动前后端
pnpm dev
# 前端：http://localhost:5173
# 后端：http://localhost:3000，Swagger：/api-docs
```

前端 dev server 已配置代理：`/api` → `http://localhost:3000`，可直接联调。

常用质量命令：`pnpm check`（生成 Prisma Client、lint、类型检查、构建）和 `pnpm test`。

### 生产部署

```bash
cd deploy
docker compose up -d --build
```

## 核心亮点

- **完整全栈链路**：前端 → REST API → Prisma → SQLite，体现 NestJS + React 工程能力
- **规范工程化**：分层架构、全局管道/过滤器/拦截器、Swagger 文档、TS strict、容器化、CI
- **重点项目**：[MindTree](https://github.com/) — 本地优先的 AI 思维导图工作空间（React 19 + Tauri + xyflow，20+ 版本迭代）
