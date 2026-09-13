import { Link } from 'react-router-dom'
import { useFetch } from '../useFetch'
import type { Dashboard as Dash } from '../types'

// 今天页 —— 不做 stat 网格（A1 闸门），改成第一人称的日期页：
// 大字日期开头，下面每节形状不同（大数字 / 清单 / 索引 / 引导），≥3 种 section 形状。
function dateLabel(iso: string): { main: string; week: string } {
  const d = new Date(iso + 'T00:00:00')
  const week = '日一二三四五六'[d.getDay()]
  return { main: `${d.getMonth() + 1}月${d.getDate()}日`, week: `星期${week}` }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 36 }}>
      <span className="micro" style={{ display: 'block', marginBottom: 10 }}>{title}</span>
      {children}
    </section>
  )
}

export default function Dashboard() {
  const { data, loading, error } = useFetch<Dash>('/dashboard')

  if (loading) return <div className="loading">载入中</div>
  if (error || !data) return <div className="error-box">{error ?? '加载失败'}</div>

  const { main, week } = dateLabel(data.today)

  return (
    <>
      {/* 开头：一天的日期就是这一页的 display type */}
      <div className="page-head" style={{ marginBottom: 0 }}>
        <h1 className="page-title" style={{ fontSize: 'var(--fs-xl)' }}>
          {main}<span style={{ fontSize: '0.45em', marginLeft: 14, color: 'var(--ink-2)' }}>{week}</span>
        </h1>
        <p className="page-sub">全职求职中 · 做一点是一点</p>
      </div>

      <div className="grid sidebar-content" style={{ marginTop: 8 }}>
        <div>
          {/* 待办：display 大数字 + 真清单 */}
          <Section title={`待办 · ${data.open_todos} 项未完成`}>
            <div className="row" style={{ gap: 18, alignItems: 'baseline' }}>
              <span className="figure">{data.open_todos}</span>
              <span className="muted small">件事悬着</span>
            </div>
            {data.today_todos.length > 0 ? (
              <div className="list" style={{ marginTop: 14 }}>
                {data.today_todos.map((t) => (
                  <div key={t.id} className="todo-item">
                    <div className="grow">
                      <span className="title">{t.title}</span>
                      <div className="small dim">
                        {t.due_date < data.today ? '过期了' : '今天到期'}
                        {t.project_name ? ` · ${t.project_name}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty" style={{ marginBottom: 0 }}>今天没有到期的事。</p>
            )}
            <p className="small" style={{ margin: '12px 0 0' }}>
              <Link to="/todos">全部待办 →</Link>
            </p>
          </Section>

          {/* 求职：索引行，公司名用衬线字号跳出正文 */}
          <Section title={`求职 · 推进中 ${data.active_apps.length}`}>
            {data.active_apps.length === 0 ? (
              <p className="empty" style={{ marginBottom: 0 }}>没有在推进的。投出去才有。</p>
            ) : (
              <div className="list">
                {data.active_apps.map((a) => (
                  <div key={a.id} className="row between" style={{ padding: '12px 0', alignItems: 'baseline' }}>
                    <div>
                      <span className="serif" style={{ fontSize: 'var(--fs-m)' }}>{a.company}</span>
                      <div className="small dim">{a.position}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge status-${a.status}`}>{a.status}</span>
                      {a.next_event_at && (
                        <div className="small dim">{a.next_event_at.slice(5, 10)} 有安排</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="small" style={{ margin: '12px 0 0' }}>
              <Link to="/jobs">求职台 →</Link>
            </p>
          </Section>
        </div>

        <div>
          {/* 学习节奏 */}
          <Section title="学习节奏">
            <div className="row" style={{ gap: 14, alignItems: 'baseline' }}>
              <span className="figure-m">{data.checkin_days_30}</span>
              <span className="dim small">/ 最近 30 天打了卡</span>
            </div>
            <p className="small" style={{ margin: '10px 0 0', color: data.checked_in_yesterday ? 'var(--ink-2)' : 'var(--warn)' }}>
              {data.checked_in_yesterday ? '昨天打了卡，接着来。' : '昨天断了。今天补上就是连续。'}
            </p>
            <p className="small" style={{ margin: '8px 0 0' }}>
              <Link to="/learning">去打卡 →</Link>
            </p>
          </Section>

          {/* 今日记录 */}
          <Section title="今日记录">
            {data.daily_written ? (
              <p className="small" style={{ margin: 0, color: 'var(--ink-2)' }}>
                写过了。临睡前再看一眼，有漏的补上。
              </p>
            ) : (
              <p className="small" style={{ margin: 0, color: 'var(--ink-2)' }}>
                还没写。一句话也行 —— 面了什么、学了什么、卡在哪。
              </p>
            )}
            <p className="small" style={{ margin: '8px 0 0' }}>
              <Link to="/daily">{data.daily_written ? '去看 →' : '写一句 →'}</Link>
            </p>
          </Section>

          {/* 项目 */}
          <Section title="项目">
            <div className="row" style={{ gap: 14, alignItems: 'baseline' }}>
              <span className="figure-m">{data.active_projects}</span>
              <span className="dim small">个在做</span>
            </div>
            <p className="small" style={{ margin: '10px 0 0' }}>
              <Link to="/projects">看板 →</Link>
            </p>
          </Section>
        </div>
      </div>
    </>
  )
}
