import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { Github, Menu, Moon, Sun, X } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import './Navbar.css'

const NAV_ITEMS = [
  { href: '#hero', label: '首页' },
  { href: '#about', label: '关于' },
  { href: '#projects', label: '项目' },
  { href: '#skills', label: '技能' },
  { href: '#learning', label: '学习' },
  { href: '#blog', label: '博客' },
  { href: '#contact', label: '联系' },
]

// 与 GooeyNav 示例的 `colors={[1, 2, 3, 1, 2, 3, 1, 4]}` 对应。
// 白色胶囊保留为主视觉，粒子使用源码示例中的白／靛蓝／洋红层次。
const GOOEY_COLORS = ['#ffffff', '#241bff', '#ff00d9', '#ddd4ff']
const GOOEY_COLOR_SEQUENCE = [0, 1, 2, 0, 1, 2, 0, 3]

type Indicator = {
  left: number
  top: number
  width: number
  height: number
}

type Particle = {
  id: number
  x: number
  y: number
  size: number
  delay: number
  color: string
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [indicator, setIndicator] = useState<Indicator | null>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const navRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const particleId = useRef(0)
  const particleTimer = useRef<number | null>(null)
  const { theme, toggle } = useTheme()

  const updateIndicator = useCallback((index: number) => {
    const nav = navRef.current
    const item = itemRefs.current[index]
    if (!nav || !item) return

    const container = nav.getBoundingClientRect()
    const target = item.getBoundingClientRect()
    setIndicator({
      left: target.left - container.left,
      top: target.top - container.top,
      width: target.width,
      height: target.height,
    })
  }, [])

  const burst = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const next = Array.from({ length: 15 }, (_, index) => {
      const angle = Math.random() * Math.PI * 2
      const distance = 10 + Math.random() * 80
      return {
        id: particleId.current++,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: 3 + Math.random() * 6,
        delay: Math.random() * 300,
        color:
          GOOEY_COLORS[GOOEY_COLOR_SEQUENCE[index % GOOEY_COLOR_SEQUENCE.length] ?? 0] ??
          GOOEY_COLORS[0],
      }
    })
    setParticles(next)
    if (particleTimer.current) window.clearTimeout(particleTimer.current)
    particleTimer.current = window.setTimeout(() => setParticles([]), 960)
  }, [])

  const activate = useCallback(
    (index: number, withBurst = false) => {
      setActiveIndex(index)
      requestAnimationFrame(() => updateIndicator(index))
      if (withBurst) burst()
    },
    [burst, updateIndicator],
  )

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useLayoutEffect(() => {
    activate(activeIndex)
  }, [activate, activeIndex])

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const observer = new ResizeObserver(() => updateIndicator(activeIndex))
    const onResize = () => updateIndicator(activeIndex)
    observer.observe(nav)
    window.addEventListener('resize', onResize)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [activeIndex, updateIndicator])

  useEffect(() => {
    const updateActiveFromScroll = () => {
      const readingLine = window.innerHeight * 0.32
      let nextIndex = 0
      NAV_ITEMS.forEach((item, index) => {
        const section = document.querySelector(item.href)
        if (section && section.getBoundingClientRect().top <= readingLine) {
          nextIndex = index
        }
      })
      activate(nextIndex)
    }

    updateActiveFromScroll()
    window.addEventListener('scroll', updateActiveFromScroll, { passive: true })
    return () => window.removeEventListener('scroll', updateActiveFromScroll)
  }, [activate])

  useEffect(
    () => () => {
      if (particleTimer.current) window.clearTimeout(particleTimer.current)
    },
    [],
  )

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <a href="#hero" className="navbar__logo" onClick={() => setMobileOpen(false)}>
          <span className="navbar__logo-mark">M</span>
          <span className="navbar__logo-text">Martin</span>
        </a>

        <div
          ref={navRef}
          className={`navbar__nav ${mobileOpen ? 'navbar__nav--open' : ''}`}
        >
          {indicator && (
            <span
              className="navbar__gooey-indicator"
              aria-hidden="true"
              style={indicator as CSSProperties}
            >
              {particles.map((particle) => (
                <span
                  key={particle.id}
                  className="navbar__gooey-particle"
                  style={
                    {
                      '--particle-x': `${particle.x}px`,
                      '--particle-y': `${particle.y}px`,
                      '--particle-size': `${particle.size}px`,
                      '--particle-delay': `${particle.delay}ms`,
                      '--particle-color': particle.color,
                    } as CSSProperties
                  }
                />
              ))}
            </span>
          )}
          <nav aria-label="主导航">
          {NAV_ITEMS.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              ref={(element) => {
                itemRefs.current[index] = element
              }}
              className={activeIndex === index ? 'is-active' : ''}
              aria-current={activeIndex === index ? 'page' : undefined}
              onClick={() => {
                activate(index, true)
                setMobileOpen(false)
              }}
            >
              {item.label}
            </a>
          ))}
          </nav>
        </div>

        <div className="navbar__actions">
          <button
            className="navbar__icon-btn"
            onClick={toggle}
            aria-label="切换主题"
            title="切换明暗主题"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a
            className="navbar__icon-btn"
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            title="GitHub"
          >
            <Github size={18} />
          </a>
          <button
            className="navbar__icon-btn navbar__menu-btn"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="菜单"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </header>
  )
}
