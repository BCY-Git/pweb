import { useEffect, useState } from 'react'
import { api } from './api'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { About } from './sections/About'
import { Contact } from './sections/Contact'
import { CsdnPulse } from './sections/CsdnPulse'
import { Hero } from './sections/Hero'
import { Projects } from './sections/Projects'
import { Skills } from './sections/Skills'
import { useApplyTheme } from './hooks/useTheme'
import type {
  Profile,
  Project,
  ProjectStats,
  SkillGroup,
} from './types'

export default function App() {
  // 应用主题到 <html data-theme>
  useApplyTheme()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [skills, setSkills] = useState<SkillGroup[]>([])

  useEffect(() => {
    // 并行加载所有数据，单个失败不影响其他板块
    Promise.allSettled([
      api.getProfile(),
      api.getProjects(),
      api.getProjectStats(),
      api.getSkills(),
    ]).then(([pRes, projRes, statsRes, skillsRes]) => {
      if (pRes.status === 'fulfilled') setProfile(pRes.value)
      if (projRes.status === 'fulfilled') setProjects(projRes.value)
      if (statsRes.status === 'fulfilled') setStats(statsRes.value)
      if (skillsRes.status === 'fulfilled') setSkills(skillsRes.value)
    })
  }, [])

  return (
    <>
      <Navbar />
      <main>
        <Hero profile={profile} />
        <CsdnPulse />
        <About profile={profile} stats={stats} />
        <Projects projects={projects} />
        <Skills groups={skills} />
        <Contact profile={profile} />
      </main>
      <Footer />
    </>
  )
}
