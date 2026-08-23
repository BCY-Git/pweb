import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, ArrowRight } from 'lucide-react'
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
    <Section id="learning" title="学习笔记" subtitle="learning">
      <motion.div
        className="learning"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
      >
        {notes.map((note) => (
          <Link
            key={note.slug}
            to={`/notes/${note.slug}`}
            className="learning-card"
          >
            <div className="learning-card__head">
              <BookOpen size={20} className="learning-card__icon" />
              <span className="learning-card__status">{note.status}</span>
            </div>
            <h3 className="learning-card__title">{note.title}</h3>
            <p className="learning-card__desc">{note.description}</p>

            {/* 进度条 */}
            <div className="learning-card__progress">
              <div className="learning-card__progress-bar">
                <div
                  className="learning-card__progress-fill"
                  style={{
                    width: `${Math.round((note.topicsDone / note.topicsTotal) * 100)}%`,
                  }}
                />
              </div>
              <span className="learning-card__progress-text mono">
                专题 {note.topicsDone}/{note.topicsTotal} · {note.problemCount} 题
              </span>
            </div>

            <div className="learning-card__foot">
              <div className="learning-card__tags">
                {note.tags.map((t) => (
                  <span key={t} className="learning-card__tag mono">
                    {t}
                  </span>
                ))}
              </div>
              <span className="learning-card__more">
                阅读笔记
                <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </motion.div>
    </Section>
  )
}
