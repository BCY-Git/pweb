import type { ReactNode } from 'react'
import { BlurText } from './BlurText'

interface SectionProps {
  id: string
  title?: string
  subtitle?: string
  children: ReactNode
  tone?: 'paper' | 'data' | 'stone' | 'ink' | 'cool' | 'sand'
  /** 整板块背景层（如 WebGL 背景），绝对定位铺满，置于内容之下 */
  background?: ReactNode
}

/**
 * 板块容器：统一的内边距、标题模糊进场动画、内容区。
 * 标题用 React Bits BlurText 逐词对焦进场。
 */
export function Section({ id, title, subtitle, children, tone = 'paper', background }: SectionProps) {
  return (
    <section id={id} className={`section section--${tone}`}>
      {background && (
        <div className="section__background" aria-hidden="true">
          {background}
        </div>
      )}
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
