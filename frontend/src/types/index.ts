/**
 * 前端共享类型定义。
 * 与后端 DTO 字段对齐（手动维护，避免引入 OpenAPI codegen 的复杂度）。
 */

export interface Profile {
  name: string
  title: string
  bio: string
  avatarUrl?: string | null
  githubUrl?: string | null
  giteeUrl?: string | null
  email?: string | null
  wechatQrUrl?: string | null
  resumeUrl?: string | null
  location?: string | null
}

export interface Project {
  id: number
  slug: string
  name: string
  tagline: string
  description: string
  coverUrl?: string | null
  demoUrl?: string | null
  repoUrl?: string | null
  techStack: string[]
  highlights?: string[]
  isFeatured: boolean
  sortOrder: number
}

export interface ProjectStats {
  totalProjects: number
  featuredProjects: number
  techCount: number
}

export interface SkillItem {
  name: string
  level: number
}

export interface SkillGroup {
  category: string
  label: string
  items: SkillItem[]
}

/** 后端统一响应包装 */
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
