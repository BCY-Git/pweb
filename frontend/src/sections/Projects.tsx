import type { Project } from '../types'
import { ProjectCard } from '../components/ProjectCard'
import { Section } from '../components/Section'
import './Projects.css'

interface ProjectsProps {
  projects: Project[]
}

export function Projects({ projects }: ProjectsProps) {
  // 重点项目单独大卡片展示，其余走网格
  const featured = projects.filter((p) => p.isFeatured)
  const others = projects.filter((p) => !p.isFeatured)

  return (
    <Section id="projects" title="项目经历" subtitle="projects">
      {featured.length > 0 && (
        <div className="projects__featured">
          {featured.map((p, i) => (
            <ProjectCard key={p.id} project={p} featured index={i} />
          ))}
        </div>
      )}

      {others.length > 0 && (
        <>
          {featured.length > 0 && (
            <p className="projects__group-label mono">// 其他参与项目</p>
          )}
          <div className="projects__grid">
            {others.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        </>
      )}

      {projects.length === 0 && (
        <p className="projects__empty">项目数据加载中…</p>
      )}
    </Section>
  )
}
