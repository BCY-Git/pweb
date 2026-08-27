import { useEffect, useMemo, useRef } from 'react'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ComposeOption } from 'echarts/core'
import type { BarSeriesOption, LineSeriesOption } from 'echarts/charts'
import type {
  GridComponentOption,
  LegendComponentOption,
  TooltipComponentOption,
} from 'echarts/components'
import { motion } from 'framer-motion'
import { Eye, FileText, ThumbsUp, Users, ExternalLink } from 'lucide-react'
import { Section } from '../components/Section'
import type { CsdnArticle, CsdnOverview, CsdnSnapshot } from '../types'
import './Blog.css'

echarts.use([
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
])

type ECOption = ComposeOption<
  | LineSeriesOption
  | BarSeriesOption
  | GridComponentOption
  | TooltipComponentOption
  | LegendComponentOption
>

/** 读取 CSS 变量作为图表配色（主题切换后重新挂载生效） */
function chartColors() {
  const css = getComputedStyle(document.documentElement)
  const v = (name: string) => css.getPropertyValue(name).trim()
  return {
    accent1: v('--accent-1') || '#22d3ee',
    accent2: v('--accent-2') || '#a855f7',
    text: v('--text-secondary') || '#a1a1aa',
    border: v('--border') || 'rgba(255,255,255,0.08)',
  }
}

/**
 * 挂 ECharts 的 Hook：option 变化时重建图表，容器尺寸变化时自适应。
 */
function useEChart(option: ECOption | null) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || !option) return
    const chart = echarts.init(ref.current)
    chart.setOption(option)
    const ro = new ResizeObserver(() => chart.resize())
    ro.observe(ref.current)
    return () => {
      ro.disconnect()
      chart.dispose()
    }
  }, [option])

  return ref
}

interface BlogProps {
  overview: CsdnOverview | null
  trend: CsdnSnapshot[]
  articles: CsdnArticle[]
}

const fmt = (n: number) => (n >= 10000 ? `${(n / 10000).toFixed(1)}w` : n.toLocaleString())

export function Blog({ overview, trend, articles }: BlogProps) {
  const latest = overview?.latest ?? null
  const previous = overview?.previous ?? null

  /** 与上一次快照的增量（首日采集时没有上一次快照） */
  const delta = (key: keyof CsdnSnapshot): number | null => {
    if (!latest || !previous) return null
    return (latest[key] as number) - (previous[key] as number)
  }

  const totalLikes = useMemo(
    () => articles.reduce((sum, a) => sum + a.diggCount, 0),
    [articles],
  )

  const trendOption = useMemo<ECOption | null>(() => {
    if (trend.length === 0) return null
    const c = chartColors()
    return {
      grid: { top: 40, left: 12, right: 16, bottom: 8, containLabel: true },
      tooltip: { trigger: 'axis' },
      legend: {
        data: ['总访问量', '粉丝数'],
        textStyle: { color: c.text },
        top: 0,
      },
      xAxis: {
        type: 'category',
        data: trend.map((s) => s.date.slice(5)),
        axisLine: { lineStyle: { color: c.border } },
        axisLabel: { color: c.text },
      },
      yAxis: [
        {
          type: 'value',
          name: '访问量',
          nameTextStyle: { color: c.text },
          axisLabel: { color: c.text },
          splitLine: { lineStyle: { color: c.border } },
        },
        {
          type: 'value',
          name: '粉丝',
          nameTextStyle: { color: c.text },
          axisLabel: { color: c.text },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: '总访问量',
          type: 'line',
          smooth: true,
          data: trend.map((s) => s.totalViews),
          lineStyle: { color: c.accent1, width: 2 },
          itemStyle: { color: c.accent1 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: `${c.accent1}55` },
                { offset: 1, color: `${c.accent1}00` },
              ],
            },
          },
        },
        {
          name: '粉丝数',
          type: 'line',
          smooth: true,
          yAxisIndex: 1,
          data: trend.map((s) => s.fansCount),
          lineStyle: { color: c.accent2, width: 2 },
          itemStyle: { color: c.accent2 },
        },
      ],
    }
  }, [trend])

  const topOption = useMemo<ECOption | null>(() => {
    if (articles.length === 0) return null
    const c = chartColors()
    const top = [...articles]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 8)
      .reverse()
    return {
      grid: { top: 8, left: 12, right: 40, bottom: 8, containLabel: true },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'value',
        axisLabel: { color: c.text },
        splitLine: { lineStyle: { color: c.border } },
      },
      yAxis: {
        type: 'category',
        data: top.map((a) =>
          a.title.length > 18 ? `${a.title.slice(0, 18)}…` : a.title,
        ),
        axisLine: { lineStyle: { color: c.border } },
        axisLabel: { color: c.text },
      },
      series: [
        {
          type: 'bar',
          data: top.map((a) => a.viewCount),
          barWidth: 14,
          itemStyle: {
            borderRadius: [0, 7, 7, 0],
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: c.accent1 },
                { offset: 1, color: c.accent2 },
              ],
            },
          },
          label: { show: true, position: 'right', color: c.text },
        },
      ],
    }
  }, [articles])

  const trendRef = useEChart(trendOption)
  const topRef = useEChart(topOption)

  // 暂不在个人站展示的系列文章；保留在 CSDN 原站，不影响同步数据与统计。
  const hiddenArticleIds = useMemo(
    () => new Set(['161294629', '161265637', '161259229']),
    [],
  )

  const featuredArticles = useMemo(
    () =>
      [...articles]
        .filter((article) => !hiddenArticleIds.has(article.articleId))
        .sort((a, b) => b.viewCount - a.viewCount || b.postTime.localeCompare(a.postTime))
        .slice(0, 5),
    [articles, hiddenArticleIds],
  )

  if (!latest) {
    return (
      <Section id="blog" title="技术博客" subtitle="csdn blog">
        <div className="blog-empty" role="status">
          <FileText size={22} aria-hidden="true" />
          <div>
            <strong>CSDN 数据正在首次同步</strong>
            <p>
              同步完成后，这里会展示访问趋势、热门文章和最新发布内容。
            </p>
          </div>
        </div>
      </Section>
    )
  }

  const stats = [
    {
      icon: Eye,
      label: '总访问量',
      value: latest.totalViews,
      delta: delta('totalViews'),
    },
    {
      icon: FileText,
      label: '原创文章',
      value: latest.originalCount,
      delta: delta('originalCount'),
    },
    {
      icon: Users,
      label: '粉丝',
      value: latest.fansCount,
      delta: delta('fansCount'),
    },
    { icon: ThumbsUp, label: '累计获赞', value: totalLikes, delta: null },
  ]

  return (
    <Section id="blog" title="技术博客" subtitle="csdn blog">
      <motion.div
        className="blog"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
      >
        <p className="blog__intro">
          我在{' '}
          <a href={overview?.blogUrl} target="_blank" rel="noreferrer">
            CSDN
          </a>{' '}
          持续输出技术文章，以下数据每日自动同步。
        </p>

        {/* 统计卡片 */}
        <div className="blog-stats">
          {stats.map(({ icon: Icon, label, value, delta: d }) => (
            <div key={label} className="blog-stat">
              <Icon size={18} className="blog-stat__icon" />
              <div className="blog-stat__value">{fmt(value)}</div>
              <div className="blog-stat__label">
                {label}
                {d !== null && d > 0 && (
                  <span className="blog-stat__delta">+{fmt(d)}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 图表区 */}
        <div className="blog-charts">
          {trendOption && (
            <div className="blog-chart">
              <h3 className="blog-chart__title">数据趋势（每日快照）</h3>
              <div ref={trendRef} className="blog-chart__canvas" />
              {trend.length < 2 && (
                <p className="blog-chart__hint">
                  快照数据自 {trend[0]?.date} 起每日积累，趋势图将随时间丰富
                </p>
              )}
            </div>
          )}
          {topOption && (
            <div className="blog-chart">
              <h3 className="blog-chart__title">热门文章 Top 8（阅读量）</h3>
              <div ref={topRef} className="blog-chart__canvas" />
            </div>
          )}
        </div>

        {/* 精选文章：按阅读量排序，优先展示代表作。 */}
        {featuredArticles.length > 0 && (
          <div className="blog-recent">
            <h3 className="blog-chart__title">精选文章（按阅读量）</h3>
            <ul className="blog-recent__list">
              {featuredArticles.map((a) => (
                <li key={a.articleId}>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="blog-recent__item"
                  >
                    <span className="blog-recent__title">
                      {a.title}
                      <ExternalLink size={13} />
                    </span>
                    <span className="blog-recent__meta mono">
                      {a.postTime.slice(0, 10)} · 阅读 {a.viewCount} · 赞{' '}
                      {a.diggCount}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </Section>
  )
}
