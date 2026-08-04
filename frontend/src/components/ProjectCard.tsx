import { motion } from 'framer-motion'
import { ExternalLink, Github } from 'lucide-react'
import type { Project } from '../types'
import './ProjectCard.css'

interface ProjectCardProps {
  project: Project
  featured?: boolean
  index?: number
}

export function ProjectCard({ project, featured = false, index = 0 }: ProjectCardProps) {
  return (
    <motion.article
      className={`project-card ${featured ? 'project-card--featured' : ''}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      {featured && <span className="project-card__badge">★ 重点项目</span>}

      <div className="project-card__head">
        <h3 className="project-card__name">{project.name}</h3>
        <p className="project-card__tagline">{project.tagline}</p>
      </div>

      {project.highlights && project.highlights.length > 0 && (
        <ul className="project-card__highlights">
          {project.highlights.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      )}

      <div className="project-card__tech">
        {project.techStack.map((t) => (
          <span key={t} className="project-card__tech-tag mono">{t}</span>
        ))}
      </div>

      <div className="project-card__actions">
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="project-card__btn"
          >
            <Github size={15} /> 源码
          </a>
        )}
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="project-card__btn project-card__btn--primary"
          >
            <ExternalLink size={15} /> Demo
          </a>
        )}
      </div>
    </motion.article>
  )
}
