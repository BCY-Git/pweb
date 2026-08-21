import { useEffect, useState, lazy, Suspense } from 'react'
import { api } from './api'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { About } from './sections/About'
import { Contact } from './sections/Contact'
import { Hero } from './sections/Hero'
import { Projects } from './sections/Projects'
import { Skills } from './sections/Skills'
import { useApplyTheme } from './hooks/useTheme'

// ECharts 体积较大，Blog 板块懒加载分包，不拖慢首屏
const Blog = lazy(() =>
  import('./sections/Blog').then((m) => ({ default: m.Blog })),
)
import type {
  CsdnArticle,
  CsdnOverview,
  CsdnSnapshot,
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
  const [csdnOverview, setCsdnOverview] = useState<CsdnOverview | null>(null)
  const [csdnTrend, setCsdnTrend] = useState<CsdnSnapshot[]>([])
  const [csdnArticles, setCsdnArticles] = useState<CsdnArticle[]>([])

  useEffect(() => {
    // 并行加载所有数据，单个失败不影响其他板块
    Promise.allSettled([
      api.getProfile(),
      api.getProjects(),
      api.getProjectStats(),
      api.getSkills(),
      api.getCsdnOverview(),
      api.getCsdnTrend(30),
      api.getCsdnArticles(),
    ]).then(([pRes, projRes, statsRes, skillsRes, ovRes, trendRes, artRes]) => {
      if (pRes.status === 'fulfilled') setProfile(pRes.value)
      if (projRes.status === 'fulfilled') setProjects(projRes.value)
      if (statsRes.status === 'fulfilled') setStats(statsRes.value)
      if (skillsRes.status === 'fulfilled') setSkills(skillsRes.value)
      if (ovRes.status === 'fulfilled') setCsdnOverview(ovRes.value)
      if (trendRes.status === 'fulfilled') setCsdnTrend(trendRes.value)
      if (artRes.status === 'fulfilled') setCsdnArticles(artRes.value)
    })
  }, [])

  return (
    <>
      <Navbar />
      <main>
        <Hero profile={profile} />
        <About profile={profile} stats={stats} />
        <Projects projects={projects} />
        <Skills groups={skills} />
        <Suspense fallback={null}>
          <Blog
            overview={csdnOverview}
            trend={csdnTrend}
            articles={csdnArticles}
          />
        </Suspense>
        <Contact profile={profile} />
      </main>
      <Footer />
    </>
  )
}
