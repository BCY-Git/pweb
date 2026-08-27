import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
} from 'motion/react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import './Dock.css'

export interface DockItemData {
  icon: ReactNode
  label: string
  onClick?: () => void
  className?: string
  active?: boolean
}

interface DockItemProps extends DockItemData {
  mouseX: MotionValue<number>
  spring: SpringOptions
  distance: number
  magnification: number
  baseItemSize: number
}

function DockLabel({
  children,
  isHovered,
}: {
  children: ReactNode
  isHovered: MotionValue<number>
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const unsubscribe = isHovered.on('change', (latest) => {
      setIsVisible(latest === 1)
    })
    return unsubscribe
  }, [isHovered])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.span
          initial={{ opacity: 0, y: 4, scale: 0.96 }}
          animate={{ opacity: 1, y: -10, scale: 1 }}
          exit={{ opacity: 0, y: 2, scale: 0.96 }}
          transition={{ duration: 0.16 }}
          className="dock-label"
          role="tooltip"
        >
          {children}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

function DockItem({
  icon,
  label,
  onClick,
  className = '',
  active = false,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
}: DockItemProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const isHovered = useMotionValue(0)

  const mouseDistance = useTransform(mouseX, (value) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize,
    }
    return value - rect.x - rect.width / 2
  })
  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize],
  )
  const size = useSpring(targetSize, spring)

  return (
    <motion.button
      ref={ref}
      type="button"
      style={{ width: size, height: size }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={`dock-item ${active ? 'dock-item--active' : ''} ${className}`}
      aria-label={label}
      aria-current={active ? 'location' : undefined}
    >
      <span className="dock-icon" aria-hidden="true">
        {icon}
      </span>
      <DockLabel isHovered={isHovered}>{label}</DockLabel>
      {active && <span className="dock-active-dot" aria-hidden="true" />}
    </motion.button>
  )
}

interface DockProps {
  items: DockItemData[]
  className?: string
  distance?: number
  panelHeight?: number
  baseItemSize?: number
  dockHeight?: number
  magnification?: number
  spring?: SpringOptions
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 68,
  dockHeight = 180,
  baseItemSize = 50,
}: DockProps) {
  const mouseX = useMotionValue(Infinity)
  const isHovered = useMotionValue(0)
  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [dockHeight, magnification],
  )
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight])
  const height = useSpring(heightRow, spring)

  return (
    <motion.div style={{ height }} className="dock-outer">
      <motion.div
        onMouseMove={({ clientX }) => {
          isHovered.set(1)
          mouseX.set(clientX)
        }}
        onMouseLeave={() => {
          isHovered.set(0)
          mouseX.set(Infinity)
        }}
        className={`dock-panel ${className}`}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="页面快捷导航"
      >
        {items.map((item) => (
          <DockItem
            key={item.label}
            {...item}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
