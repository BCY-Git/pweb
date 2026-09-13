import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 生产部署在网站的 /app 路径下（gateway 反代），资源引用要带前缀
  base: '/app/',
  build: {
    // 产物直接进 public/，server/index.js 生产模式下托管它
    outDir: 'public',
    emptyOutDir: true,
  },
  server: {
    port: 5174, // 网站占了 5173，工作台固定 5174
    // 开发时把 /api 请求转发给 Express 后端（Vue CLI 里类似的配置叫 devServer.proxy）
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
