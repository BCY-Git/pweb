import type { ReactNode } from 'react'
import { BlurText } from './BlurText'

interface SectionProps {
  id: string
  title?: string
  subtitle?: string
  children: ReactNode
}

/**
 * 板块容器：统一的内边距、标题模糊进场动画、内容区。
 * 标题用 React Bits BlurText 逐词对焦进场。
 */
export function Section({ id, title, subtitle, children }: SectionProps) {
  return (
    <section id={id} className="section">
      <div className="container">
        {title && (
          <div>
            <p className="section-subtitle">// {subtitle ?? id}</p>
            <h2 className="section-title">
              <BlurText text={title} />
            </h2>
          </div>
        )}
        {children}
      </div>
    </section>
  )
}
