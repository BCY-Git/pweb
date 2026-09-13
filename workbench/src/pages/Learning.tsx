import { useMemo, useState } from 'react'
import { apiDelete, apiPost, apiPut } from '../api'
import { useFetch } from '../useFetch'
import type { Checkin, LearningTrack } from '../types'
import { StatusBadge, todayStr } from '../ui'

// 连续打卡天数：从今天（或昨天，今天还没打）往回数连续日期。
// 纯前端算——数据量小，不值得为它写接口。
function streak(dates: Set<string>): number {
  const day = (d: Date) => d.toISOString().slice(0, 10)
  let cur = new Date()
  if (!dates.has(day(cur))) cur = new Date(cur.getTime() - 86400000) // 今天没打，从昨天起算
  let n = 0
  while (dates.has(day(cur))) {
    n++
    cur = new Date(cur.getTime() - 86400000)
  }
  return n
}

function TrackCard({ track, checkins, onChanged }: {
  track: LearningTrack
  checkins: Checkin[]
  onChanged: () => void
}) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(todayStr())
  const [content, setContent] = useState('')
  const [minutes, setMinutes] = useState(60)

  const mine = useMemo(
    () => checkins.filter((c) => c.track_id === track.id),
    [checkins, track.id],
  )
  const s = streak(new Set(mine.map((c) => c.date)))

  async function checkin() {
    await apiPost('/checkins', { track_id: track.id, date, content, minutes })
    setContent('')
    onChanged()
  }

  async function removeCheckin(id: number) {
    await apiDelete(`/checkins/${id}`)
    onChanged()
  }

  async function setStatus(status: LearningTrack['status']) {
    await apiPut(`/tracks/${track.id}`, { status })
    onChanged()
  }

  // 最近 14 天的打卡点（学习热力缩影）
  const recent = useMemo(() => {
    const set = new Set(mine.map((c) => c.date))
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(Date.now() - (13 - i) * 86400000)
      return set.has(d.toISOString().slice(0, 10))
    })
  }, [mine])

  return (
    <div className="sheet">
      <div className="row between">
        <div className="row">
          <strong className="serif" style={{ fontSize: 'var(--fs-m)', fontWeight: 400 }}>{track.name}</strong>
          <StatusBadge status={track.status} />
          {s > 0 && <span className="badge green">连续 {s} 天</span>}
        </div>
        <div className="row">
          <select value={track.status} onChange={(e) => void setStatus(e.target.value as LearningTrack['status'])}>
            <option value="active">进行中</option>
            <option value="paused">暂停</option>
            <option value="done">完成</option>
          </select>
          <button className="primary" onClick={() => setOpen(!open)}>
            {open ? '收起' : '打卡'}
          </button>
        </div>
      </div>
      {track.description && (
        <div className="small muted" style={{ margin: '6px 0' }}>{track.description}</div>
      )}
      <div className="row wrap small muted" style={{ gap: 14 }}>
        <span className="dots" title="最近 14 天">
          {recent.map((on, i) => <i key={i} className={on ? 'on' : ''} />)}
        </span>
        <span>累计 {mine.length} 次 · {mine.reduce((a, c) => a + c.minutes, 0)} 分钟</span>
        {track.stat.last_date && <span>最近：{track.stat.last_date}</span>}
      </div>

      {/* 条件渲染：React 里 {open && ...}，Vue 里 v-if —— 同一个心智 */}
      {open && (
        <div style={{ marginTop: 10 }}>
          <div className="expand"><div className="sheet" style={{ padding: '10px 12px', background: 'transparent' }}>
            <div className="row wrap">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <input
                className="grow"
                placeholder="今天学了什么？"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void checkin()}
              />
              <input
                type="number"
                min={0}
                style={{ width: 90 }}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              />
              <span className="small muted">分钟</span>
              <button className="primary" onClick={() => void checkin()}>打卡</button>
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            {mine.slice(0, 10).map((c) => (
              <div key={c.id} className="todo-item">
                <div className="grow">
                  <span className="badge gray" style={{ marginRight: 6 }}>{c.date}</span>
                  {c.content || <span className="muted">（无备注）</span>}
                  {c.minutes > 0 && <span className="small muted"> · {c.minutes} 分钟</span>}
                </div>
                <button className="danger-ghost" onClick={() => void removeCheckin(c.id)}>删除</button>
              </div>
            ))}
            {mine.length === 0 && <div className="empty small">还没打过。今天记第一次。</div>}
          </div></div>
        </div>
      )}
    </div>
  )
}

export default function Learning() {
  const { data: tracks, reload: reloadTracks } = useFetch<LearningTrack[]>('/tracks')
  const { data: checkins, reload: reloadCheckins } = useFetch<Checkin[]>('/checkins')
  const [name, setName] = useState('')

  async function addTrack() {
    const n = name.trim()
    if (!n) return
    await apiPost('/tracks', { name: n })
    setName('')
    await reloadTracks()
  }

  function refreshAll() {
    void reloadTracks()
    void reloadCheckins()
  }

  const active = (tracks ?? []).filter((t) => t.status === 'active')
  const rest = (tracks ?? []).filter((t) => t.status !== 'active')

  return (
    <>
      <h1 className="page-title">学习</h1>
      <p className="page-sub">学习线打卡 · 连续天数按自然日算</p>

      <div className="sheet">
        <div className="row">
          <input
            className="grow"
            placeholder="新学习线，比如：Redis 八股"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void addTrack()}
          />
          <button className="primary" onClick={() => void addTrack()}>添加</button>
        </div>
      </div>

      {active.map((t) => (
        <TrackCard key={t.id} track={t} checkins={checkins ?? []} onChanged={refreshAll} />
      ))}
      {rest.length > 0 && <h3 style={{ margin: '18px 0 0' }}>暂停 / 已完成</h3>}
      {rest.map((t) => (
        <TrackCard key={t.id} track={t} checkins={checkins ?? []} onChanged={refreshAll} />
      ))}
    </>
  )
}
