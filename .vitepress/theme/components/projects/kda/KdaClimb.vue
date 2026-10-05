<script setup lang="ts">
// KDA², the best result over time, drawn by the scroll: as the chart travels up the window the
// line runs on from July to September, and the readout above it says where it has got to. Point
// at the chart (or drag a finger along it) to read any date. When the line arrives, the three
// candidates that clocked more and were refused for overfitting the verifier hang above it.
//
// Drawn in real pixels at the measured width, so its labels are never scaled below 11px. On the
// server, and for a reader who asked for less motion, the line is whole.
import { computed, ref } from 'vue'
import { span, useScrollProgress } from '../../../home/motion'
import { useWidth } from '../../kit/shared'
import { useMotion } from './motion'

interface Milestone {
  x: number
  label: string
  tone?: 'red' | 'ink' | 'grey'
}

const props = defineProps<{
  dates: string[]
  kda: [number, number][]
  cake: [number, number][]
  reference: { x: number; y: number; label: string }
  milestones: Milestone[]
  refused: number[]
}>()

const box = ref<HTMLElement | null>(null)
const width = useWidth(box, 1000)
const motion = useMotion()
const scrolled = useScrollProgress(box, (rect, vh) => span(vh * 0.88 - rect.top, 0, vh * 0.55))
const hover = ref<number | null>(null)

const H = computed(() => (width.value < 600 ? 280 : 380))
const M = computed(() => ({ l: 44, r: width.value < 600 ? 92 : 132, t: 24, b: 34 }))
/** Room between the axis and the first date, so the first point does not sit on a tick label. */
const PAD = 18
const Y0 = 1.3
const Y1 = 3.9
const last = computed(() => props.dates.length - 1)
const sx = (i: number) => M.value.l + PAD + (i / last.value) * (width.value - M.value.l - M.value.r - PAD)
const sy = (v: number) => M.value.t + (1 - (v - Y0) / (Y1 - Y0)) * (H.value - M.value.t - M.value.b)

/** How far along the dates the line has got, in date indices. */
const cut = computed(() => {
  if (hover.value !== null) return last.value
  if (!motion.value) return last.value
  return scrolled.value * last.value
})
const at = computed(() => (hover.value !== null ? hover.value : Math.floor(cut.value + 1e-6)))

const step = (pts: [number, number][]) =>
  pts.map(([x, y], i) => (i ? `H${sx(x).toFixed(1)}V${sy(y).toFixed(1)}` : `M${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`)).join('')

const kdaPath = computed(() => step([...props.kda, [last.value, props.kda[props.kda.length - 1][1]]]))
const cakePath = computed(() => step(props.cake))

/** The best KDA result on or before date index `i`. */
const bestAt = (i: number) => {
  let v: number | null = null
  for (const [x, y] of props.kda) if (x <= i) v = y
  return v
}
const readout = computed(() => {
  const i = at.value
  const v = bestAt(i)
  const m = props.milestones.find((ms) => ms.x === i)
  return { date: props.dates[i], value: v, note: m?.label ?? (v === null ? props.reference.label : '') }
})
const done = computed(() => cut.value >= last.value - 0.02)

const yTicks = [1.5, 2, 2.5, 3, 3.5]

/** The milestones that get a label on the chart: on a wide chart, every one that does not
 *  collide with the one labelled before it; on a narrow one, none (the readout names them). */
const labels = computed(() => {
  if (width.value < 600) return []
  const out: (Milestone & { y: number })[] = []
  for (const m of props.milestones) {
    const y = sy(bestAt(m.x) ?? Y0)
    const prev = out[out.length - 1]
    const near = prev && Math.abs(sx(m.x) - sx(prev.x)) < m.label.length * 7 + 16 && Math.abs(y - prev.y) < 22
    if (!near) out.push({ ...m, y })
  }
  return out
})

function onMove(e: PointerEvent) {
  const rect = (e.currentTarget as SVGElement).getBoundingClientRect()
  const x = e.clientX - rect.left
  const i = Math.round(((x - M.value.l - PAD) / (width.value - M.value.l - M.value.r - PAD)) * last.value)
  hover.value = Math.max(0, Math.min(last.value, i))
}
</script>

<template>
  <figure class="climb" :class="{ done }">
    <div class="climb-read" aria-hidden="true">
      <span class="kd-mono climb-date">{{ readout.date }}</span>
      <span class="climb-value">{{ readout.value === null ? `${reference.y.toFixed(2)}×` : `${readout.value.toFixed(2)}×` }}</span>
      <span class="kd-mono climb-note">{{ readout.value === null ? reference.label : readout.note || 'best KDA result' }}</span>
    </div>

    <div ref="box" class="climb-box">
      <svg
        :width="width"
        :height="H"
        :viewBox="`0 0 ${width} ${H}`"
        role="img"
        aria-label="KDA² best speedup over FlashKDA on B300, by date: 1.61× on July 21, 2.45× on August 14 with Humanize flows, 2.54× on August 30 with TIRx, 2.56× on September 1, 2.93× on September 2, 2.94× on September 6 with CAKE, and 2.96× on September 12 with TIRx. The INT21 reference is 1.5×. Candidates that clocked 3.28×, 3.57× and 3.74× were refused for overfitting the verifier."
        @pointermove="onMove"
        @pointerdown="onMove"
        @pointerleave="hover = null"
      >
        <defs>
          <clipPath id="kd-climb-cut">
            <rect x="0" y="0" :width="sx(cut) + 1" :height="H" />
          </clipPath>
        </defs>

        <g class="grid">
          <g v-for="v in yTicks" :key="v">
            <line :x1="M.l" :x2="width - M.r" :y1="sy(v)" :y2="sy(v)" />
            <text :x="M.l - 8" :y="sy(v) + 4" text-anchor="end">{{ v.toFixed(1) }}×</text>
          </g>
          <template v-for="(d, i) in dates" :key="d">
            <text v-if="width >= 600 || i % 3 === 0 || i === last" :x="sx(i)" :y="H - 10" text-anchor="middle">{{ d }}</text>
          </template>
        </g>

        <!-- the refused: what three candidates clocked, and could not keep -->
        <g class="refused" :class="{ on: done }">
          <g v-for="v in refused" :key="v">
            <line :x1="sx(last) + 16" :x2="width - 48" :y1="sy(v)" :y2="sy(v)" />
            <text :x="width - 44" :y="sy(v) + 4">{{ v.toFixed(2) }}×</text>
          </g>
          <text class="refused-label" :x="width" :y="sy(refused[refused.length - 1]) - 14" text-anchor="end">refused</text>
        </g>

        <circle class="ref" :cx="sx(reference.x)" :cy="sy(reference.y)" r="4.5" />

        <g clip-path="url(#kd-climb-cut)">
          <path class="cake" :d="cakePath" />
          <path class="kda" :d="kdaPath" />
          <circle v-for="[x, y] in kda" :key="`k${x}`" class="dot" :cx="sx(x)" :cy="sy(y)" r="4" />
        </g>

        <g v-for="m in labels" :key="`m${m.x}${m.label}`" class="ms" :class="[m.tone ?? 'ink', { on: m.x <= cut + 1e-6 }]">
          <line :x1="sx(m.x)" :x2="sx(m.x)" :y1="m.y - 8" :y2="m.y - 26" />
          <text :x="sx(m.x)" :y="m.y - 32" :text-anchor="m.x === last ? 'end' : 'middle'">{{ m.label }}</text>
        </g>

        <line class="head" :x1="sx(hover ?? cut)" :x2="sx(hover ?? cut)" :y1="M.t" :y2="H - M.b" />
        <circle v-if="bestAt(at) !== null" class="head-dot" :cx="sx(at)" :cy="sy(bestAt(at)!)" r="7" />
      </svg>
    </div>

    <figcaption class="climb-legend kd-mono">
      <span class="lk"><i />KDA best</span>
      <span class="lc"><i />CAKE</span>
      <span class="lr"><i />INT21 reference</span>
      <span class="lx"><i />refused candidates</span>
    </figcaption>
  </figure>
</template>

<style scoped>
.climb {
  margin: 0;
}

.climb-read {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 18px;
  min-height: 92px;
  margin-bottom: 8px;
}

.climb-date {
  font-size: 14px;
  font-weight: 700;
  color: var(--kd-fg-2);
  min-width: 4ch;
}

.climb-value {
  font-size: clamp(56px, 7vw, 96px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.05em;
  color: var(--kd-red-text);
  font-variant-numeric: tabular-nums;
  min-width: 3.4ch;
}

.climb-note {
  font-size: 13px;
  color: var(--kd-fg-2);
}

.climb-box {
  width: 100%;
  touch-action: pan-y;
}

svg {
  display: block;
  overflow: visible;
  cursor: crosshair;
}

.grid line {
  stroke: var(--kd-grid);
  stroke-width: 1;
}

.grid line.one {
  stroke: var(--kd-line);
}

.grid text,
.refused text,
.ms text {
  font-family: var(--kd-mono);
  font-size: 11px;
  fill: var(--kd-fg-3);
}

.kda {
  fill: none;
  stroke: var(--kd-red);
  stroke-width: 3;
  stroke-linejoin: round;
}

.cake {
  fill: none;
  stroke: var(--kd-fg);
  stroke-width: 1.5;
  stroke-dasharray: 5 4;
}

.dot {
  fill: var(--kd-bg);
  stroke: var(--kd-red);
  stroke-width: 2;
}

.ref {
  fill: var(--kd-fg-3);
}

.ms line {
  stroke: var(--kd-fg-3);
}

.ms text {
  font-size: 11.5px;
  font-weight: 600;
  fill: var(--kd-fg-2);
}

.ms.red text {
  fill: var(--kd-red-text);
}

.ms {
  opacity: 0;
  transition: opacity 0.4s var(--kd-ease);
}

.ms.on {
  opacity: 1;
}

.refused line {
  stroke: var(--kd-fg-3);
  stroke-width: 1.5;
  stroke-dasharray: 2 4;
}

.refused text {
  fill: var(--kd-fg-2);
  font-weight: 600;
}

.refused .refused-label {
  fill: var(--kd-fg-3);
  font-weight: 500;
}

.refused {
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 0.6s var(--kd-ease),
    transform 0.8s var(--kd-ease);
}

.refused.on {
  opacity: 1;
  transform: none;
}

.head {
  stroke: var(--kd-fg);
  stroke-width: 1;
  opacity: 0.35;
}

.head-dot {
  fill: var(--kd-red);
  stroke: var(--kd-bg);
  stroke-width: 3;
}

.climb-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin-top: 14px;
  font-size: 12px;
  color: var(--kd-fg-2);
}

.climb-legend span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.climb-legend i {
  display: inline-block;
  width: 18px;
  height: 0;
  border-top: 3px solid var(--kd-red);
}

.climb-legend .lc i {
  border-top: 1.5px dashed var(--kd-fg);
}

.climb-legend .lr i {
  width: 9px;
  height: 9px;
  border: 0;
  border-radius: 50%;
  background: var(--kd-fg-3);
}

.climb-legend .lx i {
  border-top: 1.5px dotted var(--kd-fg-3);
}
</style>
