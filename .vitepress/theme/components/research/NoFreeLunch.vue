<script setup lang="ts">
// "No free lunch", drawn twice. On the left, coding as constraint satisfaction: proposals land
// anywhere until one falls inside every constraint at once, and then any such point will do --
// one feasible solution is the whole job, which is what RLCR is built to find. On the right, a
// kernel as optimisation: a rugged cost landscape where a model that only fine-tunes walks into
// the nearest valley and stays, and a Flame Chase alternates it with a model that makes large
// refactors, so the run hops from one local optimum to a better one. Both play when they come on
// screen and loop; with reduced motion each is shown at its end.
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { still, useSeen } from './chart'

const root = ref<HTMLElement | null>(null)
const seen = useSeen(root)
const t = ref(1) // 0..1 through one loop of both panels
let raf = 0
let start = 0
const LOOP = 9000
watch(seen, (on) => {
  if (!on || still()) return
  t.value = 0
  start = performance.now()
  const tick = (now: number) => {
    t.value = ((now - start) % (LOOP + 1600)) / LOOP
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))
const u = computed(() => Math.min(1, t.value))

// ---------------------------------------------------------------- constraint satisfaction
// Three constraints as three bands; the feasible set is where all three overlap.
const PROPOSALS = [
  [70, 60], [250, 70], [120, 175], [230, 165], [180, 120],
] as const
const shown = computed(() => PROPOSALS.filter((_, i) => u.value > 0.12 + i * 0.16))
const feasible = (p: readonly number[]) => p[0] > 140 && p[0] < 220 && p[1] > 90 && p[1] < 150
const done = computed(() => shown.value.some(feasible))
const CHECKS = ['features implemented', 'tests pass', 'lints clean']

// --------------------------------------------------------------------------- optimisation
const W = 320
const H = 170
const f = (x: number) => 0.62 - 0.42 * x + 0.13 * Math.sin(19 * x + 0.6) + 0.07 * Math.sin(41 * x)
const Y = (x: number) => 14 + (0.95 - f(x)) * 150
const curve = Array.from({ length: 161 }, (_, i) => {
  const x = i / 160
  return `${i ? 'L' : 'M'}${(x * W).toFixed(1)} ${Y(x).toFixed(1)}`
}).join('')
// the local minima, left to right
const minima: number[] = []
for (let i = 1; i < 400; i++) {
  const [a, b, c] = [f((i - 1) / 400), f(i / 400), f((i + 1) / 400)]
  if (b < a && b < c) minima.push(i / 400)
}
// The chase: fine-tune down into a valley (small steps), then a refactor jumps to a better one.
const route: { x: number; who: 'fine' | 'jump' }[] = []
{
  let x = 0.04
  let m = 0
  while (m < minima.length) {
    const target = minima[m]
    for (let k = 1; k <= 6; k++) route.push({ x: x + ((target - x) * k) / 6, who: 'fine' })
    x = target
    const next = minima.findIndex((mx, j) => j > m && f(mx) < f(x) - 0.01)
    if (next < 0) break
    route.push({ x: (x + minima[next]) / 2 - 0.02, who: 'jump' })
    m = next
  }
}
const step = computed(() => Math.min(route.length - 1, Math.floor(u.value * route.length)))
const trail = computed(() =>
  route.slice(0, step.value + 1).map((r) => ({ cx: r.x * W, cy: Y(r.x), who: r.who })),
)
const head = computed(() => trail.value[trail.value.length - 1])
const trapped = minima.length ? minima[0] : 0.1
</script>

<template>
  <div ref="root" class="nfl">
    <figure class="nfl-panel">
      <p class="nfl-kicker">Coding · constraint satisfaction</p>
      <svg viewBox="0 0 320 230" role="img" aria-label="Proposals scattered over three overlapping constraint bands; the first one inside all three is accepted.">
        <rect x="20" y="20" width="280" height="190" class="nfl-field" />
        <rect x="140" y="20" width="80" height="190" class="nfl-band b1" />
        <rect x="20" y="90" width="280" height="60" class="nfl-band b2" />
        <polygon points="100,210 180,20 260,20 180,210" class="nfl-band b3" />
        <rect x="140" y="90" width="80" height="60" class="nfl-feasible" :class="{ hit: done }" />
        <text x="180" y="124" text-anchor="middle" class="nfl-tag">feasible</text>
        <g v-for="(p, i) in shown" :key="i" :transform="`translate(${p[0]},${p[1]})`" :class="['nfl-try', { ok: feasible(p) }]">
          <circle r="7" />
          <path v-if="feasible(p)" d="M-3.5 0 L-1 3 L4 -3" />
          <path v-else d="M-3 -3 L3 3 M3 -3 L-3 3" />
        </g>
      </svg>
      <ul class="nfl-checks">
        <li v-for="c in CHECKS" :key="c" :class="{ on: done }">{{ c }}</li>
      </ul>
      <figcaption>One feasible solution is the whole job. <b>→ RLCR</b>: propose, check, repeat until every check passes.</figcaption>
    </figure>

    <figure class="nfl-panel">
      <p class="nfl-kicker">Kernels · optimisation</p>
      <svg viewBox="-10 0 340 230" role="img" aria-label="A rugged cost landscape: small fine-tuning steps settle into the nearest valley; alternating with large refactors jumps to deeper valleys.">
        <path :d="`${curve} L${W} ${H + 30} L0 ${H + 30} Z`" class="nfl-land" />
        <path :d="curve" class="nfl-ridge" />
        <g class="nfl-trap" :transform="`translate(${trapped * W},${Y(trapped)})`">
          <line y1="10" y2="34" />
          <text y="48" text-anchor="middle">fine-tuning stops here</text>
        </g>
        <polyline :points="trail.map((p) => `${p.cx},${p.cy}`).join(' ')" class="nfl-path" />
        <circle v-for="(p, i) in trail" :key="i" :cx="p.cx" :cy="p.cy" r="3" :class="['nfl-dot', p.who]" />
        <circle v-if="head" :cx="head.cx" :cy="head.cy" r="8" class="nfl-head" />
        <text x="0" y="222" class="nfl-axis">cost ↓ is better · one axis of a huge design space</text>
      </svg>
      <ul class="nfl-legend">
        <li class="fine">small step · fine-tune (the model that polishes)</li>
        <li class="jump">big jump · refactor (the model that rewrites)</li>
      </ul>
      <figcaption>The best one is the job. <b>→ Flame-Chase</b>: alternate the two, and the run hops from one local optimum to a better one.</figcaption>
    </figure>
  </div>
</template>

<style scoped>
.nfl {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin: 24px 0;
}
.nfl-panel {
  margin: 0;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-top: 4px solid var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}
.nfl-kicker {
  margin: 0 0 8px !important;
  font: 700 11px/1.3 var(--vp-font-family-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
}
svg {
  display: block;
  width: 100%;
  height: auto;
}
.nfl-field {
  fill: none;
  stroke: var(--vp-c-divider);
}
.nfl-band {
  fill: var(--vp-c-text-1);
  opacity: 0.07;
}
.nfl-feasible {
  fill: none;
  stroke: var(--vp-c-text-1);
  stroke-width: 2;
  stroke-dasharray: 5 4;
  transition: fill 0.4s;
}
.nfl-feasible.hit {
  fill: color-mix(in srgb, var(--hf-red) 22%, transparent);
  stroke: var(--hf-red);
  stroke-dasharray: none;
}
.nfl-tag {
  font: 600 12px var(--vp-font-family-mono);
  fill: var(--vp-c-text-2);
}
.nfl-try circle {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-text-3);
  stroke-width: 2;
}
.nfl-try path {
  fill: none;
  stroke: var(--vp-c-text-3);
  stroke-width: 1.8;
}
.nfl-try.ok circle {
  fill: var(--hf-red);
  stroke: var(--hf-red);
}
.nfl-try.ok path {
  stroke: #fff;
  stroke-width: 2;
}
.nfl-checks,
.nfl-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin: 10px 0 0 !important;
  padding: 0 !important;
  list-style: none;
  font: 12px/1.5 var(--vp-font-family-mono);
  color: var(--vp-c-text-2);
}
.nfl-checks li,
.nfl-legend li {
  margin: 0 !important;
}
.nfl-checks li::before {
  content: '□ ';
}
.nfl-checks li.on {
  color: var(--vp-c-text-1);
}
.nfl-checks li.on::before {
  content: '■ ';
  color: var(--hf-red);
}
.nfl-land {
  fill: var(--vp-c-text-1);
  opacity: 0.08;
}
.nfl-ridge {
  fill: none;
  stroke: var(--vp-c-text-1);
  stroke-width: 2;
}
.nfl-trap line {
  stroke: var(--vp-c-text-3);
  stroke-dasharray: 2 3;
}
.nfl-trap text,
.nfl-axis {
  font: 11px var(--vp-font-family-mono);
  fill: var(--vp-c-text-2);
}
.nfl-path {
  fill: none;
  stroke: var(--hf-red);
  stroke-width: 1.5;
  stroke-dasharray: 3 3;
}
.nfl-dot.fine {
  fill: var(--vp-c-text-1);
}
.nfl-dot.jump {
  fill: var(--hf-red);
}
.nfl-head {
  fill: var(--hf-red);
}
.nfl-legend li::before {
  content: '● ';
  color: var(--vp-c-text-1);
}
.nfl-legend li.jump::before {
  color: var(--hf-red);
}
figcaption {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--vp-c-text-1);
}
</style>
