import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, Mail } from 'lucide-react'
import DotGrid from '../components/DotGrid'
import ParticleText from '../components/ParticleText'
import { StarBorder } from '../components/StarBorder'
import type { Profile } from '../types'
import './Hero.css'

interface HeroProps {
  profile: Profile | null
}

/** 首屏始终为深色，以便与下方暖白内容区形成清晰层次。 */
const DOT_COLORS = {
  dark: { baseColor: '#2b2b38', activeColor: '#22d3ee' },
} as const

const NAME_COLORS = {
  dark: { color: '#e4e4e7', highlightColor: '#22d3ee' },
} as const

export function Hero({ profile }: HeroProps) {
  const name = profile?.name ?? 'BCY'
  const title = profile?.title ?? 'AI Agent 全栈开发工程师'
  const dotColors = DOT_COLORS.dark
  const nameColors = NAME_COLORS.dark

  return (
    <section id="hero" className="hero">
      {/* DotGrid 交互点阵背景（React Bits）：鼠标靠近点亮主题色，点击触发冲击波 */}
      <div className="hero__bg" aria-hidden="true">
        <DotGrid
          dotSize={5}
          gap={28}
          baseColor={dotColors.baseColor}
          activeColor={dotColors.activeColor}
          proximity={130}
          speedTrigger={80}
          shockRadius={260}
          shockStrength={4}
          resistance={750}
          returnDuration={1.4}
        />
        <div className="hero__bg-overlay" />
      </div>

      <div className="container hero__content">
        <motion.p
          className="hero__greeting mono"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="hero__dot" /> 你好，我是
        </motion.p>

        {/* 粒子聚拢姓名（React Bits ParticleText）*/}
        <motion.div
          className="hero__name-particles"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <ParticleText
            text={name}
            particleSize={2.2}
            density={5}
            color={nameColors.color}
            highlightColor={nameColors.highlightColor}
            scatter={200}
            gatherDuration={1600}
            stagger={450}
            pointerRepel={40}
            repelRadius={120}
            idleDrift={0}
            trigger="mount"
            fontSize="clamp(3rem, 10vw, 6.5rem)"
            fontWeight={800}
            fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            glow={true}
          />
        </motion.div>

        <motion.p
          className="hero__title"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="gradient-text">{title}</span>
        </motion.p>

        <motion.p
          className="hero__desc"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          把 Agent、RAG 与本机能力集成为可控、可中断、可恢复的工程链路。
        </motion.p>

        <motion.div
          className="hero__cta"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <StarBorder
            className="hero__star-btn"
            color="#22d3ee"
            speed={4}
            radius={10}
          >
            <a href="#projects" className="hero__btn hero__btn--primary">
              查看项目 <ArrowRight size={16} />
            </a>
          </StarBorder>
          <a href="#contact" className="hero__btn">
            <Mail size={16} /> 联系我
          </a>
        </motion.div>
      </div>

      <a href="#about" className="hero__scroll" aria-label="向下滚动">
        <ChevronDown size={20} />
      </a>
    </section>
  )
}
