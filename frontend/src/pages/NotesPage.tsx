import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft } from 'lucide-react'
import { useApplyTheme } from '../hooks/useTheme'
import './NotesPage.css'

/**
 * 学习笔记详情页：/notes/:slug
 *
 * 笔记以 Markdown 文件存放在 public/notes/ 下，直接 fetch 渲染，
 * 更新笔记 = 编辑 md 文件 + 提交 git，无需动后端。
 */
export default function NotesPage() {
  useApplyTheme()
  const { slug } = useParams<{ slug: string }>()
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetch(`/notes/${slug}.md`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then(setContent)
      .catch(() => setError(true))
  }, [slug])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  return (
    <div className="notes-page">
      <div className="notes-page__bar">
        <Link to="/" className="notes-page__back">
          <ArrowLeft size={16} />
          返回首页
        </Link>
      </div>
      <article className="notes-page__body">
        {error && <p className="notes-page__error">笔记加载失败 😢</p>}
        {content === null && !error && (
          <p className="notes-page__loading">加载中…</p>
        )}
        {content !== null && (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        )}
      </article>
    </div>
  )
}
