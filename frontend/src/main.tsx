import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App'
import { GlowCursor } from './components/GlowCursor'
import './styles/variables.css'
import './styles/global.css'
import './styles/animations.css'

// 笔记详情页按需加载（含 react-markdown，分包不拖慢首屏）
const NotesPage = lazy(() => import('./pages/NotesPage'))
// 管理登录页按需加载
const LoginPage = lazy(() => import('./pages/LoginPage'))

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

createRoot(rootEl).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="/login"
          element={
            <Suspense fallback={null}>
              <LoginPage />
            </Suspense>
          }
        />
        <Route
          path="/notes/:slug"
          element={
            <Suspense fallback={null}>
              <NotesPage />
            </Suspense>
          }
        />
      </Routes>
      <GlowCursor />
    </BrowserRouter>
  </StrictMode>,
)
