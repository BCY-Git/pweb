import { Injectable, NotFoundException } from '@nestjs/common'
import { Project } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { ProjectDto } from './projects.dto'

/**
 * 把数据库 Project 实体转成响应 DTO。
 *
 * 处理 JSON 字符串 → 数组的反序列化。
 */
function toDto(p: Project): ProjectDto {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    coverUrl: p.coverUrl,
    demoUrl: p.demoUrl,
    repoUrl: p.repoUrl,
    techStack: safeParseArray(p.techStack),
    highlights: p.highlights ? safeParseArray(p.highlights) : undefined,
    isFeatured: p.isFeatured,
    sortOrder: p.sortOrder,
  }
}

function safeParseArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

/**
 * 项目服务。
 *
 * 提供项目列表（重点项目优先）和详情查询。
 */
@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ProjectDto[]> {
    // 重点项目在前，同级别按 sortOrder
    const projects = await this.prisma.project.findMany({
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
    })
    return projects.map(toDto)
  }

  async findBySlug(slug: string): Promise<ProjectDto> {
    const project = await this.prisma.project.findUnique({ where: { slug } })
    if (!project) {
      throw new NotFoundException(`项目 ${slug} 不存在`)
    }
    return toDto(project)
  }

  async findFeatured(): Promise<ProjectDto | null> {
    const project = await this.prisma.project.findFirst({
      where: { isFeatured: true },
      orderBy: [{ sortOrder: 'asc' }],
    })
    return project ? toDto(project) : null
  }

  /**
   * 统计：项目数、重点项目数、累计技术栈数。
   * 给前端 About 板块的数据卡片用。
   */
  async getStats() {
    const [total, featured, allProjects] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.project.count({ where: { isFeatured: true } }),
      this.prisma.project.findMany({ select: { techStack: true } }),
    ])
    const techSet = new Set<string>()
    for (const p of allProjects) {
      for (const t of safeParseArray(p.techStack)) techSet.add(t)
    }
    return { totalProjects: total, featuredProjects: featured, techCount: techSet.size }
  }

  // 暴露给其他模块的查询（如未来需要 raw 数据）
  asDto(project: Project): ProjectDto {
    return toDto(project)
  }
}
