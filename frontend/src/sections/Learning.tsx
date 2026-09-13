import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, BookOpen } from 'lucide-react'
import { Section } from '../components/Section'
import './Learning.css'

/** 笔记元信息（对应 public/notes/index.json） */
interface NoteMeta {
  slug: string
  title: string
  description: string
  status: string
  topicsTotal: number
  topicsDone: number
  problemCount: number
  tags: string[]
  updatedAt: string
}

function formatUpdatedAt(value: string) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

/**
 * 学习板块：展示 public/notes/ 下的学习笔记索引，
 * 点击卡片进入笔记详情页（/notes/:slug）。
 */
export function Learning() {
  const [notes, setNotes] = useState<NoteMeta[]>([])

  useEffect(() => {
    fetch('/notes/index.json')
      .then((res) => res.json())
      .then((data: { notes: NoteMeta[] }) => setNotes(data.notes ?? []))
      .catch(() => setNotes([]))
  }, [])

  if (notes.length === 0) return null

  return (
    <Section id="learning" title="学习笔记" subtitle="learning" tone="paper">
      <motion.div
        className="learning"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
      >
        <div className="learning__eyebrow">
          <BookOpen size={16} aria-hidden="true" />
          <span>持续积累 · 可追溯的学习记录</span>
        </div>
        <div className="learning__list">
          {notes.map((note) => {
            const progress = Math.min(
              100,
              Math.round((note.topicsDone / Math.max(note.topicsTotal, 1)) * 100),
            )
            return (
              <motion.div
                key={note.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35 }}
              >
                <Link
                  to={`/notes/${note.slug}`}
                  className="learning-entry"
                  aria-label={`阅读${note.title}，当前${note.status}`}
                >
                  <div
                    className="learning-entry__progress"
                    style={{ '--progress': `${progress}%` } as CSSProperties}
                    aria-label={`学习进度 ${progress}%`}
                  >
                    <strong>{progress}</strong>
                    <span>%</span>
                  </div>

                  <div className="learning-entry__content">
                    <div className="learning-entry__meta mono">
                      <span className="learning-entry__status">{note.status}</span>
                      <span>专题 {note.topicsDone}/{note.topicsTotal}</span>
                      <span>{note.problemCount} 题</span>
                    </div>
                    <h3>{note.title}</h3>
                    <p>{note.description}</p>
                    <div className="learning-entry__tags">
                      {note.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="learning-entry__action">
                    <span>更新于 {formatUpdatedAt(note.updatedAt)}</span>
                    <strong>
                      查看笔记 <ArrowUpRight size={16} />
                    </strong>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </Section>
  )
}
