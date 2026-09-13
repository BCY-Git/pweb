// 跨页面复用的小 UI 片段。React 里"组件就是函数"——没有 Vue 的 SFC 单文件组件，
// 一个返回 JSX 的函数就是一个组件，放同一个文件里完全没问题。

export function JobBadge({ status }: { status: string }) {
  return <span className={`badge status-${status}`}>{status}</span>
}

export function StatusBadge({ status }: { status: 'active' | 'paused' | 'done' }) {
  const map = {
    active: { cls: 'green', label: '进行中' },
    paused: { cls: 'orange', label: '暂停' },
    done: { cls: 'gray', label: '已完成' },
  } as const
  return <span className={`badge ${map[status].cls}`}>{map[status].label}</span>
}

export function PriorityDots({ n }: { n: number }) {
  // 优先级 1高 2中 3低 → 红点/橙点/灰点
  const color = n === 1 ? 'var(--red)' : n === 2 ? 'var(--orange)' : '#c1c6cd'
  return (
    <span style={{ color, fontSize: 11 }} title={`优先级 ${n === 1 ? '高' : n === 2 ? '中' : '低'}`}>
      ●
    </span>
  )
}

export function todayStr(): string {
  const d = new Date()
  const p = (x: number) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function fmtDateTime(s: string): string {
  // "2026-09-09 08:30:00" → "09-09 08:30"
  return s ? s.slice(5, 16) : ''
}
