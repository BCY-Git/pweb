import { useEffect } from 'react'
import { create } from 'zustand'

type Theme = 'dark' | 'light'

interface ThemeStore {
  theme: Theme
  toggle: () => void
  set: (t: Theme) => void
}

const THEME_KEY = 'portfolio-theme'

/** 读取初始主题：localStorage > 系统偏好 > 默认深色 */
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const saved = localStorage.getItem(THEME_KEY) as Theme | null
  if (saved === 'dark' || saved === 'light') return saved
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
  return prefersLight ? 'light' : 'dark'
}

export const useTheme = create<ThemeStore>((set, get) => ({
  theme: getInitialTheme(),
  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    set({ theme: next })
    localStorage.setItem(THEME_KEY, next)
  },
  set: (t) => {
    set({ theme: t })
    localStorage.setItem(THEME_KEY, t)
  },
}))

/**
 * 把主题应用到 document.documentElement 的 data-theme 属性。
 * 在 App 顶层调用一次。
 */
export function useApplyTheme() {
  const theme = useTheme((s) => s.theme)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
}
