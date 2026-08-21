import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

interface AnimatedContentProps {
  children: ReactNode
  direction?: Direction
  distance?: number
  duration?: number
  delay?: number
  className?: string
}

const directionToOffset = (dir: Direction, dist: number) => {
  switch (dir) {
    case 'up':
      return { x: 0, y: dist }
    case 'down':
      return { x: 0, y: -dist }
    case 'left':
      return { x: dist, y: 0 }
    case 'right':
      return { x: -dist, y: 0 }
    default:
      return { x: 0, y: 0 }
  }
}

/**
 * React Bits AnimatedContent —— 通用滚动入场动画 wrapper。
 *
 * 封装 Framer Motion 的 whileInView，支持方向、距离、时长、延迟配置。
 * 用它包裹任意元素即可获得统一的进场效果。
 */
export function AnimatedContent({
  children,
  direction = 'up',
  distance = 30,
  duration = 0.5,
  delay = 0,
  className = '',
}: AnimatedContentProps) {
  const offset = directionToOffset(direction, distance)

  const variants: Variants = {
    hidden: { opacity: 0, x: offset.x, y: offset.y },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration, delay, ease: 'easeOut' },
    },
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      {children}
    </motion.div>
  )
}
