import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import OptionWheel from '../components/OptionWheel'
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
  // 把所有技能扁平化成标签数组（只显示技能名，避免文字过长导致重叠）
  const allItems = useMemo(() => {
    const items: string[] = []
    for (const g of groups) {
      for (const item of g.items) {
        items.push(item.name)
      }
    }
    return items
  }, [groups])

  // 找到当前选中技能所属的分类
  const [selectedIdx, setSelectedIdx] = useState(Math.floor(0))

  return (
    <Section id="skills" title="技能栈" subtitle="skills">
      <motion.div
        className="skills-wheel"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
      >
        <p className="skills-wheel__hint mono">
          // 滚动 · 拖拽 · 方向键 浏览全部 {allItems.length} 项技能
        </p>

        <div className="skills-wheel__viewport">
          {allItems.length > 0 && (
            <OptionWheel
              items={allItems}
              defaultSelected={0}
              onChange={(idx) => setSelectedIdx(idx)}
              textColor="var(--text-tertiary)"
              activeColor="var(--accent-1)"
              side="left"
              fontSize={2}
              spacing={1.5}
              curve={0.8}
              tilt={5}
              blur={1.5}
              fade={0.2}
              minOpacity={0.08}
              smoothing={200}
              inset={40}
              loop={true}
              draggable={true}
            />
          )}
        </div>

        {allItems[selectedIdx] && (
          <div className="skills-wheel__current">
            <span className="skills-wheel__current-label">当前技能：</span>
            <span className="gradient-text">{allItems[selectedIdx]}</span>
          </div>
        )}

        {allItems.length === 0 && (
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
