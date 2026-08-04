import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface SectionProps {
  id: string
  title?: string
  subtitle?: string
  children: ReactNode
}

/**
 * 板块容器：统一的内边距、标题样式、滚动浮现动画。
 */
export function Section({ id, title, subtitle, children }: SectionProps) {
  return (
    <section id={id} className="section">
      <div className="container">
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <p className="section-subtitle">// {subtitle ?? id}</p>
            <h2 className="section-title">{title}</h2>
          </motion.div>
        )}
        {children}
      </div>
    </section>
  )
}
