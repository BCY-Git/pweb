import { motion } from 'framer-motion'
import './BlurText.css'

interface BlurTextProps {
  text: string
  className?: string
  /** 每个词之间的错峰延迟（秒） */
  stagger?: number
  /** 动画时长（秒） */
  duration?: number
}

/**
 * React Bits BlurText —— 标题逐词模糊→清晰进场。
 *
 * 把文字拆成词，每个词从 blur(10px) + 下沉 + 透明
 * 逐个对焦到清晰。纯 Framer Motion + CSS filter，性能好。
 */
export function BlurText({
  text,
  className = '',
  stagger = 0.08,
  duration = 0.5,
}: BlurTextProps) {
  const words = text.split(' ')

  return (
    <span className={`blur-text ${className}`.trim()}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="blur-text__word"
          initial={{ filter: 'blur(10px)', opacity: 0, y: 16 }}
          whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{
            duration,
            delay: i * stagger,
            ease: 'easeOut',
          }}
        >
          {word}
          {i < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </span>
  )
}
