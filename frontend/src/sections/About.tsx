import { motion } from 'framer-motion'
import { Code2, FolderGit2, Layers } from 'lucide-react'
import type { Profile, ProjectStats } from '../types'
import { Section } from '../components/Section'
import './About.css'

interface AboutProps {
  profile: Profile | null
  stats: ProjectStats | null
}

export function About({ profile, stats }: AboutProps) {
  const cards = [
    {
      icon: FolderGit2,
      value: stats?.totalProjects ?? 0,
      label: '项目数',
    },
    {
      icon: Layers,
      value: stats?.techCount ?? 0,
      label: '技术栈',
    },
    {
      icon: Code2,
      value: '20+',
      label: '版本迭代',
    },
  ]

  return (
    <Section id="about" title="关于我" subtitle="about">
      <div className="about">
        <motion.div
          className="about__bio"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <p>
            我是一名专注于 <strong>AI Agent 全栈开发</strong> 的工程师，
            热爱把想法落地成产品。擅长 React 前端工程化与 NestJS 后端架构，
            对 LLM 应用集成、Agent 设计有实战经验。
          </p>
          <p>
            我相信好的软件来自清晰的分层与持续的小步迭代
            —— 这也是我在个人项目{' '}
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="about__link"
            >
              MindTree
            </a>{' '}
            里坚持的原则：从 0.2 迭代到 1.20，20+ 个版本，
            配套 30+ 篇设计文档，所有变更走命令层保证可撤销。
          </p>
          <p>
            {profile?.location && (
              <>
                <span className="mono">{profile.location}</span> · 基于 NestJS + React 构建
              </>
            )}
            {!profile?.location && <>本站基于 NestJS + React 构建</>}
          </p>
        </motion.div>

        <motion.div
          className="about__stats"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {cards.map((c, i) => (
            <div key={i} className="about__stat-card">
              <c.icon size={22} className="about__stat-icon" />
              <div className="about__stat-value gradient-text">{c.value}</div>
              <div className="about__stat-label">{c.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}
