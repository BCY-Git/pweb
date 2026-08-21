import { useRef, useState, type ReactNode } from 'react'

interface MagnetProps {
  children: ReactNode
  /** 磁性强度（0-1，越大吸得越远） */
  strength?: number
  className?: string
}

/**
 * React Bits Magnet —— 鼠标磁性吸附。
 *
 * 鼠标在容器内移动时，内容被吸引向鼠标方向偏移；
 * 鼠标离开后平滑回到原位。纯 transform，性能好。
 */
export function Magnet({
  children,
  strength = 0.3,
  className = '',
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = (e.clientX - centerX) * strength
    const dy = (e.clientY - centerY) * strength
    setOffset({ x: dx, y: dy })
  }

  const reset = () => setOffset({ x: 0, y: 0 })

  return (
    <div
      ref={ref}
      className={`magnet ${className}`.trim()}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: 'transform 0.3s ease-out',
      }}
    >
      {children}
    </div>
  )
}
