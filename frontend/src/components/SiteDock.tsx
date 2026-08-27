import { useEffect, useState } from 'react'
import {
  BookOpen,
  Braces,
  BriefcaseBusiness,
  FolderKanban,
  Home,
  Moon,
  Rss,
  Send,
  Sun,
  UserRound,
} from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import Dock, { type DockItemData } from './Dock'

const SECTIONS = [
  { id: 'hero', label: '首页', icon: Home },
  { id: 'about', label: '关于', icon: UserRound },
  { id: 'experience', label: '经历', icon: BriefcaseBusiness },
  { id: 'projects', label: '项目', icon: FolderKanban },
  { id: 'skills', label: '技能', icon: Braces },
  { id: 'learning', label: '学习', icon: BookOpen },
  { id: 'blog', label: '博客', icon: Rss },
  { id: 'contact', label: '联系', icon: Send },
] as const

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  window.history.replaceState(null, '', `#${id}`)
}

export function SiteDock() {
  const [activeSection, setActiveSection] = useState('hero')
  const [compact, setCompact] = useState(() =>
    window.matchMedia('(max-width: 640px)').matches,
  )
  const { theme, toggle } = useTheme()

  useEffect(() => {
    const updateActiveSection = () => {
      const threshold = window.innerHeight * 0.38
      let current: (typeof SECTIONS)[number]['id'] = SECTIONS[0].id

      for (const section of SECTIONS) {
        const element = document.getElementById(section.id)
        if (element && element.getBoundingClientRect().top <= threshold) {
          current = section.id
        }
      }

      setActiveSection(current)
    }

    updateActiveSection()
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)
    return () => {
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)')
    const handleChange = (event: MediaQueryListEvent) => setCompact(event.matches)
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  const items: DockItemData[] = [
    ...SECTIONS.map(({ id, label, icon: Icon }) => ({
      label,
      icon: <Icon size={compact ? 17 : 19} strokeWidth={1.8} />,
      active: activeSection === id,
      onClick: () => scrollToSection(id),
    })),
    {
      label: theme === 'dark' ? '切换浅色' : '切换深色',
      icon:
        theme === 'dark' ? (
          <Sun size={compact ? 17 : 19} strokeWidth={1.8} />
        ) : (
          <Moon size={compact ? 17 : 19} strokeWidth={1.8} />
        ),
      onClick: toggle,
      className: 'dock-item--theme',
    },
  ]

  return (
    <Dock
      items={items}
      panelHeight={compact ? 50 : 60}
      baseItemSize={compact ? 38 : 46}
      magnification={compact ? 54 : 68}
      distance={compact ? 120 : 180}
    />
  )
}
