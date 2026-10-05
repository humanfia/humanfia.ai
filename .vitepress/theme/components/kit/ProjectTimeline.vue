<script setup lang="ts">
// A results timeline: every post a project reported a result in, on one axis of dates, with the
// write-ups listed under it.
//
// The axis is a ruled line across the months, one square per post, stacked where two land on
// the same days. Under it, the posts as cards in the same order, each with its headline number,
// its title and its standfirst, linking to the post. Pointing at a square lights its card and
// the other way round, and a readout over the axis names what is under the pointer. The line
// draws itself on the first time the figure is seen and the squares land along it in order.
//
// The posts are named by url; their titles, dates and standfirsts are read from the posts
// themselves (posts.data.mts), so a retitled post is retitled here too. An entry can override
// any of them, and an entry with `pending` and no url is something still to come -- drawn
// hollow, at the end of the axis, and not a link.
//
//   <ProjectTimeline
//     kicker="HOA · results"
//     label="…"
//     :entries="[
//       { url: '/news/2026-06-26-putnambench', metric: '670 / 672' },
//       { url: '/news/2026-10-05-putnambench-672', metric: '672 / 672' },
//       { title: 'FlowBench opens', pending: true, metric: 'Next' },
//     ]"
//   />
import { computed, ref } from 'vue'
import { data as posts } from '../../posts.data.mts'
import ChartFrame from './ChartFrame.vue'
import { useInView, useWidth } from './shared'

interface Entry {
  url?: string
  title?: string
  /** YYYY-MM-DD, when there is no post to read it from (or to override it). */
  date?: string
  /** The headline number, set big on the card and in the readout. */
  metric?: string
  /** Replaces the post's standfirst on the card. */
  note?: string
  /** Not yet: drawn hollow at the end of the axis, and not a link. */
  pending?: boolean
}

const props = withDefaults(
  defineProps<{
    entries: Entry[]
    label: string
    kicker?: string
    title?: string
    caption?: string
    invert?: boolean
  }>(),
  { invert: false },
)

const DAY = 86_400_000
const FORMAT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
const MONTH = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' })

const resolved = computed(() => {
  const known = props.entries.map((entry) => {
    const post = entry.url ? posts.find((p) => p.url === entry.url.replace(/\/$/, '')) : undefined
    const iso = entry.date ? `${entry.date}T00:00:00.000Z` : post?.iso
    return {
      href: entry.pending ? undefined : entry.url,
      title: entry.title ?? post?.title ?? entry.url ?? '',
      text: entry.note ?? post?.description ?? '',
      kind: post ? (post.kind === 'news' ? 'News' : 'Blog') : entry.pending ? 'Next' : '',
      metric: entry.metric,
      pending: Boolean(entry.pending),
      time: iso ? +new Date(iso) : Number.NaN,
    }
  })
  const last = Math.max(...known.filter((e) => Number.isFinite(e.time)).map((e) => e.time))
  // Something still to come with no date sits a few weeks past the last thing that happened.
  return known
    .map((e) => (Number.isFinite(e.time) ? e : { ...e, time: last + 24 * DAY }))
    .sort((a, b) => a.time - b.time || Number(a.pending) - Number(b.pending))
    .map((e, i) => ({ ...e, i, date: e.pending && !Number.isFinite(e.time) ? 'Next' : FORMAT.format(new Date(e.time)) }))
})

const root = ref<HTMLElement | null>(null)
const plot = ref<HTMLElement | null>(null)
const seen = useInView(root, 0.2)
const width = useWidth(plot, 720)

const PAD = 18
const domain = computed(() => {
  const times = resolved.value.map((e) => e.time)
  const lo = new Date(Math.min(...times) - 12 * DAY)
  const hi = Math.max(...times) + 12 * DAY
  // From the first of the month the first entry is in.
  const start = Date.UTC(lo.getUTCFullYear(), lo.getUTCMonth(), 1)
  return [start, hi] as const
})
const x = (t: number) => {
  const [a, b] = domain.value
  return PAD + ((t - a) / Math.max(1, b - a)) * (width.value - 2 * PAD)
}

/** Month ticks (the cards carry the year), thinned on a narrow axis so their labels never touch. */
const months = computed(() => {
  const [a, b] = domain.value
  const ticks: { x: number; label: string }[] = []
  const d = new Date(a)
  while (+d <= b) {
    ticks.push({ x: x(+d), label: MONTH.format(d) })
    d.setUTCMonth(d.getUTCMonth() + 1)
  }
  const gap = ticks.length > 1 ? ticks[1].x - ticks[0].x : width.value
  const every = gap < 38 ? 3 : gap < 52 ? 2 : 1
  return ticks.filter((_, i) => i % every === 0)
})

/** Each entry's square, lifted into a lane of its own where it would overlap the one before. */
const SIZE = 12
const marks = computed(() => {
  const lanes: number[] = []
  return resolved.value.map((e) => {
    const cx = x(e.time)
    let lane = lanes.findIndex((end) => end < cx - SIZE - 3)
    if (lane < 0) lane = lanes.length
    lanes[lane] = cx
    return { ...e, cx, lane }
  })
})
const laneCount = computed(() => Math.max(1, ...marks.value.map((m) => m.lane + 1)))
const AXIS = computed(() => 34 + laneCount.value * (SIZE + 6))
const height = computed(() => AXIS.value + 30)
const markY = (lane: number) => AXIS.value - 12 - lane * (SIZE + 6)

const active = ref<number | null>(null)
const shown = computed(() => (active.value === null ? resolved.value[resolved.value.length - 1] : resolved.value[active.value]))
</script>

<template>
  <div ref="root" class="ptl-root post-wide">
    <ChartFrame :kicker="kicker" :title="title" :caption="caption" :label="label" :invert="invert">
      <div class="ptl" :class="{ seen }" @mouseleave="active = null">
        <p class="ptl-readout" aria-hidden="true">
          <span class="ptl-readout-date">{{ shown?.date }}</span>
          <strong v-if="shown?.metric">{{ shown.metric }}</strong>
          <span class="ptl-readout-title">{{ shown?.title }}</span>
        </p>

        <div ref="plot" class="ptl-plot">
          <svg :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" aria-hidden="true">
            <g v-for="m in months" :key="m.x" class="ptl-month">
              <line :x1="m.x" :x2="m.x" :y1="AXIS - 4" :y2="AXIS + 6" />
              <text :x="m.x + 4" :y="AXIS + 22">{{ m.label }}</text>
            </g>
            <line class="ptl-axis" :x1="PAD" :x2="width - PAD" :y1="AXIS" :y2="AXIS" />
            <line
              v-if="active !== null"
              class="ptl-drop"
              :x1="marks[active].cx"
              :x2="marks[active].cx"
              :y1="markY(marks[active].lane)"
              :y2="AXIS"
            />
            <g
              v-for="m in marks"
              :key="m.i"
              class="ptl-mark"
              :class="{ on: active === m.i, last: active === null && m.i === marks.length - 1, pending: m.pending }"
              :style="{ '--i': m.i, '--x': `${m.cx}px`, '--y': `${markY(m.lane)}px` }"
              @mouseenter="active = m.i"
            >
              <!-- A wider target than the square, so a finger can find it. -->
              <rect class="ptl-hit" :x="m.cx - 11" :y="markY(m.lane) - 11" width="22" height="22" />
              <rect class="ptl-square" :x="m.cx - SIZE / 2" :y="markY(m.lane) - SIZE / 2" :width="SIZE" :height="SIZE" />
            </g>
          </svg>
        </div>

        <ol class="ptl-list">
          <li
            v-for="e in resolved"
            :key="e.i"
            :class="{ on: active === e.i, pending: e.pending }"
            :style="{ '--i': e.i }"
            @mouseenter="active = e.i"
            @focusin="active = e.i"
            @focusout="active = null"
          >
            <component :is="e.href ? 'a' : 'div'" class="ptl-card" :href="e.href">
              <span class="ptl-meta">
                <time>{{ e.date }}</time>
                <span v-if="e.kind" class="ptl-kind">{{ e.kind }}</span>
              </span>
              <strong v-if="e.metric" class="ptl-metric">{{ e.metric }}</strong>
              <span class="ptl-title">{{ e.title }}</span>
              <span v-if="e.text" class="ptl-text">{{ e.text }}</span>
            </component>
          </li>
        </ol>
      </div>
    </ChartFrame>
  </div>
</template>

<style scoped>
.ptl-readout {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
  min-height: 3.2em;
  margin: 0 0 4px;
  font-family: var(--k-mono);
  font-size: 12px;
  line-height: 1.5;
  color: var(--k-fg-2);
}

.ptl-readout-date {
  color: var(--k-fg-3);
}

.ptl-readout strong {
  font-size: 15px;
  color: var(--k-red-text);
}

.ptl-readout-title {
  flex: 1 1 260px;
  color: var(--k-fg);
}

.ptl-plot {
  overflow: hidden;
}

.ptl-plot svg {
  display: block;
  overflow: visible;
}

.ptl-axis {
  stroke: var(--k-fg);
  stroke-width: 3;
  transform-origin: 0 0;
  transform: scaleX(0);
  transition: transform 1.2s var(--k-ease);
}

.seen .ptl-axis {
  transform: scaleX(1);
}

.ptl-month line {
  stroke: var(--k-line);
  stroke-width: 1;
}

.ptl-month text {
  font-family: var(--k-mono);
  font-size: 11px;
  fill: var(--k-fg-3);
}

.ptl-drop {
  stroke: var(--k-red);
  stroke-width: 1.5;
  stroke-dasharray: 3 3;
}

.ptl-hit {
  fill: transparent;
  cursor: pointer;
}

.ptl-square {
  fill: var(--k-fg);
  stroke: var(--k-bg);
  stroke-width: 2;
  transform-box: fill-box;
  transform-origin: 50% 50%;
  transform: translateY(-40px) rotate(-45deg) scale(0.4);
  opacity: 0;
  transition:
    transform 0.6s calc(0.5s + var(--i) * 90ms) cubic-bezier(0.3, 1.5, 0.5, 1),
    opacity 0.3s calc(0.5s + var(--i) * 90ms),
    fill 0.2s;
  pointer-events: none;
}

.seen .ptl-square {
  transform: none;
  opacity: 1;
}

.ptl-mark.pending .ptl-square {
  fill: var(--k-bg);
  stroke: var(--k-fg-3);
  stroke-dasharray: 3 2;
}

.ptl-mark.on .ptl-square,
.ptl-mark.last .ptl-square {
  fill: var(--k-red);
  transform: scale(1.35);
  transition-delay: 0s;
}

.ptl-mark.pending.last .ptl-square {
  fill: var(--k-bg);
  stroke: var(--k-red);
}

/* ---- The write-ups --------------------------------------------------------------------- */

.ptl-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--k-line);
  border-left: 1px solid var(--k-line);
}

.ptl-list li {
  margin: 0;
  border-right: 1px solid var(--k-line);
  border-bottom: 1px solid var(--k-line);
  opacity: 0;
  transform: translateY(14px);
  transition:
    opacity 0.5s calc(0.7s + var(--i) * 60ms),
    transform 0.5s calc(0.7s + var(--i) * 60ms) var(--k-ease),
    background-color 0.2s;
}

.seen .ptl-list li {
  opacity: 1;
  transform: none;
}

.ptl-list li.on {
  background: var(--k-bg-2);
  transition-delay: 0s;
}

.ptl-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;
  height: 100%;
  padding: 14px 16px 16px;
  color: inherit;
  text-decoration: none !important;
}

/* The card that is lit gets the red square the axis gives it. */
.ptl-card::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  width: 0;
  height: 4px;
  background: var(--k-red);
  transition: width 0.3s var(--k-ease);
}

.on .ptl-card::before {
  width: calc(100% + 2px);
}

.ptl-meta {
  display: flex;
  gap: 10px;
  font-family: var(--k-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--k-fg-3);
}

.ptl-kind {
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--k-red-text);
}

.ptl-metric {
  font-size: 24px;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.035em;
  color: var(--k-fg);
}

.on .ptl-metric {
  color: var(--k-red-text);
}

.ptl-title {
  font-size: 14.5px;
  line-height: 1.4;
  font-weight: 650;
  color: var(--k-fg);
}

a.ptl-card:hover .ptl-title {
  text-decoration: underline;
  text-decoration-color: var(--k-red);
  text-underline-offset: 3px;
}

.ptl-text {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.5;
  color: var(--k-fg-2);
}

.pending .ptl-card {
  border: 1px dashed var(--k-fg-3);
  margin: 6px;
  height: calc(100% - 12px);
}

@media (prefers-reduced-motion: reduce) {
  .ptl-axis,
  .ptl-square,
  .ptl-list li {
    transition: none !important;
  }
}
</style>
