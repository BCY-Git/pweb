import { Code2, FolderGit2, Layers } from 'lucide-react'
import type { ProjectStats } from '../types'
import Scanner from '../components/Scanner'
import { AnimatedContent } from '../components/AnimatedContent'
import { CountUp } from '../components/CountUp'
import { Section } from '../components/Section'
import './About.css'

interface AboutProps {
  stats: ProjectStats | null
}

export function About({ stats }: AboutProps) {
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
    <Section
      id="about"
      title="关于我"
      subtitle="about"
      tone="paper"
      background={
        /* 整板块 WebGL 背景：贴着 paper 色调的青色扫描线，置于内容之下 */
        <Scanner
          color1="#0f6e82"
          color2="#148ca5"
          color3="#f2ede2"
          speed={0.4}
          opacity={0.55}
          grainIntensity={0.03}
          mouseInteraction={false}
        />
      }
    >
      <div className="about">
        <AnimatedContent direction="right" distance={30} duration={0.5}>
          <div className="about__bio">
            <p>
              我习惯以<strong>“工程化”</strong>的方式学习：不为学而学，而是带着真实问题进入新领域，
              再把学到的东西沉淀为可复用的资产。前端是我从零自学并独立负责的方向——从架构设计到工程落地，
              支撑起<strong>千万级项目</strong>的交付；后端与 AI 侧，我主动扩展到 Agent、RAG 混合检索与私有化模型接入，
              把新能力快速组织成可控、可中断、可恢复的工程链路。我也坚持系统化的基础训练，
              用带进度追踪的笔记把学习拆解为可追溯、可复盘的过程。
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
