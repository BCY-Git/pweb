import {
  CSSProperties,
  useEffect,
  useRef,
} from 'react'

interface Rgb {
  r: number
  g: number
  b: number
}

const hexToRgb = (hex: string): Rgb | null => {
  const clean = hex.replace('#', '').trim()
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  }
}

const mixRgb = (from: Rgb, to: Rgb, amount: number): Rgb => ({
  r: Math.round(from.r + (to.r - from.r) * amount),
  g: Math.round(from.g + (to.g - from.g) * amount),
  b: Math.round(from.b + (to.b - from.b) * amount),
})

const rgbToCss = (rgb: Rgb): string => `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

interface Particle {
  x: number
  y: number
  startX: number
  startY: number
  targetX: number
  targetY: number
  size: number
  color: string
  seed: number
  depth: number
  delay: number
}

const resolveFontSize = (
  value: number | string,
  container: HTMLElement,
  fontWeight: number,
  fontFamily: string,
): number => {
  if (typeof value === 'number') return value

  const probe = document.createElement('span')
  probe.textContent = 'M'
  probe.style.position = 'absolute'
  probe.style.visibility = 'hidden'
  probe.style.pointerEvents = 'none'
  probe.style.fontSize = value
  probe.style.fontWeight = String(fontWeight)
  probe.style.fontFamily = fontFamily
  container.appendChild(probe)
  const size = parseFloat(window.getComputedStyle(probe).fontSize) || 96
  probe.remove()
  return size
}

const waitForFonts = async (font: string): Promise<void> => {
  if (!('fonts' in document)) return
  try {
    await document.fonts.load(font)
  } catch {
    /* noop */
  }
  await document.fonts.ready
}

interface ParticleTextProps {
  /** 要显示的文字 */
  text?: string
  /** 粒子尺寸（像素） */
  particleSize?: number
  /** 采样密度：越小越密 */
  density?: number
  /** 粒子基础色 */
  color?: string
  /** 粒子高亮色（渐变 + 发光） */
  highlightColor?: string
  /** 散开距离（聚拢动画的起始散布范围） */
  scatter?: number
  /** 聚拢动画总时长（毫秒） */
  gatherDuration?: number
  /** 粒子之间的错峰延迟（毫秒） */
  stagger?: number
  /** 鼠标排斥力度 */
  pointerRepel?: number
  /** 鼠标排斥半径 */
  repelRadius?: number
  /** 静止时的漂移幅度 */
  idleDrift?: number
  /** 聚拢触发时机：mount 进场即播 / hover 悬停时播 / click 点击时播 */
  trigger?: 'mount' | 'hover' | 'click'
  /** 字号（数字 = px，字符串 = 任意 CSS 值如 clamp） */
  fontSize?: number | string
  fontWeight?: number
  fontFamily?: string
  /** 是否启用粒子发光（shadowBlur） */
  glow?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * React Bits 的 ParticleText 组件 —— 粒子聚拢文字。
 *
 * 文字由成百上千个粒子组成：进场时从四面散开位置聚拢成字形，
 * 静止时轻微漂浮，鼠标靠近时粒子被排斥推开。
 *
 * 用 Canvas 2D + 离屏文字采样实现，无第三方依赖。
 * 用作 Hero 首屏的姓名展示，配合 MoltenMetal 液态金属背景。
 */
const ParticleText = ({
  text = 'React Bits',
  particleSize = 2,
  density = 4,
  color = '#ffffff',
  highlightColor = '#8b5cf6',
  scatter = 180,
  gatherDuration = 1600,
  stagger = 420,
  pointerRepel = 40,
  repelRadius = 120,
  idleDrift = 0.7,
  trigger = 'mount',
  fontSize = 'clamp(3rem, 12vw, 8rem)',
  fontWeight = 800,
  fontFamily = 'inherit',
  glow = true,
  className = '',
  style,
}: ParticleTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return undefined

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    let particles: Particle[] = []
    let animationFrame: number | null = null
    let resizeFrame: number | null = null
    let buildId = 0
    let gathering = false
    let gatherStart = 0
    let reducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    let width = 0
    let height = 0
    let dpr = 1

    const pointer = {
      active: false,
      x: 0,
      y: 0,
      smoothX: 0,
      smoothY: 0,
    }

    const startGather = (fromScatter = true) => {
      if (!particles.length) return

      const now = performance.now()
      const spread = reducedMotion ? 0 : scatter

      particles.forEach((particle) => {
        if (fromScatter) {
          const angle = particle.seed * Math.PI * 2
          const distance = spread * (0.35 + particle.depth * 0.75)
          particle.x =
            particle.targetX +
            Math.cos(angle) * distance +
            (particle.depth - 0.5) * spread * 0.55
          particle.y =
            particle.targetY +
            Math.sin(angle) * distance +
            (particle.seed - 0.5) * spread * 0.55
        }

        particle.startX = particle.x
        particle.startY = particle.y
        particle.delay = reducedMotion ? 0 : particle.seed * stagger
      })

      gatherStart = now
      gathering = true
    }

    const drawParticle = (particle: Particle) => {
      const size = particle.size
      ctx.fillStyle = particle.color

      if (size <= 2.1) {
        ctx.fillRect(
          particle.x - size / 2,
          particle.y - size / 2,
          size,
          size,
        )
        return
      }

      ctx.beginPath()
      ctx.arc(particle.x, particle.y, size / 2, 0, Math.PI * 2)
      ctx.fill()
    }

    const render = (now: number) => {
      ctx.clearRect(0, 0, width, height)

      // 【性能】glow（shadowBlur）只在聚拢动画期间开启，
      // 聚拢完成后关掉——静止状态下不需要每帧重绘阴影
      const showGlow = glow && !reducedMotion && gathering
      if (showGlow) {
        ctx.shadowBlur = particleSize * 3
        ctx.shadowColor = highlightColor
      } else {
        ctx.shadowBlur = 0
      }

      pointer.smoothX += (pointer.x - pointer.smoothX) * 0.18
      pointer.smoothY += (pointer.y - pointer.smoothY) * 0.18

      let complete = true
      let needsRedraw = false

      particles.forEach((particle) => {
        let baseX = particle.targetX
        let baseY = particle.targetY
        let progress = 1

        if (gathering) {
          const local =
            (now - gatherStart - particle.delay) /
            Math.max(1, reducedMotion ? 1 : gatherDuration)
          progress = clamp(local, 0, 1)
          const eased = easeOutCubic(progress)
          baseX = particle.startX + (particle.targetX - particle.startX) * eased
          baseY = particle.startY + (particle.targetY - particle.startY) * eased
          if (progress < 1) complete = false
        } else if (!reducedMotion && idleDrift > 0) {
          const driftTime = now * 0.001
          baseX += Math.sin(driftTime * 0.9 + particle.seed * 10) * idleDrift * particle.depth
          baseY += Math.cos(driftTime * 0.75 + particle.depth * 10) * idleDrift * particle.depth
        }

        if (pointer.active && !reducedMotion && pointerRepel > 0 && repelRadius > 0) {
          const dx = baseX - pointer.smoothX
          const dy = baseY - pointer.smoothY
          const distance = Math.hypot(dx, dy)
          if (distance > 0 && distance < repelRadius) {
            const force = Math.pow(1 - distance / repelRadius, 2) * pointerRepel
            baseX += (dx / distance) * force
            baseY += (dy / distance) * force
          }
        }

        const follow = reducedMotion ? 1 : 0.22
        const prevX = particle.x
        const prevY = particle.y
        particle.x += (baseX - particle.x) * follow
        particle.y += (baseY - particle.y) * follow

        ctx.globalAlpha = clamp(0.35 + progress * 0.65, 0, 1)
        drawParticle(particle)

        // 判断是否还在变化（动画中或鼠标排斥导致位移）
        if (Math.abs(particle.x - prevX) > 0.1 || Math.abs(particle.y - prevY) > 0.1) {
          needsRedraw = true
        }
      })

      ctx.globalAlpha = 1
      ctx.shadowBlur = 0

      if (gathering && complete) {
        gathering = false
      }

      // 【性能】静止状态下停止渲染循环，只在有变化时继续。
      // idleDrift 漂浮和鼠标排斥会通过 needsRedraw 触发继续渲染。
      if (needsRedraw || gathering) {
        animationFrame = window.requestAnimationFrame(render)
      } else {
        // 完全静止：停掉循环。鼠标交互/视口返回时由 tryStart 恢复。
        animationFrame = null
      }
    }

    const ensureRenderLoop = () => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(render)
      }
    }

    const sampleText = async () => {
      const currentBuild = ++buildId
      const rect = container.getBoundingClientRect()
      width = Math.floor(rect.width)
      height = Math.floor(rect.height)

      if (width <= 0 || height <= 0) return

      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const computed = window.getComputedStyle(container)
      const resolvedFamily =
        fontFamily === 'inherit' ? computed.fontFamily || 'sans-serif' : fontFamily
      let resolvedSize = resolveFontSize(fontSize, container, fontWeight, resolvedFamily)
      let font = `${fontWeight} ${resolvedSize}px ${resolvedFamily}`

      await waitForFonts(font)
      if (currentBuild !== buildId) return

      const offscreen = document.createElement('canvas')
      const offCtx = offscreen.getContext('2d', { willReadFrequently: true })
      if (!offCtx) return

      const content = String(text || ' ')
      const maxTextWidth = width * 0.92
      offCtx.font = font
      let metrics = offCtx.measureText(content)
      const measuredWidth = Math.max(1, metrics.width)
      if (measuredWidth > maxTextWidth) {
        resolvedSize = Math.max(18, resolvedSize * (maxTextWidth / measuredWidth))
        font = `${fontWeight} ${resolvedSize}px ${resolvedFamily}`
        await waitForFonts(font)
        if (currentBuild !== buildId) return
        offCtx.font = font
        metrics = offCtx.measureText(content)
      }

      const left = Math.ceil(metrics.actualBoundingBoxLeft || 0)
      const right = Math.ceil(metrics.actualBoundingBoxRight || metrics.width)
      const ascent = Math.ceil(metrics.actualBoundingBoxAscent || resolvedSize * 0.78)
      const descent = Math.ceil(metrics.actualBoundingBoxDescent || resolvedSize * 0.22)
      const padding = Math.max(12, Math.ceil(resolvedSize * 0.08))
      const textWidth = Math.max(1, left + right)
      const textHeight = Math.max(1, ascent + descent)

      offscreen.width = textWidth + padding * 2
      offscreen.height = textHeight + padding * 2
      offCtx.clearRect(0, 0, offscreen.width, offscreen.height)
      offCtx.font = font
      offCtx.textAlign = 'left'
      offCtx.textBaseline = 'alphabetic'
      offCtx.fillStyle = '#ffffff'
      offCtx.fillText(content, padding - left, padding + ascent)

      const imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height)
      const targets: { x: number; y: number; alpha: number }[] = []
      const step = Math.max(2, Math.floor(density))

      for (let y = 0; y < offscreen.height; y += step) {
        for (let x = 0; x < offscreen.width; x += step) {
          const alpha = imageData.data[(y * offscreen.width + x) * 4 + 3]
          if (alpha > 40) {
            targets.push({
              x: width / 2 - offscreen.width / 2 + x,
              y: height / 2 - offscreen.height / 2 + y,
              alpha: alpha / 255,
            })
          }
        }
      }

      const maxParticles = Math.max(900, Math.min(5200, Math.floor((width * height) / 90)))
      const stride = Math.max(1, Math.ceil(targets.length / maxParticles))
      const baseRgb = hexToRgb(color)
      const highlightRgb = hexToRgb(highlightColor)
      const selected = targets.filter((_, index) => index % stride === 0)

      particles = selected.map((target, index) => {
        const seed = ((index * 9301 + 49297) % 233280) / 233280
        const depth = 0.45 + (((index * 233 + 97) % 1000) / 1000) * 0.9
        const blend =
          baseRgb && highlightRgb
            ? clamp(
                target.x / Math.max(1, width) + (seed - 0.5) * 0.35,
                0,
                1,
              )
            : 0
        const particleColor =
          baseRgb && highlightRgb
            ? rgbToCss(mixRgb(baseRgb, highlightRgb, blend))
            : color
        const angle = seed * Math.PI * 2
        const distance = (reducedMotion ? 0 : scatter) * (0.35 + depth * 0.75)
        const startX =
          target.x + Math.cos(angle) * distance + (seed - 0.5) * scatter * 0.45
        const startY =
          target.y +
          Math.sin(angle) * distance +
          (depth - 0.9) * scatter * 0.45

        return {
          x: reducedMotion ? target.x : startX,
          y: reducedMotion ? target.y : startY,
          startX,
          startY,
          targetX: target.x,
          targetY: target.y,
          size: Math.max(0.6, particleSize * (0.75 + target.alpha * 0.45)),
          color: particleColor,
          seed,
          depth,
          delay: seed * stagger,
        }
      })

      pointer.x = width / 2
      pointer.y = height / 2
      pointer.smoothX = pointer.x
      pointer.smoothY = pointer.y

      if (reducedMotion) {
        particles.forEach((particle) => {
          particle.x = particle.targetX
          particle.y = particle.targetY
          particle.startX = particle.targetX
          particle.startY = particle.targetY
          particle.delay = 0
        })
        gathering = false
      } else {
        startGather(false)
      }

      ensureRenderLoop()
    }

    const queueSample = () => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame)
      resizeFrame = window.requestAnimationFrame(sampleText)
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      pointer.active = true
      // 初始聚拢结束且 idleDrift 为 0 时，渲染循环会主动暂停。
      // 每次移动鼠标都必须重新唤醒，才能让停留很久后的悬停继续排斥粒子。
      ensureRenderLoop()
    }

    const handlePointerLeave = () => {
      pointer.active = false
      // 唤醒一帧以上的回位动画，避免粒子停留在最后一次排斥位置。
      ensureRenderLoop()
    }

    const handlePointerEnter = (event: PointerEvent) => {
      handlePointerMove(event)
      if (trigger === 'hover') startGather(true)
    }

    const handleClick = () => {
      if (trigger === 'click') startGather(true)
    }

    const reduceMotionQuery = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    )
    const handleReduceMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches
      sampleText()
    }

    reduceMotionQuery?.addEventListener('change', handleReduceMotionChange)
    canvas.addEventListener('pointerenter', handlePointerEnter)
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerleave', handlePointerLeave)
    canvas.addEventListener('click', handleClick)

    const resizeObserver = new ResizeObserver(queueSample)
    resizeObserver.observe(container)
    sampleText()

    return () => {
      buildId += 1
      resizeObserver.disconnect()
      reduceMotionQuery?.removeEventListener('change', handleReduceMotionChange)
      canvas.removeEventListener('pointerenter', handlePointerEnter)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerleave', handlePointerLeave)
      canvas.removeEventListener('click', handleClick)

      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
      if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame)
    }
  }, [
    text,
    particleSize,
    density,
    color,
    highlightColor,
    scatter,
    gatherDuration,
    stagger,
    pointerRepel,
    repelRadius,
    idleDrift,
    trigger,
    fontSize,
    fontWeight,
    fontFamily,
    glow,
  ])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        display: 'block',
        width: '100%',
        height: '100%',
        minHeight: 240,
        overflow: 'hidden',
        touchAction: 'none',
        ...style,
      }}
      aria-label={text}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'block',
          width: '100%',
          height: '100%',
        }}
        aria-hidden="true"
      />
      {/* 屏幕阅读器专用文本（等价 Tailwind sr-only，本项目无 Tailwind 需手写） */}
      <span
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {text}
      </span>
    </div>
  )
}

export default ParticleText
