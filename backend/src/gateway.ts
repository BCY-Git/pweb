/**
 * 生产环境网关（80 端口入口）。
 *
 * 单一 Node http 服务，负责：
 *   1. 前端静态文件托管 + SPA fallback
 *   2. 把 /api/* 请求反向代理到 NestJS 后端（默认 3000 端口）
 *
 * 这样 NestJS 保持纯净（只跑 API），静态托管由独立网关负责，
 * 完全规避 NestJS 11 + Express 5 的通配路由兼容问题。
 *
 * 启动：
 *   node dist/gateway.js
 *
 * 环境变量：
 *   PORT          网关监听端口（默认 80）
 *   STATIC_DIR    前端静态文件目录（相对 cwd，默认 public）
 *   BACKEND_PORT  后端 NestJS 端口（默认 3000）
 *   BACKEND_HOST  后端主机（默认 127.0.0.1）
 */
import { createServer, IncomingMessage, ServerResponse, request as httpRequest } from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, extname, normalize } from 'node:path'

const PORT = Number(process.env.PORT ?? 80)
const STATIC_DIR = process.env.STATIC_DIR ?? 'public'
const BACKEND_PORT = Number(process.env.BACKEND_PORT ?? 3000)
const BACKEND_HOST = process.env.BACKEND_HOST ?? '127.0.0.1'

const absStaticDir = join(process.cwd(), STATIC_DIR)
const indexFile = join(absStaticDir, 'index.html')

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
}

/** 把请求反向代理到后端 NestJS */
function proxyToBackend(req: IncomingMessage, res: ServerResponse): void {
  const chunks: Buffer[] = []
  req.on('data', (c) => chunks.push(c))
  req.on('error', () => res.end())

  const sendProxy = () => {
    const body = Buffer.concat(chunks)
    const headers: Record<string, string> = { host: `${BACKEND_HOST}:${BACKEND_PORT}` }
    // 透传客户端请求头（去掉 host，由我们设置）
    for (const [k, v] of Object.entries(req.headers)) {
      if (k.toLowerCase() === 'host') continue
      if (v !== undefined) headers[k] = Array.isArray(v) ? v.join(', ') : v
    }

    const proxyReq = httpRequest({
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: req.url,
      method: req.method,
      headers,
    }, (proxyRes: IncomingMessage) => {
      res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers)
      proxyRes.pipe(res)
    })
    proxyReq.on('error', () => {
      res.writeHead(502, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ code: 502, message: '后端服务不可用' }))
    })
    if (body.length > 0) proxyReq.write(body)
    proxyReq.end()
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    sendProxy()
  } else {
    req.on('end', sendProxy)
  }
}

/** 提供静态文件，未命中返回 index.html（SPA fallback） */
function serveStatic(req: IncomingMessage, res: ServerResponse): void {
  // 解析路径，防止目录穿越
  // 注意：公网扫描器常发畸形百分号编码（如 /%e2%28%a1），decodeURIComponent 会抛
  // URIError，必须捕获并返回 400，否则整个网关进程会被一个恶意请求打崩。
  let urlPath: string
  try {
    urlPath = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/')
  } catch {
    res.writeHead(400, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ code: 400, message: '请求路径非法' }))
    return
  }
  const safePath = normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
  let filePath = join(absStaticDir, safePath)

  // 如果是目录，尝试 index.html
  try {
    if (statSync(filePath).isDirectory()) {
      filePath = join(filePath, 'index.html')
    }
  } catch {
    // 不存在，走 SPA fallback
  }

  if (existsSync(filePath) && statSync(filePath).isFile()) {
    const ext = extname(filePath).toLowerCase()
    const mime = MIME[ext] ?? 'application/octet-stream'
    try {
      const data = readFileSync(filePath)
      res.writeHead(200, {
        'content-type': mime,
        'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
      })
      res.end(data)
    } catch {
      res.writeHead(500, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ code: 500, message: '读取文件失败' }))
    }
    return
  }

  // SPA fallback：返回 index.html，交给前端路由
  if (existsSync(indexFile)) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    res.end(readFileSync(indexFile))
    return
  }

  res.writeHead(404, { 'content-type': 'application/json' })
  res.end(JSON.stringify({ code: 404, message: 'Not Found' }))
}

const server = createServer((req, res) => {
  const url = req.url ?? '/'
  // /api/* 和 /health 反代到后端
  if (url.startsWith('/api/') || url === '/health' || url.startsWith('/api-docs')) {
    return proxyToBackend(req, res)
  }
  // 其余走静态文件
  return serveStatic(req, res)
})

server.listen(PORT, () => {
  console.log(`[gateway] 监听 http://0.0.0.0:${PORT}`)
  console.log(`[gateway] 静态文件: ${absStaticDir}`)
  console.log(`[gateway] API 代理: → ${BACKEND_HOST}:${BACKEND_PORT}`)
})
