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
              我专注于 <strong>AI Agent 全栈开发</strong>，具备扎实的数据结构与常见算法基础；
              能够把模型调用、本机能力和业务系统组织成可控、可中断、可恢复的工程链路。
            </p>
            <p>
              在最近负责的<strong>千万级项目</strong>中，我作为当前唯一 Owner 持续维护超过 6 个月，
              覆盖现场部署、交付和问题闭环；该项目获得公司<strong>年度最佳项目奖金</strong>。
            </p>
            <p>
              前端侧负责从 0 到 1 的架构设计与工程落地，是前端 Owner；后端侧主要负责业务逻辑的迭代与修改，
              能够在前后端协作、现场环境与交付节点之间推进复杂项目。
            </p>
            <p>
              具备 RAG 混合检索、私有化模型接入与端到端系统交付经验，重视测试、密钥保护与保密环境下的部署质量。
              {profile?.location && <span className="mono"> {profile.location}</span>}
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
