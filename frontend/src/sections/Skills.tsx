import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { DriftWall, type DriftWallItem } from '../components/DriftWall'
import { Section } from '../components/Section'
import type { SkillGroup } from '../types'
import './Skills.css'

interface SkillsProps {
  groups: SkillGroup[]
}

/** 分类 key → 中文标签 */
const CATEGORY_LABELS: Record<string, string> = {
  frontend: '前端',
  backend: '后端',
  database: '数据库',
  devops: '工程化',
  ai: 'AI',
}

export function Skills({ groups }: SkillsProps) {
  const wallItems = useMemo<DriftWallItem[]>(() => {
    const colors: Record<string, string> = {
      frontend: '#155e75',
      backend: '#2563a8',
      database: '#0f766e',
      devops: '#a16207',
      ai: '#16829a',
    }

    return groups.flatMap((group, groupIndex) =>
      group.items.map((item, itemIndex) => {
        const color = colors[group.category] ?? '#155e75'
        const offset = (groupIndex * 19 + itemIndex * 13) % 72
        const artwork = encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 240" fill="none">
            <defs>
              <filter id="b"><feGaussianBlur stdDeviation="22"/></filter>
            </defs>
            <rect width="360" height="240" fill="#080b14"/>
            <rect width="360" height="240" fill="${color}" opacity=".78"/>
            <circle cx="${80 + offset}" cy="58" r="70" fill="#67e8f9" opacity=".48" filter="url(#b)"/>
            <circle cx="${294 - offset}" cy="192" r="88" fill="#c084fc" opacity=".4" filter="url(#b)"/>
            <path d="M-24 188C78 ${116 - offset} 168 ${256 + offset} 384 64" stroke="white" stroke-opacity=".22" stroke-width="1"/>
            <path d="M-18 210C88 ${142 - offset} 216 ${270 + offset} 378 86" stroke="white" stroke-opacity=".14" stroke-width="1"/>
          </svg>
        `)
        return {
          image: `data:image/svg+xml;charset=UTF-8,${artwork}`,
          title: item.name,
          subtitle: `${CATEGORY_LABELS[group.category] ?? group.label} · 熟练度 ${item.level}/5`,
        }
      }),
    )
  }, [groups])

  return (
    <Section id="skills" title="技能栈" subtitle="skills" tone="cool">
      <motion.div
        className="skills-wall"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
      >
        <div className="skills-wall__intro">
          <p className="skills-wall__eyebrow mono">// TECHNOLOGY IN MOTION</p>
          <p className="skills-wall__hint">
            鼠标移动可改变视角；悬停技能卡片查看所属方向与熟练度。
          </p>
        </div>

        <div className="skills-wall__viewport">
          {wallItems.length > 0 && (
            <DriftWall
              items={wallItems}
              columns={5}
              tileWidth={176}
              tileHeight={118}
              gap={14}
              tilt={14}
              turn={-12}
              perspective={1200}
              depth={88}
              speed={20}
              variance={0.35}
              parallax={0.45}
              lift={52}
              fade={0.55}
              dim={0.72}
              overlayColor="rgba(7, 10, 18, 0.24)"
            />
          )}
        </div>

        {wallItems.length === 0 && (
          <p className="skills__empty">技能数据加载中…</p>
        )}
      </motion.div>

      {/* 分类图例 */}
      {groups.length > 0 && (
        <div className="skills-legend">
          {groups.map((g) => (
            <span key={g.category} className="skills-legend__tag mono">
              {CATEGORY_LABELS[g.category] ?? g.label} · {g.items.length}
            </span>
          ))}
        </div>
      )}
    </Section>
  )
}
