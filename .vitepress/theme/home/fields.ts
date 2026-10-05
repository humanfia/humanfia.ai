import { DOT, PIECES, SLOPE } from './logo'
import { Clock, Stage, clamp, easeInOut, easeOut, lerp, span } from './motion'

// The two moving pictures on the home page. The hero is an SVG -- a dozen flat shapes, so the
// browser keeps every edge sharp and the colours are CSS variables that flip with the theme on
// their own. The stack is a canvas, because it is four planes in perspective and a projection is
// easier to do by hand than to describe to SVG. Neither uses a library.

/** A pointer position as -1..1 on each axis, eased toward rather than jumped to. */
class Pointer {
  x = 0
  y = 0
  private tx = 0
  private ty = 0
  private readonly onMove = (e: PointerEvent) => {
    this.tx = (e.clientX / innerWidth) * 2 - 1
    this.ty = (e.clientY / innerHeight) * 2 - 1
  }
  constructor() {
    addEventListener('pointermove', this.onMove, { passive: true })
  }
  step(k = 0.05) {
    this.x += (this.tx - this.x) * k
    this.y += (this.ty - this.y) * k
  }
  destroy() {
    removeEventListener('pointermove', this.onMove)
  }
}

// ------------------------------------------------------------------------------------- hero

/** Where the H stands at rest, in the SVG's CSS pixels: its centre and its height. */
export type Anchor = { x: number; y: number; size: number }

const SVG = 'http://www.w3.org/2000/svg'
const pts = (p: [number, number][]) => p.map(([x, y]) => `${x},${y}`).join(' ')

/** Ease out with a little overshoot: a plane that arrives with some momentum and sits back. */
const backOut = (u: number, k = 1.6) => 1 + (k + 1) * (u - 1) ** 3 + k * (u - 1) ** 2

/** The diagonal, as a unit vector pointing up the slope (right and up on screen). */
const UP = (() => {
  const n = Math.hypot(1, SLOPE)
  return { x: 1 / n, y: -SLOPE / n }
})()

// The circle's run, in mark units. It rolls down a rail laid on the counter-diagonal -- the
// mirror of the H's own, so the two cross like the bars of a Klutsis poster -- leaves the end of
// it with the speed it built up, and falls into its slot. The rail is a ramp of the same 1 in 3,
// and the flight is solved backwards from where it has to land, so it does land there.
const R = DOT.r
const DOWN = { x: UP.x, y: -UP.y } // down the counter-diagonal: right and down
const NORMAL = { x: -DOWN.y, y: DOWN.x } // perpendicular to the rail, toward the side it sits on
const RUN = 74 // how far it rolls along the rail
const ROLL = 1.05 // seconds on the rail, accelerating from rest
const FLY = 0.36 // seconds in the air
const SPEED = (2 * RUN) / ROLL // uniform acceleration from rest: v = 2s / t
// Where it leaves the rail: as far left of the slot as it travels in the air, and well above it.
const LEAVE = { x: DOT.cx - SPEED * DOWN.x * FLY, y: -42 }
const GRAVITY = (2 * (DOT.cy - LEAVE.y - SPEED * DOWN.y * FLY)) / FLY ** 2
const START = { x: LEAVE.x - DOWN.x * RUN, y: LEAVE.y - DOWN.y * RUN }
const railAt = (p: { x: number; y: number }) => ({ x: p.x + NORMAL.x * R, y: p.y + NORMAL.y * R })

// The intro, in seconds from the moment the page is up. Each piece arrives along its own axis:
// the left stem drops in from above, the crossbar slides up its diagonal, the right stem rises
// out of the baseline, and the circle comes last, the long way round.
const T = {
  guides: [0.1, 0.95],
  disc: [0.25, 1.25],
  stem: [0.45, 1.15],
  bar: [0.75, 1.5],
  post: [0.95, 1.65],
  rail: [1.2, 1.6],
  appear: 1.45,
  roll: 1.75,
  extras: [2.2, 3.4],
  calm: [3.3, 4.3],
} as const
const LAND = T.roll + ROLL + FLY

/**
 * The hero: the H built out of its four primitives, the way a constructivist plate is built --
 * construction lines first, then the planes sliding in along them, then the circle, which rolls
 * down a rail across the composition, leaves it, and drops into the slot over the right stem.
 * It lands the way something with weight does: a squash, a little dip into the gap, a ring that
 * spreads and fades, a nudge through the stem underneath, and then it is still.
 *
 * Afterwards it is a quiet picture: a dial turns slowly round the disc, and the layers move a
 * little apart under the pointer. Scrolling past it pulls the pieces apart along the same axes
 * they came in on and brings the construction lines back -- the drawing it was made from -- so
 * leaving the hero shows how the mark is put together rather than throwing it at the reader.
 */
export class HeroScene {
  progress = 0
  private readonly clock: Clock
  private readonly pointer = new Pointer()
  private readonly el: Record<string, SVGElement> = {}
  private readonly world: SVGGElement

  constructor(
    private readonly svg: SVGSVGElement,
    private readonly still: boolean,
    private readonly anchor: () => Anchor,
  ) {
    this.world = this.build()
    this.clock = new Clock(svg, (t) => this.draw(t), !still)
  }

  /** The shapes, created once; every frame after that only moves them. Mark units throughout:
   *  the H is 96 x 108 with its top left at the origin, and the world group scales it. */
  private build() {
    const make = <K extends keyof SVGElementTagNameMap>(
      tag: K,
      attrs: Record<string, string | number>,
      parent: Element,
      key?: string,
    ) => {
      const node = document.createElementNS(SVG, tag)
      for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v))
      parent.appendChild(node)
      if (key) this.el[key] = node
      return node
    }
    this.svg.replaceChildren()
    const defs = make('defs', {}, this.svg)
    const clip = make('clipPath', { id: 'hf-hero-ground' }, defs)
    // The right stem rises out of the baseline, so it is drawn through a window that ends there.
    make('rect', { x: 60, y: -200, width: 60, height: 308 }, clip)

    const world = make('g', {}, this.svg, 'world')
    const back = make('g', {}, world, 'back')
    make('circle', { class: 'hf-c-disc', cx: 78, cy: 30, r: 70 }, back, 'disc')
    const dial = make('g', { class: 'hf-c-hair' }, back, 'dial')
    make('circle', { cx: 0, cy: 0, r: 82, fill: 'none' }, dial)
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2
      const r0 = i % 6 ? 79 : 75
      make('line', { x1: Math.cos(a) * r0, y1: Math.sin(a) * r0, x2: Math.cos(a) * 82, y2: Math.sin(a) * 82 }, dial)
    }

    const guides = make('g', { class: 'hf-c-hair' }, world, 'guides')
    const line = (key: string) => make('line', {}, guides, key)
    line('g-cap')
    line('g-base')
    line('g-diag')
    line('g-v1')
    line('g-v2')
    make('path', { fill: 'none' }, guides, 'g-arc')
    make('line', {}, guides, 'g-level')

    const extras = make('g', {}, world, 'extras')
    make('rect', { class: 'hf-c-ink', x: -30, y: 116, width: 160, height: 3 }, extras, 'plinth')
    for (let i = 0; i < 3; i++) {
      make('line', { class: 'hf-c-hatch', x1: 110, y1: 92 + i * 7, x2: 152, y2: 78 + i * 7 }, extras, `hatch${i}`)
    }
    make('rect', { class: 'hf-c-outline', x: -6, y: -6, width: 12, height: 12 }, extras, 'square')
    make('rect', { class: 'hf-c-ink', x: -2, y: -22, width: 4, height: 44 }, extras, 'needle')

    const labels = make('g', { class: 'hf-c-label' }, world, 'labels')
    make('text', { x: 31, y: 92 }, labels, 'l-angle').textContent = '18.4°'
    make('text', { x: -30, y: 132 }, labels, 'l-size').textContent = '96 × 108'
    make('text', { x: 130, y: 132, 'text-anchor': 'end' }, labels, 'l-ratio').textContent = '1 : 3'

    make('line', { class: 'hf-c-rail' }, world, 'rail')
    make('circle', { class: 'hf-c-ring', cx: DOT.cx, cy: DOT.cy, r: R }, world, 'ring')

    const mark = make('g', {}, world, 'mark')
    make('polygon', { class: 'hf-c-ink', points: pts(PIECES.stem) }, mark, 'stem')
    make('polygon', { class: 'hf-c-ink', points: pts(PIECES.post) }, make('g', { 'clip-path': 'url(#hf-hero-ground)' }, mark), 'post')
    make('polygon', { class: 'hf-c-ink', points: pts(PIECES.bar) }, mark, 'bar')
    const dot = make('g', {}, mark, 'dot')
    make('circle', { class: 'hf-c-red', cx: 0, cy: 0, r: R }, dot)
    // A notch in the circle so its rolling can be seen; it fades once the circle is home.
    make('rect', { class: 'hf-c-notch', x: -1.4, y: -R, width: 2.8, height: R * 0.62 }, dot, 'notch')
    return world as SVGGElement
  }

  private set(key: string, attrs: Record<string, string | number>) {
    const node = this.el[key]
    for (const k in attrs) node.setAttribute(k, String(attrs[k]))
  }

  private draw(time: number) {
    const t = this.still ? 99 : time
    this.pointer.step()
    const box = this.svg.getBoundingClientRect()
    if (!box.width || !box.height) return
    this.svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`)

    const rest = this.anchor()
    const s = rest.size / 108
    // Scrolling away: e is how far apart the pieces have been drawn, 0 at rest.
    const e = easeInOut(span(this.progress, 0, 0.85))
    const px = this.pointer.x
    const py = this.pointer.y
    const ox = rest.x - 48 * s
    const oy = rest.y - 54 * s - e * 40
    this.set('world', {
      transform: `translate(${ox} ${oy}) scale(${s}) rotate(${-7 * e} 48 54)`,
    })
    // The font size is set in screen pixels, so the labels stay legible at any scale.
    this.set('labels', { 'font-size': 12 / s })
    const layer = (key: string, depth: number) =>
      this.set(key, { transform: `translate(${(px * depth) / s} ${(py * depth) / s})` })
    layer('back', -14)
    layer('guides', -5)
    layer('extras', 9)

    // Construction lines: drawn on first, held while the planes arrive, then let down to a
    // whisper; scrolling brings them back up.
    const g = easeOut(span(t, ...T.guides))
    const calm = easeInOut(span(t, ...T.calm))
    const hair = lerp(1, 0.45, calm) * (1 - e) + e * 1
    this.set('guides', { opacity: hair })
    const reach = (x1: number, y1: number, x2: number, y2: number, u: number) => ({
      x1, y1, x2: lerp(x1, x2, u), y2: lerp(y1, y2, u),
    })
    this.set('g-cap', reach(-70, 0, 170, 0, g))
    this.set('g-base', reach(170, 108, -70, 108, g))
    this.set('g-diag', reach(-110, 50 + 134 * SLOPE, 210, 50 - 186 * SLOPE, easeOut(span(t, 0.3, 1.2))))
    this.set('g-v1', reach(24, -40, 24, 140, easeOut(span(t, 0.2, 1))))
    this.set('g-v2', reach(72, 140, 72, -40, easeOut(span(t, 0.35, 1.15))))
    // The angle the whole mark is built on, measured off the crossbar's foot.
    const a = easeOut(span(t, 0.9, 1.5)) * Math.atan(SLOPE)
    const ar = 34
    this.set('g-arc', { d: `M${24 + ar} 71A${ar} ${ar} 0 0 0 ${24 + ar * Math.cos(a)} ${71 - ar * Math.sin(a)}` })
    this.set('g-level', reach(24, 71, 66, 71, easeOut(span(t, 0.8, 1.2))))
    const labels = clamp(span(t, 1.1, 1.6) * (1 - 0.5 * calm) + e)
    this.set('labels', { opacity: labels })

    // The disc and its dial.
    const d = this.still ? 1 : backOut(span(t, ...T.disc), 1.2)
    const breathe = 1 + Math.sin(t * 0.7) * 0.012 * calm
    this.set('disc', { transform: `translate(78 30) scale(${d * breathe * (1 + e * 0.18)}) translate(-78 -30)` })
    this.set('dial', {
      transform: `translate(78 30) rotate(${-30 + t * 4 + e * 40}) scale(${d})`,
      opacity: d,
    })

    // The planes.
    const stem = easeOut(span(t, ...T.stem))
    const bar = easeOut(span(t, ...T.bar))
    const post = easeOut(span(t, ...T.post))
    const landed = Math.max(0, t - LAND)
    const recoil = landed > 0 ? 2.4 * Math.exp(-9 * landed) * Math.sin(22 * landed) : 0
    this.set('stem', { transform: `translate(0 ${-150 * (1 - stem) - 14 * e})`, opacity: span(stem, 0, 0.15) })
    const slide = -190 * (1 - bar) + 16 * e
    this.set('bar', { transform: `translate(${UP.x * slide} ${UP.y * slide})`, opacity: span(bar, 0, 0.15) })
    this.set('post', { transform: `translate(0 ${84 * (1 - post) + recoil + 14 * e})` })

    this.drawCircle(t, e)

    // The furniture arrives last, each piece along the diagonal, and leans out on the scroll.
    const x = (k: number) => easeOut(span(t, T.extras[0] + k * 0.12, T.extras[0] + k * 0.12 + 0.8))
    const along = (u: number, dist: number) => ({ x: UP.x * dist * (1 - u), y: UP.y * dist * (1 - u) })
    const pl = x(0)
    this.set('plinth', { transform: `translate(${-60 * (1 - pl)} ${10 * e}) scale(${pl} 1)`, opacity: pl })
    for (let i = 0; i < 3; i++) {
      const u = x(1 + i)
      const o = along(u, 40)
      this.set(`hatch${i}`, { transform: `translate(${o.x + 10 * e} ${o.y - 4 * e})`, opacity: u })
    }
    const q = x(4)
    const sq = along(q, -50)
    this.set('square', {
      transform: `translate(${-36 + sq.x - 12 * e} ${92 + sq.y}) rotate(${-18.4 + 90 * (1 - q) + 30 * e})`,
      opacity: q,
    })
    const n = x(5)
    this.set('needle', {
      transform: `translate(${-28} ${30 - 40 * (1 - n) - 10 * e}) rotate(${18.4 + e * 20})`,
      opacity: n,
    })
  }

  /** The circle: appears at the head of the rail, rolls, flies, lands, settles. */
  private drawCircle(t: number, e: number) {
    const railDraw = easeOut(span(t, ...T.rail))
    const a = railAt(START)
    const b = railAt(LEAVE)
    // The rail draws on toward the drop, then withdraws after the circle has left it.
    const gone = easeInOut(span(t, LAND - 0.15, LAND + 0.55))
    this.set('rail', {
      x1: lerp(a.x, b.x, gone),
      y1: lerp(a.y, b.y, gone),
      x2: lerp(a.x, b.x, railDraw),
      y2: lerp(a.y, b.y, railDraw),
      opacity: railDraw * (1 - gone),
    })

    let x = START.x
    let y = START.y
    let sx = 1
    let sy = 1
    let rot = 0
    let foot = false
    let spin = 0
    const pop = backOut(span(t, T.appear, T.appear + 0.35), 2.2)
    if (t < T.roll) {
      sx = sy = pop
    } else if (t < T.roll + ROLL) {
      const u = (t - T.roll) / ROLL
      const dist = RUN * u * u
      x = START.x + DOWN.x * dist
      y = START.y + DOWN.y * dist
      spin = dist / R
    } else if (t < LAND) {
      const f = t - T.roll - ROLL
      x = LEAVE.x + SPEED * DOWN.x * f
      y = LEAVE.y + SPEED * DOWN.y * f + 0.5 * GRAVITY * f * f
      spin = RUN / R + (SPEED * f) / R
      // Stretched along its velocity, more as it falls faster.
      const vx = SPEED * DOWN.x
      const vy = SPEED * DOWN.y + GRAVITY * f
      const k = 1 + 0.16 * clamp(Math.hypot(vx, vy) / 320)
      sx = k
      sy = 1 / k
      rot = Math.atan2(vy, vx)
    } else {
      const l = t - LAND
      const ring = Math.exp(-6 * l)
      const squash = 0.34 * ring * Math.cos(16 * l)
      x = DOT.cx + 5 * Math.exp(-7 * l) * Math.sin(12 * l)
      y = DOT.cy + 3.2 * Math.exp(-5 * l) * Math.sin(10 * l)
      sx = 1 + squash * 0.75
      sy = 1 - squash
      foot = true
      spin = RUN / R + (SPEED * FLY) / R
      // Out of the scroll: the circle lifts from its slot, further than anything else moves.
      y -= 30 * e
    }

    const deg = (rot * 180) / Math.PI
    const transform = foot
      ? `translate(${x} ${y + R}) scale(${sx} ${sy}) translate(0 ${-R})`
      : `translate(${x} ${y}) rotate(${deg}) scale(${sx} ${sy}) rotate(${-deg})`
    this.set('dot', { transform, opacity: t < T.appear ? 0 : 1 })
    this.set('notch', {
      transform: `rotate(${(spin * 180) / Math.PI})`,
      opacity: 1 - span(t, LAND + 0.2, LAND + 0.9),
    })

    // The ring that spreads from the landing.
    const l = t - LAND
    const ringOn = l > 0 && l < 1.1
    this.set('ring', {
      r: R + 30 * easeOut(clamp(l / 1.1)),
      opacity: ringOn ? 0.55 * (1 - clamp(l / 1.1)) : 0,
    })
  }

  update() {
    if (this.still) this.clock.frame()
  }

  destroy() {
    this.clock.destroy()
    this.pointer.destroy()
  }
}

// ------------------------------------------------------------------------------------ stack

const AGENTS = ['claude', 'codex', 'dsh', 'agy', 'grok', 'kimi', 'qwen', 'pi', 'opencode', 'mimo']
const LAYERS = ['FLOWS', 'RUNTIME', 'AGENTS', 'APPLICATIONS']
const APPS: [string, number, number][] = [['HOA', -0.55, 0.35], ['KDA', 0.15, -0.5], ['HKA', 0.6, 0.45]]

interface Mote { x: number; z: number; phase: number; speed: number; size: number }

/** Rotate about y by `yaw`, then about x by `pitch`, then perspective. `depth` is the camera's
 *  distance in the same units as the point, so a smaller number is a wider lens. */
function project(x: number, y: number, z: number, yaw: number, pitch: number, depth: number) {
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const x1 = x * cy + z * sy
  const z1 = -x * sy + z * cy
  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)
  const y2 = y * cp - z1 * sp
  const z2 = y * sp + z1 * cp
  const f = depth / (depth + z2)
  return { x: x1 * f, y: y2 * f, f, z: z2 }
}

/** The page's colours, read off the CSS variables, so the canvas follows the theme like
 *  everything else instead of keeping a second copy of the palette. */
function palette(el: Element) {
  const css = getComputedStyle(el)
  const read = (name: string) => css.getPropertyValue(name).trim() || '#000'
  return { ink: read('--h-ink'), ink3: read('--h-ink-3'), red: read('--h-red'), plane: read('--h-bg-alt'), bg: read('--h-bg') }
}

/**
 * The architecture, as four flat planes in space: flows over the runtime over the agents over the
 * applications. As the reader moves down the five paragraphs beside it, the stack turns and one
 * layer at a time is the subject; work falls through all four as small square blocks; and at the
 * end the one arrow that runs the other way -- the benchmark's -- carries the winner back up to
 * the top, in the page's one red.
 *
 * `target` is set from the scroll, 0..1 across the five paragraphs; `progress` follows it on a
 * critically damped spring, so a flick of the wheel turns the stack rather than jumping it.
 */
export class StackField {
  target = 0
  progress = 0
  private colors = { ink: '#000', ink3: '#888', red: '#f00', plane: '#eee', bg: '#fff' }
  private velocity = 0
  private last = 0
  private readonly motes: Mote[]
  private readonly stage: Stage
  private readonly pointer = new Pointer()

  constructor(private readonly canvas: HTMLCanvasElement, private readonly still: boolean) {
    this.motes = Array.from({ length: innerWidth < 720 ? 70 : 130 }, () => ({
      x: (Math.random() * 2 - 1) * 0.82,
      z: (Math.random() * 2 - 1) * 0.82,
      phase: Math.random(),
      speed: 0.1 + Math.random() * 0.1,
      size: Math.random() < 0.85 ? 1 : 1.8,
    }))
    this.recolor()
    this.stage = new Stage(canvas, (t, s) => this.draw(t, s), !still)
  }

  /** Re-read the palette. Called after the theme flips, a frame late so the class is on <html>. */
  recolor() {
    requestAnimationFrame(() => {
      this.colors = palette(this.canvas)
      this.stage?.frame()
    })
  }

  focus(k: number) {
    return clamp(1 - Math.abs(this.progress * 5 - 0.5 - k) * 1.15)
  }

  private follow(time: number) {
    const dt = Math.min(0.05, Math.max(0, time - this.last))
    this.last = time
    if (this.still || !dt) {
      this.progress = this.target
      return
    }
    // A critically damped spring: no overshoot, about a third of a second to arrive.
    const w = 11
    const a = w * w * (this.target - this.progress) - 2 * w * this.velocity
    this.velocity += a * dt
    this.progress += this.velocity * dt
  }

  private draw(time: number, { ctx, width, height }: Stage) {
    const t = this.still ? 0 : time
    this.follow(time)
    this.pointer.step(0.04)
    const { ink, ink3, red, plane } = this.colors
    const p = this.progress
    const narrow = width < 640
    const unit = Math.min(width * (narrow ? 0.3 : 0.25), height * 0.3)
    // The stack sits a little right of centre, and slides left at the end to make room for the
    // referee's arrow on its right.
    const cx = width / 2 + unit * ((narrow ? 0 : 0.3) - this.focus(4) * (narrow ? 0.45 : 0.75))
    const cy = height / 2 + unit * 0.05
    const gap = this.still ? 0.56 : lerp(0.3, 0.56, easeInOut(span(p, 0, 0.2)))
    const yaw = 0.55 + p * 0.85 + this.pointer.x * 0.18
    const pitch = 0.6 + this.pointer.y * 0.06
    const levels = LAYERS.map((_, k) => (k - 1.5) * gap - this.focus(k) * 0.07)
    const P = (x: number, y: number, z: number) => {
      const q = project(x, y, z, yaw, pitch, 5)
      return { x: cx + q.x * unit, y: cy + q.y * unit, f: q.f, z: q.z }
    }
    const mono = (weight: number, size: number) =>
      `${weight} ${size}px ui-monospace, SFMono-Regular, Menlo, monospace`

    ctx.clearRect(0, 0, width, height)

    // Planes, bottom first: the camera is above the stack, so the lowest is the furthest away.
    // Flat and opaque, like cut paper laid over cut paper; the one in focus is edged in red.
    for (let k = LAYERS.length - 1; k >= 0; k--) {
      const y = levels[k]
      const on = this.focus(k)
      const c = [P(-1, y, -1), P(1, y, -1), P(1, y, 1), P(-1, y, 1)]
      ctx.beginPath()
      c.forEach((v, i) => (i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y)))
      ctx.closePath()
      ctx.globalAlpha = 0.9
      ctx.fillStyle = plane
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.lineWidth = 1 + on * 1.5
      ctx.strokeStyle = on > 0.05 ? red : ink
      ctx.globalAlpha = 0.35 + on * 0.65
      ctx.stroke()
      // One rule across each plane on the diagonal, the mark's own construction line.
      const r0 = P(-1, y, 0.6)
      const r1 = P(1, y, -0.2)
      ctx.beginPath()
      ctx.moveTo(r0.x, r0.y)
      ctx.lineTo(r1.x, r1.y)
      ctx.lineWidth = 1
      ctx.strokeStyle = ink
      ctx.globalAlpha = 0.12 + on * 0.2
      ctx.stroke()
      // The label hangs off whichever corner is leftmost right now, so it never sits on a plane.
      const label = c.reduce((a, b) => (b.x < a.x ? b : a))
      ctx.font = mono(700, narrow ? 11 : 12)
      ctx.fillStyle = on > 0.05 ? red : ink
      ctx.globalAlpha = 0.4 + on * 0.6
      ctx.textAlign = 'right'
      ctx.fillText(LAYERS[k], Math.max(label.x - 12, ctx.measureText(LAYERS[k]).width + 4), label.y + 4)
    }

    // Work falling through the stack, as small square blocks: always there, busiest while the
    // runtime is the subject.
    const top = levels[0] - 0.35
    const bottom = levels[3] + 0.35
    const busy = 0.4 + this.focus(1) * 0.6
    ctx.fillStyle = ink
    for (const m of this.motes) {
      const u = (m.phase + t * m.speed) % 1
      const q = P(m.x, lerp(top, bottom, u), m.z)
      const s = 2.6 * m.size * q.f * (unit / 260)
      ctx.globalAlpha = clamp(span(u, 0, 0.1) * span(1 - u, 0, 0.1)) * busy * 0.7
      ctx.fillRect(q.x - s / 2, q.y - s / 2, s, s)
    }

    // The agents: names on a ring around their layer, the ring turning.
    const agentsOn = this.focus(2)
    ctx.textAlign = 'center'
    AGENTS.forEach((name, i) => {
      const a = (i / AGENTS.length) * Math.PI * 2 + t * 0.2
      const q = P(Math.cos(a) * 1.55, levels[2], Math.sin(a) * 1.55)
      const near = clamp(0.5 - q.z / 3)
      ctx.globalAlpha = (0.15 + agentsOn * 0.85) * (0.35 + 0.65 * near)
      ctx.font = mono(600, Math.max(11, Math.round((narrow ? 11 : 12.5) * q.f * (1 + agentsOn * 0.25))))
      ctx.fillStyle = agentsOn > 0.3 ? ink : ink3
      ctx.fillText(name, q.x, q.y)
    })

    // The applications: three red circles on the bottom plane, each where a flow is found out.
    const appsOn = this.focus(3)
    for (const [name, x, z] of APPS) {
      const q = P(x, levels[3], z)
      const pulse = 1 + 0.08 * Math.sin(t * 2 + x * 3)
      const s = (4 + appsOn * 5) * q.f * pulse * (unit / 260)
      ctx.globalAlpha = 0.35 + appsOn * 0.65
      ctx.fillStyle = red
      ctx.beginPath()
      ctx.arc(q.x, q.y, s, 0, Math.PI * 2)
      ctx.fill()
      ctx.font = mono(700, narrow ? 11 : 13)
      ctx.fillStyle = ink
      ctx.globalAlpha = 0.25 + appsOn * 0.75
      ctx.fillText(name, q.x, q.y - 10 - s)
    }

    // The referee's arrow: from the applications back up to the flows, the one that runs the
    // other way. A solid red band with a hard arrowhead, and blocks riding up it.
    const refOn = this.focus(4)
    if (refOn > 0.01) {
      // Held to the right of the stack on screen whichever way the stack has turned: the point
      // is placed at +d along the camera's own x axis, then handed back as world coordinates.
      const arc = (u: number) => {
        const d = 1.45 + Math.sin(Math.PI * u) * 0.45
        return P(d * Math.cos(yaw), lerp(levels[3], levels[0], u), d * Math.sin(yaw))
      }
      const reach = easeOut(clamp(refOn * 1.4))
      ctx.globalAlpha = refOn
      ctx.beginPath()
      const steps = Math.max(2, Math.round(40 * reach))
      for (let i = 0; i <= steps; i++) {
        const q = arc((i / steps) * reach * 0.96)
        i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)
      }
      ctx.lineWidth = 3
      ctx.lineCap = 'butt'
      ctx.strokeStyle = red
      ctx.stroke()
      ctx.fillStyle = red
      for (let i = 0; i < 9; i++) {
        const u = ((i / 9 + t * 0.14) % 1) * reach
        const q = arc(u)
        const s = 5 * q.f * (unit / 260)
        ctx.globalAlpha = refOn * clamp(span(u, 0, 0.1) * span(reach - u, 0, 0.1))
        ctx.fillRect(q.x - s / 2, q.y - s / 2, s, s)
      }
      if (reach > 0.95) {
        const head = arc(1)
        const prev = arc(0.94)
        const ang = Math.atan2(head.y - prev.y, head.x - prev.x)
        ctx.globalAlpha = refOn
        ctx.beginPath()
        ctx.moveTo(head.x + Math.cos(ang) * 8, head.y + Math.sin(ang) * 8)
        ctx.lineTo(head.x + Math.cos(ang + 2.5) * 12, head.y + Math.sin(ang + 2.5) * 12)
        ctx.lineTo(head.x + Math.cos(ang - 2.5) * 12, head.y + Math.sin(ang - 2.5) * 12)
        ctx.closePath()
        ctx.fill()
        ctx.font = mono(700, narrow ? 11 : 13)
        ctx.fillText('FLOWBENCH', head.x, head.y - 18)
      }
    }
    ctx.globalAlpha = 1
  }

  update() {
    if (this.still) this.stage.frame()
  }

  destroy() {
    this.stage.destroy()
    this.pointer.destroy()
  }
}
