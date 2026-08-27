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
 * React Bits StarBorder —— 使用单色细边框强调主操作。
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
