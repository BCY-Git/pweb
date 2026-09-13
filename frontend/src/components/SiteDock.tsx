import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  Braces,
  BriefcaseBusiness,
  FolderKanban,
  Home,
  LayoutDashboard,
  Moon,
  Rss,
  Send,
  Sun,
  UserRound,
} from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { useLanguage } from '../hooks/useLanguage'
import Dock, { type DockItemData } from './Dock'

const SECTIONS = [
  { id: 'hero', icon: Home },
  { id: 'experience', icon: BriefcaseBusiness },
  { id: 'about', icon: UserRound },
  { id: 'blog', icon: Rss },
  { id: 'projects', icon: FolderKanban },
  { id: 'skills', icon: Braces },
  { id: 'learning', icon: BookOpen },
  { id: 'contact', icon: Send },
] as const

const SECTION_LABELS = {
  zh: ['首页', '经历', '关于', '博客', '项目', '技能', '学习', '联系'],
  en: ['Home', 'Experience', 'About', 'Blog', 'Work', 'Skills', 'Notes', 'Contact'],
} as const

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  window.history.replaceState(null, '', `#${id}`)
}

export function SiteDock({ isAuthed = false }: { isAuthed?: boolean }) {
  const [activeSection, setActiveSection] = useState('hero')
  const [compact, setCompact] = useState(() =>
    window.matchMedia('(max-width: 640px)').matches,
  )
  const { theme, toggle } = useTheme()
  const language = useLanguage((s) => s.language)
  const sections = useMemo(
    () => SECTIONS.map((section, index) => ({ ...section, label: SECTION_LABELS[language][index] })),
    [language],
  )

  useEffect(() => {
    const updateActiveSection = () => {
      const threshold = window.innerHeight * 0.38
      let current: (typeof SECTIONS)[number]['id'] = SECTIONS[0].id

      for (const section of sections) {
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
  }, [sections])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)')
    const handleChange = (event: MediaQueryListEvent) => setCompact(event.matches)
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  const items: DockItemData[] = [
    ...sections.map(({ id, label, icon: Icon }) => ({
      label,
      icon: <Icon size={compact ? 17 : 19} strokeWidth={1.8} />,
      active: activeSection === id,
      onClick: () => scrollToSection(id),
    })),
    // 工作台：仅管理员登录后出现，整页跳转到 /app（登录墙后）
    ...(isAuthed
      ? [
          {
            label: language === 'zh' ? '工作台' : 'Workbench',
            icon: <LayoutDashboard size={compact ? 17 : 19} strokeWidth={1.8} />,
            onClick: () => {
              window.location.href = '/app'
            },
          },
        ]
      : []),
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
