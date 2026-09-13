import { useEffect, useState } from 'react'
import { NavLink, Outlet, Route, Routes } from 'react-router-dom'
import { apiGet } from './api'
import LoginGate from './LoginGate'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import Daily from './pages/Daily'
import Learning from './pages/Learning'
import Todos from './pages/Todos'
import Projects from './pages/Projects'

// Vue Router 的 routes 数组 → React Router 的 <Routes> 声明式写法。
// 布局型路由：父 <Route element={<Layout/>}> 没有 path，子路由渲染进它的 <Outlet/>（≈ <router-view/>）。
const NAV = [
  { to: '/', label: '今天', end: true },
  { to: '/jobs', label: '求职' },
  { to: '/daily', label: '记录' },
  { to: '/learning', label: '学习' },
  { to: '/todos', label: '待办' },
  { to: '/projects', label: '项目' },
]

function Layout() {
  // 门口先探登录态：null=检查中，false=未登录只给登录门，true 才渲染工作台。
  // 探测用的是 /api/me —— 它也在后端的锁后面，401 就是"没钥匙"。
  const [authed, setAuthed] = useState<boolean | null>(null)
  useEffect(() => {
    apiGet('/me').then(() => setAuthed(true)).catch(() => setAuthed(false))
  }, [])

  if (authed === null) return <div className="loading">载入中</div>
  if (!authed) return <LoginGate onOk={() => setAuthed(true)} />

  return (
    <div className="app">
      {/* 顶部纸面导航，替代原来的深色侧边栏 —— 后者是 admin 语言的标志 */}
      <header className="topbar">
        <div className="wordmark">工作台</div>
        <nav>
          {/* NavLink 的 active 类 ≈ Vue Router 的 router-link-active；end 表示"/"只在精确匹配时高亮 */}
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="daily" element={<Daily />} />
        <Route path="learning" element={<Learning />} />
        <Route path="todos" element={<Todos />} />
        <Route path="projects" element={<Projects />} />
      </Route>
    </Routes>
  )
}
