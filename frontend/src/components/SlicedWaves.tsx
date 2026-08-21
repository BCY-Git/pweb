import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Triangle } from 'ogl'
import './SlicedWaves.css'

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [1, 1, 1]
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ]
}

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uColumns;
uniform float uRows;
uniform float uThickness;
uniform float uSpeed;
uniform float uTravel;
uniform float uWaveSpread;
uniform float uRowOffset;
uniform float uSoftness;
uniform float uGlow;
uniform float uBrightness;
uniform float uContrast;
uniform float uOpacity;
uniform float uVertical;
uniform float uAlternate;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uMouseRadius;
uniform float uEnableMouse;
uniform float uMouseActive;
uniform float uGrain;
uniform float uGrainIntensity;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  vec2 grid = vec2(max(uColumns, 1.0), max(uRows, 1.0));
  vec2 p = uv * grid;
  vec2 gv = fract(p) - 0.5;
  vec2 id = floor(p);

  float barCoord, waveId, offId, along;
  if (uVertical > 0.5) {
    barCoord = gv.x; waveId = id.y; offId = id.x; along = uv.y;
  } else {
    barCoord = gv.y; waveId = id.x; offId = id.y; along = uv.x;
  }

  float dir = 1.0;
  if (uAlternate > 0.5 && mod(offId, 2.0) >= 1.0) dir = -1.0;

  float phase = iTime * uSpeed + waveId * uWaveSpread + cos(offId * uRowOffset);
  float mv = sin(phase) * 0.5 + 0.5;
  if (dir < 0.0) mv = 1.0 - mv;

  float infl = 0.0;
  if (uEnableMouse > 0.5) {
    float md = distance(uv, uMouse);
    infl = smoothstep(uMouseRadius, 0.0, md) * uMouseStrength * uMouseActive;
  }

  float thick = clamp(uThickness + infl * 0.25, 0.0, 1.0);
  float startPos = (0.5 - thick * 0.5) * uTravel;
  float endPos = (-0.5 + thick * 0.5) * uTravel;
  float pos = mix(startPos, endPos, mv);

  float aa = max(uSoftness, 0.0005);
  float d = abs(barCoord + pos) - thick * 0.5;
  float aaWidth = fwidth(uVertical > 0.5 ? p.x : p.y);
  float edge = max(aa, aaWidth);
  float mask = smoothstep(edge, -edge, d);
  float glow = exp(-max(d, 0.0) * (7.0 / (uGlow + 0.001))) * clamp(uGlow, 0.0, 1.0);
  float intensity = clamp(mask + glow * (1.0 - mask), 0.0, 1.0);

  if (uGrain > 0.5) {
    float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453);
    intensity = clamp(intensity + (g - 0.5) * uGrainIntensity, 0.0, 1.0);
  }

  float tint = mv;
  vec3 grad = mix(uColor2, uColor1, tint);
  grad = mix(grad, uColor3, clamp(along, 0.0, 1.0) * 0.45);

  vec3 col = grad * uBrightness * (1.0 + infl * 0.6);
  col = (col - 0.5) * uContrast + 0.5;
  col = clamp(col, 0.0, 1.0);

  float a = intensity * uOpacity;
  fragColor = vec4(col * a, a);
}
`

const ctxMap = new WeakMap<
  HTMLDivElement,
  { renderer: Renderer; program: Program; mesh: Mesh }
>()

interface SlicedWavesProps {
  color1?: string
  color2?: string
  color3?: string
  columns?: number
  rows?: number
  barThickness?: number
  speed?: number
  travel?: number
  waveSpread?: number
  rowOffset?: number
  softness?: number
  glow?: number
  brightness?: number
  contrast?: number
  opacity?: number
  orientation?: 'horizontal' | 'vertical'
  alternate?: boolean
  mouseInteraction?: boolean
  mouseStrength?: number
  mouseRadius?: number
  grain?: boolean
  grainIntensity?: number
  className?: string
}

/**
 * React Bits 的 SlicedWaves 组件 —— 切片波形网格背景。
 *
 * 网格状的波形条带横向/纵向流动，带鼠标交互。
 * Shader 无 for 循环，比 MoltenMetal 轻量很多，适合作全屏背景。
 *
 * 内置性能优化：低分辨率渲染(dpr=0.5) + 30fps 降帧 + 视口外暂停。
 */
const SlicedWaves = ({
  color1 = '#FF9FFC',
  color2 = '#5227FF',
  color3 = '#B497CF',
  columns = 14,
  rows = 8,
  barThickness = 0.1,
  speed = 0.35,
  travel = 0.7,
  waveSpread = 0.9,
  rowOffset = 1.0,
  softness = 0.05,
  glow = 0,
  brightness = 1.0,
  contrast = 1.0,
  opacity = 0.5,
  orientation = 'horizontal',
  alternate = false,
  mouseInteraction = true,
  mouseStrength = 1,
  mouseRadius = 0.3,
  grain = true,
  grainIntensity = 0.05,
  className = '',
}: SlicedWavesProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // 【性能】低分辨率渲染 + 降帧：切片波形是色块网格，低分辨率无视觉损失
    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      dpr: 0.5,
    })

    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    const canvas = gl.canvas as HTMLCanvasElement
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    container.appendChild(canvas)

    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uColumns: { value: Math.max(1, Math.round(columns)) },
        uRows: { value: Math.max(1, Math.round(rows)) },
        uThickness: { value: barThickness },
        uSpeed: { value: speed },
        uTravel: { value: travel },
        uWaveSpread: { value: waveSpread },
        uRowOffset: { value: rowOffset },
        uSoftness: { value: softness },
        uGlow: { value: glow },
        uBrightness: { value: brightness },
        uContrast: { value: contrast },
        uOpacity: { value: opacity },
        uVertical: { value: orientation === 'vertical' ? 1.0 : 0.0 },
        uAlternate: { value: alternate ? 1.0 : 0.0 },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uMouseStrength: { value: mouseStrength },
        uMouseRadius: { value: mouseRadius },
        uEnableMouse: { value: mouseInteraction ? 1.0 : 0.0 },
        uMouseActive: { value: 0.0 },
        uGrain: { value: grain ? 1.0 : 0.0 },
        uGrainIntensity: { value: grainIntensity },
        uColor1: { value: new Float32Array([1, 1, 1]) },
        uColor2: { value: new Float32Array([1, 1, 1]) },
        uColor3: { value: new Float32Array([1, 1, 1]) },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })
    ctxMap.set(container, { renderer, program, mesh })

    const setSize = () => {
      const rect = container.getBoundingClientRect()
      const w = Math.max(1, Math.floor(rect.width))
      const h = Math.max(1, Math.floor(rect.height))
      renderer.setSize(w, h)
      const res = program.uniforms.iResolution.value
      res[0] = gl.drawingBufferWidth
      res[1] = gl.drawingBufferHeight
      renderer.render({ scene: mesh })
    }

    const ro = new ResizeObserver(setSize)
    ro.observe(container)
    setSize()

    let currentMouse = [0.5, 0.5]
    let targetMouse = [0.5, 0.5]
    let currentActive = 0
    let targetActive = 0

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      targetMouse = [
        (e.clientX - rect.left) / rect.width,
        1.0 - (e.clientY - rect.top) / rect.height,
      ]
      targetActive = 1
    }
    const onMouseLeave = () => {
      targetActive = 0
    }
    if (mouseInteraction) {
      canvas.addEventListener('mousemove', onMouseMove)
      canvas.addEventListener('mouseleave', onMouseLeave)
    }

    let raf = 0
    let isVisible = true
    let isPageVisible = !document.hidden
    const t0 = performance.now()
    // 【性能】30fps 降帧
    let lastFrame = 0
    const FRAME_INTERVAL = 1000 / 30

    const loop = (t: number) => {
      if (t - lastFrame < FRAME_INTERVAL) {
        raf = requestAnimationFrame(loop)
        return
      }
      lastFrame = t
      program.uniforms.iTime.value = (t - t0) * 0.001
      // 鼠标交互关闭时跳过 lerp 计算，省每帧开销
      if (mouseInteraction) {
        currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0])
        currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1])
        currentActive += 0.05 * (targetActive - currentActive)
        program.uniforms.uMouse.value[0] = currentMouse[0]
        program.uniforms.uMouse.value[1] = currentMouse[1]
        program.uniforms.uMouseActive.value = currentActive
      }
      renderer.render({ scene: mesh })
      raf = requestAnimationFrame(loop)
    }

    const tryStart = () => {
      if (isVisible && isPageVisible && raf === 0) raf = requestAnimationFrame(loop)
    }
    const tryStop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        isVisible ? tryStart() : tryStop()
      },
      // Hero 滚出 70% 时就暂停渲染（不必等完全不可见）
      { threshold: 0.3 },
    )
    io.observe(container)

    const onVisibility = () => {
      isPageVisible = !document.hidden
      isPageVisible ? tryStart() : tryStop()
    }
    document.addEventListener('visibilitychange', onVisibility)

    tryStart()

    return () => {
      tryStop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseleave', onMouseLeave)
      ctxMap.delete(container)
      try {
        container.removeChild(canvas)
      } catch {
        /* noop */
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ctx = ctxMap.get(container)
    if (!ctx) return
    const u = ctx.program.uniforms

    u.uColumns.value = Math.max(1, Math.round(columns))
    u.uRows.value = Math.max(1, Math.round(rows))
    u.uThickness.value = barThickness
    u.uSpeed.value = speed
    u.uTravel.value = travel
    u.uWaveSpread.value = waveSpread
    u.uRowOffset.value = rowOffset
    u.uSoftness.value = softness
    u.uGlow.value = glow
    u.uBrightness.value = brightness
    u.uContrast.value = contrast
    u.uOpacity.value = opacity
    u.uVertical.value = orientation === 'vertical' ? 1.0 : 0.0
    u.uAlternate.value = alternate ? 1.0 : 0.0
    u.uMouseStrength.value = mouseStrength
    u.uMouseRadius.value = mouseRadius
    u.uEnableMouse.value = mouseInteraction ? 1.0 : 0.0
    u.uGrain.value = grain ? 1.0 : 0.0
    u.uGrainIntensity.value = grainIntensity
    const c1 = hexToRgb(color1)
    u.uColor1.value[0] = c1[0]
    u.uColor1.value[1] = c1[1]
    u.uColor1.value[2] = c1[2]
    const c2 = hexToRgb(color2)
    u.uColor2.value[0] = c2[0]
    u.uColor2.value[1] = c2[1]
    u.uColor2.value[2] = c2[2]
    const c3 = hexToRgb(color3)
    u.uColor3.value[0] = c3[0]
    u.uColor3.value[1] = c3[1]
    u.uColor3.value[2] = c3[2]
  }, [
    color1,
    color2,
    color3,
    columns,
    rows,
    barThickness,
    speed,
    travel,
    waveSpread,
    rowOffset,
    softness,
    glow,
    brightness,
    contrast,
    opacity,
    orientation,
    alternate,
    mouseInteraction,
    mouseStrength,
    mouseRadius,
    grain,
    grainIntensity,
  ])

  return (
    <div
      ref={containerRef}
      className={`sliced-waves-container ${className}`.trim()}
    />
  )
}

export default SlicedWaves
