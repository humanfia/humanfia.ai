import { onBeforeUnmount, onMounted, ref, type Directive, type Ref } from 'vue'

// The home page's motion, in one place. Everything on it moves for one of two reasons: a section
// is pinned and the scroll position inside it is a timeline (`useStickyProgress`), or something
// arrived on screen and plays once (`vReveal`). Both are read off a single scroll listener and a
// single IntersectionObserver, however many sections ask.

export const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v)
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u

/** Where `p` is between `a` and `b`, as 0..1. The workhorse of every scroll timeline. */
export const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a))

export const easeInOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2)
export const easeOut = (u: number) => 1 - (1 - u) ** 3

/** Asked once per call site, never at import: the page is rendered on the server first. */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ---------------------------------------------------------------------------------- scroll

type Tick = () => void
const ticks = new Set<Tick>()
let queued = false

const flush = () => {
  queued = false
  ticks.forEach((tick) => tick())
}
const queue = () => {
  if (!queued) {
    queued = true
    requestAnimationFrame(flush)
  }
}

/** Run `fn` once per animation frame in which the page scrolled or resized. */
export function onScrollFrame(fn: Tick) {
  onMounted(() => {
    if (!ticks.size) {
      addEventListener('scroll', queue, { passive: true })
      addEventListener('resize', queue)
    }
    ticks.add(fn)
    fn()
  })
  onBeforeUnmount(() => {
    ticks.delete(fn)
    if (!ticks.size) {
      removeEventListener('scroll', queue)
      removeEventListener('resize', queue)
    }
  })
}

/**
 * How far the reader has scrolled through a pinned section, 0 at the moment its top reaches the
 * top of the window and 1 when its bottom reaches the bottom. The section is taller than the
 * window and holds a `position: sticky` child, so for that whole distance the child stays put
 * and this number is its timeline.
 */
export function useStickyProgress(el: Ref<HTMLElement | null>) {
  const progress = ref(0)
  onScrollFrame(() => {
    const node = el.value
    if (!node) return
    const box = node.getBoundingClientRect()
    const travel = box.height - innerHeight
    progress.value = travel > 0 ? clamp(-box.top / travel) : box.top < 0 ? 1 : 0
  })
  return progress
}

// ---------------------------------------------------------------------------------- reveal

let io: IntersectionObserver | null = null
const observer = () =>
  (io ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('rv-in')
        io!.unobserve(entry.target)
      }
    },
    { threshold: 0.16, rootMargin: '0px 0px -6% 0px' },
  ))

/**
 * `v-reveal` or `v-reveal="120"`: fade and rise into place the first time the element is on
 * screen, after an optional delay in milliseconds. The hidden state lives in CSS under
 * `.hf-motion`, which is only set once the page has mounted and motion is allowed -- so the
 * server-rendered page, and a reader who asked for less motion, see everything at once.
 */
export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, { value }) {
    el.classList.add('rv')
    if (value) el.style.setProperty('--rv-delay', `${value}ms`)
    observer().observe(el)
  },
  unmounted(el) {
    io?.unobserve(el)
  },
}

/** Calls `fn` once, the first time `el` is mostly on screen. */
export function onFirstSight(el: Ref<HTMLElement | null>, fn: () => void, threshold = 0.35) {
  let seen: IntersectionObserver | null = null
  onMounted(() => {
    if (!el.value) return
    seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        seen?.disconnect()
        fn()
      },
      { threshold },
    )
    seen.observe(el.value)
  })
  onBeforeUnmount(() => seen?.disconnect())
}

// ---------------------------------------------------------------------------------- canvas

/**
 * A canvas that draws every frame while it is on screen and not at all when it is not. `draw`
 * gets the time in seconds and the canvas's CSS size; the backing store is kept at the device
 * pixel ratio, capped at 2 because a third of the pixels again is not worth the fill rate.
 */
export class Stage {
  readonly ctx: CanvasRenderingContext2D
  width = 0
  height = 0
  dpr = 1
  private raf = 0
  private visible = false
  private readonly start = performance.now()
  private readonly ro: ResizeObserver
  private readonly vo: IntersectionObserver

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly draw: (t: number, stage: Stage) => void,
    private readonly animated = true,
  ) {
    this.ctx = canvas.getContext('2d')!
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(canvas)
    this.vo = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting
      if (this.visible) this.loop()
    })
    this.vo.observe(canvas)
    this.resize()
  }

  private resize() {
    const box = this.canvas.getBoundingClientRect()
    this.dpr = Math.min(2, devicePixelRatio || 1)
    this.width = box.width
    this.height = box.height
    this.canvas.width = Math.round(box.width * this.dpr)
    this.canvas.height = Math.round(box.height * this.dpr)
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.frame()
  }

  /** Draw once now -- for a still canvas, or one whose inputs just changed. */
  frame() {
    if (!this.width || !this.height) return
    this.draw((performance.now() - this.start) / 1000, this)
  }

  private loop = () => {
    cancelAnimationFrame(this.raf)
    if (!this.visible) return
    this.frame()
    if (this.animated) this.raf = requestAnimationFrame(this.loop)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    this.vo.disconnect()
  }
}

/** A soft round dot, drawn once and stamped thousands of times: far cheaper than `arc()`. */
export function sprite(color: string, glow: boolean, size = 48) {
  // Fade to the colour itself at zero alpha, not to `transparent`: that is black at zero alpha,
  // and a gradient into it draws a grey fringe round every dot on a light page.
  const n = parseInt(color.slice(1), 16)
  const clear = `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},0)`
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const r = size / 2
  const grad = g.createRadialGradient(r, r, 0, r, r, r)
  if (glow) {
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.22, color)
    grad.addColorStop(1, clear)
  } else {
    grad.addColorStop(0, color)
    grad.addColorStop(0.42, color)
    grad.addColorStop(0.6, color.length === 7 ? `${color}66` : color)
    grad.addColorStop(1, clear)
  }
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return c
}
