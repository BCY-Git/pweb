import { useEffect, useRef, useState, lazy, Suspense, type ReactNode } from 'react'
import { api } from './api'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { SiteDock } from './components/SiteDock'
import { About } from './sections/About'
import { Contact } from './sections/Contact'
import { Experience } from './sections/Experience'
import { Hero } from './sections/Hero'
import { Learning } from './sections/Learning'
import { Projects } from './sections/Projects'
import { Skills } from './sections/Skills'
import { Workflow } from './sections/Workflow'
import { useApplyTheme } from './hooks/useTheme'

// ECharts 体积较大，Blog 板块懒加载分包，不拖慢首屏
const Blog = lazy(() =>
  import('./sections/Blog').then((m) => ({ default: m.Blog })),
)

/**
 * 滚动接近视口才真正挂载子树。
 * lazy() 只延迟下载代码，组件一旦渲染就会立即请求分包；
 * 用占位容器 + IntersectionObserver 把「下载 + 挂载」一起推迟到快滚到的时候。
 */
function DeferredSection({
  children,
  minHeight = 560,
}: {
  children: ReactNode
  minHeight?: number
}) {
  const placeholderRef = useRef<HTMLDivElement>(null)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (shouldRender) return
    const el = placeholderRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldRender(true)
          io.disconnect()
        }
      },
      { rootMargin: '600px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shouldRender])

  return (
    <div ref={placeholderRef} style={shouldRender ? undefined : { minHeight }}>
      {shouldRender ? children : null}
    </div>
  )
}
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

  // 登录态探测：登录过的管理员，导航里才会出现「工作台」入口
  const [isAuthed, setIsAuthed] = useState(false)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [skills, setSkills] = useState<SkillGroup[]>([])
  const [csdnOverview, setCsdnOverview] = useState<CsdnOverview | null>(null)
  const [csdnTrend, setCsdnTrend] = useState<CsdnSnapshot[]>([])
  const [csdnArticles, setCsdnArticles] = useState<CsdnArticle[]>([])

  useEffect(() => {
    // 401 = 普通访客，静默即可；200 = 管理员，导航显示工作台入口
    fetch('/api/v1/auth/me')
      .then((res) => setIsAuthed(res.ok))
      .catch(() => setIsAuthed(false))

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
      <Navbar profile={profile} isAuthed={isAuthed} />
      <main>
        <Hero profile={profile} />
        <div className="content-shell">
          <Experience />
          <About stats={stats} />
          <DeferredSection>
            <Suspense fallback={null}>
              <Blog
                overview={csdnOverview}
                trend={csdnTrend}
                articles={csdnArticles}
              />
            </Suspense>
          </DeferredSection>
          <Projects projects={projects} />
          <Skills groups={skills} />
          <Learning />
          <Workflow />
          <Contact profile={profile} />
        </div>
      </main>
      <Footer profile={profile} />
      <SiteDock isAuthed={isAuthed} />
    </>
  )
}
