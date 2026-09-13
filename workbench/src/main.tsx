import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// 对比 Vue：main.tsx ≈ main.js，createRoot(...).render() ≈ createApp(App).mount('#root')。
// 多包一层 BrowserRouter（路由提供者）——Vue Router 是 app.use(router) 插件式，React 是组件包裹式。
// basename="/app"：生产环境部署在网站的 /app 子路径下，Router 统一剥掉这个前缀。
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/app">
      <App />
    </BrowserRouter>
  </StrictMode>,
)
