import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { gsap } from 'gsap'
import './CardSwap.css'

type CardProps = ComponentPropsWithoutRef<'div'> & {
  customClass?: string
}

/** 可组合的项目卡片外壳，供 CardSwap 作为卡组内容使用。 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ customClass, className, ...props }, ref) => (
    <div
      ref={ref}
      {...props}
      className={`card-swap__card ${customClass ?? ''} ${className ?? ''}`.trim()}
    />
  ),
)
Card.displayName = 'Card'

type Slot = { x: number; y: number; z: number; zIndex: number }

const makeSlot = (index: number, distanceX: number, distanceY: number, total: number): Slot => ({
  x: index * distanceX,
  y: -index * distanceY,
  z: -index * distanceX * 1.5,
  zIndex: total - index,
})

interface CardSwapProps {
  width?: number
  height?: number
  cardDistance?: number
  verticalDistance?: number
  delay?: number
  pauseOnHover?: boolean
  skewAmount?: number
  children: ReactNode
}

/**
 * 叠放卡组：前卡下落时，后续卡片逐层提升到新的展示位。
 * 基于用户提供的 GSAP CardSwap 交互，改为本项目的无 Tailwind 实现。
 */
export function CardSwap({
  width = 560,
  height = 470,
  cardDistance = 54,
  verticalDistance = 36,
  delay = 2000,
  pauseOnHover = true,
  skewAmount = 4,
  children,
}: CardSwapProps) {
  const childArr = useMemo(
    () => Children.toArray(children).filter(isValidElement),
    [children],
  )
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const order = useRef<number[]>([])
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const intervalRef = useRef<number | null>(null)
  const isPausedRef = useRef(false)

  useEffect(() => {
    const total = childArr.length
    const cards = cardsRef.current.slice(0, total)
    order.current = Array.from({ length: total }, (_, index) => index)

    cards.forEach((card, index) => {
      if (!card) return
      const slot = makeSlot(index, cardDistance, verticalDistance, total)
      gsap.set(card, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        xPercent: -50,
        yPercent: -50,
        skewY: skewAmount,
        transformOrigin: 'center center',
        zIndex: slot.zIndex,
        force3D: true,
      })
    })

    const swap = () => {
      if (isPausedRef.current || order.current.length < 2 || timelineRef.current) return

      const [front, ...rest] = order.current
      const frontCard = cards[front]
      if (!frontCard) return

      const timeline = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: () => {
          order.current = [...rest, front]
          timelineRef.current = null
        },
      })
      timelineRef.current = timeline

      timeline.to(frontCard, { y: '+=560', duration: 0.8 })
      timeline.addLabel('promote', '-=0.36')

      rest.forEach((index, position) => {
        const card = cards[index]
        if (!card) return
        const slot = makeSlot(position, cardDistance, verticalDistance, total)
        timeline.set(card, { zIndex: slot.zIndex }, 'promote')
        timeline.to(
          card,
          { x: slot.x, y: slot.y, z: slot.z, duration: 0.8 },
          `promote+=${position * 0.12}`,
        )
      })

      const backSlot = makeSlot(total - 1, cardDistance, verticalDistance, total)
      timeline.addLabel('return', 'promote+=0.45')
      timeline.set(frontCard, { zIndex: backSlot.zIndex }, 'return')
      timeline.to(
        frontCard,
        { x: backSlot.x, y: backSlot.y, z: backSlot.z, duration: 0.8 },
        'return',
      )
    }

    intervalRef.current = window.setInterval(swap, delay)

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      timelineRef.current?.kill()
      timelineRef.current = null
    }
  }, [cardDistance, childArr.length, delay, skewAmount, verticalDistance])

  const pause = () => {
    if (!pauseOnHover) return
    isPausedRef.current = true
    timelineRef.current?.pause()
  }

  const resume = () => {
    if (!pauseOnHover) return
    isPausedRef.current = false
    timelineRef.current?.play()
  }

  return (
    <div
      className="card-swap"
      style={{ '--card-width': `${width}px`, '--card-height': `${height}px` } as CSSProperties}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      {childArr.map((child, index) => (
        <div
          className="card-swap__item"
          key={child.key ?? index}
          ref={(node) => {
            cardsRef.current[index] = node
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
