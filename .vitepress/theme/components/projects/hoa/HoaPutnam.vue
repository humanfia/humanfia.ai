<script setup lang="ts">
// PutnamBench in two panels that share their entries. On the left, the official leaderboard
// (Lean, with answers given, each team's latest entry): four at 672, then everyone else. On the
// right, what the four at 672 say a proof cost them, on a logarithmic axis -- because they do
// not measure it the same way, and an axis of orders of magnitude is the honest way to set
// numbers like that side by side. Pointing at an entry in either panel lights it in both.
import { computed, ref } from 'vue'
import { vReveal } from '../../../home/motion'

interface Entry {
  name: string
  score: number
  us?: boolean
  added: string
  cost?: number
  basis?: string
}
const props = defineProps<{ entries: Entry[] }>()

const TOTAL = 672
const hot = ref<string | null>(null)

/** Ties share a rank. */
const ranked = computed(() =>
  props.entries.map((e) => ({ ...e, rank: 1 + props.entries.filter((o) => o.score > e.score).length })),
)

// The cost axis: $0.10 to $100, three decades.
const LO = -1
const HI = 2
const at = (cost: number) => ((Math.log10(cost) - LO) / (HI - LO)) * 100
const TICKS = [
  { v: 0.1, t: '$0.10' },
  { v: 1, t: '$1' },
  { v: 10, t: '$10' },
  { v: 100, t: '$100' },
]
const priced = computed(() => props.entries.filter((e) => e.cost !== undefined) as Required<Entry>[])
const money = (v: number) => `$${v < 1 ? v.toFixed(2) : v % 1 ? v.toFixed(2) : v}`
</script>

<template>
  <div v-reveal class="hp">
    <figure class="hp-panel hoa-sheet">
      <figcaption class="hp-cap">
        <span class="hoa-kicker">Official leaderboard · Lean, with answers</span>
        <span class="hp-title">A four-way tie at the top</span>
      </figcaption>
      <ol class="hp-board">
        <li
          v-for="(e, i) in ranked"
          :key="e.name"
          :class="{ us: e.us, hot: hot === e.name, full: e.score === TOTAL }"
          :style="{ '--w': e.score / TOTAL, '--i': i }"
          @mouseenter="hot = e.name"
          @mouseleave="hot = null"
        >
          <span class="hp-rank">{{ e.rank }}</span>
          <span class="hp-name">{{ e.name }}</span>
          <span class="hp-bar" aria-hidden="true"><i /></span>
          <span class="hp-score">{{ e.score }}</span>
        </li>
      </ol>
      <p class="hoa-caption">
        Each team's latest entry, from the leaderboard's published data. Ties share a rank.
      </p>
    </figure>

    <figure class="hp-panel hoa-sheet">
      <figcaption class="hp-cap">
        <span class="hoa-kicker">Reported cost per problem · log scale</span>
        <span class="hp-title">Where we are not first</span>
      </figcaption>
      <div class="hp-cost">
        <div class="hp-axis" aria-hidden="true">
          <span v-for="t in TICKS" :key="t.v" :style="{ left: `${at(t.v)}%` }">{{ t.t }}</span>
        </div>
        <ul class="hp-dots">
          <li
            v-for="(e, i) in priced"
            :key="e.name"
            :class="{ us: e.us, hot: hot === e.name }"
            :style="{ '--x': `${at(e.cost)}%`, '--i': i }"
            @mouseenter="hot = e.name"
            @mouseleave="hot = null"
          >
            <span class="hp-dname">{{ e.name }}</span>
            <span class="hp-track" aria-hidden="true">
              <i class="hp-stem" />
              <i class="hp-dot" />
            </span>
            <span class="hp-val"><b>{{ money(e.cost) }}</b> {{ e.basis }}</span>
          </li>
        </ul>
      </div>
      <p class="hoa-caption">
        In each team's own words, from its note on the leaderboard: one is total spend, one is actor
        side only. Read it as orders of magnitude, not as a ranking. Two of the four got to 672 for a
        tenth of our cost or less.
      </p>
    </figure>
  </div>
</template>

<style scoped>
.hp {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: clamp(16px, 2.4vw, 28px);
  align-items: start;
}

.hp-panel {
  margin: 0;
  padding: 18px 20px 18px;
}

.hp-cap {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;
}
.hp-cap .hoa-kicker {
  font-size: 11px;
  color: var(--k-ink-3);
}
.hp-title {
  font-size: 20px;
  font-weight: 750;
  letter-spacing: -0.02em;
  color: var(--k-ink);
}

/* ---- the board ---- */
.hp-board {
  margin: 0;
  padding: 0;
  list-style: none;
}
.hp-board li {
  display: grid;
  grid-template-columns: 1.6em minmax(0, 13em) minmax(0, 1fr) 3ch;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 6px 0;
  font-size: 13.5px;
  transition: opacity 0.2s;
}
.hp-board li + li {
  border-top: 1px solid var(--k-line);
}
.hp-board li.full + li:not(.full) {
  border-top: 2px dashed var(--k-ink-3);
}
.hp-rank {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: var(--k-ink-3);
}
.hp-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--k-ink-2);
}
.us .hp-name {
  font-weight: 750;
  color: var(--k-ink);
}
.hp-bar {
  height: 12px;
  background: color-mix(in srgb, var(--k-ink) 6%, transparent);
}
.hp-bar i {
  display: block;
  height: 100%;
  width: calc(var(--w) * 100%);
  background: var(--k-ink-3);
  transform-origin: left;
  transition: transform 1s var(--k-ease) calc(var(--i) * 70ms), background-color 0.2s;
}
.full .hp-bar i {
  background: var(--k-ink);
}
.us .hp-bar i {
  background: var(--k-red);
}
.hot .hp-bar i {
  background: var(--k-accent);
}
.hp-score {
  font-family: var(--vp-font-family-mono);
  font-weight: 700;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* ---- the cost axis ---- */
.hp-cost {
  position: relative;
  padding-top: 4px;
}
.hp-axis {
  position: relative;
  height: 18px;
  margin: 0 0 8px;
  border-bottom: 1px solid var(--k-ink);
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  color: var(--k-ink-3);
}
.hp-axis span {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
}
.hp-axis span:first-child {
  transform: none;
}
.hp-axis span:last-child {
  transform: translateX(-100%);
}
.hp-dots {
  margin: 0;
  padding: 0;
  list-style: none;
}
.hp-dots li {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  margin: 0;
  padding: 8px 0 10px;
  border-bottom: 1px solid var(--k-line);
}
.hp-dname {
  font-size: 13px;
  color: var(--k-ink-2);
}
.us .hp-dname {
  font-weight: 750;
  color: var(--k-ink);
}
.hp-track {
  position: relative;
  height: 16px;
  margin: 4px 0 2px;
}
.hp-stem {
  position: absolute;
  left: 0;
  top: 50%;
  height: 1px;
  width: var(--x);
  background: var(--k-line);
  transform-origin: left;
  transition: transform 1s var(--k-ease) calc(var(--i) * 90ms);
}
.hp-dot {
  position: absolute;
  top: 1px;
  left: var(--x);
  width: 14px;
  height: 14px;
  margin-left: -7px;
  background: var(--k-ink);
  transition: transform 1s var(--k-ease) calc(var(--i) * 90ms), opacity 0.6s calc(var(--i) * 90ms);
}
.us .hp-dot {
  background: var(--k-red);
}
.hot .hp-dot {
  outline: 2px solid var(--k-red);
  outline-offset: 2px;
}
.hp-val {
  font-size: 12.5px;
  color: var(--k-ink-3);
}
.hp-val b {
  font-family: var(--vp-font-family-mono);
  color: var(--k-ink);
}
.us .hp-val b {
  color: var(--k-accent);
}

/* Drawn in as the figure arrives. */
.hf-motion .hp.rv:not(.rv-in) .hp-bar i,
.hf-motion .hp.rv:not(.rv-in) .hp-stem {
  transform: scaleX(0);
}
.hf-motion .hp.rv:not(.rv-in) .hp-dot {
  opacity: 0;
  transform: translateX(-40px);
}

@media (max-width: 960px) {
  .hp {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 520px) {
  .hp-panel {
    padding: 14px 14px 16px;
  }
  .hp-board li {
    grid-template-columns: 1.2em minmax(0, 1fr) 3ch;
    gap: 4px 8px;
    font-size: 12.5px;
  }
  .hp-bar {
    grid-column: 2 / 4;
    grid-row: 2;
    height: 8px;
  }
}
</style>
