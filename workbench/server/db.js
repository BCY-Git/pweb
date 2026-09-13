import { DatabaseSync } from 'node:sqlite'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '..', 'data')
if (!existsSync(dataDir)) mkdirSync(dataDir)

// node:sqlite（Node 22.13+ 内置）—— 同步 API，和 better-sqlite3 几乎同款：
// db.prepare(sql).run/get/all。换掉它是为了部署免原生编译（Windows 服务器直接跑）。
const db = new DatabaseSync(join(dataDir, 'workbench.db'))
db.exec('PRAGMA journal_mode = WAL')
db.exec('PRAGMA foreign_keys = ON')

db.exec(`
CREATE TABLE IF NOT EXISTS applications (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  company       TEXT NOT NULL,
  position      TEXT NOT NULL,
  source        TEXT DEFAULT '',
  salary        TEXT DEFAULT '',
  priority      INTEGER DEFAULT 2,          -- 1高 2中 3低
  status        TEXT DEFAULT '投递',         -- 投递/约面/一面/二面/终面/offer/挂/拒
  next_event_at TEXT DEFAULT '',             -- 下次面试/跟进时间 ISO
  notes         TEXT DEFAULT '',
  created_at    TEXT DEFAULT (datetime('now','localtime')),
  updated_at    TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS job_events (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  type           TEXT NOT NULL,              -- 投递/笔试/一面/二面/终面/offer/挂/拒/跟进
  happened_at    TEXT NOT NULL,
  notes          TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS daily_logs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  date       TEXT NOT NULL UNIQUE,           -- YYYY-MM-DD，一天一条
  content    TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now','localtime')),
  updated_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS learning_tracks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  status      TEXT DEFAULT 'active',          -- active/paused/done
  created_at  TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS learning_checkins (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  track_id INTEGER NOT NULL REFERENCES learning_tracks(id) ON DELETE CASCADE,
  date     TEXT NOT NULL,
  content  TEXT DEFAULT '',
  minutes  INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS projects (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  status      TEXT DEFAULT 'active',          -- active/paused/done
  description TEXT DEFAULT '',
  updated_at  TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS todos (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  status     TEXT DEFAULT 'open',            -- open/done
  priority   INTEGER DEFAULT 2,
  due_date   TEXT DEFAULT '',
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  created_at TEXT DEFAULT (datetime('now','localtime'))
);
`)

// ---------- 种子数据：只有空库时灌一次，之后删 data/workbench.db 可重建 ----------
const count = db.prepare('SELECT COUNT(*) AS n FROM applications').get().n
if (count === 0) {
  const today = new Date().toISOString().slice(0, 10)

  const seed = () => {
    db.exec('BEGIN')
    // ---- 求职线（2026-09 真实进展）----
    const insApp = db.prepare(`INSERT INTO applications
      (company, position, source, salary, priority, status, next_event_at, notes)
      VALUES (@company, @position, @source, @salary, @priority, @status, @next_event_at, @notes)`)
    const insEvt = db.prepare(`INSERT INTO job_events
      (application_id, type, happened_at, notes) VALUES (?, ?, ?, ?)`)

    const qingtian = insApp.run({
      company: '江苏擎天工业互联网',
      position: 'Java 初级研发（AI 方向）',
      source: 'Boss直聘',
      salary: '9-10K',
      priority: 1,
      status: '终面',
      next_event_at: '',
      notes: '用户首选：中大厂自研、AI 技术引擎向子公司输出、平台成长性好。薪资卡经验，可谈 10-11K。注意劳动合同主体（Boss 显示 A轮 100-499，用户称集团 1000+）。',
    }).lastInsertRowid
    insEvt.run(qingtian, '投递', '2026-09-01', 'Boss 沟通，JD 与自己牌高度重合')
    insEvt.run(qingtian, '终面', '2026-09-09', '早上面试完成。HR 前期已表态中意：自学经历、个人网站/MindTree、自驱力。等结果')

    const turing = insApp.run({
      company: '汕头市中科图灵科技（南京）',
      position: '全栈开发（FastAPI + React）',
      source: 'Boss直聘',
      salary: '12-13K（预估）',
      priority: 2,
      status: '终面',
      next_event_at: '',
      notes: '实质 FDE 岗，一人端到端。AIGC 图文生成，日活约 1000。8:30-17:30 双休。作为 backup 和谈薪筹码。',
    }).lastInsertRowid
    insEvt.run(turing, '投递', '2026-08-28', '')
    insEvt.run(turing, '终面', '2026-09-08', '聊 40+ 分钟几乎没问技术，主要聊 AI 工具使用与规范，自评良好')

    // ---- 学习线 ----
    const insTrack = db.prepare(`INSERT INTO learning_tracks (name, description, created_at)
      VALUES (?, ?, ?)`)
    const spring = insTrack.run('Spring / SpringBoot',
      '面试导向。主线：注解-反射-代理。已落盘两份桌面 HTML（装饰器vs注解 / SpringBoot地图）。2026-09-02 启动',
      '2026-09-02').lastInsertRowid
    const cangqiong = insTrack.run('苍穹外卖',
      '跟课实战，每天过 2 天课。工程 ~/IdeaProjects/sky-take-out（JDK17+lombok）。8080 被 demo1 占用；DB 密码还是明文待改',
      '2026-09-04').lastInsertRowid
    { insTrack.run('算法录制（B站）',
      '算法讲解视频传 B 站：求职展示 + 学习闭环', '2026-09-05') }

    const insCheck = db.prepare(`INSERT INTO learning_checkins (track_id, date, content, minutes)
      VALUES (?, ?, ?, ?)`)
    insCheck.run(spring, '2026-09-11', '苍穹外卖继续 + Spring 注解复习', 90)
    insCheck.run(spring, '2026-09-12', 'IoC 容器：@Service 怎么变成对象（桌面 HTML 走读）', 60)
    insCheck.run(cangqiong, '2026-09-12', '过课 2 天', 120)

    // ---- 项目 ----
    const insProj = db.prepare(`INSERT INTO projects (name, status, description) VALUES (?, ?, ?)`)
    const afsim = insProj.run('AFSIM（军仿 AI 助手）', 'active',
      '简历头号项目。LangGraph 6 节点 + RAG(Qdrant混合检索) + 本地私有化。标书线：15客户端架构 + 4战例是最高风险').lastInsertRowid
    const mindtree = insProj.run('MindTree', 'paused',
      '云同步服务端在腾讯云 Win。HTTP 明文未上 HTTPS，token 在服务器 .env').lastInsertRowid
    const website = insProj.run('个人网站/简历站', 'active',
      '部署在腾讯云，面试展示用').lastInsertRowid
    insProj.run('afsim-xr（Web 版 AFSIM 助手）', 'paused',
      '本机 Node + Web 版。真基建：mission.exe / LLM agentic loop / GenerationPlan').lastInsertRowid

    // ---- 待办 ----
    const insTodo = db.prepare(`INSERT INTO todos (title, status, priority, due_date, project_id)
      VALUES (?, ?, ?, ?, ?)`)
    insTodo.run('跟进擎天面试结果（超一周未果就发消息问 HR）', 'open', 1, '', null)
    insTodo.run('算法录制：剪一期传 B 站', 'open', 2, '', null)
    insTodo.run('sky-take-out 数据库密码明文 → 改 MD5', 'open', 3, '', null)
    insTodo.run('AFSIM 标书：贝卡谷地战例落地（唯一未落地战例）', 'open', 2, '', afsim)
    insTodo.run('MindTree 上 HTTPS', 'open', 3, '', mindtree)
    insTodo.run('个人网站更新最新项目经历', 'open', 2, '', website)
    insTodo.run('每天过 2 天苍穹外卖课', 'open', 1, today, null)
    db.exec('COMMIT')
  }
  seed()
  console.log('[db] 空库，已灌入种子数据')
}

export default db
