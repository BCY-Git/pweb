import { useState } from 'react'
import { apiDelete, apiPost, apiPut } from '../api'
import { useFetch } from '../useFetch'
import type { Project, Todo } from '../types'
import { PriorityDots, todayStr } from '../ui'

// Vue 思维对照：
// - data、projects = ref 数组 → useFetch hook 返回的 state
// - 新增后手动 refetch ≈ Vue 里重新拉列表；这里调 reload() 即可
export default function Todos() {
  const { data: todos, loading, error, reload } = useFetch<Todo[]>('/todos')
  const { data: projects } = useFetch<Project[]>('/projects')

  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState(2)
  const [projectId, setProjectId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [showDone, setShowDone] = useState(false)

  async function add() {
    const t = title.trim()
    if (!t) return
    await apiPost('/todos', {
      title: t,
      priority,
      due_date: dueDate,
      project_id: projectId ? Number(projectId) : null,
    })
    setTitle('')
    setDueDate('')
    await reload()
  }

  async function toggle(todo: Todo) {
    await apiPut(`/todos/${todo.id}`, { status: todo.status === 'open' ? 'done' : 'open' })
    await reload()
  }

  async function remove(id: number) {
    await apiDelete(`/todos/${id}`)
    await reload()
  }

  const visible = (todos ?? []).filter((t) => (showDone ? true : t.status === 'open'))

  return (
    <>
      <h1 className="page-title">待办</h1>
      <p className="page-sub">过期了的排最前</p>

      <div className="sheet">
        <div className="row wrap">
          {/* React 受控输入：value + onChange 绑定。Vue 是 v-model 一行，React 要自己接线 */}
          <input
            className="grow"
            placeholder="接下来干嘛？回车记下"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void add()}
          />
          <select value={priority} onChange={(e) => setPriority(Number(e.target.value))} aria-label="优先级">
            <option value={1}>高</option>
            <option value={2}>中</option>
            <option value={3}>低</option>
          </select>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">无项目</option>
            {(projects ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <button className="primary" onClick={() => void add()}>添加</button>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}
      {loading ? (
        <div className="loading">加载中…</div>
      ) : (
        <div className="sheet">
          <div className="row between" style={{ marginBottom: 4 }}>
            <span className="muted small">
              {todos?.filter((t) => t.status === 'open').length ?? 0} 项未完成
            </span>
            <label className="small muted row" style={{ gap: 5 }}>
              <input
                type="checkbox"
                checked={showDone}
                onChange={(e) => setShowDone(e.target.checked)}
              />
              显示已完成
            </label>
          </div>
          {visible.length === 0 ? (
            <div className="empty">空着。想起什么写下来。</div>
          ) : (
            visible.map((t) => {
              const overdue = t.status === 'open' && t.due_date && t.due_date < todayStr()
              return (
                <div key={t.id} className={`todo-item ${t.status === 'done' ? 'done' : ''}`}>
                  <input
                    type="checkbox"
                    checked={t.status === 'done'}
                    onChange={() => void toggle(t)}
                  />
                  <div className="grow">
                    {/* 条件渲染：Vue 用 v-if，React 用 && —— 注意 falsy 陷阱，所以用 Boolean() 包住 */}
                    {Boolean(overdue) && <span className="badge red" style={{ marginRight: 6 }}>过期</span>}
                    <span className="title">{t.title}</span>
                    <div className="small muted">
                      <PriorityDots n={t.priority} />{' '}
                      {t.project_name && <span>{t.project_name}</span>}
                      {t.due_date && <span> · 截止 {t.due_date}</span>}
                    </div>
                  </div>
                  <button className="danger-ghost" onClick={() => void remove(t.id)}>删除</button>
                </div>
              )
            })
          )}
        </div>
      )}
    </>
  )
}
