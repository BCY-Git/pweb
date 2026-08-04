import { motion } from 'framer-motion'
import type { SkillGroup } from '../types'
import { Section } from '../components/Section'
import './Skills.css'

interface SkillsProps {
  groups: SkillGroup[]
}

/** 熟悉度等级 → 文案 */
const LEVEL_LABELS: Record<number, string> = {
  1: '了解',
  2: '熟悉',
  3: '熟练',
  4: '精通',
  5: '专家',
}

export function Skills({ groups }: SkillsProps) {
  return (
    <Section id="skills" title="技能栈" subtitle="skills">
      <div className="skills">
        {groups.map((group, gi) => (
          <motion.div
            key={group.category}
            className="skills__group"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: gi * 0.1 }}
          >
            <h3 className="skills__group-title">
              <span className="skills__group-bar" />
              {group.label}
            </h3>
            <div className="skills__items">
              {group.items.map((item) => (
                <div key={item.name} className="skills__item">
                  <div className="skills__item-head">
                    <span className="skills__item-name">{item.name}</span>
                    <span className="skills__item-level mono">
                      {LEVEL_LABELS[item.level] ?? '熟练'}
                    </span>
                  </div>
                  <div className="skills__bar">
                    <div
                      className="skills__bar-fill"
                      style={{ width: `${(item.level / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {groups.length === 0 && (
          <p className="skills__empty">技能数据加载中…</p>
        )}
      </div>
    </Section>
  )
}
