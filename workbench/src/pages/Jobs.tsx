import { useEffect, useState } from 'react'
import { apiDelete, apiPost, apiPut } from '../api'
import { useFetch } from '../useFetch'
import type { Application, JobEvent, JobStatus } from '../types'
import { JobBadge, todayStr } from '../ui'

const STATUSES: JobStatus[] = ['投递', '约面', '一面', '二面', '终面', 'offer', '挂', '拒']
const EVENT_TYPES = ['投递', '笔试', '一面', '二面', '终面', 'offer', '挂', '拒', '跟进', 'HR沟通']

// 展开后的详情区：编辑主记录 + 时间线 + 记一笔事件
function JobDetail({ app, onChanged }: { app: Application; onChanged: () => void }) {
  const { data: events, reload: reloadEvents } = useFetch<JobEvent[]>(`/applications/${app.id}/events`)
  const [form, setForm] = useState(app)
  const [evtType, setEvtType] = useState('跟进')
  const [evtDate, setEvtDate] = useState(todayStr())
  const [evtNotes, setEvtNotes] = useState('')

  // 切换展开的公司时，表单回填成该条的最新值
  useEffect(() => setForm(app), [app])

  async function save() {
    await apiPut(`/applications/${app.id}`, form)
    onChanged()
  }

  async function addEvent() {
    await apiPost(`/applications/${app.id}/events`, {
      type: evtType,
      happened_at: evtDate,
      notes: evtNotes,
      // 事件类型正好是状态之一（投递/一面/…）时，顺手把主记录状态同步过去
      sync_status: STATUSES.includes(evtType as JobStatus) ? evtType : undefined,
    })
    setEvtNotes('')
    await reloadEvents()
    onChanged()
  }

  async function removeEvent(id: number) {
    await apiDelete(`/job-events/${id}`)
    await reloadEvents()
    onChanged()
  }

  async function removeApp() {
    if (!confirm(`删除「${app.company}」的求职记录？时间线一并删除。`)) return
    await apiDelete(`/applications/${app.id}`)
    onChanged()
  }

  // Vue: v-model="form.salary" → React: value + onChange 自己接线（见 set() 工具函数）
  const set = (k: keyof Application) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div style={{ marginTop: 10 }}>
      <div className="sheet" style={{ padding: '12px 14px', background: 'transparent' }}>
        <div className="form-grid">
          <label>公司<input value={form.company} onChange={set('company')} /></label>
          <label>职位<input value={form.position} onChange={set('position')} /></label>
          <label>薪资<input value={form.salary} onChange={set('salary')} /></label>
          <label>渠道<input value={form.source} onChange={set('source')} /></label>
          <label>
            状态
            <select value={form.status} onChange={set('status')}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>
            下次面试/跟进
            <input type="date" value={form.next_event_at.slice(0, 10)} onChange={set('next_event_at')} />
          </label>
          <label className="full">备注<textarea rows={2} value={form.notes} onChange={set('notes')} /></label>
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <button className="primary" onClick={() => void save()}>保存修改</button>
          <button className="danger-ghost" onClick={() => void removeApp()}>删除记录</button>
        </div>
      </div>

      {/* 记一笔 */}
      <div className="sheet" style={{ marginTop: 10 }}>
        <h3>时间线</h3>
        <div className="row wrap" style={{ marginBottom: 12 }}>
          <select value={evtType} onChange={(e) => setEvtType(e.target.value)}>
            {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="date" value={evtDate} onChange={(e) => setEvtDate(e.target.value)} />
          <input
            className="grow"
            placeholder="经过/感受，比如：问了很多 LangGraph 细节"
            value={evtNotes}
            onChange={(e) => setEvtNotes(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void addEvent()}
          />
          <button className="primary" onClick={() => void addEvent()}>记一笔</button>
        </div>
        <ul className="timeline">
          {(events ?? []).map((ev) => (
            <li key={ev.id}>
              <div className="row">
                <JobBadge status={ev.type} />
                <span className="when">{ev.happened_at}</span>
                <span className="grow" />
                <button
                  className="danger-ghost"
                  style={{ border: 'none', padding: '0 4px' }}
                  onClick={() => void removeEvent(ev.id)}
                >
                  ✕
                </button>
              </div>
              {ev.notes && <div className="small" style={{ marginTop: 2 }}>{ev.notes}</div>}
            </li>
          ))}
          {(events ?? []).length === 0 && <div className="empty small">还没记。面完趁热写。</div>}
        </ul>
      </div>
    </div>
  )
}

export default function Jobs() {
  const { data: apps, loading, error, reload } = useFetch<Application[]>('/applications')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ company: '', position: '', source: 'Boss直聘', salary: '' })

  async function add() {
    if (!draft.company.trim() || !draft.position.trim()) return
    const created = await apiPost<Application>('/applications', draft)
    setDraft({ company: '', position: '', source: 'Boss直聘', salary: '' })
    setAdding(false)
    await reload()
    setExpandedId(created.id) // 新增完直接展开详情，顺手记第一条事件
  }

  async function quickStatus(app: Application, status: JobStatus) {
    await apiPut(`/applications/${app.id}`, { status })
    await reload()
  }

  const live = (apps ?? []).filter((a) => !['挂', '拒'].includes(a.status))
  const dead = (apps ?? []).filter((a) => ['挂', '拒'].includes(a.status))

  return (
    <>
      <div className="row between">
        <div>
          <h1 className="page-title">求职</h1>
          <p className="page-sub">推进中 {live.length} · 结束 {dead.length} · 点开一家看时间线</p>
        </div>
        <button className="primary" onClick={() => setAdding(!adding)}>
          {adding ? '收起' : '记一家'}
        </button>
      </div>

      {adding && (
        <div className="sheet expand" style={{ marginBottom: 12 }}>
          <div className="form-grid">
            <label>公司 *<input value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} /></label>
            <label>职位 *<input value={draft.position} onChange={(e) => setDraft({ ...draft, position: e.target.value })} /></label>
            <label>渠道<input value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} /></label>
            <label>薪资<input value={draft.salary} onChange={(e) => setDraft({ ...draft, salary: e.target.value })} /></label>
          </div>
          <button className="primary" style={{ marginTop: 10 }} onClick={() => void add()}>创建</button>
        </div>
      )}

      {error && <div className="error-box">{error}</div>}
      {loading ? (
        <div className="loading">载入中</div>
      ) : (
        <>
          <div className="list">
          {(apps ?? []).map((a) => (
            <div key={a.id}>
              <div
                className="row between"
                style={{ cursor: 'pointer', padding: '16px 0', alignItems: 'baseline' }}
                onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
              >
                <div>
                  <div className="row" style={{ alignItems: 'baseline', gap: 12 }}>
                    <strong className="serif" style={{ fontSize: 'var(--fs-m)', fontWeight: 400 }}>{a.company}</strong>
                    <JobBadge status={a.status} />
                    {a.priority === 1 && <span className="badge red">重点</span>}
                  </div>
                  <div className="small muted" style={{ marginTop: 2 }}>
                    {a.position} · {a.salary || '薪资未谈'} · {a.source}
                    {a.next_event_at && ` · 下次：${a.next_event_at.slice(0, 10)}`}
                  </div>
                </div>
                {/* 点击下拉不触发展开：e.stopPropagation() 和 Vue 里 @click.stop 一个意思 */}
                <select
                  value={a.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => void quickStatus(a, e.target.value as JobStatus)}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {expandedId === a.id && <div className="expand"><JobDetail app={a} onChanged={() => void reload()} /></div>}
            </div>
          ))}
          </div>
          {dead.length > 0 && live.length > 0 && (
            <p className="dim small" style={{ margin: '18px 0 6px' }}>
              挂 / 拒的也还在下面，翻到就是。
            </p>
          )}
        </>
      )}
    </>
  )
}
