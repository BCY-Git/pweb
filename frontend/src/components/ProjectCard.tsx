import { ExternalLink, Github } from 'lucide-react'
import type { Project } from '../types'
import { Card } from './CardSwap'
import './ProjectCard.css'

interface ProjectCardProps {
  project: Project
  featured?: boolean
}

export function ProjectCard({ project, featured = false }: ProjectCardProps) {
  return (
    <Card customClass={`project-card ${featured ? 'project-card--featured' : ''}`}>
      <article>
        {featured && <span className="project-card__badge">★ 核心项目</span>}

        <div className="project-card__head">
          <h3 className="project-card__name">{project.name}</h3>
          <p className="project-card__tagline">{project.tagline}</p>
        </div>

        {project.highlights && project.highlights.length > 0 && (
          <ul className="project-card__highlights">
            {project.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
          </ul>
        )}

        <div className="project-card__tech">
          {project.techStack.map((tech) => (
            <span key={tech} className="project-card__tech-tag mono">{tech}</span>
          ))}
        </div>

        {(project.repoUrl || project.demoUrl) && (
          <div className="project-card__actions">
            {project.repoUrl && (
              <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="project-card__btn">
                <Github size={15} /> 源码
              </a>
            )}
            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="project-card__btn project-card__btn--primary">
                <ExternalLink size={15} /> Demo
              </a>
            )}
          </div>
        )}
      </article>
    </Card>
  )
}
