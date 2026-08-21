import type {
  CsdnArticle,
  CsdnOverview,
  CsdnSnapshot,
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
  getCsdnOverview: () => request<CsdnOverview | null>('/csdn/overview'),
  getCsdnTrend: (days = 30) =>
    request<CsdnSnapshot[]>(`/csdn/trend?days=${days}`),
  getCsdnArticles: () => request<CsdnArticle[]>('/csdn/articles'),
  sendMessage: (data: { name: string; email?: string; content: string }) =>
    request<{ id: number; createdAt: string }>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
