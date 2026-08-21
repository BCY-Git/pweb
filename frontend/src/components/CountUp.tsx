import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

interface CountUpProps {
  /** 目标数值 */
  end: number
  /** 动画时长（毫秒） */
  duration?: number
  /** 前缀（如 "20+" 的 "+" 写在 suffix） */
  prefix?: string
  /** 后缀 */
  suffix?: string
  className?: string
}

/**
 * React Bits CountUp —— 数字从 0 滚动增长到目标值。
 *
 * 进入视口时触发，requestAnimationFrame 缓动。
 */
export function CountUp({
  end,
  duration = 1500,
  prefix = '',
  suffix = '',
  className = '',
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return

    let raf = 0
    const start = performance.now()

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // easeOutExpo 缓动
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCount(Math.round(eased * end))

      if (progress < 1) {
        raf = requestAnimationFrame(animate)
      }
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [inView, end, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count}
      {suffix}
    </span>
  )
}
