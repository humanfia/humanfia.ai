<script setup lang="ts">
// One line chart, the one every figure on the Flow Science page is drawn with. It is drawn at
// the width it is shown, in the site's inks (so it turns over with the theme), and it is read
// with the pointer or the keyboard: a rule follows the cursor and the box beside it says what
// every series was at that moment, best first. The legend is a row of switches -- click one to
// hide a series, hover one to pick it out. The lines draw themselves in from the left the first
// time the chart is on screen, and are simply there for a reader who asked for less motion.
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'
import { pathOf, still, useSeen, useWidth, valueAt, type Scale, type Series } from './chart'

const props = withDefaults(
  defineProps<{
    series: Series[]
    x: Scale
    y: Scale
    xLabel: string
    yLabel: string
    /** Best-so-far curves are steps; smoothed curves are lines. */
    step?: boolean
    /** For a score where less is better (clock cycles), so "best first" sorts the right way. */
    lowerBetter?: boolean
    /** How a value reads in the box beside the rule, when the tick format is too coarse. */
    readout?: (v: number) => string
    height?: number
    /** Words for a screen reader: what the chart shows, in one sentence. */
    summary: string
  }>(),
  { step: true, lowerBetter: false, height: 320 },
)

const uid = useId()
const box = ref<HTMLElement | null>(null)
const width = useWidth(box)
const seen = useSeen(box)

const M = computed(() => ({ l: width.value < 480 ? 46 : 58, r: 14, t: 12, b: 44 }))
const W = computed(() => Math.max(120, width.value - M.value.l - M.value.r))
const H = computed(() => props.height - M.value.t - M.value.b)

const hidden = ref(new Set<string>())
const hot = ref<string | null>(null)
function toggle(id: string) {
  const next = new Set(hidden.value)
  if (next.has(id)) next.delete(id)
  else if (next.size < props.series.length - 1) next.add(id)
  hidden.value = next
}

const paths = computed(() =>
  props.series.map((s) => ({ ...s, ...pathOf(s.points, props.x, props.y, W.value, H.value, props.step) })),
)

// x tick labels thin themselves out on a narrow screen rather than overprinting.
const xTicks = computed(() => {
  const all = props.x.ticks.map((v) => ({ v, px: props.x.to(v) * W.value }))
  const out: typeof all = []
  for (const t of all) if (!out.length || t.px - out[out.length - 1].px >= 38) out.push(t)
  return out
})
const yTicks = computed(() => props.y.ticks.map((v) => ({ v, py: (1 - props.y.to(v)) * H.value })))

// --- the reveal: a clip that opens from the left
const reveal = ref(0)
let raf = 0
watch(
  seen,
  (on) => {
    if (!on) return
    if (still()) {
      reveal.value = 1
      return
    }
    const t0 = performance.now()
    const tick = (now: number) => {
      const u = Math.min(1, (now - t0) / 1600)
      reveal.value = 1 - (1 - u) ** 3
      if (u < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  },
  { immediate: true },
)
onBeforeUnmount(() => cancelAnimationFrame(raf))

// --- reading the chart
const cursor = ref<number | null>(null) // 0..1 along the x axis
function move(e: PointerEvent) {
  const svg = e.currentTarget as SVGSVGElement
  const r = svg.getBoundingClientRect()
  const u = (e.clientX - r.left - M.value.l) / W.value
  cursor.value = u < 0 || u > 1 ? null : u
}
function key(e: KeyboardEvent) {
  const d = e.key === 'ArrowRight' ? 0.02 : e.key === 'ArrowLeft' ? -0.02 : 0
  if (e.key === 'Home') cursor.value = 0
  else if (e.key === 'End') cursor.value = 1
  else if (!d) return
  else cursor.value = Math.min(1, Math.max(0, (cursor.value ?? (d > 0 ? 0 : 1)) + d))
  e.preventDefault()
}
const fmtY = computed(() => props.readout ?? props.y.fmt)
const reading = computed(() => {
  if (cursor.value === null) return null
  const xv = props.x.from(cursor.value)
  const rows = props.series
    .filter((s) => !hidden.value.has(s.id))
    .map((s) => ({ s, v: valueAt(s.points, xv, props.step) }))
    .filter((r): r is { s: Series; v: number } => r.v !== null)
    .sort((a, b) => (props.lowerBetter ? a.v - b.v : b.v - a.v))
  return {
    x: props.x.fmt(xv),
    px: cursor.value * W.value,
    rows: rows.map((r) => ({ ...r, py: (1 - props.y.to(r.v)) * H.value, text: fmtY.value(r.v) })),
  }
})
const flip = computed(() => reading.value !== null && reading.value.px > W.value * 0.58)
</script>

<template>
  <div class="dc" :class="{ 'dc-hot': hot }">
    <div class="dc-legend" role="group" aria-label="Series (click to hide or show)">
      <button
        v-for="s in series"
        :key="s.id"
        type="button"
        class="dc-key"
        :class="[`t${s.tone}`, { off: hidden.has(s.id), on: hot === s.id }]"
        :aria-pressed="!hidden.has(s.id)"
        @click="toggle(s.id)"
        @pointerenter="hot = s.id"
        @pointerleave="hot = null"
        @focus="hot = s.id"
        @blur="hot = null"
      >
        <svg width="22" height="10" aria-hidden="true"><line x1="1" y1="5" x2="21" y2="5" /></svg>
        {{ s.label }}
      </button>
    </div>

    <p class="dc-ylabel" aria-hidden="true">↑ {{ yLabel }}</p>
    <div ref="box" class="dc-box">
      <svg
        :width="width"
        :height="height"
        class="dc-svg"
        tabindex="0"
        role="img"
        :aria-label="summary"
        @pointermove="move"
        @pointerleave="cursor = null"
        @keydown="key"
        @blur="cursor = null"
      >
        <defs>
          <clipPath :id="`${uid}-clip`">
            <rect x="-4" y="-8" :width="(W + 8) * reveal" :height="H + 16" />
          </clipPath>
        </defs>
        <g :transform="`translate(${M.l},${M.t})`">
          <g class="dc-grid">
            <line v-for="t in yTicks" :key="`y${t.v}`" x1="0" :x2="W" :y1="t.py" :y2="t.py" />
          </g>
          <g class="dc-axis">
            <line x1="0" :x2="W" :y1="H" :y2="H" class="dc-base" />
            <text v-for="t in yTicks" :key="`yl${t.v}`" x="-8" :y="t.py" dy="0.32em" text-anchor="end">{{ y.fmt(t.v) }}</text>
            <g v-for="t in xTicks" :key="`x${t.v}`" :transform="`translate(${t.px},${H})`">
              <line y2="5" />
              <text y="19" text-anchor="middle">{{ x.fmt(t.v) }}</text>
            </g>
            <text class="dc-title" :x="W / 2" :y="H + 38" text-anchor="middle">{{ xLabel }}</text>
          </g>
          <g :clip-path="`url(#${uid}-clip)`">
            <path
              v-for="p in paths"
              :key="p.id"
              :d="p.d"
              class="dc-line"
              :class="[`t${p.tone}`, { off: hidden.has(p.id), dim: hot && hot !== p.id, lift: hot === p.id }]"
            />
          </g>
          <g v-if="reading" class="dc-read" aria-hidden="true">
            <line :x1="reading.px" :x2="reading.px" y1="0" :y2="H" />
            <circle v-for="r in reading.rows" :key="r.s.id" :cx="reading.px" :cy="r.py" r="4" :class="`t${r.s.tone}`" />
          </g>
        </g>
      </svg>
      <div
        v-if="reading && reading.rows.length"
        class="dc-tip"
        :class="{ flip }"
        :style="{ left: `${M.l + reading.px}px` }"
        aria-hidden="true"
      >
        <b>{{ reading.x }}</b>
        <span v-for="r in reading.rows" :key="r.s.id" :class="`t${r.s.tone}`"><i />{{ r.s.label }}<em>{{ r.text }}</em></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dc {
  /* The six inks a chart may use, all from the site's palette. The red is the flow the figure
     is about; the rest are ink, a warm grey, ochre, the old blue and a mid grey, told apart by
     dash as well as by colour so the chart still reads in greyscale. */
  --dc-0: var(--hf-red);
  --dc-1: var(--vp-c-text-1);
  --dc-2: #b07a12;
  --dc-3: var(--hf-blue);
  --dc-4: var(--vp-c-text-3);
  --dc-5: #7a5a8c;
  margin: 18px 0 8px;
}
.dark .dc {
  --dc-2: #e0aa48;
  --dc-3: var(--hf-blue-light);
  --dc-5: #b49ac4;
}
.t0 { --c: var(--dc-0); }
.t1 { --c: var(--dc-1); }
.t2 { --c: var(--dc-2); }
.t3 { --c: var(--dc-3); }
.t4 { --c: var(--dc-4); }
.t5 { --c: var(--dc-5); }

.dc-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 8px;
  margin-bottom: 10px;
}
.dc-key {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px 3px 6px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 2px;
  font: 500 12px/1.4 var(--vp-font-family-mono);
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  cursor: pointer;
  transition: opacity 0.2s, border-color 0.2s;
}
.dc-key:hover,
.dc-key.on {
  border-color: var(--c);
}
.dc-key.off {
  opacity: 0.4;
  text-decoration: line-through;
}
.dc-key line {
  stroke: var(--c);
  stroke-width: 3;
}
.t1 line, .t1.dc-line { stroke-dasharray: none; }
.dc-key.t2 line, .dc-line.t2 { stroke-dasharray: 7 3; }
.dc-key.t3 line, .dc-line.t3 { stroke-dasharray: 2 3; }
.dc-key.t4 line, .dc-line.t4 { stroke-dasharray: 10 3 2 3; }
.dc-key.t5 line, .dc-line.t5 { stroke-dasharray: 4 4; }

.dc-box {
  position: relative;
  width: 100%;
}
.dc-svg {
  display: block;
  overflow: visible;
  outline: none;
  touch-action: pan-y;
}
.dc-svg:focus-visible {
  outline: 2px solid var(--hf-red);
  outline-offset: 4px;
}
.dc-grid line {
  stroke: var(--vp-c-divider);
}
.dc-axis line {
  stroke: var(--vp-c-text-3);
}
.dc-axis .dc-base {
  stroke: var(--vp-c-text-1);
  stroke-width: 1.5;
}
.dc-axis text {
  font: 11px/1 var(--vp-font-family-mono);
  fill: var(--vp-c-text-2);
}
.dc-axis .dc-title {
  font: 600 11px/1 var(--vp-font-family-base);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  fill: var(--vp-c-text-2);
}
.dc-ylabel {
  margin: 0 0 6px;
  font: 600 11px/1.3 var(--vp-font-family-base);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
}
.dc-line {
  fill: none;
  stroke: var(--c);
  stroke-width: 2;
  stroke-linejoin: round;
  transition: opacity 0.25s, stroke-width 0.25s;
}
.dc-line.t0 {
  stroke-width: 3;
}
.dc-line.off {
  opacity: 0;
}
.dc-line.dim {
  opacity: 0.18;
}
.dc-line.lift {
  stroke-width: 3.5;
}
.dc-read line {
  stroke: var(--vp-c-text-1);
  stroke-width: 1;
  stroke-dasharray: 3 3;
}
.dc-read circle {
  fill: var(--vp-c-bg);
  stroke: var(--c);
  stroke-width: 2.5;
}
.dc-tip {
  position: absolute;
  top: 8px;
  transform: translateX(14px);
  display: grid;
  gap: 3px;
  min-width: 170px;
  padding: 8px 10px;
  border: 1px solid var(--vp-c-text-1);
  background: var(--vp-c-bg-elv);
  box-shadow: 4px 4px 0 var(--vp-c-text-1);
  font: 12px/1.35 var(--vp-font-family-mono);
  color: var(--vp-c-text-1);
  pointer-events: none;
  z-index: 2;
}
.dc-tip.flip {
  transform: translateX(calc(-100% - 14px));
}
.dc-tip b {
  font-weight: 700;
  margin-bottom: 2px;
}
.dc-tip span {
  display: grid;
  grid-template-columns: 10px 1fr auto;
  align-items: center;
  gap: 6px;
}
.dc-tip i {
  width: 10px;
  height: 3px;
  background: var(--c);
}
.dc-tip em {
  font-style: normal;
  font-weight: 700;
}
</style>
