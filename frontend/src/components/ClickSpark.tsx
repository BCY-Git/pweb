import { useRef, useState, type ReactNode } from 'react'
import './ClickSpark.css'

interface ClickSparkProps {
  children: ReactNode
  className?: string
  /** 火花颜色 */
  color?: string
  /** 火花数量 */
  count?: number
}

interface Spark {
  id: number
  x: number
  y: number
  angle: number
}

let sparkId = 0

/**
 * React Bits ClickSpark —— 点击迸发火花粒子。
 *
 * 点击时在点击位置生成若干小粒子向外迸发，
 * 纯 CSS 动画，1 秒后自动清除。无 Canvas/rAF。
 */
export function ClickSpark({
  children,
  className = '',
  color = '#22d3ee',
  count = 6,
}: ClickSparkProps) {
  const [sparks, setSparks] = useState<Spark[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newSparks: Spark[] = Array.from({ length: count }, (_, i) => ({
      id: sparkId++,
      x,
      y,
      angle: (360 / count) * i + Math.random() * 20,
    }))

    setSparks((prev) => [...prev, ...newSparks])

    // 1 秒后清除
    setTimeout(() => {
      setSparks((prev) =>
        prev.filter((s) => !newSparks.find((ns) => ns.id === s.id)),
      )
    }, 1000)
  }

  return (
    <div
      ref={containerRef}
      className={`click-spark ${className}`.trim()}
      onClick={handleClick}
      style={{ '--cs-color': color } as React.CSSProperties}
    >
      {children}
      {sparks.map((spark) => (
        <span
          key={spark.id}
          className="click-spark__particle"
          style={
            {
              left: `${spark.x}px`,
              top: `${spark.y}px`,
              '--cs-angle': `${spark.angle}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
