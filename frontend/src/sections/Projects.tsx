import type { Project } from '../types'
import { CardSwap } from '../components/CardSwap'
import { ProjectCard } from '../components/ProjectCard'
import { Section } from '../components/Section'
import './Projects.css'

interface ProjectsProps {
  projects: Project[]
}

export function Projects({ projects }: ProjectsProps) {
  return (
    <Section id="projects" title="项目经历" subtitle="projects">
      {projects.length > 0 && (
        <div className="projects__deck">
          <div className="projects__deck-copy">
            <p className="mono">// SELECTED WORK</p>
            <span>卡片会自动切换；悬停可暂停阅读。</span>
          </div>
          <CardSwap delay={2000}>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                featured={project.isFeatured}
              />
            ))}
          </CardSwap>
        </div>
      )}

      {projects.length === 0 && (
        <p className="projects__empty">项目数据加载中…</p>
      )}
    </Section>
  )
}
