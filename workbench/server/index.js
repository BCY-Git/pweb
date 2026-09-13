import express from 'express'
import { createHmac } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import db from './db.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// 极简 .env 加载（KEY=VALUE 每行一条），不引依赖。
// 用 /\r?\n/ 切行：服务器上的 .env 多半是 CRLF（PowerShell 产物），split('\n') 会留 \r
// 害得正则 $ 匹配不上，整个文件静默失效 —— 这个坑已经踩过一次。
const envPath = join(__dirname, '..', '.env')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
}

const ADMIN_PASSWORD = process.env.WB_ADMIN_PASSWORD
const SESSION_SECRET = process.env.WB_SESSION_SECRET || 'wb-dev-secret'
if (!ADMIN_PASSWORD) {
  console.warn('[auth] 警告：未设置 WB_ADMIN_PASSWORD，使用默认密码 wb-local（仅限本地开发！）')
}

const app = express()
app.use(express.json())

// ---------- 会话：无状态 HMAC 签名 cookie（wb_session=<exp>.<sig>），零存储零依赖 ----------
const COOKIE = 'wb_session'
const SESSION_TTL_MS = 7 * 24 * 3600 * 1000

function sign(exp) {
  return createHmac('sha256', SESSION_SECRET).update(String(exp)).digest('hex')
}

function makeSessionCookie() {
  const exp = Date.now() + SESSION_TTL_MS
  return `${COOKIE}=${exp}.${sign(exp)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_MS / 1000}`
}

function parseCookies(header = '') {
  const out = {}
  for (const part of header.split(';')) {
    const i = part.indexOf('=')
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim()
  }
  return out
}

function sessionValid(req) {
  const raw = parseCookies(req.headers.cookie)[COOKIE]
  if (!raw) return false
  const dot = raw.indexOf('.')
  if (dot < 0) return false
  const exp = Number(raw.slice(0, dot))
  const sig = raw.slice(dot + 1)
  if (!Number.isFinite(exp) || exp < Date.now()) return false
  return sig === sign(exp) // 时序安全比较对这里过剩，HMAC 比对即可
}

// ---------- API 层权限锁：除 /api/login 外，所有 /api/* 必须持有效会话 ----------
app.use('/api', (req, res, next) => {
  if (req.path === '/login') return next()
  if (!sessionValid(req)) return res.status(401).json({ error: '未登录' })
  next()
})

app.post('/api/login', (req, res) => {
  const { password } = req.body ?? {}
  if (!password || password !== ADMIN_PASSWORD) {
    // 简单防爆破：错一次睡 800ms
    return setTimeout(() => res.status(401).json({ error: '密码不对' }), 800)
  }
  res.setHeader('Set-Cookie', makeSessionCookie())
  ok(res, { name: 'admin' })
})

app.post('/api/logout', (req, res) => {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`)
  ok(res, null)
})

app.get('/api/me', (req, res) => ok(res, { name: 'admin' }))

// 小工具：把 POST/PUT 的 body 白名单过滤成表字段，避免前端多传的字段混进 SQL
function pick(body, keys) {
  const out = {}
  for (const k of keys) if (body[k] !== undefined) out[k] = body[k]
  return out
}

const ok = (res, data) => res.json({ data })
const notFound = (res, what = '记录') => res.status(404).json({ error: `${what}不存在` })

// ---------- 求职 applications ----------
const APP_KEYS = ['company', 'position', 'source', 'salary', 'priority', 'status', 'next_event_at', 'notes']

app.get('/api/applications', (req, res) => {
  const rows = db.prepare('SELECT * FROM applications ORDER BY priority, updated_at DESC').all()
  ok(res, rows)
})

app.post('/api/applications', (req, res) => {
  const b = pick(req.body, APP_KEYS)
  if (!b.company || !b.position) return res.status(400).json({ error: 'company 和 position 必填' })
  const info = db.prepare(`
    INSERT INTO applications (company, position, source, salary, priority, status, next_event_at, notes)
    VALUES (@company, @position, @source, @salary, @priority, @status, @next_event_at, @notes)
  `).run({ source: '', salary: '', priority: 2, status: '投递', next_event_at: '', notes: '', ...b })
  ok(res, db.prepare('SELECT * FROM applications WHERE id = ?').get(info.lastInsertRowid))
})

app.put('/api/applications/:id', (req, res) => {
  const old = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id)
  if (!old) return notFound(res)
  const b = { ...old, ...pick(req.body, APP_KEYS), updated_at: datetimeNow() }
  db.prepare(`
    UPDATE applications SET company=@company, position=@position, source=@source, salary=@salary,
      priority=@priority, status=@status, next_event_at=@next_event_at, notes=@notes, updated_at=@updated_at
    WHERE id=@id
  `).run({ ...b, id: old.id })
  ok(res, db.prepare('SELECT * FROM applications WHERE id = ?').get(old.id))
})

app.delete('/api/applications/:id', (req, res) => {
  db.prepare('DELETE FROM applications WHERE id = ?').run(req.params.id) // 级联删 job_events
  ok(res, null)
})

// ---------- 求职事件 job_events ----------
app.get('/api/applications/:id/events', (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM job_events WHERE application_id = ? ORDER BY happened_at DESC, id DESC'
  ).all(req.params.id)
  ok(res, rows)
})

app.post('/api/applications/:id/events', (req, res) => {
  const app = db.prepare('SELECT id FROM applications WHERE id = ?').get(req.params.id)
  if (!app) return notFound(res, '求职记录')
  const { type, happened_at, notes = '' } = req.body
  if (!type || !happened_at) return res.status(400).json({ error: 'type 和 happened_at 必填' })
  const info = db.prepare(
    'INSERT INTO job_events (application_id, type, happened_at, notes) VALUES (?, ?, ?, ?)'
  ).run(app.id, type, happened_at, notes)
  // 记了事件就顺手同步主表状态和时间
  const sync = {}
  if (req.body.sync_status) sync.status = type
  if (req.body.sync_next !== undefined) sync.next_event_at = req.body.sync_next
  if (Object.keys(sync).length) {
    db.prepare('UPDATE applications SET status = COALESCE(?, status), next_event_at = COALESCE(?, next_event_at), updated_at = ? WHERE id = ?')
      .run(sync.status ?? null, sync.next_event_at ?? null, datetimeNow(), app.id)
  }
  ok(res, db.prepare('SELECT * FROM job_events WHERE id = ?').get(info.lastInsertRowid))
})

app.delete('/api/job-events/:id', (req, res) => {
  db.prepare('DELETE FROM job_events WHERE id = ?').run(req.params.id)
  ok(res, null)
})

// ---------- 每日记录 daily_logs（一天一条，按日期 upsert）----------
app.get('/api/daily-logs', (req, res) => {
  const rows = db.prepare('SELECT * FROM daily_logs ORDER BY date DESC').all()
  ok(res, rows)
})

app.put('/api/daily-logs/:date', (req, res) => {
  const date = req.params.date
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: '日期格式应为 YYYY-MM-DD' })
  const content = req.body.content ?? ''
  db.prepare(`
    INSERT INTO daily_logs (date, content) VALUES (?, ?)
    ON CONFLICT(date) DO UPDATE SET content = excluded.content, updated_at = ?
  `).run(date, content, datetimeNow())
  ok(res, db.prepare('SELECT * FROM daily_logs WHERE date = ?').get(date))
})

app.delete('/api/daily-logs/:date', (req, res) => {
  db.prepare('DELETE FROM daily_logs WHERE date = ?').run(req.params.date)
  ok(res, null)
})

// ---------- 学习线 tracks + 打卡 checkins ----------
app.get('/api/tracks', (req, res) => {
  const tracks = db.prepare('SELECT * FROM learning_tracks ORDER BY status, id').all()
  const stat = db.prepare(`
    SELECT track_id,
           COUNT(*)               AS total,
           MAX(date)              AS last_date,
           COUNT(DISTINCT date)   AS days
    FROM learning_checkins GROUP BY track_id`)
  const byTrack = Object.fromEntries(stat.all().map(r => [r.track_id, r]))
  ok(res, tracks.map(t => ({ ...t, stat: byTrack[t.id] ?? { total: 0, days: 0, last_date: '' } })))
})

app.post('/api/tracks', (req, res) => {
  if (!req.body.name) return res.status(400).json({ error: 'name 必填' })
  const info = db.prepare('INSERT INTO learning_tracks (name, description) VALUES (?, ?)')
    .run(req.body.name, req.body.description ?? '')
  ok(res, db.prepare('SELECT * FROM learning_tracks WHERE id = ?').get(info.lastInsertRowid))
})

app.put('/api/tracks/:id', (req, res) => {
  const old = db.prepare('SELECT * FROM learning_tracks WHERE id = ?').get(req.params.id)
  if (!old) return notFound(res)
  const b = { ...old, ...pick(req.body, ['name', 'description', 'status']) }
  db.prepare('UPDATE learning_tracks SET name=?, description=?, status=? WHERE id=?')
    .run(b.name, b.description, b.status, old.id)
  ok(res, db.prepare('SELECT * FROM learning_tracks WHERE id = ?').get(old.id))
})

app.delete('/api/tracks/:id', (req, res) => {
  db.prepare('DELETE FROM learning_tracks WHERE id = ?').run(req.params.id)
  ok(res, null)
})

app.get('/api/checkins', (req, res) => {
  const rows = req.query.track_id
    ? db.prepare('SELECT * FROM learning_checkins WHERE track_id = ? ORDER BY date DESC, id DESC').all(req.query.track_id)
    : db.prepare('SELECT * FROM learning_checkins ORDER BY date DESC, id DESC').all()
  ok(res, rows)
})

app.post('/api/checkins', (req, res) => {
  const { track_id, date, content = '', minutes = 0 } = req.body
  if (!track_id || !date) return res.status(400).json({ error: 'track_id 和 date 必填' })
  const info = db.prepare(
    'INSERT INTO learning_checkins (track_id, date, content, minutes) VALUES (?, ?, ?, ?)'
  ).run(track_id, date, content, minutes)
  ok(res, db.prepare('SELECT * FROM learning_checkins WHERE id = ?').get(info.lastInsertRowid))
})

app.delete('/api/checkins/:id', (req, res) => {
  db.prepare('DELETE FROM learning_checkins WHERE id = ?').run(req.params.id)
  ok(res, null)
})

// ---------- 待办 todos ----------
const TODO_KEYS = ['title', 'status', 'priority', 'due_date', 'project_id']

app.get('/api/todos', (req, res) => {
  const rows = db.prepare(`
    SELECT t.*, p.name AS project_name FROM todos t
    LEFT JOIN projects p ON p.id = t.project_id
    ORDER BY t.status, t.priority, t.due_date = '' , t.due_date, t.id DESC`).all()
  ok(res, rows)
})

app.post('/api/todos', (req, res) => {
  const b = pick(req.body, TODO_KEYS)
  if (!b.title) return res.status(400).json({ error: 'title 必填' })
  const info = db.prepare(
    'INSERT INTO todos (title, status, priority, due_date, project_id) VALUES (@title, @status, @priority, @due_date, @project_id)'
  ).run({ status: 'open', priority: 2, due_date: '', project_id: null, ...b })
  ok(res, db.prepare('SELECT * FROM todos WHERE id = ?').get(info.lastInsertRowid))
})

app.put('/api/todos/:id', (req, res) => {
  const old = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id)
  if (!old) return notFound(res)
  const b = { ...old, ...pick(req.body, TODO_KEYS) }
  db.prepare('UPDATE todos SET title=?, status=?, priority=?, due_date=?, project_id=? WHERE id=?')
    .run(b.title, b.status, b.priority, b.due_date, b.project_id, old.id)
  ok(res, db.prepare('SELECT t.*, p.name AS project_name FROM todos t LEFT JOIN projects p ON p.id=t.project_id WHERE t.id = ?').get(old.id))
})

app.delete('/api/todos/:id', (req, res) => {
  db.prepare('DELETE FROM todos WHERE id = ?').run(req.params.id)
  ok(res, null)
})

// ---------- 项目 projects ----------
const PROJ_KEYS = ['name', 'status', 'description']

app.get('/api/projects', (req, res) => {
  const rows = db.prepare(`
    SELECT p.*, (SELECT COUNT(*) FROM todos t WHERE t.project_id = p.id AND t.status = 'open') AS open_todos
    FROM projects p ORDER BY p.status, p.updated_at DESC`).all()
  ok(res, rows)
})

app.post('/api/projects', (req, res) => {
  if (!req.body.name) return res.status(400).json({ error: 'name 必填' })
  const info = db.prepare('INSERT INTO projects (name, status, description) VALUES (?, ?, ?)')
    .run(req.body.name, req.body.status ?? 'active', req.body.description ?? '')
  ok(res, db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid))
})

app.put('/api/projects/:id', (req, res) => {
  const old = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id)
  if (!old) return notFound(res)
  const b = { ...old, ...pick(req.body, PROJ_KEYS), updated_at: datetimeNow() }
  db.prepare('UPDATE projects SET name=?, status=?, description=?, updated_at=? WHERE id=?')
    .run(b.name, b.status, b.description, b.updated_at, old.id)
  ok(res, db.prepare('SELECT * FROM projects WHERE id = ?').get(old.id))
})

app.delete('/api/projects/:id', (req, res) => {
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id)
  ok(res, null)
})

// ---------- Dashboard 聚合：一次请求拿全总览数字 ----------
app.get('/api/dashboard', (req, res) => {
  const today = datetimeNow().slice(0, 10)
  const funnel = db.prepare('SELECT status, COUNT(*) AS n FROM applications GROUP BY status').all()
  const nextInterview = db.prepare(`
    SELECT id, company, position, next_event_at FROM applications
    WHERE next_event_at != '' AND next_event_at >= ? ORDER BY next_event_at LIMIT 1`).get(today)
  const openTodos = db.prepare(`
    SELECT COUNT(*) AS n FROM todos WHERE status='open'`).get().n
  const todayTodos = db.prepare(`
    SELECT t.*, p.name AS project_name FROM todos t LEFT JOIN projects p ON p.id=t.project_id
    WHERE t.status='open' AND t.due_date != '' AND t.due_date <= ? ORDER BY t.priority`).all(today)
  const dailyWritten = !!db.prepare('SELECT id FROM daily_logs WHERE date = ?').get(today)
  const checkinDays = db.prepare(`
    SELECT COUNT(DISTINCT date) AS n FROM learning_checkins WHERE date >= date('now','localtime','-30 day')`).get().n
  const yesterdayCheckin = !!db.prepare(
    "SELECT id FROM learning_checkins WHERE date = date('now','localtime','-1 day')").get()
  const activeProjects = db.prepare("SELECT COUNT(*) AS n FROM projects WHERE status='active'").get().n
  const activeApps = db.prepare(`
    SELECT id, company, position, status, next_event_at, notes
    FROM applications WHERE status NOT IN ('挂', '拒')
    ORDER BY priority, updated_at DESC LIMIT 6`).all()
  ok(res, {
    today,
    funnel,
    next_interview: nextInterview ?? null,
    open_todos: openTodos,
    today_todos: todayTodos,
    daily_written: dailyWritten,
    checkin_days_30: checkinDays,
    checked_in_yesterday: yesterdayCheckin,
    active_projects: activeProjects,
    active_apps: activeApps,
  })
})

function datetimeNow() {
  // SQLite 的 datetime('now','localtime') 输出格式：YYYY-MM-DD HH:MM:SS
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

// ---------- 生产静态托管：vite 产物 + SPA fallback（gateway 把 /app/* 剥前缀转过来） ----------
const publicDir = join(__dirname, '..', 'public')
if (existsSync(publicDir)) {
  app.use(express.static(publicDir))
  app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(join(publicDir, 'index.html')))
}

// 只绑 127.0.0.1：公网请求必须经 gateway 反代，工作台进程不直接暴露
const PORT = process.env.PORT || 3001
app.listen(PORT, '127.0.0.1', () => console.log(`[server] http://127.0.0.1:${PORT}`))
