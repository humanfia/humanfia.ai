import { LOGO_BOX, LOGO_MATRIX, LOGO_PATHS } from './logo'
import { Stage, clamp, easeInOut, easeOut, lerp, span, sprite } from './motion'

// The two canvases on the home page. Both are a handful of 3D points projected through a
// perspective camera every frame -- no WebGL, no library -- because a few thousand dots and four
// planes is well inside what a 2D canvas does at 60 fps, and it keeps the site at one dependency.

type Palette = { dots: string[]; glow: boolean }

const DARK: Palette = { dots: ['#e2e8f0', '#8daee2', '#6e93cf', '#efb358'], glow: true }
const LIGHT: Palette = { dots: ['#1e293b', '#2e599e', '#6e93cf', '#b45309'], glow: false }

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

interface Dot {
  hx: number; hy: number; hz: number // home: a point inside the H
  sx: number; sy: number; sz: number // start: somewhere out on a shell, before the H forms
  dx: number; dy: number; dz: number // where it flies when the reader scrolls past
  tone: number
  size: number
  phase: number
  delay: number
}

/** Points inside the H, found by filling the real outline into a small canvas and reading back
 *  which pixels it covered. Units: the H is 1 tall, centred on the origin. */
function sampleLogo(count: number): [number, number][] {
  const S = 6
  const w = LOGO_BOX.width * S
  const h = LOGO_BOX.height * S
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  g.scale(S, S)
  g.transform(...LOGO_MATRIX)
  for (const p of LOGO_PATHS) {
    g.save()
    g.translate(p.x, p.y)
    g.fill(new Path2D(p.d))
    g.restore()
  }
  const pixels = g.getImageData(0, 0, w, h).data
  const inside: [number, number][] = []
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (pixels[(y * w + x) * 4 + 3] > 128) inside.push([(x - w / 2) / h, (y - h / 2) / h])
    }
  }
  const out: [number, number][] = []
  for (let i = 0; i < count; i++) {
    const [x, y] = inside[(Math.random() * inside.length) | 0]
    out.push([x + (Math.random() - 0.5) / h, y + (Math.random() - 0.5) / h])
  }
  return out
}

/** Where the H stands at rest, in the canvas's CSS pixels: its centre and its height. */
export type Anchor = { x: number; y: number; size: number }

/**
 * The hero: the H, made of a few thousand points, that assembles itself when the page loads,
 * turns to follow the pointer, and comes apart toward the reader as they scroll -- the camera
 * flying through it into the page. At rest it stands wherever `anchor` says (the layout owns
 * that, not the canvas); scrolling brings it to the middle of the window as it opens up.
 */
export class HeroField {
  progress = 0
  private palette = LIGHT
  private sprites: HTMLCanvasElement[] = []
  private readonly dots: Dot[]
  private readonly stage: Stage
  private readonly pointer = new Pointer()

  constructor(
    canvas: HTMLCanvasElement,
    dark: boolean,
    private readonly still: boolean,
    private readonly anchor: () => Anchor,
  ) {
    const count = innerWidth < 720 ? 1100 : 2400
    this.dots = sampleLogo(count).map(([hx, hy]) => {
      const u = Math.random() * 2 - 1
      const a = Math.random() * Math.PI * 2
      const r = 1.6 + Math.random() * 1.6
      const s = Math.sqrt(1 - u * u)
      const out = 0.8 + Math.random() * 1.8
      // Tone by position, not at random: the H shades from the mark's slate at the top left to
      // the accent at the bottom right, the same diagonal as the gradient on the headings, with
      // the odd warm point through it.
      const diagonal = clamp((hx + 0.45) / 0.9 * 0.45 + (hy + 0.5) * 0.55 + (Math.random() - 0.5) * 0.35)
      const tone = Math.random() < 0.04 ? 3 : Math.min(2, Math.floor(diagonal * 3))
      return {
        hx,
        hy,
        hz: (Math.random() - 0.5) * 0.09,
        sx: s * Math.cos(a) * r,
        sy: u * r,
        sz: s * Math.sin(a) * r,
        dx: (hx * 2 + (Math.random() - 0.5)) * out,
        dy: (hy * 2 + (Math.random() - 0.5)) * out,
        dz: -Math.random() * 2.5,
        tone,
        size: 0.55 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        delay: Math.random() * 0.7 + (hy + 0.5) * 0.35,
      }
    })
    this.setDark(dark)
    this.stage = new Stage(canvas, (t, s) => this.draw(t, s), !still)
  }

  setDark(dark: boolean) {
    this.palette = dark ? DARK : LIGHT
    this.sprites = this.palette.dots.map((c) => sprite(c, this.palette.glow))
    this.stage?.frame()
  }

  private draw(time: number, { ctx, width, height }: Stage) {
    const t = this.still ? 99 : time
    this.pointer.step()
    const p = this.progress
    const burst = easeInOut(span(p, 0.08, 0.9))
    const fade = 1 - span(p, 0.62, 0.95)

    ctx.clearRect(0, 0, width, height)
    if (fade <= 0) return
    ctx.globalCompositeOperation = this.palette.glow ? 'lighter' : 'source-over'

    const rest = this.anchor()
    const centre = easeInOut(span(p, 0, 0.45))
    const unit = lerp(rest.size, Math.min(height * 0.42, width * 0.6), centre) * (1 + burst * 0.7)
    const cx = lerp(rest.x, width / 2, centre)
    const cy = lerp(rest.y, height / 2, centre)
    const yaw = this.pointer.x * 0.42 + Math.sin(t * 0.32) * 0.16 * (1 - burst)
    const pitch = this.pointer.y * 0.22 + Math.sin(t * 0.27) * 0.05

    for (const d of this.dots) {
      const a = easeOut(span(t, 0.15 + d.delay, 1.75 + d.delay))
      if (a <= 0) continue
      const swirl = (1 - a) * 2.4
      const sx = d.sx * Math.cos(swirl) - d.sz * Math.sin(swirl)
      const sz = d.sx * Math.sin(swirl) + d.sz * Math.cos(swirl)
      const x = lerp(sx, d.hx, a) + d.dx * burst
      const y = lerp(d.sy, d.hy, a) + d.dy * burst
      const z = lerp(sz, d.hz, a) + d.dz * burst
      const q = project(x, y, z, yaw, pitch, 3.2)
      if (q.f <= 0 || q.f > 9) continue
      const size = d.size * q.f * (1.2 + burst * 1.6) * (unit / 330)
      const twinkle = 0.78 + 0.22 * Math.sin(t * 1.6 + d.phase)
      ctx.globalAlpha = clamp(twinkle * a * fade * clamp(q.f * 0.9))
      const img = this.sprites[d.tone]
      ctx.drawImage(img, cx + q.x * unit - size * 2, cy + q.y * unit - size * 2, size * 4, size * 4)
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }

  update() {
    if (this.still) this.stage.frame()
  }

  destroy() {
    this.stage.destroy()
    this.pointer.destroy()
  }
}

// ------------------------------------------------------------------------------------ stack

const AGENTS = ['claude', 'codex', 'dsh', 'agy', 'grok', 'kimi', 'qwen', 'pi', 'opencode', 'mimo']
const LAYERS = ['FLOWS', 'RUNTIME', 'AGENTS', 'APPLICATIONS']
const APPS: [string, number, number][] = [['HOA', -0.55, 0.35], ['KDA', 0.15, -0.5], ['HKA', 0.6, 0.45]]

interface Mote { x: number; z: number; phase: number; speed: number; tone: number }

/**
 * The architecture, as four planes in space: flows over the runtime over the agents over the
 * applications. Scrolling pulls the stack apart and turns it, one layer at a time comes forward,
 * work falls through all four, and at the end the one arrow that runs the other way -- the
 * benchmark's -- carries the winner back up to the top.
 *
 * `progress` is 0..1 across the whole pinned section; `focus(k)` is how much layer k (or, at
 * k = 4, the referee) is the subject right now.
 */
export class StackField {
  progress = 0
  private dark = false
  private readonly motes: Mote[]
  private readonly stage: Stage
  private readonly pointer = new Pointer()
  private amber: HTMLCanvasElement | null = null
  private blue: HTMLCanvasElement | null = null

  constructor(canvas: HTMLCanvasElement, dark: boolean, private readonly still: boolean) {
    this.motes = Array.from({ length: innerWidth < 720 ? 140 : 260 }, () => ({
      x: (Math.random() * 2 - 1) * 0.82,
      z: (Math.random() * 2 - 1) * 0.82,
      phase: Math.random(),
      speed: 0.12 + Math.random() * 0.12,
      tone: Math.random(),
    }))
    this.setDark(dark)
    this.stage = new Stage(canvas, (t, s) => this.draw(t, s), !still)
  }

  setDark(dark: boolean) {
    this.dark = dark
    this.blue = sprite(dark ? '#8daee2' : '#2e599e', dark)
    this.amber = sprite(dark ? '#efb358' : '#b45309', dark)
    this.stage?.frame()
  }

  focus(k: number) {
    return clamp(1 - Math.abs(this.progress * 5 - 0.5 - k) * 1.15)
  }

  private draw(time: number, { ctx, width, height }: Stage) {
    const t = this.still ? 0 : time
    this.pointer.step(0.04)
    const p = this.progress
    const narrow = width < 640
    const unit = Math.min(width * (narrow ? 0.3 : 0.25), height * 0.3)
    // The stack sits a little right of centre, and slides left at the end to make room for the
    // referee's arrow on its right.
    const cx = width / 2 + unit * ((narrow ? 0 : 0.3) - this.focus(4) * (narrow ? 0.45 : 0.75))
    const cy = height / 2 + unit * 0.05
    // A still picture is drawn pulled apart, the way the moving one spends most of its time.
    const gap = this.still ? 0.56 : lerp(0.2, 0.56, easeInOut(span(p, 0, 0.2)))
    const yaw = 0.55 + p * 0.85 + this.pointer.x * 0.18
    const pitch = 0.6 + this.pointer.y * 0.06
    const levels = LAYERS.map((_, k) => (k - 1.5) * gap - this.focus(k) * 0.07)
    const P = (x: number, y: number, z: number) => {
      const q = project(x, y, z, yaw, pitch, 5)
      return { x: cx + q.x * unit, y: cy + q.y * unit, f: q.f, z: q.z }
    }

    const ink = this.dark ? '226,232,240' : '15,23,42'
    const accent = this.dark ? '141,174,226' : '46,89,158'
    const warm = this.dark ? '239,179,88' : '180,83,9'
    ctx.clearRect(0, 0, width, height)

    // Planes, bottom first: the camera is above the stack, so the lowest is the furthest away.
    for (let k = LAYERS.length - 1; k >= 0; k--) {
      const y = levels[k]
      const on = this.focus(k)
      const c = [P(-1, y, -1), P(1, y, -1), P(1, y, 1), P(-1, y, 1)]
      ctx.beginPath()
      c.forEach((v, i) => (i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y)))
      ctx.closePath()
      ctx.fillStyle = `rgba(${accent},${0.035 + on * 0.12})`
      ctx.fill()
      ctx.lineWidth = 1 + on
      ctx.strokeStyle = `rgba(${on > 0.05 ? accent : ink},${0.22 + on * 0.7})`
      ctx.stroke()
      ctx.beginPath()
      for (const v of [-0.5, 0, 0.5]) {
        const a = P(v, y, -1)
        const b = P(v, y, 1)
        const e = P(-1, y, v)
        const g = P(1, y, v)
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.moveTo(e.x, e.y)
        ctx.lineTo(g.x, g.y)
      }
      ctx.lineWidth = 1
      ctx.strokeStyle = `rgba(${accent},${0.06 + on * 0.16})`
      ctx.stroke()
      // The label hangs off whichever corner is leftmost right now, so it never sits on a plane.
      const label = c.reduce((a, b) => (b.x < a.x ? b : a))
      ctx.font = `600 ${narrow ? 10 : 11}px ui-monospace, SFMono-Regular, Menlo, monospace`
      ctx.fillStyle = `rgba(${on > 0.05 ? accent : ink},${0.35 + on * 0.65})`
      ctx.textAlign = 'right'
      ctx.fillText(LAYERS[k], Math.max(label.x - 12, ctx.measureText(LAYERS[k]).width + 4), label.y + 4)
    }

    // Work falling through the stack: always there, loudest while the runtime is the subject.
    ctx.globalCompositeOperation = this.dark ? 'lighter' : 'source-over'
    const top = levels[0] - 0.35
    const bottom = levels[3] + 0.35
    const busy = 0.45 + this.focus(1) * 0.55
    for (const m of this.motes) {
      const u = (m.phase + t * m.speed) % 1
      const q = P(m.x, lerp(top, bottom, u), m.z)
      const s = 2.2 * q.f * (unit / 260)
      ctx.globalAlpha = clamp(span(u, 0, 0.1) * span(1 - u, 0, 0.1)) * busy * (m.tone < 0.5 ? 1 : 0.6)
      ctx.drawImage(this.blue!, q.x - s * 2, q.y - s * 2, s * 4, s * 4)
    }

    // The agents: names on a ring around their layer, the ring turning.
    const agentsOn = this.focus(2)
    ctx.textAlign = 'center'
    AGENTS.forEach((name, i) => {
      const a = (i / AGENTS.length) * Math.PI * 2 + t * 0.22
      const q = P(Math.cos(a) * 1.55, levels[2], Math.sin(a) * 1.55)
      const near = clamp(0.5 - q.z / 3)
      ctx.globalAlpha = (0.12 + agentsOn * 0.88) * (0.35 + 0.65 * near)
      ctx.font = `600 ${Math.round((narrow ? 10 : 12.5) * q.f * (1 + agentsOn * 0.25))}px ui-monospace, SFMono-Regular, Menlo, monospace`
      ctx.fillStyle = `rgb(${agentsOn > 0.3 ? accent : ink})`
      ctx.fillText(name, q.x, q.y)
    })

    // The applications: three lights on the bottom plane, each where a flow is found out.
    const appsOn = this.focus(3)
    for (const [name, x, z] of APPS) {
      const q = P(x, levels[3], z)
      const pulse = 1 + 0.25 * Math.sin(t * 2.4 + x * 3)
      const s = (6 + appsOn * 10) * q.f * pulse * (unit / 260)
      ctx.globalAlpha = 0.25 + appsOn * 0.75
      ctx.drawImage(this.blue!, q.x - s * 2, q.y - s * 2, s * 4, s * 4)
      ctx.font = `700 ${narrow ? 11 : 13}px ui-sans-serif, system-ui, sans-serif`
      ctx.fillStyle = `rgb(${ink})`
      ctx.globalAlpha = 0.2 + appsOn * 0.8
      ctx.fillText(name, q.x, q.y - 14 - s)
    }

    // The referee's arrow: from the applications back up to the flows, the one that runs the
    // other way, drawn in the site's one warm colour.
    const refOn = this.focus(4)
    if (refOn > 0.01) {
      // Held to the right of the stack on screen whichever way the stack has turned: the point
      // is placed at +d along the camera's own x axis, then handed back as world coordinates.
      const arc = (u: number) => {
        const d = 1.45 + Math.sin(Math.PI * u) * 0.45
        return P(d * Math.cos(yaw), lerp(levels[3], levels[0], u), d * Math.sin(yaw))
      }
      ctx.globalAlpha = refOn
      ctx.beginPath()
      for (let i = 0; i <= 40; i++) {
        const q = arc(i / 40)
        i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)
      }
      ctx.setLineDash([4, 6])
      ctx.lineDashOffset = -t * 30
      ctx.lineWidth = 1.5
      ctx.strokeStyle = `rgb(${warm})`
      ctx.stroke()
      ctx.setLineDash([])
      for (let i = 0; i < 26; i++) {
        const u = (i / 26 + t * 0.18) % 1
        const q = arc(u)
        const s = 3 * q.f * (unit / 260)
        ctx.globalAlpha = refOn * clamp(span(u, 0, 0.12) * span(1 - u, 0, 0.12))
        ctx.drawImage(this.amber!, q.x - s * 2, q.y - s * 2, s * 4, s * 4)
      }
      const head = arc(1)
      ctx.globalAlpha = refOn
      ctx.font = `700 ${narrow ? 11 : 13}px ui-monospace, SFMono-Regular, Menlo, monospace`
      ctx.fillStyle = `rgb(${warm})`
      ctx.textAlign = 'center'
      ctx.fillText('FLOWBENCH', head.x, head.y - 16)
      ctx.beginPath()
      ctx.arc(head.x, head.y, 3, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }

  update() {
    if (this.still) this.stage.frame()
  }

  destroy() {
    this.stage.destroy()
    this.pointer.destroy()
  }
}
