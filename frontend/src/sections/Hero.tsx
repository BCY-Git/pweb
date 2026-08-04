import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, Mail } from 'lucide-react'
import type { Profile } from '../types'
import './Hero.css'

interface HeroProps {
  profile: Profile | null
}

export function Hero({ profile }: HeroProps) {
  const name = profile?.name ?? 'Martin'
  const title = profile?.title ?? 'AI Agent 全栈开发工程师'

  return (
    <section id="hero" className="hero">
      {/* 流动渐变背景光斑 */}
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__blob hero__blob--1" />
        <div className="hero__blob hero__blob--2" />
        <div className="hero__blob hero__blob--3" />
        <div className="hero__noise" />
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

        <motion.h1
          className="hero__name"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {name}
        </motion.h1>

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
          专注 React 前端工程化与 NestJS 后端架构，热爱把想法落地成产品。
        </motion.p>

        <motion.div
          className="hero__cta"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <a href="#projects" className="hero__btn hero__btn--primary">
            查看项目 <ArrowRight size={16} />
          </a>
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
