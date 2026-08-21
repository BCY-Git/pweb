import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  BookOpenText,
  ChartNoAxesCombined,
  CircleDotDashed,
  Eye,
  Heart,
  MessageCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import './CsdnPulse.css'

type Article = {
  title: string
  topic: string
  reads: number
  likes: number
  comments: number
  publishedAt: string
}

const articles: Article[] = [
  {
    title: '从 Agent Loop 到可验证的工具调用：一次工程化拆解',
    topic: 'AI ENGINEERING',
    reads: 2840,
    likes: 86,
    comments: 14,
    publishedAt: '05.28',
  },
  {
    title: 'React 状态边界：何时使用 Zustand，何时让状态留在组件里',
    topic: 'FRONTEND',
    reads: 1960,
    likes: 61,
    comments: 9,
    publishedAt: '05.14',
  },
  {
    title: 'NestJS 模块分层实践：把业务复杂度留在正确的位置',
    topic: 'BACKEND',
    reads: 1420,
    likes: 42,
    comments: 6,
    publishedAt: '04.30',
  },
]

const trend = [42, 58, 51, 74, 88, 79, 106, 132, 118, 154, 173, 204]

const format = (value: number) => new Intl.NumberFormat('zh-CN').format(value)

export function CsdnPulse() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeArticle = articles[activeIndex]

  const chart = useMemo(() => {
    const width = 720
    const height = 232
    const padX = 8
    const min = Math.min(...trend)
    const max = Math.max(...trend)
    const points = trend.map((value, index) => {
      const x = padX + (index * (width - padX * 2)) / (trend.length - 1)
      const y = height - 20 - ((value - min) / (max - min)) * (height - 48)
      return [x, y] as const
    })
    const line = points.map(([x, y]) => `${x},${y}`).join(' ')
    const area = `${padX},${height} ${line} ${width - padX},${height}`
    return { area, line, points, width, height }
  }, [])

  return (
    <section id="csdn" className="csdn-pulse">
      <div className="csdn-pulse__grain" aria-hidden="true" />
      <div className="container csdn-pulse__inner">
        <motion.div
          className="csdn-pulse__intro"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55 }}
        >
          <div className="csdn-pulse__eyebrow">
            <span className="csdn-pulse__live-dot" /> CSDN / CONTENT INTELLIGENCE
          </div>
          <h2>
            代码之外，<br />
            <em>我也持续输出。</em>
          </h2>
          <p>
            这是一个把文章、阅读与互动沉淀成长期信号的内容工作台。它让技术表达不止停留在链接里。
          </p>
          <a className="csdn-pulse__profile-link" href="https://blog.csdn.net/" target="_blank" rel="noreferrer">
            前往 CSDN 主页 <ArrowUpRight size={16} />
          </a>
        </motion.div>

        <motion.div
          className="csdn-pulse__metrics"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          <div className="csdn-pulse__metric">
            <span>累计阅读</span>
            <strong>18.4<span>k</span></strong>
            <small><ArrowUpRight size={13} /> 24% / 近 90 天</small>
          </div>
          <div className="csdn-pulse__metric">
            <span>内容主题</span>
            <strong>05<span>类</span></strong>
            <small>AI · 工程化 · 全栈</small>
          </div>
          <div className="csdn-pulse__metric">
            <span>读者互动</span>
            <strong>248<span>次</span></strong>
            <small>点赞与评论的真实反馈</small>
          </div>
        </motion.div>

        <motion.div
          className="csdn-pulse__workspace"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-70px' }}
          transition={{ duration: 0.65, delay: 0.16 }}
        >
          <div className="csdn-pulse__chart-head">
            <div>
              <span className="mono">READING MOMENTUM</span>
              <h3>阅读增长轨迹</h3>
            </div>
            <div className="csdn-pulse__chart-total">
              <ChartNoAxesCombined size={18} />
              <span>+386 <small>本月新增阅读</small></span>
            </div>
          </div>
          <div className="csdn-pulse__chart">
            <div className="csdn-pulse__chart-axis" aria-hidden="true">
              <span>200</span><span>140</span><span>80</span><span>20</span>
            </div>
            <svg viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label="最近十二期文章阅读增长趋势">
              <defs>
                <linearGradient id="csdn-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#c8ff3d" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#c8ff3d" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[44, 102, 160, 218].map((y) => <line key={y} x1="0" x2={chart.width} y1={y} y2={y} />)}
              <polygon points={chart.area} />
              <polyline points={chart.line} />
              {chart.points.map(([x, y], index) => (
                <circle key={index} cx={x} cy={y} r={index === chart.points.length - 1 ? 5 : 3} />
              ))}
            </svg>
            <div className="csdn-pulse__chart-labels"><span>01月</span><span>03月</span><span>05月</span><span>07月</span><span>09月</span><span>11月</span></div>
          </div>
        </motion.div>

        <div className="csdn-pulse__bottom">
          <motion.div
            className="csdn-pulse__articles"
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-70px' }}
            transition={{ duration: 0.5 }}
          >
            <div className="csdn-pulse__section-label"><BookOpenText size={16} /> FEATURED WRITING</div>
            {articles.map((article, index) => (
              <button
                type="button"
                className={`csdn-pulse__article ${activeIndex === index ? 'csdn-pulse__article--active' : ''}`}
                key={article.title}
                onClick={() => setActiveIndex(index)}
              >
                <span className="csdn-pulse__article-no">0{index + 1}</span>
                <span className="csdn-pulse__article-copy"><b>{article.title}</b><small>{article.topic} · {article.publishedAt}</small></span>
                <ArrowUpRight size={17} />
              </button>
            ))}
          </motion.div>

          <motion.aside
            className="csdn-pulse__signal"
            initial={{ opacity: 0, x: 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-70px' }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <div className="csdn-pulse__signal-top"><CircleDotDashed size={17} /><span>SELECTED SIGNAL</span></div>
            <p>{activeArticle.topic}</p>
            <h3>{activeArticle.title}</h3>
            <div className="csdn-pulse__engagement">
              <span><Eye size={15} /> {format(activeArticle.reads)}</span>
              <span><Heart size={15} /> {activeArticle.likes}</span>
              <span><MessageCircle size={15} /> {activeArticle.comments}</span>
            </div>
            <div className="csdn-pulse__signal-note">内容不是静态履历，而是持续验证技术判断与表达能力的公开记录。</div>
          </motion.aside>
        </div>
        <p className="csdn-pulse__demo-note mono">DEMO SNAPSHOT · 后续可直接接入 CSDN 同步接口替换为实时数据</p>
      </div>
    </section>
  )
}
