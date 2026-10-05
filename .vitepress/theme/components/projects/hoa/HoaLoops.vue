<script setup lang="ts">
// The claim about loops, in two figures. On the left, the Humanize ablation as a slope chart:
// the same four base models through the raw API, through a coding CLI and inside a Humanize
// flow, 50 problems each, one line per model. The switch changes benchmark and the lines move
// to their new places rather than being redrawn, so PutnamBench's cliff and Physics Cup's gentle
// rise are seen as the same lines doing different things. Pointing at a model lifts its line.
//
// On the right, IChO: the same two models with and without the review loop, as dumbbells.
import { gsap } from 'gsap'
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { vReveal } from '../../../home/motion'
import { prefersReducedMotion, useWidth } from '../../kit/shared'

interface Row {
  label: string
  api: number
  cli: number
  flow: number
}
const props = defineProps<{
  ablation: Record<'putnam' | 'physics', Row[]>
  icho: { label: string; goal: number; flow: number }[]
}>()

const BENCHES = [
  { key: 'putnam', label: 'PutnamBench' },
  { key: 'physics', label: 'Physics Cup' },
] as const
const bench = ref<'putnam' | 'physics'>('putnam')
const STAGES = [
  { key: 'api', label: 'Model API', short: 'API' },
  { key: 'cli', label: 'Coding CLI', short: 'CLI' },
  { key: 'flow', label: 'Humanize flow', short: 'Flow' },
] as const

/** What is drawn: tweened toward the chosen benchmark's numbers. */
const vals = reactive(props.ablation.putnam.map((r) => ({ ...r })))
let tween: gsap.core.Tween | null = null
watch(bench, (b) => {
  tween?.kill()
  const target = props.ablation[b]
  if (prefersReducedMotion()) {
    target.forEach((r, i) => Object.assign(vals[i], r))
    return
  }
  tween = gsap.to(vals, {
    api: (i: number) => target[i].api,
    cli: (i: number) => target[i].cli,
    flow: (i: number) => target[i].flow,
    duration: 0.9,
    ease: 'power3.inOut',
  })
})
onBeforeUnmount(() => tween?.kill())

const hot = ref('Kimi-K3')

const box = ref<HTMLElement | null>(null)
const width = useWidth(box, 640)
const H = 320
const PAD = { top: 18, bottom: 34 }
const geo = computed(() => {
  const narrow = width.value < 520
  const left = narrow ? 30 : 46
  const right = narrow ? 112 : 150
  const xs = STAGES.map((_, i) => left + (i / (STAGES.length - 1)) * (width.value - left - right))
  const y = (v: number) => PAD.top + (1 - v / 50) * (H - PAD.top - PAD.bottom)
  return { narrow, xs, y }
})

/** The labels at the flow end, pushed apart so that no two overlap: sorted by height, each at
 *  least `gap` below the one above it, then the whole run pulled back up if it fell off the
 *  bottom. */
function spread(ys: number[], gap = 15) {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y)
  for (let k = 1; k < order.length; k++) order[k].y = Math.max(order[k].y, order[k - 1].y + gap)
  const over = order[order.length - 1].y - (H - PAD.bottom)
  if (over > 0) order.forEach((o) => (o.y -= over))
  const out: number[] = []
  order.forEach((o) => (out[o.i] = o.y))
  return out
}
const lines = computed(() => {
  const { xs, y } = geo.value
  const ends = spread(vals.map((r) => y(r.flow)))
  return vals.map((r, i) => ({
    label: r.label,
    points: STAGES.map((s, j) => ({ x: xs[j], y: y(r[s.key]), v: Math.round(r[s.key]) })),
    end: ends[i],
  }))
})
/** SVG has no z-index: the lifted line is drawn last, over the others. */
const onTop = computed(() => [...lines.value].sort((a, b) => +(a.label === hot.value) - +(b.label === hot.value)))
const TICKS = [0, 10, 20, 30, 40, 50]
</script>

<template>
  <div v-reveal class="hlp">
    <figure class="hlp-slope hoa-sheet">
      <div class="hlp-top">
        <div class="hoa-switch" role="group" aria-label="Benchmark">
          <button
            v-for="b in BENCHES"
            :key="b.key"
            type="button"
            :aria-pressed="bench === b.key"
            @click="bench = b.key"
          >{{ b.label }}</button>
        </div>
        <span class="hlp-sub">Same model · three levels of scaffolding · solved of 50</span>
      </div>

      <div ref="box" class="hlp-box">
        <svg
          :width="width"
          :height="H"
          :viewBox="`0 0 ${width} ${H}`"
          role="img"
          :aria-label="`The Humanize ablation on ${bench === 'putnam' ? 'PutnamBench' : 'Physics Cup'}, problems solved of 50 through the model API, a coding CLI and a Humanize flow: ${ablation[bench].map((r) => `${r.label} ${r.api}, ${r.cli}, ${r.flow}`).join('; ')}.`"
        >
          <g class="hlp-grid">
            <g v-for="t in TICKS" :key="t">
              <line :x1="geo.xs[0]" :x2="geo.xs[2]" :y1="geo.y(t)" :y2="geo.y(t)" />
              <text :x="geo.xs[0] - 10" :y="geo.y(t)" dy="0.32em" text-anchor="end">{{ t }}</text>
            </g>
            <g v-for="(s, j) in STAGES" :key="s.key">
              <line class="hlp-col" :x1="geo.xs[j]" :x2="geo.xs[j]" :y1="geo.y(50)" :y2="geo.y(0)" />
              <text
                class="hlp-stage"
                :x="geo.xs[j]"
                :y="H - 10"
                :text-anchor="j === 0 ? 'start' : j === 2 ? 'end' : 'middle'"
                :class="{ flow: s.key === 'flow' }"
              >{{ geo.narrow ? s.short : s.label }}</text>
            </g>
          </g>
          <g
            v-for="l in onTop"
            :key="l.label"
            class="hlp-line"
            :class="{ hot: hot === l.label }"
            @mouseenter="hot = l.label"
          >
            <polyline :points="l.points.map((p) => `${p.x},${p.y}`).join(' ')" />
            <rect v-for="(p, j) in l.points" :key="j" :x="p.x - 4.5" :y="p.y - 4.5" width="9" height="9" />
            <text class="hlp-end" :x="geo.xs[2] + 12" :y="l.end" dy="0.32em">
              <tspan class="v">{{ l.points[2].v }}</tspan> {{ geo.narrow ? l.label.split(' ')[0] : l.label }}
            </text>
          </g>
        </svg>
      </div>

      <ul class="hlp-keys">
        <li v-for="l in lines" :key="l.label">
          <button type="button" :aria-pressed="hot === l.label" @click="hot = l.label" @mouseenter="hot = l.label">
            {{ l.label }} <span>{{ l.points.map((p) => p.v).join(' → ') }}</span>
          </button>
        </li>
      </ul>
      <figcaption class="hoa-caption">
        From the ablation in the KDA² post, September 2026. On PutnamBench, Kimi-K3 goes from 4 of 50
        in its CLI to 47 inside a flow; on Physics Cup the gains are smaller, because not every
        benchmark is limited by the loop. The
        <a href="/blog/2026-07-08-model-tool-flow">earlier version of this comparison</a> adds
        SuperChem and an HLE subset.
      </figcaption>
    </figure>

    <figure class="hlp-icho hoa-sheet">
      <p class="hoa-kicker">IChO 2026 · theory subquestions accepted</p>
      <p class="hlp-icho-t">The same model, with and without the review loop.</p>
      <ul class="hlp-db">
        <li v-for="(r, i) in icho" :key="r.label" :style="{ '--a': r.goal / 68, '--b': r.flow / 68, '--i': i }">
          <span class="hlp-db-name">{{ r.label }}</span>
          <span class="hlp-db-track" aria-hidden="true">
            <i class="seg" />
            <i class="from" />
            <i class="to" />
          </span>
          <span class="hlp-db-v">
            <span>native /goal <b>{{ r.goal }}</b></span>
            <span class="to">review loop <b>{{ r.flow }} / 68</b></span>
          </span>
        </li>
      </ul>
      <p class="hlp-icho-n">
        Run as a plain Codex <code>/goal</code> on the same 68 targets, each model had about half of
        them accepted. With formalization review and proof review in the loop, all 68.
      </p>
    </figure>
  </div>
</template>

<style scoped>
.hlp {
  display: grid;
  grid-template-columns: minmax(0, 1.75fr) minmax(0, 1fr);
  gap: clamp(16px, 2.4vw, 28px);
}

.hlp-slope,
.hlp-icho {
  margin: 0;
  padding: 18px 20px 20px;
}
.hlp-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 18px;
}
.hlp-sub {
  font-size: 13px;
  color: var(--k-ink-3);
}
.hlp-box {
  margin-top: 18px;
}
.hlp-box svg {
  display: block;
  overflow: visible;
}

.hlp-grid line {
  stroke: var(--k-line);
}
.hlp-grid .hlp-col {
  stroke: var(--k-ink);
  stroke-width: 1;
}
.hlp-grid text {
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  fill: var(--k-ink-3);
}
.hlp-grid .hlp-stage {
  font-size: 11.5px;
  font-weight: 650;
  fill: var(--k-ink-2);
}
.hlp-grid .hlp-stage.flow {
  fill: var(--k-accent);
}

.hlp-line {
  cursor: pointer;
}
.hlp-line polyline {
  fill: none;
  stroke: var(--k-ink-3);
  stroke-width: 1.5;
  transition: stroke 0.25s, stroke-width 0.25s;
}
.hlp-line rect {
  fill: var(--k-card);
  stroke: var(--k-ink-3);
  stroke-width: 1.5;
  transition: fill 0.25s, stroke 0.25s;
}
.hlp-end {
  font-size: 12px;
  fill: var(--k-ink-3);
  transition: fill 0.25s;
}
.hlp-end .v {
  font-family: var(--vp-font-family-mono);
  font-weight: 700;
}
.hlp-line.hot polyline {
  stroke: var(--k-red);
  stroke-width: 3;
}
.hlp-line.hot rect {
  fill: var(--k-red);
  stroke: var(--k-red);
}
.hlp-line.hot .hlp-end {
  fill: var(--k-ink);
  font-weight: 700;
}

/* The lines draw in left to right as the figure arrives. */
.hlp-box svg {
  clip-path: inset(-20px -200px -20px -20px);
  transition: clip-path 1.4s var(--k-ease) 0.2s;
}
.hf-motion .hlp.rv:not(.rv-in) .hlp-box svg {
  clip-path: inset(-20px 100% -20px -20px);
}

.hlp-keys {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}
.hlp-keys li {
  margin: 0;
}
.hlp-keys button {
  padding: 5px 9px;
  border: 1px solid var(--k-line);
  font-size: 12px;
  font-weight: 650;
  color: var(--k-ink-2);
  transition: border-color 0.2s, color 0.2s;
}
.hlp-keys button span {
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 500;
  color: var(--k-ink-3);
}
.hlp-keys button[aria-pressed='true'] {
  border-color: var(--k-red);
  color: var(--k-ink);
}

/* ---- IChO ---- */
.hlp-icho .hoa-kicker {
  font-size: 11px;
}
.hlp-icho-t {
  margin: 10px 0 0;
  font-family: var(--k-serif);
  font-style: italic;
  font-size: 22px;
  line-height: 1.3;
}
.hlp-db {
  margin: 26px 0 0;
  padding: 0;
  list-style: none;
}
.hlp-db li {
  margin: 0 0 22px;
}
.hlp-db-name {
  font-size: 13.5px;
  font-weight: 700;
}
.hlp-db-track {
  position: relative;
  display: block;
  height: 18px;
  margin: 10px 0 6px;
  border-bottom: 1px solid var(--k-line);
}
.hlp-db-track i {
  position: absolute;
  top: 3px;
}
.hlp-db-track .seg {
  top: 8px;
  left: calc(var(--a) * 100%);
  width: calc((var(--b) - var(--a)) * 100%);
  height: 2px;
  background: var(--k-red);
  transform-origin: left;
  transition: transform 1s var(--k-ease) calc(0.3s + var(--i) * 0.15s);
}
.hlp-db-track .from {
  left: calc(var(--a) * 100%);
  width: 12px;
  height: 12px;
  margin-left: -6px;
  border: 2px solid var(--k-ink-3);
  background: var(--k-card);
}
.hlp-db-track .to {
  left: calc(var(--b) * 100%);
  width: 12px;
  height: 12px;
  margin-left: -12px;
  background: var(--k-red);
  transition: transform 1s var(--k-ease) calc(0.3s + var(--i) * 0.15s), opacity 0.4s calc(0.3s + var(--i) * 0.15s);
}
.hlp-db-v {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
  color: var(--k-ink-3);
}
.hlp-db-v b {
  font-family: var(--vp-font-family-mono);
  color: var(--k-ink);
}
.hlp-db-v .to b {
  color: var(--k-accent);
}
.hlp-icho-n {
  margin: 4px 0 0;
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--k-ink-2);
}
.hlp-icho-n code {
  font-size: 0.92em;
}

.hf-motion .hlp.rv:not(.rv-in) .hlp-db-track .seg {
  transform: scaleX(0);
}
.hf-motion .hlp.rv:not(.rv-in) .hlp-db-track .to {
  opacity: 0;
  transform: translateX(-60px);
}

@media (max-width: 1000px) {
  .hlp {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 520px) {
  .hlp-slope,
  .hlp-icho {
    padding: 14px 14px 16px;
  }
}
</style>
