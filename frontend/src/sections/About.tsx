import { Code2, FolderGit2, Layers } from 'lucide-react'
import type { Profile, ProjectStats } from '../types'
import { AnimatedContent } from '../components/AnimatedContent'
import { CountUp } from '../components/CountUp'
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
      end: stats?.totalProjects ?? 0,
      suffix: '',
      label: '项目数',
    },
    {
      icon: Layers,
      end: stats?.techCount ?? 0,
      suffix: '',
      label: '技术栈',
    },
    {
      icon: Code2,
      end: 300,
      suffix: '+',
      label: '自动化测试',
    },
  ]

  return (
    <Section id="about" title="关于我" subtitle="about">
      <div className="about">
        <AnimatedContent direction="right" distance={30} duration={0.5}>
          <div className="about__bio">
            <p>
              我专注于 <strong>AI Agent 全栈开发</strong>，把模型调用构建为可控、
              可中断、可恢复的工程链路。熟悉意图路由、工具调用编排、
              Human-in-the-loop 与运行事件流观测。
            </p>
            <p>
              具备 RAG 混合检索、私有化模型接入与端到端系统交付经验；
              在个人项目 <strong>MindTree</strong>{' '}
              中，所有变更均通过 Command 系统执行，结合 Schema 校验、
              版本检查与事务保障复杂交互下的数据一致性。
            </p>
            <p>
              {profile?.location && <span className="mono">{profile.location} · </span>}
              重视测试、密钥保护与保密环境的离线部署和现场交付。
            </p>
          </div>
        </AnimatedContent>

        <AnimatedContent direction="left" distance={30} duration={0.5} delay={0.1}>
          <div className="about__stats">
            {cards.map((c, i) => (
              <div key={i} className="about__stat-card">
                <c.icon size={22} className="about__stat-icon" />
                <div className="about__stat-value gradient-text">
                  <CountUp end={c.end} suffix={c.suffix} duration={1500} />
                </div>
                <div className="about__stat-label">{c.label}</div>
              </div>
            ))}
          </div>
        </AnimatedContent>
      </div>
    </Section>
  )
}
