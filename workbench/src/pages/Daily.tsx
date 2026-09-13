import { useEffect, useState } from 'react'
import { apiPut } from '../api'
import { useFetch } from '../useFetch'
import type { DailyLog } from '../types'
import { fmtDateTime, todayStr } from '../ui'

// 每日记录：一天一条（后端按 date upsert）。
// 编辑器绑定"选中日期"，默认今天；点历史某天 → 载入编辑。
export default function Daily() {
  const { data: logs, loading, error, reload } = useFetch<DailyLog[]>('/daily-logs')
  const [date, setDate] = useState(todayStr())
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedTip, setSavedTip] = useState('')

  // 选中日期变化时，把已有内容填进编辑器（Vue：watch(date) → 回填）
  useEffect(() => {
    const log = (logs ?? []).find((l) => l.date === date)
    setContent(log?.content ?? '')
    setSavedTip('')
  }, [date, logs])

  async function save() {
    setSaving(true)
    try {
      await apiPut(`/daily-logs/${date}`, { content })
      setSavedTip('已保存 ✓')
      await reload()
    } finally {
      setSaving(false)
    }
  }

  const today = todayStr()

  return (
    <>
      <h1 className="page-title">每日记录</h1>
      <p className="page-sub">一天一条，记录今天干了什么 —— 面试、学习、投递都算</p>

      <div className="sheet">
        <div className="row" style={{ marginBottom: 10 }}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          {date === today ? <span className="badge indigo">今天</span> : null}
          <span className="grow" />
          {savedTip && <span className="small" style={{ color: 'var(--green)' }}>{savedTip}</span>}
          <button className="primary" disabled={saving} onClick={() => void save()}>
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
        <textarea
          rows={7}
          style={{ width: '100%' }}
          placeholder={'今天做了什么？比如：\n- 投了 X 公司\n- 苍穹外卖过课 2 天\n- 复盘一面问题…'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="small muted" style={{ marginTop: 6 }}>
          纯文本保存，支持换行
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}
      {loading ? (
        <div className="loading">载入中</div>
      ) : (
        (logs ?? []).map((log) => (
          <div key={log.id} className="sheet" style={{ cursor: 'pointer' }} onClick={() => setDate(log.date)}>
            <div className="row between">
              <strong>
                {log.date}
                {log.date === today && ' · 今天'}
              </strong>
              <span className="small muted">编辑于 {fmtDateTime(log.updated_at)}（点击载入编辑）</span>
            </div>
            <div className="md" style={{ marginTop: 6 }}>{log.content || <span className="muted">（空）</span>}</div>
          </div>
        ))
      )}
    </>
  )
}
