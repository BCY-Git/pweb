# Martin's Portfolio

> 个人简历展示站 — 面试官点开链接即可快速了解我的能力与项目。

## 技术栈

- **后端**：NestJS 11 · TypeScript(strict) · Prisma · SQLite(过渡，可迁移 PostgreSQL) · Swagger · helmet
- **前端**：React 18 · TypeScript(strict) · Vite 6 · React Router 6 · Zustand · Framer Motion · lucide-react
- **工程化**：ESLint · Prettier · Husky · lint-staged · Commitlint · Docker · GitHub Actions

## 目录结构

```
website/
├── backend/      NestJS 后端（独立 package）
├── frontend/     React 前端（独立 package）
├── deploy/       docker-compose 部署
└── .github/      CI 工作流
```

## 快速开始

### 环境要求

- Node.js >= 18.18（推荐 20，见 `.nvmrc`）
- npm 10+

### 安装与开发

```bash
# 后端
cd backend
cp .env.example .env
npm install
npm run db:migrate   # 建表
npm run db:seed      # 写入种子数据
npm run dev          # http://localhost:3000，Swagger: /api-docs

# 前端（另开终端）
cd frontend
npm install
npm run dev          # http://localhost:5173
```

前端 dev server 已配置代理：`/api` → `http://localhost:3000`，可直接联调。

### 生产部署

```bash
cd deploy
docker compose up -d --build
```

## 核心亮点

- **完整全栈链路**：前端 → REST API → Prisma → SQLite，体现 NestJS + React 工程能力
- **规范工程化**：分层架构、全局管道/过滤器/拦截器、Swagger 文档、TS strict、容器化、CI
- **重点项目**：[MindTree](https://github.com/) — 本地优先的 AI 思维导图工作空间（React 19 + Tauri + xyflow，20+ 版本迭代）
