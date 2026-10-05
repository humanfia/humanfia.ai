<script setup lang="ts">
// Lines over time, or over anything ordered: a convergence curve, an error curve, a timeline of
// a result improving date by date.
//
// The plot is a scrubber. Move a pointer over it (or focus it and use the arrow keys; Home and
// End jump to the ends, Shift moves ten steps) and a cursor follows, reading every visible series
// at that point. The first time it is on screen the cursor sweeps once from left to right and the
// lines draw in behind it, which is the chart telling its own story before the reader takes over.
// A reader who asked for less motion gets the finished lines and no sweep.
//
// Annotations (`annotations`) ring a point and get a numbered key under the plot; hovering or
// focusing a key moves the cursor there. `x.categories` turns the x axis into named steps (dates,
// versions), and a point's x is then the index of its category.
//
// Wide plots with many labels set `minWidth`: under it the plot scrolls sideways inside its frame
// rather than shrinking its type below the site's 11px floor.
//
//   <LineChart
//     :series="[{ key: 'ours', label: 'Ours', tone: 'red', data: [[0, 1.1], [4, 1.5], [8, 1.85]] }]"
//     :x="{ suffix: 'h' }" :y="{ suffix: '×', decimals: 1 }"
//   />
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import ChartFrame from './ChartFrame.vue'
import { format, niceTicks, prefersReducedMotion, scale, toneOf, uid, useInView, useWidth, type Tone } from './shared'

type Point = readonly [number, number]

interface Series {
  key: string
  label: string
  tone?: Tone
  data: readonly Point[]
  /** Hold each value until the next point: a "best so far" curve. */
  step?: boolean
  dashed?: boolean
  /** Mark every point. */
  dots?: boolean
  /** Shade the area under the line, faintly. */
  area?: boolean
}

interface Axis {
  min?: number
  max?: number
  ticks?: number[]
  /** Tick labels: the value divided by `divide`, with `decimals` and `suffix`. */
  divide?: number
  decimals?: number
  /** Decimals on the tick labels, when they want fewer than the readout ("2.5×" vs "2.45×"). */
  tickDecimals?: number
  suffix?: string
  /** Named steps; a point's x is the index of its category. */
  categories?: string[]
  /** The axis's name, for the readout ("Context") and for a screen reader. */
  label?: string
  /** The readout's unit when it is not the tick suffix (" tokens"). */
  unit?: string
}

interface Annotation {
  x: number
  y: number
  label: string
  detail?: string
  tone?: Tone
}

const props = withDefaults(
  defineProps<{
    series: Series[]
    x?: Axis
    y?: Axis
    kicker?: string
    title?: string
    caption?: string
    label?: string
    height?: number
    minWidth?: number
    annotations?: Annotation[]
    reference?: { y: number; label: string }
    endLabels?: boolean
    sweep?: boolean
    invert?: boolean
  }>(),
  { x: () => ({}), y: () => ({}), height: 300, minWidth: 0, endLabels: true, sweep: true, invert: false },
)

const box = ref<HTMLElement | null>(null)
const plotEl = ref<HTMLElement | null>(null)
const boxWidth = useWidth(box, 640)
const seen = useInView(plotEl, 0.35)
const clipId = uid('lc-clip')

const width = computed(() => Math.max(boxWidth.value, props.minWidth))
const overflows = computed(() => props.minWidth > 0 && boxWidth.value < props.minWidth)

const visible = ref<Record<string, boolean>>(Object.fromEntries(props.series.map((s) => [s.key, true])))
const all = computed(() => props.series.map((s, i) => ({ ...s, tone: toneOf(s.tone, i) })))
const shown = computed(() => all.value.filter((s) => visible.value[s.key]))
function toggle(key: string) {
  const on = props.series.filter((s) => visible.value[s.key])
  if (on.length === 1 && on[0].key === key) return
  visible.value = { ...visible.value, [key]: !visible.value[key] }
}

const points = computed(() => props.series.flatMap((s) => s.data))
const cats = computed(() => props.x.categories)
const xMin = computed(() => props.x.min ?? (cats.value ? 0 : Math.min(...points.value.map((p) => p[0]))))
const xMax = computed(() => props.x.max ?? (cats.value ? cats.value.length - 1 : Math.max(...points.value.map((p) => p[0]))))
const yLo = computed(() => props.y.min ?? Math.min(0, ...points.value.map((p) => p[1])))
const yHi = computed(() => {
  if (props.y.max !== undefined) return props.y.max
  const peak = Math.max(...points.value.map((p) => p[1]), props.reference?.y ?? -Infinity)
  const t = niceTicks(yLo.value, peak, 5)
  return Math.max(peak, t[t.length - 1])
})

const fmtX = (v: number) =>
  cats.value ? (cats.value[Math.round(v)] ?? '') : format(v / (props.x.divide ?? 1), props.x.decimals ?? 0, props.x.suffix ?? '')
const fmtY = (v: number) => format(v / (props.y.divide ?? 1), props.y.decimals ?? 0, props.y.suffix ?? '')
const tickY = (v: number) => format(v / (props.y.divide ?? 1), props.y.tickDecimals ?? props.y.decimals ?? 0, props.y.suffix ?? '')
const tickX = (v: number) =>
  cats.value ? fmtX(v) : format(v / (props.x.divide ?? 1), props.x.tickDecimals ?? props.x.decimals ?? 0, props.x.suffix ?? '')
const readX = (v: number) =>
  cats.value ? fmtX(v) : props.x.unit !== undefined ? format(v, 0, props.x.unit) : fmtX(v)

const xTicks = computed(() =>
  props.x.ticks ?? (cats.value ? cats.value.map((_, i) => i) : niceTicks(xMin.value, xMax.value, Math.max(3, Math.min(8, Math.floor(width.value / 110))))),
)
const yTicks = computed(() => props.y.ticks ?? niceTicks(yLo.value, yHi.value, props.height < 260 ? 4 : 5))

/** The plot's margins, in pixels: room for the y labels on the left and the end labels on the right. */
const M = computed(() => ({
  top: 14,
  right: props.endLabels ? 60 : 16,
  bottom: 30,
  left: Math.max(...yTicks.value.map((t) => tickY(t).length)) * 7 + 14,
}))
const sx = computed(() => scale([xMin.value, xMax.value], [M.value.left, width.value - M.value.right]))
const sy = computed(() => scale([yLo.value, yHi.value], [props.height - M.value.bottom, M.value.top]))
const invX = computed(() => scale([M.value.left, width.value - M.value.right], [xMin.value, xMax.value]))

function pathOf(s: Series) {
  const X = sx.value
  const Y = sy.value
  return s.data
    .map(([a, b], i) => {
      if (!i) return `M${X(a).toFixed(1)} ${Y(b).toFixed(1)}`
      return s.step ? `H${X(a).toFixed(1)}V${Y(b).toFixed(1)}` : `L${X(a).toFixed(1)} ${Y(b).toFixed(1)}`
    })
    .join('')
}

function areaOf(s: Series) {
  if (!s.data.length) return ''
  const base = sy.value(Math.max(yLo.value, 0)).toFixed(1)
  return `${pathOf(s)}V${base}H${sx.value(s.data[0][0]).toFixed(1)}Z`
}

/** A series' value at `x`: the last point at or before it for a step series, the nearest point
 *  otherwise. Undefined outside the series' own range -- a line that has not started yet has no
 *  value to read. */
function valueAt(s: Series, x: number): Point | undefined {
  const d = s.data
  if (!d.length || x < d[0][0] - 1e-9 || x > d[d.length - 1][0] + 1e-9) {
    // A single point (a reference measurement) reads only at its own x.
    return d.length === 1 && Math.abs(d[0][0] - x) < (cats.value ? 0.5 : (xMax.value - xMin.value) / 200) ? d[0] : undefined
  }
  if (s.step) {
    let hit = d[0]
    for (const p of d) if (p[0] <= x + 1e-9) hit = p
    return hit
  }
  let best = d[0]
  for (const p of d) if (Math.abs(p[0] - x) < Math.abs(best[0] - x)) best = p
  return best
}

/** Where the cursor is, in data units; null when nobody is scrubbing. */
const cursor = ref<number | null>(null)
/** How far the lines have drawn, 0..1; 1 once the sweep is done or skipped. */
const drawn = ref(0)
const sweeping = ref(false)

const steps = computed(() => (cats.value ? cats.value.length - 1 : 100))
const snap = (x: number) => {
  const clamped = Math.min(xMax.value, Math.max(xMin.value, x))
  return cats.value ? Math.round(clamped) : clamped
}

function fromPointer(event: PointerEvent) {
  if (sweeping.value) stopSweep()
  const rect = (event.currentTarget as Element).getBoundingClientRect()
  cursor.value = snap(invX.value(event.clientX - rect.left))
}

function key(event: KeyboardEvent) {
  const unit = (xMax.value - xMin.value) / steps.value
  const by = event.shiftKey ? 10 : 1
  const at = cursor.value ?? xMin.value
  let next: number | undefined
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = at + unit * by
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = at - unit * by
  else if (event.key === 'Home') next = xMin.value
  else if (event.key === 'End') next = xMax.value
  else if (event.key === 'Escape') cursor.value = null
  if (next === undefined) return
  event.preventDefault()
  if (sweeping.value) stopSweep()
  cursor.value = snap(next)
}

const readings = computed(() =>
  cursor.value === null
    ? []
    : shown.value
        .map((s) => ({ s, p: valueAt(s, cursor.value!) }))
        .filter((r): r is { s: (typeof shown.value)[number]; p: Point } => r.p !== undefined),
)

const valueText = computed(() => {
  if (cursor.value === null) return 'Not scrubbing'
  const parts = readings.value.map(({ s, p }) => `${s.label} ${fmtY(p[1])}`)
  return `${props.x.label ? `${props.x.label} ` : ''}${readX(cursor.value)}: ${parts.join(', ') || 'no data'}`
})

/** The tip goes on whichever side of the cursor has room. */
const tipLeft = computed(() => (cursor.value === null ? 0 : sx.value(cursor.value)))
const scrolled = ref(0)
const tipFlip = computed(() => tipLeft.value - scrolled.value > boxWidth.value * 0.55)

// ---- the sweep -------------------------------------------------------------------------------

let frame = 0
function stopSweep() {
  cancelAnimationFrame(frame)
  sweeping.value = false
  drawn.value = 1
}

function startSweep() {
  if (!props.sweep || prefersReducedMotion()) {
    drawn.value = 1
    return
  }
  sweeping.value = true
  const start = performance.now()
  const DURATION = 2200
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / DURATION)
    const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
    drawn.value = eased
    cursor.value = xMin.value + (xMax.value - xMin.value) * eased
    if (t < 1) frame = requestAnimationFrame(tick)
    else {
      sweeping.value = false
      cursor.value = null
    }
  }
  frame = requestAnimationFrame(tick)
}

watch(seen, (now) => now && startSweep())
onBeforeUnmount(() => cancelAnimationFrame(frame))

const clipWidth = computed(() => M.value.left + (width.value - M.value.left - M.value.right) * drawn.value + (drawn.value >= 1 ? M.value.right : 0))

const lastOf = (s: Series) => s.data[s.data.length - 1]

/** End labels nudged apart so two lines that finish close together do not print on each other. */
const ends = computed(() => {
  const items = shown.value
    .filter((s) => s.data.length > 1)
    .map((s) => ({ s, y: sy.value(lastOf(s)[1]), x: sx.value(lastOf(s)[0]) }))
    .sort((a, b) => a.y - b.y)
  for (let i = 1; i < items.length; i++) if (items[i].y - items[i - 1].y < 15) items[i].y = items[i - 1].y + 15
  return items
})

const focusedNote = ref<number | null>(null)
function noteOn(i: number) {
  focusedNote.value = i
  if (sweeping.value) stopSweep()
  cursor.value = snap(props.annotations![i].x)
}
function noteOff() {
  focusedNote.value = null
  cursor.value = null
}

const ariaLabel = computed(() => props.label ?? props.title ?? props.kicker ?? 'Line chart')

/** The data view: one row per x, one column per series. Long series are thinned to ~40 rows. */
const columns = computed(() => [
  cats.value
    ? { key: 'x', label: props.x.label ?? 'x' }
    : { key: 'x', label: props.x.label ?? 'x', decimals: props.x.unit !== undefined ? 0 : (props.x.decimals ?? 0), suffix: props.x.unit ?? props.x.suffix ?? '' },
  ...props.series.map((s) => ({ key: s.key, label: s.label, decimals: props.y.decimals ?? 2, suffix: props.y.suffix ?? '' })),
])
const tableRows = computed(() => {
  const xs = [...new Set(props.series.flatMap((s) => s.data.map((p) => p[0])))].sort((a, b) => a - b)
  const every = Math.max(1, Math.ceil(xs.length / 40))
  return xs
    .filter((_, i) => i % every === 0 || i === xs.length - 1)
    .map((x) => ({
      x: cats.value ? readX(x) : x,
      ...Object.fromEntries(props.series.map((s) => [s.key, s.data.find((p) => p[0] === x)?.[1] ?? null])),
    }))
})
</script>

<template>
  <ChartFrame
    :kicker="kicker"
    :title="title"
    :caption="caption"
    :label="ariaLabel"
    :invert="invert"
    :columns="columns"
    :rows="tableRows"
  >
    <template #controls>
      <span class="lc-live kit-label" aria-hidden="true">
        <template v-if="cursor !== null">
          <i />{{ x.label ? `${x.label} ` : '' }}{{ readX(cursor) }}
        </template>
        <template v-else>Drag or use ← → to scrub</template>
      </span>
    </template>

    <div ref="box" class="lc-box">
      <div class="kit-scroll" :class="{ overflows }" @scroll="scrolled = ($event.target as HTMLElement).scrollLeft">
        <div
          ref="plotEl"
          class="lc-plot"
          role="slider"
          tabindex="0"
          :aria-label="`${ariaLabel}. Scrub along ${x.label ?? 'the x axis'}`"
          :aria-valuemin="xMin"
          :aria-valuemax="xMax"
          :aria-valuenow="cursor ?? xMin"
          :aria-valuetext="valueText"
          :style="{ width: `${width}px`, height: `${height}px` }"
          @pointermove="fromPointer"
          @pointerdown="fromPointer"
          @pointerleave="!sweeping && focusedNote === null && (cursor = null)"
          @keydown="key"
          @blur="!sweeping && (cursor = null)"
        >
          <svg :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" aria-hidden="true">
            <defs>
              <clipPath :id="clipId">
                <rect x="0" y="0" :width="clipWidth" :height="height" />
              </clipPath>
            </defs>

            <g>
              <g v-for="t in yTicks" :key="`y${t}`">
                <line class="grid-line" :x1="M.left" :x2="width - M.right" :y1="sy(t)" :y2="sy(t)" />
                <text :x="M.left - 8" :y="sy(t) + 4" text-anchor="end">{{ tickY(t) }}</text>
              </g>
              <line class="axis-line" :x1="M.left" :x2="width - M.right" :y1="height - M.bottom" :y2="height - M.bottom" />
              <text v-for="t in xTicks" :key="`x${t}`" :x="sx(t)" :y="height - M.bottom + 18" text-anchor="middle">{{ tickX(t) }}</text>
            </g>

            <g v-if="reference">
              <line class="lc-ref" :x1="M.left" :x2="width - M.right" :y1="sy(reference.y)" :y2="sy(reference.y)" />
              <text class="lc-ref-text" :x="M.left + 6" :y="sy(reference.y) - 6">{{ reference.label }}</text>
            </g>

            <g :clip-path="`url(#${clipId})`">
              <g v-for="s in shown" :key="s.key" :class="`tone-${s.tone}`">
                <path v-if="s.area" class="lc-area" :d="areaOf(s)" />
                <path class="lc-line" :class="{ dashed: s.dashed }" :d="pathOf(s)" />
                <template v-if="s.dots || s.data.length === 1">
                  <rect
                    v-for="p in s.data"
                    :key="p[0]"
                    class="lc-dot"
                    :x="sx(p[0]) - 3.5"
                    :y="sy(p[1]) - 3.5"
                    width="7"
                    height="7"
                  />
                </template>
              </g>

              <g v-for="(a, i) in annotations ?? []" :key="`a${i}`" class="lc-note" :class="[`tone-${a.tone ?? 'red'}`, { on: focusedNote === i }]">
                <circle :cx="sx(a.x)" :cy="sy(a.y)" r="10" />
                <text class="lc-note-num" :x="sx(a.x)" :y="sy(a.y) - 16" text-anchor="middle">{{ i + 1 }}</text>
              </g>

              <g v-for="e in endLabels ? ends : []" :key="`e${e.s.key}`" :class="`tone-${e.s.tone}`">
                <text class="lc-end" :x="e.x + 8" :y="e.y + 4">{{ fmtY(lastOf(e.s)[1]) }}</text>
              </g>
            </g>

            <g v-if="cursor !== null" class="lc-cursor">
              <line :x1="sx(cursor)" :x2="sx(cursor)" :y1="M.top" :y2="height - M.bottom" />
              <g v-for="{ s, p } in readings" :key="`c${s.key}`" :class="`tone-${s.tone}`">
                <circle class="lc-hit" :cx="sx(p[0])" :cy="sy(p[1])" r="5" />
              </g>
            </g>
          </svg>

          <div
            v-if="cursor !== null && readings.length"
            class="kit-tip lc-tip"
            :style="tipFlip ? { right: `${width - tipLeft + 12}px` } : { left: `${tipLeft + 12}px` }"
            aria-hidden="true"
          >
            <strong>{{ x.label ? `${x.label} ` : '' }}{{ readX(cursor) }}</strong>
            <div v-for="{ s, p } in readings" :key="s.key" class="kit-tip-row" :class="`tone-${s.tone}`">
              <i class="kit-swatch line" />{{ s.label }}
              <b>{{ fmtY(p[1]) }}</b>
            </div>
          </div>
        </div>
      </div>
      <p class="kit-hint" :class="{ show: overflows }">Swipe the plot sideways to see all of it →</p>
      <p class="sr-only" aria-live="polite">{{ cursor !== null && !sweeping ? valueText : '' }}</p>
    </div>

    <ol v-if="annotations?.length" class="lc-notes">
      <li v-for="(a, i) in annotations" :key="i" :class="`tone-${a.tone ?? 'red'}`">
        <button
          type="button"
          :aria-pressed="focusedNote === i"
          @pointerenter="noteOn(i)"
          @pointerleave="noteOff"
          @focus="noteOn(i)"
          @blur="noteOff"
        >
          <span class="lc-num">{{ i + 1 }}</span>
          <span><b>{{ a.label }}</b><template v-if="a.detail"> · {{ a.detail }}</template></span>
        </button>
      </li>
    </ol>

    <template #legend>
      <ul class="kit-legend" aria-label="Series">
        <li v-for="s in all" :key="s.key" :class="`tone-${s.tone}`">
          <button
            v-if="series.length > 1"
            type="button"
            class="kit-key"
            :aria-pressed="visible[s.key]"
            @click="toggle(s.key)"
          >
            <i class="kit-swatch" :class="s.dashed ? 'dashed' : 'line'" />{{ s.label }}
          </button>
          <span v-else class="kit-key"><i class="kit-swatch line" />{{ s.label }}</span>
        </li>
      </ul>
    </template>
  </ChartFrame>
</template>

<style scoped>
.lc-box {
  position: relative;
}

.lc-plot {
  position: relative;
  touch-action: pan-y;
  cursor: crosshair;
  outline: none;
}

.lc-plot:focus-visible {
  box-shadow: 0 0 0 2px var(--k-red);
}

.lc-plot svg {
  display: block;
  overflow: visible;
}

.lc-live {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 28px;
}

.lc-live i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--k-red);
}

.lc-line {
  fill: none;
  stroke: var(--s);
  stroke-width: 2.5;
  stroke-linejoin: round;
  stroke-linecap: square;
}

.lc-line.dashed {
  stroke-dasharray: 7 5;
  stroke-width: 2;
}

.lc-area {
  fill: color-mix(in srgb, var(--s) 10%, transparent);
  stroke: none;
}

.lc-dot {
  fill: var(--k-bg);
  stroke: var(--s);
  stroke-width: 2;
}

.lc-ref {
  stroke: var(--k-fg-2);
  stroke-width: 1;
  stroke-dasharray: 4 4;
}

.kit svg .lc-ref-text {
  fill: var(--k-fg-2);
}

.kit svg .lc-end {
  font-size: 12px;
  font-weight: 700;
  fill: var(--s);
}

.lc-note circle {
  fill: none;
  stroke: var(--s);
  stroke-width: 2;
  transition: r 0.2s;
}

.lc-note.on circle {
  r: 14;
  stroke-width: 3;
}

.kit svg .lc-note-num {
  font-weight: 700;
  fill: var(--s);
}

.lc-cursor line {
  stroke: var(--k-fg);
  stroke-width: 1;
  stroke-dasharray: 2 3;
}

.lc-hit {
  fill: var(--s);
  stroke: var(--k-bg);
  stroke-width: 2;
}

.lc-tip {
  top: 6px;
}

.lc-notes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 8px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.lc-notes li {
  margin: 0;
}

.lc-notes button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  padding: 4px 10px 4px 4px;
  border: 1px solid var(--k-line);
  background: none;
  font-family: var(--k-mono);
  font-size: 11.5px;
  line-height: 1.35;
  text-align: left;
  color: var(--k-fg-2);
  cursor: default;
}

.lc-notes button:hover,
.lc-notes button[aria-pressed='true'] {
  border-color: var(--s);
  color: var(--k-fg);
}

.lc-notes b {
  color: var(--k-fg);
}

.lc-num {
  display: grid;
  place-items: center;
  flex: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--s);
  font-weight: 700;
  color: var(--k-bg);
}
</style>
