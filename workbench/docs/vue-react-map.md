# Vue → React 对照地图

以这个工作台的真实代码为例。左列是你熟的 Vue 3，右列是它在 React 里的样子。

## 心智模型的一句话差异

- **Vue**：数据是响应式的。改数据，模板自动更新。
- **React**：数据是快照。调用 set 函数要"新数据"，React 才重新渲染。
- 一句话：Vue 改 `.value` 就完事；React 永远造新对象换旧对象（不可变更新）。

## 核心对照表

| 你要干的事 | Vue 3 | React（本项目在哪） |
|---|---|---|
| 组件 | `.vue` 单文件组件 | 返回 JSX 的函数，可同文件共存（`src/ui.tsx`） |
| 响应式数据 | `ref(0)` / `reactive({})` | `useState`（`Todos.tsx` 的 `title`） |
| 读/写 | `title.value` 直接改 | `title` 只读，`setTitle(x)` 换值 |
| 派生数据 | `computed(() => ...)` | 渲染时直接算，贵就用 `useMemo`（`Learning.tsx` 的 `mine`） |
| 副作用 | `watch(dep, cb)` / `onMounted` | `useEffect(fn, [deps])`（`Daily.tsx` 日期变化回填） |
| 双向绑定 | `v-model="title"` 一行 | `value={title}` + `onChange` 自己接线（`Todos.tsx`） |
| 条件渲染 | `v-if` / `v-show` | `{cond && <X/>}` 或三元（`Todos.tsx` 的过期徽章） |
| 列表渲染 | `v-for="t in todos" :key="t.id"` | `todos.map(t => <X key={t.id}/>)` |
| 事件 | `@click="add"` / `@click.stop` | `onClick={add}` / `e.stopPropagation()`（`Jobs.tsx`） |
| 插槽 | `<slot>` | `props.children`（本项目没用，布局用的 `<Outlet/>` 是 Router 的） |
| 路由 | `vue-router`：`app.use(router)` + `<router-view>` | `react-router-dom`：`<BrowserRouter>` 包裹 + `<Routes>`（`main.tsx`/`App.tsx`） |
| 路由跳转 | `<router-link to>` | `<Link to>`（`Dashboard.tsx`） |
| 活跃菜单样式 | `router-link-active` 自动类 | `<NavLink>` 自动加 `active` 类（`App.tsx`） |
| 全局状态 | Pinia | 本项目没有；小项目用 props/Context 就够 |
| 生命周期 | `onMounted` | `useEffect(fn, [])` —— 空依赖数组 = 只跑一次 |
| 请求 | axios + onMounted 里调 | `fetch` 封装 + 自定义 Hook（`useFetch.ts`） |

## React 容易踩的坑（对应 Vue 直觉）

1. **直接改 state 不生效**
   `todos.push(x)` 在 React 里没用。要 `setTodos([...todos, x])` —— 造新数组。
   （`Jobs.tsx` 的 `setForm(f => ({...f, [k]: v}))` 就是这个套路）

2. **useEffect 依赖数组**
   `[date]` 表示 date 变了才重跑。忘写依赖 = 闭包里永远是旧值。
   Vue 的 watch 自动追踪，React 要你手动列。

3. **每次渲染整个函数重跑**
   函数组件每次渲染都从头执行一遍，所以 `useState` 之后的局部变量不跨渲染。
   要跨渲染记住 → `useRef`（本项目 `useFetch.ts` 用它防竞态）。

4. **key 的作用和 Vue 一样**
   列表项必须有稳定 `key`，不然复用错节点。

5. **异步请求竞态**
   Vue 里快速切换路由，旧请求晚到也会覆盖数据。`useFetch.ts` 用 `seqRef` 编号，
   只让最新一次请求写入 —— 这个问题 Vue 也有，只是 composable 里同样要自己防。

## 这个项目的数据流（一句话版）

```
页面组件 useFetch(path) ──GET──▶ Express(/api/*) ──▶ SQLite(data/workbench.db)
     ▲                                                    │
     └────────── 操作后调 reload() 重新拉 ◀── POST/PUT/DELETE ──┘
```

没有全局状态、没有缓存层：改完就 `reload()` 重拉列表。数据量小，简单可靠。
以后页面多了、重拉烦了，再上 TanStack Query（React 生态标准答案）。

## `pnpm lint` 的 5 个 warning：全是真的，别急着消

 oxlint 零 error、5 个 warning。每一个都是 React 官方文档重点讲的陷阱，留着对照学：

1. **`set-state-in-effect`（useFetch / Daily / Jobs）** — 在 effect 里同步 `setState` 会触发"渲染→effect→再渲染"连锁。
   官方推荐：能在渲染时直接算出来的就别存 state（"derived state"）。Daily 的"选日期回填编辑器"就是典型——
   Vue 里 `watch` 一下很自然，React 会提醒你换个思路（比如用 `key={date}` 让组件重挂载）。
2. **`purity`（Learning 的 `Date.now()`）** — 渲染期间应保持纯函数，`Date.now()` 每次渲染结果都可能不同。
   规范做法是把"今天"作为参数/状态传进来，而不是渲染时现取。
3. **`only-export-components`（ui.tsx）** — Fast refresh 要求一个文件只导出组件；混了工具函数后热更新会整页刷新。小事。

为什么留着不修：修掉它们要把代码翻复杂（key 重置、状态提升），初学阶段先看懂"React 为什么会警告"比写出无警告代码更重要。等你能不假思索说出每条的修法，就毕业了。
