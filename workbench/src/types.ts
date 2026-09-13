// 共享类型：和 server/db.js 里的表结构一一对应。
// 前后端类型对齐靠约定（后端是 JS），改表结构时记得同步这里。

export interface Application {
  id: number
  company: string
  position: string
  source: string
  salary: string
  priority: number // 1高 2中 3低
  status: JobStatus
  next_event_at: string
  notes: string
  created_at: string
  updated_at: string
}

export type JobStatus =
  | '投递' | '约面' | '一面' | '二面' | '终面' | 'offer' | '挂' | '拒'

export interface JobEvent {
  id: number
  application_id: number
  type: string
  happened_at: string
  notes: string
}

export interface DailyLog {
  id: number
  date: string
  content: string
  created_at: string
  updated_at: string
}

export interface LearningTrack {
  id: number
  name: string
  description: string
  status: 'active' | 'paused' | 'done'
  created_at: string
  stat: { total: number; days: number; last_date: string }
}

export interface Checkin {
  id: number
  track_id: number
  date: string
  content: string
  minutes: number
  created_at: string
}

export interface Project {
  id: number
  name: string
  status: 'active' | 'paused' | 'done'
  description: string
  updated_at: string
  open_todos?: number
}

export interface Todo {
  id: number
  title: string
  status: 'open' | 'done'
  priority: number
  due_date: string
  project_id: number | null
  project_name: string | null
  created_at: string
}

export interface Dashboard {
  today: string
  funnel: { status: string; n: number }[]
  next_interview: { id: number; company: string; position: string; next_event_at: string } | null
  open_todos: number
  today_todos: Todo[]
  daily_written: boolean
  checkin_days_30: number
  checked_in_yesterday: boolean
  active_projects: number
  active_apps: Pick<Application, 'id' | 'company' | 'position' | 'status' | 'next_event_at' | 'notes'>[]
}
