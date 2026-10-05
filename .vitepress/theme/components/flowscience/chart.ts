// The arithmetic under the research charts, kept apart from any one of them: scales, the path a
// series draws, and reading a series at an arbitrary x. Self-contained on purpose -- the charts in
// this folder were rebuilt from the "Humanize Intro" deck before the site had a shared chart
// kit, and keeping their maths in one plain module is what lets them move into one later.

import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

export type Point = [number, number]

export interface Series {
  id: string
  label: string
  points: Point[]
  /** Which of the six chart inks to draw in: 0 is the red, kept for the flow the chart is about. */
  tone: number
}

/** A scale, as a pair of maps between a value and a fraction of the axis (0 at the origin). */
export interface Scale {
  to: (v: number) => number
  from: (u: number) => number
  ticks: number[]
  fmt: (v: number) => string
}

export function linear(lo: number, hi: number, ticks: number[], fmt: (v: number) => string): Scale {
  return { to: (v) => (v - lo) / (hi - lo), from: (u) => lo + u * (hi - lo), ticks, fmt }
}

export function log(lo: number, hi: number, ticks: number[], fmt: (v: number) => string): Scale {
  const a = Math.log10(lo)
  const b = Math.log10(hi)
  return {
    to: (v) => (Math.log10(Math.max(v, lo / 10)) - a) / (b - a),
    from: (u) => 10 ** (a + u * (b - a)),
    ticks,
    fmt,
  }
}

/** A scale drawn piecewise between known ticks -- for an axis the source spaced by hand, like
 *  the HLE chart's 0 · 1 · 3 · 10 · 30 · 60 · 120 minutes, whose spacing is no standard transform. */
export function knots(stops: [number, number][], fmt: (v: number) => string): Scale {
  const seg = (v: number, i: 0 | 1) => {
    const o = 1 - i
    for (let k = 0; k < stops.length - 1; k++) {
      const [a, b] = [stops[k], stops[k + 1]]
      if (v <= b[i] || k === stops.length - 2) return a[o] + ((v - a[i]) * (b[o] - a[o])) / (b[i] - a[i])
    }
    return 0
  }
  return { to: (v) => seg(v, 0), from: (u) => seg(u, 1), ticks: stops.map((s) => s[0]), fmt }
}

/** The value of a series at x: the last point at or before it for a step series (a best-so-far
 *  only changes when something is accepted), the straight line between neighbours otherwise. */
export function valueAt(points: Point[], x: number, step: boolean): number | null {
  if (!points.length || x < points[0][0] || x > points[points.length - 1][0]) return null
  let lo = 0
  let hi = points.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (points[mid][0] <= x) lo = mid
    else hi = mid
  }
  const [a, b] = [points[lo], points[hi]]
  if (step || b[0] === a[0]) return x >= b[0] ? b[1] : a[1]
  return a[1] + ((x - a[0]) * (b[1] - a[1])) / (b[0] - a[0])
}

/** The SVG path of a series in a box `w` x `h`, y growing downwards. */
export function pathOf(points: Point[], sx: Scale, sy: Scale, w: number, h: number, step: boolean) {
  let d = ''
  let prevY = 0
  points.forEach(([x, y], i) => {
    const px = (sx.to(x) * w).toFixed(1)
    const py = ((1 - sy.to(y)) * h).toFixed(1)
    if (i === 0) d += `M${px} ${py}`
    else if (step) d += `H${px}V${py}`
    else d += `L${px} ${py}`
    prevY = +py
  })
  return { d, end: prevY }
}

/** The width of an element, kept current: the charts are drawn at the size they are shown, so a
 *  label is the same number of pixels on a phone as on a desktop rather than shrinking with it. */
export function useWidth(el: Ref<HTMLElement | null>, fallback = 720) {
  const width = ref(fallback)
  let ro: ResizeObserver | null = null
  onMounted(() => {
    if (!el.value) return
    width.value = el.value.clientWidth || fallback
    ro = new ResizeObserver(([entry]) => (width.value = Math.round(entry.contentRect.width) || fallback))
    ro.observe(el.value)
  })
  onBeforeUnmount(() => ro?.disconnect())
  return width
}

/** True once `el` has been on screen, and at once when the reader asked for less motion. */
export function useSeen(el: Ref<Element | null>, threshold = 0.3) {
  const seen = ref(false)
  let io: IntersectionObserver | null = null
  onMounted(() => {
    if (!el.value || still()) {
      seen.value = true
      return
    }
    io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          seen.value = true
          io?.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el.value)
  })
  onBeforeUnmount(() => io?.disconnect())
  return seen
}

export const still = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const kilo = (v: number) =>
  v >= 1e6 ? `${+(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${+(v / 1e3).toFixed(1)}k` : `${+v.toFixed(0)}`
