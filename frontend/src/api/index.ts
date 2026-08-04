import type {
  Profile,
  Project,
  ProjectStats,
  SkillGroup,
} from '../types'
import { request } from './client'

export const api = {
  getProfile: () => request<Profile>('/profile'),
  getProjects: () => request<Project[]>('/projects'),
  getFeaturedProject: () => request<Project | null>('/projects/featured'),
  getProjectStats: () => request<ProjectStats>('/projects/stats'),
  getSkills: () => request<SkillGroup[]>('/skills'),
  sendMessage: (data: { name: string; email?: string; content: string }) =>
    request<{ id: number; createdAt: string }>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
