import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'
import './DriftWall.css'

export interface DriftWallItem {
  image: string
  title: string
  subtitle?: string
}

interface DriftWallProps {
  items: DriftWallItem[]
  columns?: number
  tileWidth?: number
  tileHeight?: number
  gap?: number
  radius?: number
  tilt?: number
  turn?: number
  perspective?: number
  depth?: number
  speed?: number
  direction?: 'up' | 'down'
  variance?: number
  parallax?: number
  pauseOnHover?: boolean
  lift?: number
  fade?: number
  dim?: number
  overlayColor?: string
  className?: string
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const columnFactor = (index: number, variance: number) => {
  const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1
  return 1 + variance * pseudo
}

/**
 * 一个适合内容型页面的 DriftWall：动画由 transform 驱动，重复项不进入键盘焦点序列。
 */
export function DriftWall({
  items,
  columns = 5,
  tileWidth = 176,
  tileHeight = 118,
  gap = 14,
  radius = 16,
  tilt = 14,
  turn = -12,
  perspective = 1200,
  depth = 88,
  speed = 20,
  direction = 'up',
  variance = 0.35,
  parallax = 0.45,
  pauseOnHover = false,
  lift = 52,
  fade = 0.55,
  dim = 0.6,
  overlayColor = 'rgba(8, 10, 18, 0.3)',
  className = '',
}: DriftWallProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const planeRef = useRef<HTMLDivElement>(null)
  const trackRefs = useRef<Array<HTMLDivElement | null>>([])
  const rafRef = useRef<number | null>(null)
  const offsetsRef = useRef<number[]>([])
  const velocitiesRef = useRef<number[]>([])
  const hoveredColumnRef = useRef(-1)
  const wallHoveredRef = useRef(false)
  const pointerRef = useRef({ x: 0, y: 0 })
  const pointerDampedRef = useRef({ x: 0, y: 0 })
  const lastTimestampRef = useRef<number | null>(null)
  const activeIdRef = useRef<string | null>(null)

  const [containerHeight, setContainerHeight] = useState(520)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setReducedMotion(prefersReducedMotion())
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReducedMotion(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const columnItems = useMemo(() => {
    const cols = Array.from({ length: columns }, () => [] as DriftWallItem[])
    items.forEach((item, index) => cols[index % columns]?.push(item))
    return cols.map((col) => (col.length > 0 ? col : items.slice(0, 1)))
  }, [columns, items])

  const columnMeta = useMemo(() => {
    const unit = tileHeight + gap
    return columnItems.map((column) => {
      const copyHeight = Math.max(unit, column.length * unit)
      const copies = Math.max(
        2,
        Math.ceil((containerHeight * 1.7) / copyHeight) + 1,
      )
      return { copyHeight, copies }
    })
  }, [columnItems, containerHeight, gap, tileHeight])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(([entry]) => {
      setContainerHeight(entry?.contentRect.height || 520)
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const baseVelocities = useMemo(() => {
    const directionSign = direction === 'up' ? 1 : -1
    return columnItems.map((_, columnIndex) => {
      const alternateSign = columnIndex % 2 === 0 ? 1 : -1
      return (
        speed *
        columnFactor(columnIndex, variance) *
        directionSign *
        alternateSign
      )
    })
  }, [columnItems, direction, speed, variance])

  useEffect(() => {
    offsetsRef.current = columnMeta.map(
      (meta, columnIndex) => meta.copyHeight * ((columnIndex * 0.37) % 1),
    )
    velocitiesRef.current = columnItems.map(() => 0)
  }, [columnItems, columnMeta])

  const applyPlaneTransform = useCallback(
    (pointerX: number, pointerY: number) => {
      const plane = planeRef.current
      if (!plane) return
      plane.style.transform =
        `translate(-50%, -50%) scale(1.14) ` +
        `rotateX(${tilt + pointerY}deg) rotateY(${turn + pointerX}deg) ` +
        `translateZ(${-depth}px)`
    },
    [depth, tilt, turn],
  )

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp
      }
      const delta = Math.min(
        0.05,
        Math.max(0, timestamp - lastTimestampRef.current) / 1000,
      )
      lastTimestampRef.current = timestamp

      const maxTilt = parallax * 8
      const targetX = pointerRef.current.x * maxTilt
      const targetY = -pointerRef.current.y * maxTilt
      const damp = 1 - Math.exp(-delta / 0.12)
      pointerDampedRef.current.x +=
        (targetX - pointerDampedRef.current.x) * damp
      pointerDampedRef.current.y +=
        (targetY - pointerDampedRef.current.y) * damp
      applyPlaneTransform(
        pointerDampedRef.current.x,
        pointerDampedRef.current.y,
      )

      for (let columnIndex = 0; columnIndex < trackRefs.current.length; columnIndex += 1) {
        const track = trackRefs.current[columnIndex]
        const meta = columnMeta[columnIndex]
        if (!track || !meta) continue

        if (!reducedMotion) {
          const paused = wallHoveredRef.current && pauseOnHover
          const movementFactor =
            paused || hoveredColumnRef.current === columnIndex ? 0 : 1
          const targetVelocity =
            (baseVelocities[columnIndex] ?? 0) * movementFactor
          const easing = 1 - Math.exp(-delta / (targetVelocity === 0 ? 0.16 : 0.28))
          velocitiesRef.current[columnIndex] =
            (velocitiesRef.current[columnIndex] ?? 0) +
            (targetVelocity - (velocitiesRef.current[columnIndex] ?? 0)) * easing

          let nextOffset =
            (offsetsRef.current[columnIndex] ?? 0) +
            (velocitiesRef.current[columnIndex] ?? 0) * delta
          nextOffset =
            ((nextOffset % meta.copyHeight) + meta.copyHeight) % meta.copyHeight
          offsetsRef.current[columnIndex] = nextOffset
        }

        track.style.transform = `translate3d(0, ${-(offsetsRef.current[columnIndex] ?? 0)}px, 0)`
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    // 离屏或切后台时停掉 rAF，避免整页常驻的帧循环空转
    let inView = true
    let pageVisible = !document.hidden

    const stopLoop = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTimestampRef.current = null
    }
    const syncLoop = () => {
      if (inView && pageVisible) {
        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(animate)
        }
      } else {
        stopLoop()
      }
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? false
        syncLoop()
      },
      { rootMargin: '120px 0px' },
    )
    const container = containerRef.current
    if (container) io.observe(container)

    const onVisibility = () => {
      pageVisible = !document.hidden
      syncLoop()
    }
    document.addEventListener('visibilitychange', onVisibility)

    syncLoop()
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      stopLoop()
    }
  }, [applyPlaneTransform, baseVelocities, columnMeta, parallax, pauseOnHover, reducedMotion])

  const activate = useCallback((id: string, columnIndex: number) => {
    if (activeIdRef.current === id) return
    activeIdRef.current = id
    hoveredColumnRef.current = columnIndex
    setActiveId(id)
  }, [])

  const release = useCallback(() => {
    activeIdRef.current = null
    hoveredColumnRef.current = -1
    setActiveId(null)
  }, [])

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      if (parallax > 0 && !reducedMotion) {
        pointerRef.current = {
          x: (event.clientX - rect.left) / rect.width - 0.5,
          y: (event.clientY - rect.top) / rect.height - 0.5,
        }
      }

      const hit = document.elementFromPoint(event.clientX, event.clientY)
      const tile = hit?.closest<HTMLElement>('[data-drift-tile]')
      const id = tile?.dataset.driftTile
      const columnIndex = Number(tile?.dataset.column)
      if (!id || id === activeIdRef.current || Number.isNaN(columnIndex)) return
      activate(id, columnIndex)
    },
    [activate, parallax, reducedMotion],
  )

  const cssVariables = {
    '--dw-tile-w': `${tileWidth}px`,
    '--dw-tile-h': `${tileHeight}px`,
    '--dw-gap': `${gap}px`,
    '--dw-radius': `${radius}px`,
    '--dw-perspective': `${perspective}px`,
    '--dw-lift': `${lift}px`,
    '--dw-dim': dim,
    '--dw-overlay': overlayColor,
    '--dw-edge': `${Math.max(0, (1 - fade) * 100)}%`,
  } as CSSProperties

  if (items.length === 0) return null

  return (
    <div
      ref={containerRef}
      className={['drift-wall', reducedMotion ? 'drift-wall--reduced' : '', className]
        .filter(Boolean)
        .join(' ')}
      style={cssVariables}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => {
        wallHoveredRef.current = true
      }}
      onPointerLeave={() => {
        wallHoveredRef.current = false
        pointerRef.current = { x: 0, y: 0 }
        release()
      }}
      role="list"
      aria-label="技术栈漂浮墙"
    >
      <div ref={planeRef} className="drift-wall__plane">
        {columnItems.map((column, columnIndex) => {
          const meta = columnMeta[columnIndex]
          if (!meta) return null
          return (
            <div className="drift-wall__column" key={`column-${columnIndex}`}>
              <div
                className="drift-wall__track"
                ref={(element) => {
                  trackRefs.current[columnIndex] = element
                }}
              >
                {Array.from({ length: meta.copies }, (_, copyIndex) =>
                  column.map((item, itemIndex) => {
                    const id = `${columnIndex}-${copyIndex}-${itemIndex}`
                    const isOriginal = copyIndex === 0
                    return (
                      <div
                        className={`drift-wall__tile${activeId === id ? ' is-active' : ''}`}
                        data-drift-tile={id}
                        data-column={columnIndex}
                        key={id}
                        tabIndex={isOriginal ? 0 : -1}
                        role="listitem"
                        aria-hidden={!isOriginal}
                        aria-label={`${item.title}${item.subtitle ? `，${item.subtitle}` : ''}`}
                        onFocus={() => activate(id, columnIndex)}
                        onBlur={release}
                      >
                        <span className="drift-wall__inner">
                          <img
                            src={item.image}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                          />
                          <span className="drift-wall__overlay" aria-hidden="true" />
                          <span className="drift-wall__caption">
                            <strong>{item.title}</strong>
                            {item.subtitle && <small>{item.subtitle}</small>}
                          </span>
                        </span>
                      </div>
                    )
                  }),
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
