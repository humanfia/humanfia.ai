<script setup lang="ts">
// The record: one tile per exam or board, each with its score and a grid with one cell per
// problem in it, a red cell for every one that is done. The grids are the point -- 672 cells and
// 6 cells side by side say more about what "full marks" covers than the two fractions do.
//
// Two controls. The switch dims every tile whose result was not accepted by Lean, or every one
// that was, because who did the checking is not the same everywhere and the board says so up
// front. Pointing at a tile (or focusing it) puts its fine print and its write-ups in the
// readout under the grid.
import { computed, ref } from 'vue'
import { vReveal } from '../../../home/motion'

interface Result {
  id: string
  name: string
  score: string
  unit: string
  grader: string
  lean: boolean
  cells: number
  filled: number
  red?: number
  legend?: string
  note: string
  posts: { text: string; href: string }[]
}

const props = defineProps<{ results: Result[] }>()

const FILTERS = [
  { key: 'all', label: 'All eight' },
  { key: 'lean', label: 'By Lean' },
  { key: 'other', label: 'By others' },
] as const
type Filter = (typeof FILTERS)[number]['key']
const filter = ref<Filter>('all')
const shown = (r: Result) => filter.value === 'all' || (filter.value === 'lean') === r.lean

const picked = ref(props.results[0]?.id)
const current = computed(() => props.results.find((r) => r.id === picked.value) ?? props.results[0])

/** One row for a handful of cells; otherwise a block about 2.4 times as wide as it is tall. */
function layout(n: number) {
  const cols = n <= 8 ? n : Math.ceil(Math.sqrt(n * 2.4))
  return { cols, rows: Math.ceil(n / cols) }
}
const CELL = 10
const GAP = 2
const grids = computed(() =>
  props.results.map((r) => {
    const { cols, rows } = layout(r.cells)
    const red = r.red ?? r.filled
    const cells = Array.from({ length: r.cells }, (_, i) => ({
      x: (i % cols) * (CELL + GAP),
      y: Math.floor(i / cols) * (CELL + GAP),
      kind: i < red ? 'red' : i < r.filled ? 'ink' : 'open',
      // The fill sweeps through the grid in reading order, in about a second whatever its size.
      delay: Math.round((i / r.cells) * 900),
    }))
    return { w: cols * (CELL + GAP) - GAP, h: rows * (CELL + GAP) - GAP, cells }
  }),
)
</script>

<template>
  <div v-reveal class="hb">
    <div class="hb-top">
      <div class="hoa-switch" role="group" aria-label="Filter the record by who checked it">
        <button
          v-for="f in FILTERS"
          :key="f.key"
          type="button"
          :aria-pressed="filter === f.key"
          @click="filter = f.key"
        >{{ f.label }}</button>
      </div>
      <p class="hb-legend" aria-hidden="true">
        <span><i class="red" /> done</span>
        <span v-if="results.some((r) => r.red !== undefined)"><i class="ink" /> done, not first</span>
        <span><i class="open" /> open</span>
      </p>
    </div>

    <!-- The olympiads had a section of their own when the page was markdown; its id lands here. -->
    <ul id="olympiads-at-full-marks" class="hb-grid">
      <li v-for="(r, k) in results" :key="r.id" :class="{ dim: !shown(r), on: picked === r.id }">
        <button
          type="button"
          class="hb-tile"
          :aria-pressed="picked === r.id"
          :aria-label="`${r.name}: ${r.score} ${r.unit}. Checked by ${r.grader}.`"
          @click="picked = r.id"
          @mouseenter="picked = r.id"
          @focus="picked = r.id"
        >
          <span class="hb-head">
            <span class="hb-name">{{ r.name }}</span>
            <span class="hoa-tag" :class="{ lean: r.lean }">{{ r.grader }}</span>
          </span>
          <strong class="hb-score">{{ r.score }}</strong>
          <span class="hb-unit">{{ r.unit }}</span>
          <svg
            class="hb-cells"
            :viewBox="`0 0 ${grids[k].w} ${grids[k].h}`"
            preserveAspectRatio="xMinYMax meet"
            aria-hidden="true"
          >
            <rect
              v-for="(c, i) in grids[k].cells"
              :key="i"
              :class="c.kind"
              :x="c.x"
              :y="c.y"
              :width="CELL"
              :height="CELL"
              :style="{ transitionDelay: `${c.delay}ms` }"
            />
          </svg>
          <span v-if="r.legend" class="hb-cap">{{ r.legend }}</span>
        </button>
      </li>
    </ul>

    <div class="hb-read" aria-live="polite">
      <p class="hb-read-k">{{ current.name }} · checked by {{ current.grader }}</p>
      <p class="hb-read-t">{{ current.note }}</p>
      <p class="hb-read-l">
        <span>Written up</span>
        <a v-for="p in current.posts" :key="p.href" :href="p.href">{{ p.text }}</a>
      </p>
    </div>
    <p class="hoa-caption">
      None of the olympiad scores came from an official jury. Each tile means what its write-up says
      it means, and each write-up says who did the grading.
    </p>
  </div>
</template>

<style scoped>
.hb-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px 24px;
  margin-bottom: 18px;
}

.hb-legend {
  display: flex;
  gap: 16px;
  margin: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  color: var(--k-ink-3);
}
.hb-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.hb-legend i {
  width: 10px;
  height: 10px;
}
.hb-legend .red {
  background: var(--k-red);
}
.hb-legend .ink {
  background: var(--k-ink);
}
.hb-legend .open {
  border: 1px solid var(--k-ink-3);
}

.hb-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 3px solid var(--k-ink);
  border-left: 1px solid var(--k-line);
  scroll-margin-top: calc(var(--vp-nav-height) + 80px);
}

.hb-grid li {
  margin: 0;
  border-right: 1px solid var(--k-line);
  border-bottom: 1px solid var(--k-line);
  background: var(--k-card);
  transition: opacity 0.35s, background-color 0.25s;
}
.hb-grid li.on {
  background: var(--k-bg-alt);
}
.hb-grid li.dim {
  opacity: 0.28;
}

.hb-tile {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 16px 18px 18px;
  text-align: left;
  color: inherit;
  position: relative;
}
.hb-tile::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -3px;
  height: 3px;
  background: var(--k-red);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s var(--k-ease);
}
li.on .hb-tile::after {
  transform: none;
}

.hb-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.hb-name {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--k-ink);
}
.hoa-tag {
  color: var(--k-ink-3);
}
.hoa-tag.lean {
  color: var(--k-accent);
}

.hb-score {
  margin-top: 14px;
  font-size: clamp(30px, 3vw, 42px);
  font-weight: 850;
  line-height: 1;
  letter-spacing: -0.045em;
  color: var(--k-ink);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.hb-unit {
  margin-top: 6px;
  min-height: 2.9em;
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--k-ink-2);
}

.hb-cells {
  display: block;
  width: 100%;
  height: 72px;
  margin-top: 14px;
}
.hb-cells rect {
  transition: opacity 0.3s;
}
.hb-cells .red {
  fill: var(--k-red);
}
.hb-cells .ink {
  fill: var(--k-ink);
}
.hb-cells .open {
  fill: none;
  stroke: var(--k-ink-3);
  stroke-width: 0.8;
  opacity: 0.6;
}
.hb-cap {
  margin-top: 8px;
  font-family: var(--vp-font-family-mono);
  font-size: 10.5px;
  color: var(--k-ink-3);
}

/* Filled as the board comes on screen; the server's board, and a still one, are already full. */
.hf-motion .hb.rv:not(.rv-in) .hb-cells rect:not(.open) {
  opacity: 0;
}

.hb-read {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2.2fr) auto;
  gap: 8px 28px;
  align-items: baseline;
  padding: 16px 18px;
  border: 1px solid var(--k-line);
  border-top: 0;
  background: var(--k-ink);
  color: var(--k-bg);
}
.hb-read p {
  margin: 0;
}
.hb-read-k {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  font-weight: 650;
}
.hb-read-t {
  font-size: 14.5px;
  line-height: 1.55;
}
.hb-read-l {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  white-space: nowrap;
}
.hb-read-l span {
  opacity: 0.6;
}
.hb-read-l a {
  color: inherit !important;
  font-weight: 650;
}
.hb-read-l a::after {
  content: ' →';
}
.hb-read-l a:hover {
  color: var(--hf-red-on-ink) !important;
}
.dark .hb-read-l a:hover {
  color: var(--hf-red-on-paper) !important;
}

@media (max-width: 1100px) {
  .hb-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .hb-read {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 520px) {
  .hb-tile {
    padding: 12px 12px 14px;
  }
  .hb-head {
    flex-direction: column;
    gap: 6px;
  }
  .hb-name {
    font-size: 13px;
  }
  .hb-score {
    font-size: 26px;
  }
  .hb-unit {
    min-height: 4.4em;
    font-size: 11.5px;
  }
  .hb-cells {
    height: 52px;
  }
  .hb-legend {
    gap: 10px;
  }
}
</style>
