# 个人工作台

本地个人工作台：求职追踪 · 每日记录 · 学习打卡 · 待办 · 项目看板。

## 用法

```bash
pnpm dev        # 一条命令：Express(3001) + Vite(5173)，浏览器开 http://localhost:5173
```

数据在 `data/workbench.db`（SQLite），删掉它重启即恢复种子数据。

## 结构

- `server/` — Express + better-sqlite3，REST API，`db.js` 建表+种子，`index.js` 路由
- `src/` — React 19 + Vite + TS，`pages/` 六个页面，`useFetch.ts` 数据获取
- `docs/vue-react-map.md` — Vue → React 对照地图（学习用）
