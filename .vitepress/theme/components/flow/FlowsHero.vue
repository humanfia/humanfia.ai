<script setup lang="ts">
// The picture at the top of /flows/: what every flow is, before any one of them -- agents, and
// what passes between them, going round. Three discs on the poster's rising diagonal, the wires
// between them ruled in one after another, a comet going gently round the loop they make, and
// flat planes drifting behind at their own depths. Nothing in it is a particular flow; the
// catalogue under it is.
//
// One clock drives all of it (`now`, in seconds), so it is a pure function of time like the
// players are: it stops while scrolled out of sight, and under reduced motion it is drawn once,
// at rest, with every wire ruled.
import { computed, onMounted, onUnmounted, ref } from 'vue'

import './grammar.css'

const W = 960
const H = 270

/** The three of them: one that works, one that takes turns with it, one that judges. */
const NODES = [
  { x: 210, y: 180, kind: 'maker' },
  { x: 480, y: 128, kind: 'partner' },
  { x: 750, y: 76, kind: 'checker' },
] as const

type Pt = { x: number; y: number }
/** A cubic from one node to the next, bowed off the diagonal so the wires read as handed on,
 *  not as one line. The last one is the loop back, under everything. */
const WIRES: [Pt, Pt, Pt, Pt][] = [
  [NODES[0], { x: 300, y: 110 }, { x: 380, y: 96 }, NODES[1]],
  [NODES[1], { x: 570, y: 60 }, { x: 650, y: 44 }, NODES[2]],
  [NODES[2], { x: 840, y: 250 }, { x: 140, y: 290 }, NODES[0]],
]

const cubic = (a: number, b: number, c: number, d: number, p: number) => {
  const q = 1 - p
  return q * q * q * a + 3 * q * q * p * b + 3 * q * p * p * c + p * p * p * d
}
const at = (w: [Pt, Pt, Pt, Pt], p: number): Pt => ({
  x: cubic(w[0].x, w[1].x, w[2].x, w[3].x, p),
  y: cubic(w[0].y, w[1].y, w[2].y, w[3].y, p),
})
const pathOf = (w: [Pt, Pt, Pt, Pt], to = 1) => {
  const pts: string[] = []
  const n = Math.max(2, Math.round(40 * to))
  for (let k = 0; k <= n; k++) {
    const q = at(w, (to * k) / n)
    pts.push(`${q.x.toFixed(1)} ${q.y.toFixed(1)}`)
  }
  return `M ${pts.join(' L ')}`
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const soft = (u: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(u, 0, 1))

/** Seconds since it started; at rest, a moment where every wire is ruled. */
const now = ref(30)
const moving = ref(false)

/** Each leg of the loop takes this long, and the comet rests at each node in between. */
const LEG = 2.6
const REST = 1.1

const frame = computed(() => {
  const s = now.value
  // The wires are ruled in, one after another, over the first few seconds.
  const ruled = WIRES.map((_, n) => soft((s - 0.3 - n * 0.7) / 1.4))
  // Then a comet goes round, leg by leg, with a breath at every node.
  const cycle = 3 * (LEG + REST)
  const into = Math.max(0, s - 3) % cycle
  const leg = Math.floor(into / (LEG + REST))
  const on = into - leg * (LEG + REST)
  const p = soft(on / LEG)
  const travelling = s > 3 && on < LEG
  const head = travelling ? at(WIRES[leg], p) : null
  const trail = travelling
    ? Array.from({ length: 6 }, (_, k) => {
        const u = p - (k + 1) * 0.025
        return u > 0 ? { ...at(WIRES[leg], u), r: 4.2 * (1 - (k + 1) / 7), o: 0.4 * (1 - (k + 1) / 7) } : null
      }).filter((d): d is Pt & { r: number; o: number } => !!d)
    : []
  // The node the comet just reached rings once.
  const landed = s > 3 && on >= LEG ? (leg + 1) % 3 : -1
  const ring = landed >= 0 ? clamp((on - LEG) / REST, 0, 1) : -1
  // Whichever node holds the comet glows, as a running turn does in the players.
  const glow = NODES.map((_, n) => (n === landed ? 1 - ring * 0.6 : n === leg && travelling ? 1 - p : 0))
  return {
    wires: WIRES.map((w, n) => ({ d: ruled[n] > 0.001 ? pathOf(w, ruled[n]) : '', loop: n === 2 })),
    head,
    trail,
    landed,
    ring,
    glow,
    // The planes drift along the diagonal, each at its own pace: a slow tide, never a wave.
    drift: (rate: number) => `translate(${(Math.sin(s * rate) * 18).toFixed(1)} ${(-Math.sin(s * rate) * 5.5).toFixed(1)})`,
    discs: NODES.map((_, n) => soft((s - 0.1 - n * 0.5) / 0.9)),
  }
})

const root = ref<SVGSVGElement | null>(null)
let raf = 0
let seen: IntersectionObserver | undefined
let start = 0
let visible = false

function tick(t: number) {
  if (!start) start = t - now.value * 1000
  now.value = (t - start) / 1000
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  moving.value = true
  now.value = 0
  seen = new IntersectionObserver((entries) => {
    const was = visible
    visible = entries[0].isIntersecting
    if (visible && !was) {
      start = 0
      raf = requestAnimationFrame(tick)
    } else if (!visible && was) cancelAnimationFrame(raf)
  })
  if (root.value) seen.observe(root.value)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  seen?.disconnect()
})
</script>

<template>
  <svg ref="root" class="flows-hero hmz-flow" :viewBox="`0 0 ${W} ${H}`" aria-hidden="true" focusable="false">
    <!-- the planes, far behind -->
    <g :transform="frame.drift(0.11)">
      <rect class="f-plane" x="-60" y="150" width="760" height="54" transform="rotate(-17 330 177)" opacity="0.05" />
    </g>
    <g :transform="frame.drift(0.07)">
      <circle class="f-plane red" cx="842" cy="70" r="58" opacity="0.14" />
    </g>
    <g :transform="frame.drift(0.09)">
      <rect class="f-plane line" x="620" y="150" width="120" height="120" transform="rotate(-17 680 210)" opacity="0.18" />
      <rect class="f-plane red" x="40" y="58" width="420" height="7" transform="rotate(-17 250 61)" opacity="0.5" />
    </g>
    <g :transform="frame.drift(0.05)">
      <rect class="f-plane" x="360" y="210" width="560" height="14" transform="rotate(-17 640 217)" opacity="0.08" />
    </g>

    <!-- the wires, ruled in, and the loop back under them -->
    <g class="f-loop">
      <path v-if="frame.wires[2].d" class="track" :d="frame.wires[2].d" />
    </g>
    <g v-for="(wire, n) in frame.wires.slice(0, 2)" :key="n" class="f-wire" :class="n === 0 ? 'k-maker' : 'k-partner'">
      <path v-if="wire.d" class="track" :d="wire.d" style="opacity: 0.55" />
    </g>

    <!-- the comet -->
    <g class="f-wire k-checker">
      <circle v-for="(dot, n) in frame.trail" :key="n" class="trail" :cx="dot.x" :cy="dot.y" :r="dot.r" :opacity="dot.o" />
      <g v-if="frame.head" :transform="`translate(${frame.head.x} ${frame.head.y})`">
        <circle class="halo" r="12" />
        <circle class="comet" r="5" />
      </g>
    </g>

    <!-- the agents -->
    <g
      v-for="(node, n) in NODES"
      :key="n"
      class="f-head"
      :class="`k-${node.kind}`"
      :transform="`translate(${node.x} ${node.y}) scale(${(0.6 + 0.4 * frame.discs[n]).toFixed(3)})`"
      :opacity="frame.discs[n]"
    >
      <circle v-if="frame.glow[n] > 0.01" class="halo" :r="26 + 10 * frame.glow[n]" :opacity="0.22 * frame.glow[n]" />
      <circle
        v-if="frame.landed === n && frame.ring >= 0 && frame.ring < 1"
        class="ripple"
        :r="22 + 30 * frame.ring"
        :opacity="0.7 * (1 - frame.ring)"
      />
      <circle class="disc" r="22" />
      <path
        class="f-glyph filled on-disc"
        transform="scale(1.6)"
        d="M0 -6.5 Q0.9 -0.9 6.5 0 Q0.9 0.9 0 6.5 Q-0.9 0.9 -6.5 0 Q-0.9 -0.9 0 -6.5 Z"
      />
    </g>
  </svg>
</template>

<style scoped>
.flows-hero {
  display: block;
  width: 100%;
  height: auto;
  margin: 8px 0 18px;
  overflow: visible;
}

.flows-hero .ripple {
  fill: none;
  stroke: var(--hue);
  stroke-width: 1.5;
}
</style>
