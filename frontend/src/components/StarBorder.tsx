import type { ReactNode } from 'react'
import './StarBorder.css'

interface StarBorderProps {
  children: ReactNode
  className?: string
  /** 光点颜色 */
  color?: string
  /** 光点速度（秒/圈） */
  speed?: number
  /** 边框圆角（px） */
  radius?: number
}

/**
 * React Bits StarBorder —— 光点沿按钮边框持续绕行。
 *
 * 用 CSS conic-gradient + @property --angle 旋转实现，
 * 一个亮点绕着边框跑。纯 CSS 动画，性能极好。
 */
export function StarBorder({
  children,
  className = '',
  color = '#22d3ee',
  speed = 3,
  radius = 10,
}: StarBorderProps) {
  return (
    <div
      className={`star-border ${className}`.trim()}
      style={
        {
          '--sb-color': color,
          '--sb-speed': `${speed}s`,
          '--sb-radius': `${radius}px`,
        } as React.CSSProperties
      }
    >
      <div className="star-border__inner">{children}</div>
    </div>
  )
}
