<script setup lang="ts">
// What the work actually produced, drawn rather than described. A rail of the three efforts on
// the left, the result on the right; the rail advances on its own until a reader takes it over
// by hovering or clicking, and everything that moves is gated on `motion`, which the browser
// turns on after mount unless the reader has asked for reduced motion.
//
// Nothing here explains how any of it works. That is what the pages behind the links are for,
// and in Humanize 2's case a site of its own.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface Panel {
  key: string
  kicker: string
  title: string
  blurb: string
  label: string
  note: { text: string; href: string }
}

const PANELS: Panel[] = [
  {
    key: 'hoa',
    kicker: 'HOA · Humanize Olympic Agents',
    title: 'Six of six, and 670 of 672.',
    blurb:
      'Every IMO 2026 problem solved and machine-checked in Lean 4, and first place on PutnamBench. Three times faster than the previously reported agentic result on the same statements, at less than half the cost.',
    label: 'IMO 2026 solved six of six, and 670 of PutnamBench’s 672 statements accepted',
    note: { text: 'HOA', href: '/applications/hoa' },
  },
  {
    key: 'kda',
    kicker: 'KDA · Kernel Design Agents',
    title: 'First, second and third.',
    blurb:
      'Track placements at the MLSys 2026 FlashInfer kernel contest, with MIT HAN Lab. The contest is the referee, on its own hardware and its own reference, and its evaluation code is public.',
    label: 'First, second and third on tracks of the MLSys 2026 FlashInfer kernel contest',
    note: { text: 'KDA', href: '/applications/kda' },
  },
  {
    key: 'kaggle',
    kicker: 'AgentKaggle',
    title: 'Thirteen competitions, audited in public.',
    blurb:
      'Agents entered real Kaggle competitions. Sixteen official finishes and thirty-three late-submission estimates, published with their provenance and never mixed together.',
    label: 'Best result per competition across thirteen audited Kaggle competitions',
    note: { text: 'AgentKaggle', href: '/applications/agentkaggle' },
  },
]

const at = ref(0)
const motion = ref(false)
const held = ref(false)
const panel = computed(() => PANELS[at.value])
const root = ref<HTMLElement | null>(null)

let timer: ReturnType<typeof setInterval> | undefined
let watcher: IntersectionObserver | undefined
const onScreen = ref(true)

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  motion.value = true

  // Nothing advances while the section is scrolled away, which keeps a page left open in a
  // background tab from repainting five diagrams a minute for nobody.
  if (root.value && 'IntersectionObserver' in window) {
    watcher = new IntersectionObserver(
      (entries) => (onScreen.value = entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.15 },
    )
    watcher.observe(root.value)
  }

  timer = setInterval(() => {
    if (!held.value && onScreen.value) at.value = (at.value + 1) % PANELS.length
  }, 7000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
  watcher?.disconnect()
})

const pick = (i: number) => {
  at.value = i
}

/** Left and right walk the rail, which is what a reader expects of a set of tabs. */
function onKey(event: KeyboardEvent, i: number) {
  const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
  if (!step) return
  event.preventDefault()
  const next = (i + step + PANELS.length) % PANELS.length
  pick(next)
  const buttons = root.value?.querySelectorAll<HTMLButtonElement>('.pick')
  buttons?.[next]?.focus()
}

/* ---- HOA: the six problems, and PutnamBench's 672 statements. ------------------------- */

const IMO = [1, 2, 3, 4, 5, 6].map((n, i) => ({
  n,
  x: 16 + (i % 3) * 88,
  y: 150 + Math.floor(i / 3) * 54,
}))

const COLS = 32
const TOTAL = 672
const MISSED = new Set([311, 508])

const cells = Array.from({ length: TOTAL }, (_, i) => ({
  i,
  x: 306 + (i % COLS) * 10,
  y: 56 + Math.floor(i / COLS) * 10,
  missed: MISSED.has(i),
  delay: (i % COLS) * 0.008 + Math.floor(i / COLS) * 0.022,
}))

/* ---- KDA: the placements. -------------------------------------------------------------
   A podium, and nothing quantitative. The contest publishes placements, not per-kernel
   speedups, so there is no honest bar chart to draw here -- and a made-up one on a page whose
   whole argument is that the numbers are checkable would be the worst thing on the site.
   Block heights are the ordinal ranking everybody already reads a podium as. */

const FLOOR = 250

const PODIUM = [
  { place: 2, x: 352, height: 96 },
  { place: 1, x: 442, height: 132 },
  { place: 3, x: 532, height: 74 },
].map((block, i) => ({ ...block, y: FLOOR - block.height, delay: i * 0.12 }))

/* ---- AgentKaggle: the best result in each audited competition. ------------------------
   Straight out of agentkaggle/kaggle-results-audit. `official` is an exact final Kaggle rank;
   the rest are late-submission estimates against a frozen board, which are a weaker claim and
   are drawn as such -- hollow, and said so in the key. Percentile is rank / board size. */

interface Comp {
  name: string
  pct: number
  official: boolean
}

const COMPS: Comp[] = [
  { name: 'Google Code Golf', pct: 0.09, official: false },
  { name: 'WiDS Datathon', pct: 0.15, official: false },
  { name: 'CMI Sensor', pct: 0.19, official: false },
  { name: 'Superconductors', pct: 0.2, official: false },
  { name: 'Electricity', pct: 0.67, official: false },
  { name: 'Photo Slideshow', pct: 1.12, official: false },
  { name: 'Salary Prediction', pct: 1.2, official: false },
  { name: 'Drone Delivery', pct: 1.54, official: false },
  { name: 'Student Health Risk', pct: 2.0, official: true },
  { name: 'Scintillation', pct: 2.04, official: false },
  { name: 'ROGII', pct: 2.24, official: true },
  { name: 'NeuroGolf 2026', pct: 16.27, official: true },
  { name: 'Home Credit', pct: 51.14, official: false },
]

const TOP = 74
const BOTTOM = 250
const DECADES = [0.05, 100].map(Math.log10)

/** A log scale, because the interesting half of this chart is under one percent. */
const yPct = (pct: number) =>
  TOP + ((Math.log10(pct) - DECADES[0]) / (DECADES[1] - DECADES[0])) * (BOTTOM - TOP)

const marks = COMPS.map((comp, i) => ({
  ...comp,
  x: 152 + i * 38,
  y: yPct(comp.pct),
  delay: i * 0.06,
}))

const RULES = [0.1, 1, 10, 100].map((pct) => ({
  pct,
  y: yPct(pct),
  label: pct === 100 ? '100%' : `${pct}%`,
}))
</script>

<template>
  <div
    ref="root"
    class="results"
    :class="{ still: !motion }"
    @mouseenter="held = true"
    @mouseleave="held = false"
    @focusin="held = true"
    @focusout="held = false"
  >
    <div class="rail" role="tablist" aria-label="What we have shipped">
      <button
        v-for="(item, i) in PANELS"
        :key="item.key"
        :id="`result-tab-${item.key}`"
        class="pick"
        :class="{ on: at === i }"
        type="button"
        role="tab"
        :aria-selected="at === i"
        :aria-controls="`result-panel-${item.key}`"
        :tabindex="at === i ? 0 : -1"
        @click="pick(i)"
        @mouseenter="pick(i)"
        @focus="pick(i)"
        @keydown="onKey($event, i)"
      >
        <span class="idx">{{ String(i + 1).padStart(2, '0') }}</span>
        <span class="body">
          <span class="eyebrow">{{ item.kicker }}</span>
          <strong>{{ item.title }}</strong>
          <span class="blurb">{{ item.blurb }}</span>
        </span>
      </button>
    </div>

    <div
      class="stage"
      role="tabpanel"
      :id="`result-panel-${panel.key}`"
      :aria-labelledby="`result-tab-${panel.key}`"
    >
      <svg viewBox="0 0 640 300" role="img" :aria-label="panel.label">
        <!-- HOA -->
        <g v-if="panel.key === 'hoa'" key="hoa" class="panel">
          <text x="16" y="60" class="side">IMO 2026</text>
          <text x="16" y="116" class="huge">6 / 6</text>

          <g v-for="(item, i) in IMO" :key="item.n" class="proof" :style="{ '--d': `${i * 0.1}s` }">
            <rect :x="item.x" :y="item.y" width="80" height="42" rx="9" class="box lit" />
            <text :x="item.x + 40" :y="item.y + 20" class="ttl mid">Q{{ item.n }}</text>
            <text :x="item.x + 40" :y="item.y + 34" class="sub mid">verified</text>
          </g>

          <text x="16" y="278" class="sub">machine-checked in Lean 4</text>

          <text x="306" y="44" class="side">PutnamBench</text>
          <rect
            v-for="cell in cells"
            :key="cell.i"
            :x="cell.x"
            :y="cell.y"
            width="8"
            height="8"
            rx="1.5"
            class="cell"
            :class="{ missed: cell.missed }"
            :style="{ '--d': `${cell.delay}s` }"
          />
          <text x="306" y="286" class="count">670 / 672 accepted · first on the leaderboard</text>
        </g>

        <!-- KDA -->
        <g v-else-if="panel.key === 'kda'" key="kda" class="panel">
          <text x="16" y="60" class="side">MLSys 2026 · FlashInfer</text>
          <text x="16" y="126" class="huge">#1–#3</text>
          <text x="16" y="158" class="ttl">track placements</text>
          <text x="16" y="188" class="sub">with MIT HAN Lab, on the contest's own hardware</text>
          <text x="16" y="208" class="sub">and against its own reference implementation</text>
          <text x="16" y="246" class="sub">the evaluation and reproduction code is public,</text>
          <text x="16" y="264" class="sub">which is the only reason this is worth claiming</text>

          <g v-for="block in PODIUM" :key="block.place" class="place" :style="{ '--d': `${block.delay}s` }">
            <rect
              :x="block.x"
              :y="block.y"
              width="74"
              :height="block.height"
              rx="8"
              class="box"
              :class="{ lit: block.place === 1 }"
            />
            <text :x="block.x + 37" :y="block.y + 34" class="huge small mid">#{{ block.place }}</text>
          </g>
          <path :d="`M 332 ${FLOOR} L 626 ${FLOOR}`" class="grid" />
          <text x="479" y="274" class="sub mid">a track apiece</text>
        </g>

        <!-- AgentKaggle -->
        <g v-else key="kaggle" class="panel">
          <text x="16" y="44" class="side">best result per competition</text>

          <g v-for="rule in RULES" :key="rule.pct">
            <path :d="`M 140 ${rule.y} L 626 ${rule.y}`" class="grid soft" />
            <text x="132" :y="rule.y + 4" class="sub end">{{ rule.label }}</text>
          </g>
          <rect x="140" :y="TOP" width="486" :height="yPct(1) - TOP" class="band" />
          <text x="620" :y="TOP + 16" class="sub end">top 1%</text>

          <g v-for="mark in marks" :key="mark.name" class="mark" :style="{ '--d': `${mark.delay}s` }">
            <path :d="`M ${mark.x} ${BOTTOM} L ${mark.x} ${mark.y}`" class="stem" />
            <circle :cx="mark.x" :cy="mark.y" r="5.5" :class="mark.official ? 'official' : 'late'" />
          </g>

          <path d="M 140 250 L 626 250" class="grid" />

          <g class="key">
            <circle cx="150" cy="276" r="5.5" class="official" />
            <text x="162" y="280" class="sub">official final rank</text>
            <circle cx="300" cy="276" r="5.5" class="late" />
            <text x="312" y="280" class="sub">late-submission estimate, not a rank</text>
          </g>
          <text x="626" y="280" class="count end">13 competitions</text>
        </g>
      </svg>

      <p class="note"><a :href="panel.note.href">{{ panel.note.text }}</a></p>
    </div>
  </div>
</template>

<style scoped>
.results {
  display: grid;
  grid-template-columns: minmax(280px, 350px) 1fr;
  gap: 20px;
  align-items: stretch;
  margin: 28px 0 0;
}

/* ---- The rail ------------------------------------------------------------------------ */

.rail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pick {
  display: flex;
  gap: 12px;
  padding: 14px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: none;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.25s, border-color 0.25s;
}

.pick:hover,
.pick.on {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.idx {
  flex: none;
  padding-top: 3px;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  color: var(--vp-c-text-3);
  transition: color 0.25s;
}

.pick.on .idx {
  color: var(--vp-c-brand-1);
}

.body {
  display: block;
  min-width: 0;
}

.eyebrow {
  display: block;
  font-family: var(--vp-font-family-mono);
  font-size: 10.5px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  transition: color 0.25s;
}

.pick.on .eyebrow {
  color: var(--vp-c-brand-1);
}

.pick strong {
  display: block;
  margin-top: 4px;
  font-size: 16px;
  line-height: 1.32;
  letter-spacing: -0.015em;
  font-weight: 650;
  color: var(--vp-c-text-1);
}

.blurb {
  display: none;
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
}

.pick.on .blurb {
  display: block;
}

/* ---- The stage ----------------------------------------------------------------------- */

.stage {
  display: grid;
  align-content: center;
  padding: 10px 10px 2px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
}

svg {
  display: block;
  width: 100%;
  height: auto;
}

.panel {
  animation: arrive 0.45s ease both;
}

@keyframes arrive {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

.note {
  margin: 0;
  padding: 2px 10px 10px;
  font-size: 13px;
  text-align: right;
}

.note a {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

/* ---- Shared vocabulary ---------------------------------------------------------------- */

.box {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-divider);
  stroke-width: 1.2;
}

.box.lit {
  fill: var(--vp-c-brand-soft);
  stroke: var(--vp-c-brand-2);
}

.ttl {
  fill: var(--vp-c-text-1);
  font-size: 13px;
  font-weight: 600;
}

.sub {
  fill: var(--vp-c-text-3);
  font-size: 11px;
}

.mono {
  fill: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
}

.mid {
  text-anchor: middle;
}

.end {
  text-anchor: end;
}

.side {
  fill: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 10.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.huge {
  fill: var(--vp-c-text-1);
  font-size: 44px;
  font-weight: 750;
  letter-spacing: -0.04em;
}

.huge.small {
  font-size: 26px;
}

.count {
  fill: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 600;
}

.grid {
  fill: none;
  stroke: var(--vp-c-divider);
  stroke-width: 1;
}

.grid.soft {
  stroke-dasharray: 3 5;
}

.tickmark {
  fill: var(--vp-c-text-3);
  font-size: 10px;
}

/* ---- HOA ------------------------------------------------------------------------------ */

.proof {
  animation: pop 0.5s ease-out var(--d, 0s) both;
}

.cell {
  fill: var(--vp-c-brand-2);
  animation: pop 0.4s ease-out var(--d, 0s) both;
}

.cell.missed {
  fill: var(--vp-c-text-3);
  opacity: 0.35;
}

@keyframes pop {
  from {
    opacity: 0;
  }
}

/* ---- KDA ------------------------------------------------------------------------------ */

.place rect {
  transform-box: fill-box;
  transform-origin: center bottom;
  animation: rise 0.6s cubic-bezier(0.2, 0.8, 0.3, 1) var(--d, 0s) both;
}

.place text {
  animation: pop 0.5s ease-out calc(var(--d, 0s) + 0.25s) both;
}

@keyframes rise {
  from {
    transform: scaleY(0);
  }
}

/* ---- AgentKaggle ----------------------------------------------------------------------- */

.band {
  fill: var(--vp-c-brand-soft);
  opacity: 0.5;
}

.stem {
  stroke: var(--vp-c-divider);
  stroke-width: 1.2;
}

.mark {
  animation: drop 0.55s cubic-bezier(0.2, 0.8, 0.3, 1) var(--d, 0s) both;
}

@keyframes drop {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }
}

circle.official {
  fill: var(--vp-c-brand-3);
  stroke: none;
}

circle.late {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-brand-2);
  stroke-width: 2;
  stroke-dasharray: 2.6 2.2;
}

/* ---- Reduced motion, and the server's first render -------------------------------------- */

.still .panel,
.still .proof,
.still .cell,
.still .place rect,
.still .place text,
.still .mark {
  animation: none;
}

/* ---- Narrow ----------------------------------------------------------------------------- */

@media (max-width: 899px) {
  .results {
    grid-template-columns: 1fr;
  }

  .pick strong {
    font-size: 15px;
  }
}
</style>
