import { useState } from 'react'
import { apiDelete, apiPost, apiPut } from '../api'
import { useFetch } from '../useFetch'
import type { Project } from '../types'

type Status = Project['status']

// 索引列表，不做等宽三栏卡片（A2 闸门）：每个项目一行，名字用衬线字号跳出。
const GROUPS: { key: Status; label: string }[] = [
  { key: 'active', label: '在做' },
  { key: 'paused', label: '停着' },
  { key: 'done', label: '完了' },
]

export default function Projects() {
  const { data: projects, loading, error, reload } = useFetch<Project[]>('/projects')
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')

  async function add() {
    const n = name.trim()
    if (!n) return
    await apiPost('/projects', { name: n, description: desc })
    setName('')
    setDesc('')
    await reload()
  }

  async function setStatus(p: Project, status: Status) {
    await apiPut(`/projects/${p.id}`, { status })
    await reload()
  }

  async function remove(p: Project) {
    if (!confirm(`删掉「${p.name}」？它名下的待办会保留，变成无主待办。`)) return
    await apiDelete(`/projects/${p.id}`)
    await reload()
  }

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">项目</h1>
        <p className="page-sub">一行一个。行尾数字是没做完的待办。</p>
      </div>

      <div className="sheet">
        <div className="row wrap">
          <input
            className="grow"
            placeholder="起个名字"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void add()}
          />
          <input
            className="grow"
            placeholder="一句话说清它是什么（可不填）"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void add()}
          />
          <button className="primary" onClick={() => void add()}>立项</button>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}
      {loading ? (
        <div className="loading">载入中</div>
      ) : (
        GROUPS.map((g) => {
          const list = (projects ?? []).filter((p) => p.status === g.key)
          if (list.length === 0 && g.key !== 'active') return null
          return (
            <div key={g.key} style={{ marginTop: 30 }}>
              <span className="micro" style={{ display: 'block', marginBottom: 8 }}>
                {g.label} · {list.length}
              </span>
              {list.length === 0 ? (
                <p className="empty" style={{ margin: 0 }}>暂无</p>
              ) : (
                <div className="list">
                  {list.map((p) => (
                    <div key={p.id} className="row between" style={{ padding: '13px 0', alignItems: 'baseline' }}>
                      <div className="grow">
                        <span className="serif" style={{ fontSize: 'var(--fs-m)' }}>{p.name}</span>
                        {p.description && (
                          <div className="small dim" style={{ marginTop: 2 }}>{p.description}</div>
                        )}
                      </div>
                      <span className="small dim">{p.open_todos ? `${p.open_todos} 件未完` : '无事'}</span>
                      <select
                        value={p.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => void setStatus(p, e.target.value as Status)}
                        aria-label={`调整「${p.name}」状态`}
                      >
                        <option value="active">在做</option>
                        <option value="paused">停着</option>
                        <option value="done">完了</option>
                      </select>
                      <button
                        className="danger-ghost"
                        style={{ border: 'none', padding: '2px 4px' }}
                        onClick={() => void remove(p)}
                        aria-label={`删除「${p.name}」`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })
      )}
    </>
  )
}
