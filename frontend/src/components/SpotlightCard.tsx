import type { ReactNode } from 'react'
import './SpotlightCard.css'

interface SpotlightCardProps {
  children: ReactNode
  className?: string
  /** 聚光灯半径（px） */
  radius?: number
  /** 聚光灯颜色 */
  color?: string
}

/**
 * React Bits SpotlightCard —— 鼠标跟随聚光灯卡片。
 *
 * 纯 CSS 变量 + radial-gradient 实现，零 rAF，性能极好。
 * 鼠标移动时更新 --mouse-x/--mouse-y，径向渐变跟随光标。
 */
export function SpotlightCard({
  children,
  className = '',
  radius = 300,
  color = 'rgba(34, 211, 238, 0.08)',
}: SpotlightCardProps) {
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`)
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`)
  }

  return (
    <div
      className={`spotlight-card ${className}`.trim()}
      style={
        {
          '--spotlight-radius': `${radius}px`,
          '--spotlight-color': color,
        } as React.CSSProperties
      }
      onMouseMove={handleMouseMove}
    >
      {children}
    </div>
  )
}
