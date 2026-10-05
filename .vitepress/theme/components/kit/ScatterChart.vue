<script setup lang="ts">
// Points on two axes: cost against score, size against speed, one entry per dot.
//
// Hover anywhere and the nearest point is picked out with its readout; focus the plot and the
// arrow keys walk the points left to right. Groups switch on and off from the legend, points
// marked `highlight` carry their label permanently, and `diagonal` draws y = x for a
// "claimed versus real" plot. The dots arrive one after another the first time the chart is on
// screen; a reader who asked for less motion gets them all at once.
//
//   <ScatterChart
//     :groups="[{ key: 'us', label: 'Humanfia', tone: 'red' }, { key: 'them', label: 'Others', tone: 'grey' }]"
//     :points="[{ x: 44.5, y: 672, group: 'us', label: 'Humanfia', highlight: true }, { x: 74, y: 672, group: 'them', label: 'Aleph' }]"
//     :x="{ label: 'Cost per problem', prefix: '$', log: true }" :y="{ label: 'Solved' }"
//   />
import { computed, ref } from 'vue'
import ChartFrame from './ChartFrame.vue'
import { format, niceTicks, toneOf, uid, useInView, useWidth, type Tone } from './shared'

interface Point {
  x: number
  y: number
  label?: string
  group?: string
  /** Always labelled, and drawn larger. */
  highlight?: boolean
}

interface Group {
  key: string
  label: string
  tone?: Tone
}

interface Axis {
  min?: number
  max?: number
  label?: string
  decimals?: number
  prefix?: string
  suffix?: string
  /** A log scale, for values that span orders of magnitude (costs, sizes). */
  log?: boolean
}

const props = withDefaults(
  defineProps<{
    points: Point[]
    groups?: Group[]
    x?: Axis
    y?: Axis
    kicker?: string
    title?: string
    caption?: string
    label?: string
    height?: number
    /** Draw y = x. */
    diagonal?: boolean
    invert?: boolean
  }>(),
  { groups: () => [{ key: 'default', label: 'Points' }], x: () => ({}), y: () => ({}), height: 320, diagonal: false, invert: false },
)

const box = ref<HTMLElement | null>(null)
const width = useWidth(box, 640)
const seen = useInView(box, 0.3)
const listId = uid('sc')

const groupsT = computed(() => props.groups.map((g, i) => ({ ...g, tone: toneOf(g.tone, i) })))
const toneOfGroup = (key?: string) => groupsT.value.find((g) => g.key === (key ?? props.groups[0].key))?.tone ?? 'ink'
const visible = ref<Record<string, boolean>>(Object.fromEntries(props.groups.map((g) => [g.key, true])))
function toggle(key: string) {
  const on = props.groups.filter((g) => visible.value[g.key])
  if (on.length === 1 && on[0].key === key) return
  visible.value = { ...visible.value, [key]: !visible.value[key] }
}

const shown = computed(() =>
  props.points
    .map((p, index) => ({ ...p, index, group: p.group ?? props.groups[0].key }))
    .filter((p) => visible.value[p.group])
    .sort((a, b) => a.x - b.x || a.y - b.y),
)

function extent(axis: Axis, values: number[]) {
  let lo = axis.min ?? Math.min(...values)
  let hi = axis.max ?? Math.max(...values)
  if (axis.log) {
    lo = axis.min ?? 10 ** Math.floor(Math.log10(Math.max(lo, 1e-9)))
    hi = axis.max ?? 10 ** Math.ceil(Math.log10(hi))
    return [lo, hi] as const
  }
  if (axis.min === undefined) lo = Math.min(0, lo)
  const t = niceTicks(lo, hi, 5)
  return [lo, axis.max ?? Math.max(hi, t[t.length - 1])] as const
}

const xs = computed(() => extent(props.x, props.points.map((p) => p.x)))
const ys = computed(() => extent(props.y, props.points.map((p) => p.y)))

function ticksOf(axis: Axis, [lo, hi]: readonly [number, number], n: number) {
  if (!axis.log) return niceTicks(lo, hi, n)
  const out: number[] = []
  for (let e = Math.ceil(Math.log10(lo)); 10 ** e <= hi * 1.0001; e++) out.push(10 ** e)
  return out
}

const fmt = (axis: Axis, v: number) => format(v, axis.decimals ?? (axis.log && v < 1 ? 2 : 0), axis.suffix ?? '', axis.prefix ?? '')
const xTicks = computed(() => ticksOf(props.x, xs.value, Math.max(3, Math.floor(width.value / 120))))
const yTicks = computed(() => ticksOf(props.y, ys.value, 5))

const M = computed(() => ({
  top: 16,
  right: 18,
  bottom: 44,
  left: Math.max(...yTicks.value.map((t) => fmt(props.y, t).length)) * 7 + 16,
}))

function axisScale(axis: Axis, [lo, hi]: readonly [number, number], r0: number, r1: number) {
  if (axis.log) {
    const a = Math.log10(lo)
    const b = Math.log10(hi)
    return (v: number) => r0 + ((Math.log10(Math.max(v, lo)) - a) / (b - a)) * (r1 - r0)
  }
  return (v: number) => r0 + ((v - lo) / (hi - lo || 1)) * (r1 - r0)
}

const sx = computed(() => axisScale(props.x, xs.value, M.value.left, width.value - M.value.right))
const sy = computed(() => axisScale(props.y, ys.value, props.height - M.value.bottom, M.value.top))

const active = ref<number | null>(null)
const activePoint = computed(() => shown.value.find((p) => p.index === active.value))

function nearest(event: PointerEvent) {
  const rect = (event.currentTarget as Element).getBoundingClientRect()
  const px = event.clientX - rect.left
  const py = event.clientY - rect.top
  let best: (typeof shown.value)[number] | undefined
  let dist = 36
  for (const p of shown.value) {
    const d = Math.hypot(sx.value(p.x) - px, sy.value(p.y) - py)
    if (d < dist) {
      dist = d
      best = p
    }
  }
  active.value = best?.index ?? null
}

function key(event: KeyboardEvent) {
  const list = shown.value
  if (!list.length) return
  const at = list.findIndex((p) => p.index === active.value)
  let next: number | undefined
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = at < 0 ? 0 : (at + 1) % list.length
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = at < 0 ? list.length - 1 : (at - 1 + list.length) % list.length
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = list.length - 1
  else if (event.key === 'Escape') active.value = null
  if (next === undefined) return
  event.preventDefault()
  active.value = list[next].index
}

const describe = (p: Point) =>
  `${p.label ?? 'Point'}: ${props.x.label ?? 'x'} ${fmt(props.x, p.x)}, ${props.y.label ?? 'y'} ${fmt(props.y, p.y)}`

const tipFlip = computed(() => (activePoint.value ? sx.value(activePoint.value.x) > width.value * 0.6 : false))

const ariaLabel = computed(() => props.label ?? props.title ?? props.kicker ?? 'Scatter chart')
const columns = computed(() => [
  { key: 'label', label: 'Point' },
  { key: 'x', label: props.x.label ?? 'x', decimals: props.x.decimals ?? 2, prefix: props.x.prefix, suffix: props.x.suffix },
  { key: 'y', label: props.y.label ?? 'y', decimals: props.y.decimals ?? 0, prefix: props.y.prefix, suffix: props.y.suffix },
])
const tableRows = computed(() => props.points.map((p) => ({ label: p.label ?? '', x: p.x, y: p.y, highlight: Boolean(p.highlight) })))
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
    <div ref="box" class="sc" :class="{ seen }">
      <div
        class="sc-plot"
        role="listbox"
        tabindex="0"
        :aria-label="`${ariaLabel}. Use the arrow keys to read each point`"
        :aria-activedescendant="active !== null ? `${listId}-${active}` : undefined"
        :style="{ height: `${height}px` }"
        @pointermove="nearest"
        @pointerdown="nearest"
        @pointerleave="active = null"
        @keydown="key"
        @blur="active = null"
      >
        <svg :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" aria-hidden="true">
          <g v-for="t in yTicks" :key="`y${t}`">
            <line class="grid-line" :x1="M.left" :x2="width - M.right" :y1="sy(t)" :y2="sy(t)" />
            <text :x="M.left - 8" :y="sy(t) + 4" text-anchor="end">{{ fmt(y, t) }}</text>
          </g>
          <g v-for="t in xTicks" :key="`x${t}`">
            <line class="grid-line" :x1="sx(t)" :x2="sx(t)" :y1="M.top" :y2="height - M.bottom" />
            <text :x="sx(t)" :y="height - M.bottom + 18" text-anchor="middle">{{ fmt(x, t) }}</text>
          </g>
          <line class="axis-line" :x1="M.left" :x2="width - M.right" :y1="height - M.bottom" :y2="height - M.bottom" />
          <text v-if="x.label" class="sc-axis" :x="width - M.right" :y="height - 6" text-anchor="end">{{ x.label }} →</text>
          <text v-if="y.label" class="sc-axis" :x="M.left + 6" :y="M.top + 12">↑ {{ y.label }}</text>

          <line
            v-if="diagonal"
            class="sc-diag"
            :x1="sx(Math.max(xs[0], ys[0]))"
            :y1="sy(Math.max(xs[0], ys[0]))"
            :x2="sx(Math.min(xs[1], ys[1]))"
            :y2="sy(Math.min(xs[1], ys[1]))"
          />

          <g
            v-for="(p, i) in shown"
            :key="p.index"
            class="sc-pt"
            :class="[`tone-${toneOfGroup(p.group)}`, { hl: p.highlight, on: p.index === active, dim: active !== null && p.index !== active }]"
            :style="{ '--i': i, transformOrigin: `${sx(p.x)}px ${sy(p.y)}px` }"
          >
            <rect
              v-if="!p.highlight"
              :x="sx(p.x) - 5"
              :y="sy(p.y) - 5"
              width="10"
              height="10"
            />
            <circle v-else :cx="sx(p.x)" :cy="sy(p.y)" r="8" />
            <text
              v-if="p.highlight || p.index === active"
              class="sc-label"
              :x="sx(p.x) + (sx(p.x) > width * 0.7 ? -12 : 12)"
              :y="sy(p.y) - 10"
              :text-anchor="sx(p.x) > width * 0.7 ? 'end' : 'start'"
            >{{ p.label }}</text>
          </g>
        </svg>

        <div
          v-if="activePoint"
          class="kit-tip sc-tip"
          :style="{
            top: `${Math.max(4, sy(activePoint.y) - 70)}px`,
            ...(tipFlip ? { right: `${width - sx(activePoint.x) + 14}px` } : { left: `${sx(activePoint.x) + 14}px` }),
          }"
          aria-hidden="true"
        >
          <strong>{{ activePoint.label ?? 'Point' }}</strong>
          <div class="kit-tip-row">{{ x.label ?? 'x' }}<b>{{ fmt(x, activePoint.x) }}</b></div>
          <div class="kit-tip-row">{{ y.label ?? 'y' }}<b>{{ fmt(y, activePoint.y) }}</b></div>
        </div>

        <ul class="sr-only">
          <li v-for="p in shown" :id="`${listId}-${p.index}`" :key="p.index" role="option" :aria-selected="p.index === active">
            {{ describe(p) }}
          </li>
        </ul>
      </div>
      <p class="sr-only" aria-live="polite">{{ activePoint ? describe(activePoint) : '' }}</p>
    </div>

    <template #legend>
      <ul class="kit-legend" aria-label="Groups">
        <li v-for="g in groupsT" :key="g.key" :class="`tone-${g.tone}`">
          <button v-if="groups.length > 1" type="button" class="kit-key" :aria-pressed="visible[g.key]" @click="toggle(g.key)">
            <i class="kit-swatch" />{{ g.label }}
          </button>
          <span v-else class="kit-key"><i class="kit-swatch" />{{ g.label }}</span>
        </li>
      </ul>
    </template>
  </ChartFrame>
</template>

<style scoped>
.sc-plot {
  position: relative;
  outline: none;
  cursor: crosshair;
  touch-action: pan-y;
}

.sc-plot:focus-visible {
  box-shadow: 0 0 0 2px var(--k-red);
}

.sc-plot svg {
  display: block;
  overflow: visible;
}

.kit svg .sc-axis {
  fill: var(--k-fg-2);
}

.sc-diag {
  stroke: var(--k-fg-3);
  stroke-dasharray: 4 4;
}

.sc-pt rect,
.sc-pt circle {
  fill: var(--s);
  stroke: var(--k-bg);
  stroke-width: 1.5;
  transition: opacity 0.2s;
}

.sc-pt {
  transform: scale(0);
  transition: transform 0.5s var(--k-ease) calc(var(--i) * 35ms);
}

.sc.seen .sc-pt {
  transform: scale(1);
}

.sc-pt.on rect,
.sc-pt.on circle {
  stroke: var(--k-fg);
  stroke-width: 2.5;
}

.sc-pt.dim rect,
.sc-pt.dim circle {
  opacity: 0.35;
}

.kit svg .sc-label {
  font-size: 11.5px;
  font-weight: 700;
  fill: var(--k-fg);
  paint-order: stroke;
  stroke: var(--k-bg);
  stroke-width: 3px;
}
</style>
