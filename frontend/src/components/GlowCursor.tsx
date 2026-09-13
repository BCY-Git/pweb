import { useEffect, useRef } from 'react'

const POINT_COUNT = 40

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const mixColor = (progress: number) => {
  const start = [34, 211, 238]
  const end = [167, 139, 250]
  const channel = (index: number) =>
    Math.round(start[index] + (end[index] - start[index]) * progress)
  return `${channel(0)}, ${channel(1)}, ${channel(2)}`
}

/**
 * 覆盖全站的鼠标光轨。使用 Canvas 2D，以兼容普通 WebGL 配置较低的设备。
 * 仅在精细指针设备启用，且不接收任何指针事件。
 */
export function GlowCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const allowsMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches
    if (!canvas || !allowsMotion || !hasFinePointer) return

    const context = canvas.getContext('2d')
    if (!context) return

    const points = Array.from({ length: POINT_COUNT }, () => ({ x: 0, y: 0 }))
    const target = { x: 0, y: 0 }
    const head = { x: 0, y: 0 }
    let width = 1
    let height = 1
    let dpr = 1
    let initialized = false
    let pointerInside = false
    let visible = !document.hidden
    let fade = 0
    let lastMove = performance.now()
    let lastFrame = performance.now()
    let animationFrame = 0
    let destroyed = false

    const resize = () => {
      width = Math.max(window.innerWidth, 1)
      height = Math.max(window.innerHeight, 1)
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const initialiseTrail = (x: number, y: number) => {
      target.x = x
      target.y = y
      head.x = x
      head.y = y
      for (const point of points) {
        point.x = x
        point.y = y
      }
      initialized = true
    }

    const updatePointer = (event: PointerEvent) => {
      const x = clamp(event.clientX, 0, width)
      const y = clamp(event.clientY, 0, height)
      if (!initialized) initialiseTrail(x, y)
      target.x = x
      target.y = y
      pointerInside = true
      lastMove = performance.now()
    }

    const onPointerLeave = () => {
      pointerInside = false
      lastMove = performance.now()
    }

    const strokeSegment = (
      start: { x: number; y: number },
      end: { x: number; y: number },
      progress: number,
      lineWidth: number,
      alpha: number,
    ) => {
      context.beginPath()
      context.moveTo(start.x, start.y)
      context.lineTo(end.x, end.y)
      context.lineWidth = lineWidth
      context.strokeStyle = `rgba(${mixColor(progress)}, ${alpha})`
      context.stroke()
    }

    const drawTrail = (now: number) => {
      context.clearRect(0, 0, width, height)
      if (fade < 0.002 || !initialized) return

      context.save()
      context.globalCompositeOperation = 'lighter'
      context.lineCap = 'round'
      context.lineJoin = 'round'

      for (let index = POINT_COUNT - 2; index >= 0; index -= 1) {
        const progress = index / (POINT_COUNT - 1)
        const life = Math.pow(1 - progress, 0.9) * fade
        const trailWidth = 7.5 - progress * 5
        const pulse = 0.96 + Math.sin(now * 0.003 - progress * 9) * 0.04
        const start = points[index]
        const end = points[index + 1]

        strokeSegment(start, end, progress, trailWidth * 4, life * 0.045 * pulse)
        strokeSegment(start, end, progress, trailWidth * 2, life * 0.12 * pulse)
        strokeSegment(start, end, progress, trailWidth, life * 0.78 * pulse)
      }

      const halo = context.createRadialGradient(head.x, head.y, 0, head.x, head.y, 22)
      halo.addColorStop(0, `rgba(255, 255, 255, ${fade * 0.9})`)
      halo.addColorStop(0.18, `rgba(34, 211, 238, ${fade * 0.55})`)
      halo.addColorStop(1, 'rgba(34, 211, 238, 0)')
      context.fillStyle = halo
      context.beginPath()
      context.arc(head.x, head.y, 22, 0, Math.PI * 2)
      context.fill()
      context.restore()
    }

    const render = (now: number) => {
      if (destroyed || !visible) return
      const delta = Math.min((now - lastFrame) / 16.667, 3)
      lastFrame = now

      if (initialized) {
        const headEase = 1 - Math.pow(1 - 0.19, delta)
        const chainEase = 1 - Math.pow(1 - 0.34, delta)
        head.x += (target.x - head.x) * headEase
        head.y += (target.y - head.y) * headEase
        points[0].x = head.x
        points[0].y = head.y

        for (let index = 1; index < POINT_COUNT; index += 1) {
          points[index].x += (points[index - 1].x - points[index].x) * chainEase
          points[index].y += (points[index - 1].y - points[index].y) * chainEase
        }
      }

      const idle = now - lastMove > 700
      const fadeTarget = initialized && pointerInside && !idle ? 1 : 0
      fade += (fadeTarget - fade) * 0.12
      drawTrail(now)
      animationFrame = requestAnimationFrame(render)
    }

    const onVisibilityChange = () => {
      visible = !document.hidden
      if (visible) {
        lastFrame = performance.now()
        animationFrame = requestAnimationFrame(render)
      } else {
        cancelAnimationFrame(animationFrame)
      }
    }

    window.addEventListener('pointermove', updatePointer, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibilityChange)
    resize()
    animationFrame = requestAnimationFrame(render)

    return () => {
      destroyed = true
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('pointermove', updatePointer)
      window.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return <canvas ref={canvasRef} className="glow-cursor" aria-hidden="true" />
}
