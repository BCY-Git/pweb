import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite 配置。
// dev server 把 /api 代理到后端 3000 端口，前端代码可直接 fetch('/api/...')。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
