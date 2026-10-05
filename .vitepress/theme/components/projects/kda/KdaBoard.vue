<script setup lang="ts">
// "What it has done", as a wall of records rather than a table: one tile per result, each with
// its number, a sentence, the picture that number is best read as, and a link to the write-up.
// The pictures draw themselves the first time the wall is on screen.
//
// The records are the page's `records:` frontmatter, in the order they are laid out. `size: wide`
// is half the row on a wide screen; the rest are a third.
import { computed, ref } from 'vue'
import { vReveal } from '../../../home/motion'
import { useInView } from '../../kit/shared'

interface Bar {
  label: string
  value: number
  detail?: string
  us?: boolean
}

interface Record {
  kicker: string
  value: string
  unit?: string
  text: string
  href: string
  size?: 'wide'
  viz?: 'climb' | 'cells' | 'bars' | 'blocks' | 'board' | 'meter' | 'prs'
  /** climb: [x, y] points, and what to write under each end. */
  points?: [number, number][]
  ends?: [string, string]
  /** cells: groups of `of` cells, `won` of them lit. */
  groups?: { label: string; of: number; won: number }[]
  /** bars, meter, board: the rows. */
  bars?: Bar[]
  max?: number
  /** meter: the bar the value is held to. */
  floor?: { value: number; label: string }
  /** blocks: how many, and how many in red. */
  blocks?: { count: number; label: string; red?: boolean }[]
  /** prs: the pull requests, each a link. */
  prs?: { label: string; href: string; text: string }[]
}

const props = defineProps<{ records: Record[] }>()

const wall = ref<HTMLElement | null>(null)
const seen = useInView(wall, 0.12)

/** A record's sparkline, as an SVG path in a 100 × 40 box. */
function climb(points: [number, number][]) {
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)]
  const [y0, y1] = [Math.min(...ys) - 0.15, Math.max(...ys) + 0.05]
  const sx = (x: number) => ((x - x0) / (x1 - x0)) * 100
  const sy = (y: number) => 40 - ((y - y0) / (y1 - y0)) * 40
  return points
    .map(([x, y], i) => (i ? `H${sx(x).toFixed(2)}V${sy(y).toFixed(2)}` : `M${sx(x).toFixed(2)} ${sy(y).toFixed(2)}`))
    .join('')
}

/** Cells for a group, in the 5-row column-major order the grid lays them out in. */
const ROWS = 5
const cells = computed(() =>
  props.records.map((r) =>
    (r.groups ?? []).map((g) => ({
      ...g,
      cols: Math.ceil(g.of / ROWS),
      list: Array.from({ length: g.of }, (_, i) => i < g.won),
    })),
  ),
)
const pct = (v: number, max: number) => `${Math.min(100, (v / max) * 100)}%`
</script>

<template>
  <div ref="wall" class="wall" :class="{ seen }">
    <a
      v-for="(r, ri) in records"
      :key="r.kicker"
      v-reveal="(ri % 3) * 70"
      class="rec"
      :class="[r.size === 'wide' ? 'wide' : 'third', `viz-${r.viz ?? 'none'}`]"
      :href="r.href"
    >
      <p class="kd-kicker rec-kicker">{{ r.kicker }}</p>
      <p class="rec-value">
        {{ r.value }}<span v-if="r.unit" class="rec-unit">{{ r.unit }}</span>
      </p>
      <p class="rec-text">{{ r.text }}</p>

      <!-- climb: a step line, drawn on -->
      <div v-if="r.viz === 'climb' && r.points" class="rec-climb" aria-hidden="true">
        <svg viewBox="0 0 100 40" preserveAspectRatio="none">
          <path :d="climb(r.points)" />
        </svg>
        <p v-if="r.ends" class="climb-ends kd-mono"><span>{{ r.ends[0] }}</span><span>{{ r.ends[1] }}</span></p>
      </div>

      <!-- cells: every leaderboard on the board, the first places lit -->
      <div v-else-if="r.viz === 'cells'" class="rec-cells" aria-hidden="true">
        <div v-for="g in cells[ri]" :key="g.label" class="cell-group" :style="{ '--cols': g.cols, flexGrow: g.cols }">
          <div class="cell-grid">
            <i v-for="(lit, ci) in g.list" :key="ci" :class="{ lit }" :style="{ '--d': `${ci * 9}ms` }" />
          </div>
          <span class="kd-mono">{{ g.label }} <b>{{ g.won }}</b>/{{ g.of }}</span>
        </div>
      </div>

      <!-- bars: each against a reference line at 1 -->
      <div v-else-if="r.viz === 'bars' && r.bars" class="rec-bars" aria-hidden="true">
        <div v-for="(b, bi) in r.bars" :key="b.label" class="bar-row">
          <span class="kd-mono bar-label">{{ b.label }}</span>
          <span class="bar-track">
            <i class="bar-fill" :class="{ us: b.us !== false }" :style="{ width: pct(b.value, r.max ?? 2), '--d': `${bi * 120}ms` }" />
            <i class="bar-ref" :style="{ left: pct(1, r.max ?? 2) }" />
          </span>
          <span class="kd-mono bar-value">{{ b.value.toFixed(2) }}×</span>
        </div>
      </div>

      <!-- blocks: a count you can see -->
      <div v-else-if="r.viz === 'blocks' && r.blocks" class="rec-blocks" aria-hidden="true">
        <div v-for="b in r.blocks" :key="b.label" class="block-group">
          <div class="block-row">
            <i v-for="k in b.count" :key="k" :class="{ red: b.red }" :style="{ '--d': `${k * 18}ms` }" />
          </div>
          <span class="kd-mono">{{ b.label }}</span>
        </div>
      </div>

      <!-- meter: a value against the bar it had to clear -->
      <div v-else-if="r.viz === 'meter' && r.bars" class="rec-bars" aria-hidden="true">
        <div v-for="(b, bi) in r.bars" :key="b.label" class="bar-row">
          <span class="kd-mono bar-label">{{ b.label }}</span>
          <span class="bar-track">
            <i class="bar-fill us" :style="{ width: pct(b.value, r.max ?? 10), '--d': `${bi * 120}ms` }" />
            <i v-if="r.floor" class="bar-ref" :style="{ left: pct(r.floor.value, r.max ?? 10) }" />
          </span>
          <span class="kd-mono bar-value">{{ b.detail ?? b.value }}</span>
        </div>
        <p v-if="r.floor" class="kd-mono rec-floor">┊ {{ r.floor.label }}</p>
      </div>

      <!-- board: the top of a leaderboard -->
      <ol v-else-if="r.viz === 'board' && r.bars" class="rec-board" aria-hidden="true">
        <li v-for="(b, bi) in r.bars" :key="b.label" :class="{ us: b.us }">
          <span class="kd-mono">{{ bi + 1 }}</span>
          <span>{{ b.label }}</span>
          <span class="kd-mono">{{ b.detail }}</span>
        </li>
      </ol>

      <!-- prs: the pull requests themselves -->
      <ul v-else-if="r.viz === 'prs' && r.prs" class="rec-prs" aria-hidden="true">
        <li v-for="pr in r.prs" :key="pr.label">
          <span class="kd-mono">{{ pr.label }}</span>
          <span>{{ pr.text }}</span>
        </li>
      </ul>

      <span class="rec-more kd-mono">The write-up <span aria-hidden="true">→</span></span>
    </a>
  </div>
</template>

<style scoped>
.wall {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 1px;
  background: var(--kd-line);
  border: 1px solid var(--kd-line);
}

.rec {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 300px;
  padding: clamp(22px, 2.4vw, 32px);
  color: var(--kd-fg);
  text-decoration: none;
  background: var(--kd-bg);
  transition: background 0.3s var(--kd-ease);
}

.rec.wide {
  grid-column: span 3;
  min-height: 380px;
}

.rec.third {
  grid-column: span 2;
}

/* The red rule that draws across the top of the record under the pointer. */
.rec::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  height: 4px;
  background: var(--kd-red);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.5s var(--kd-ease);
}

.rec:hover::before,
.rec:focus-visible::before {
  transform: scaleX(1);
}

.rec:hover {
  background: var(--kd-card);
}

.rec-kicker {
  color: var(--kd-fg-3);
}

.rec-value {
  margin: 4px 0 0;
  font-size: clamp(48px, 5vw, 72px);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.05em;
  font-variant-numeric: tabular-nums;
}

.wide .rec-value {
  font-size: clamp(64px, 7.5vw, 112px);
  color: var(--kd-red-text);
}

.rec-unit {
  margin-left: 0.12em;
  font-size: 0.4em;
  letter-spacing: -0.02em;
  color: var(--kd-fg-3);
}

.rec-text {
  max-width: 44ch;
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  color: var(--kd-fg-2);
}

.rec-more {
  margin-top: auto;
  padding-top: 18px;
  font-size: 12px;
  font-weight: 600;
  color: var(--kd-red-text);
}

.rec-more span {
  display: inline-block;
  transition: transform 0.3s var(--kd-ease);
}

.rec:hover .rec-more span {
  transform: translateX(4px);
}

/* -------------------------------------------------------------------------- the pictures */

.rec-climb {
  margin-top: 14px;
}

.rec-climb svg {
  display: block;
  width: 100%;
  height: 96px;
  overflow: visible;
}

.rec-climb path {
  fill: none;
  stroke: var(--kd-red);
  stroke-width: 3;
  vector-effect: non-scaling-stroke;
}

.kd-motion .rec-climb svg {
  transition: clip-path 2s var(--kd-ease) 0.3s;
}

.kd-motion .wall:not(.seen) .rec-climb svg {
  clip-path: inset(-10px 100% -10px 0);
}

.climb-ends {
  display: flex;
  justify-content: space-between;
  margin: 10px 0 0;
  font-size: 11px;
  color: var(--kd-fg-3);
}

.rec-cells {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.cell-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.cell-grid {
  display: grid;
  grid-template-rows: repeat(5, auto);
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 2px;
}

.cell-grid i {
  aspect-ratio: 1;
  background: var(--kd-grid);
  outline: 1px solid var(--kd-line);
  outline-offset: -1px;
}

.cell-grid i.lit {
  background: var(--kd-red);
  outline: none;
}

.kd-motion .wall:not(.seen) .cell-grid i.lit {
  background: var(--kd-grid);
}

.kd-motion .cell-grid i.lit {
  transition: background 0.25s var(--kd-ease) var(--d);
}

.cell-group span {
  font-size: 11px;
  color: var(--kd-fg-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-group b {
  color: var(--kd-fg);
}

.rec-bars {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.bar-row {
  display: grid;
  grid-template-columns: 7.5em minmax(0, 1fr) 4.2em;
  gap: 10px;
  align-items: center;
}

.bar-label,
.bar-value {
  font-size: 11.5px;
  color: var(--kd-fg-2);
  white-space: nowrap;
}

.bar-value {
  text-align: right;
  color: var(--kd-fg);
  font-weight: 600;
}

.bar-track {
  position: relative;
  height: 12px;
  background: var(--kd-grid);
}

.bar-fill {
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--kd-fg-3);
  transform-origin: left;
}

.bar-fill.us {
  background: var(--kd-red);
}

.kd-motion .bar-fill {
  transition: transform 1.1s var(--kd-ease) calc(0.25s + var(--d));
}

.kd-motion .wall:not(.seen) .bar-fill {
  transform: scaleX(0);
}

.bar-ref {
  position: absolute;
  top: -4px;
  bottom: -4px;
  width: 0;
  border-left: 1.5px dashed var(--kd-fg);
}

.rec-floor {
  margin: 2px 0 0;
  font-size: 11px;
  color: var(--kd-fg-3);
}

.rec-blocks {
  display: grid;
  gap: 10px;
  margin-top: 10px;
}

.block-group span {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  color: var(--kd-fg-3);
}

.block-row {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.block-row i {
  width: 10px;
  height: 10px;
  background: var(--kd-fg-3);
}

.block-row i.red {
  background: var(--kd-red);
}

.kd-motion .block-row i {
  transition:
    opacity 0.3s var(--kd-ease) var(--d),
    transform 0.4s var(--kd-ease) var(--d);
}

.kd-motion .wall:not(.seen) .block-row i {
  opacity: 0;
  transform: translateY(6px);
}

.rec-board,
.rec-prs {
  display: grid;
  gap: 0;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}

.rec-board li,
.rec-prs li {
  display: grid;
  grid-template-columns: 1.6em minmax(0, 1fr) auto;
  gap: 10px;
  padding: 7px 0;
  font-size: 13px;
  border-top: 1px solid var(--kd-line);
  color: var(--kd-fg-2);
}

.rec-prs li {
  grid-template-columns: 3.4em minmax(0, 1fr);
  line-height: 1.45;
}

.rec-board li.us {
  color: var(--kd-fg);
  font-weight: 650;
}

.rec-board li.us span:first-child {
  color: var(--kd-red-text);
}

.rec-prs li span:first-child {
  color: var(--kd-red-text);
  font-weight: 600;
}

@media (max-width: 1060px) {
  .wall {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .rec.wide {
    grid-column: span 2;
    min-height: 0;
  }
  .rec.third {
    grid-column: span 1;
  }
}

@media (max-width: 640px) {
  .wall {
    grid-template-columns: minmax(0, 1fr);
  }
  .rec.wide,
  .rec.third {
    grid-column: span 1;
    min-height: 0;
  }
  .rec-cells {
    gap: 6px;
  }
  .cell-grid {
    gap: 1px;
  }
}
</style>
