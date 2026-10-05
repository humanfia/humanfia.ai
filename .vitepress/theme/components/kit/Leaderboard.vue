<script setup lang="ts">
// A leaderboard: ranked entries, a bar each, ours in the red.
//
// Give an entry a `from` (the rank it held before) and the board opens in the old order and
// re-sorts itself into the new one the first time it is on screen -- the climb is the news, so it
// is what moves. Hover or focus a row to read its gap to the entry above it and to the leader.
// Ties share a rank. `lowerIsBetter` ranks by smallest (a cost, an error, a time).
//
//   <Leaderboard
//     kicker="PutnamBench · Lean"
//     :entries="[{ name: 'Humanfia', score: 672, us: true, from: 3 }, { name: 'Other', score: 670, from: 1 }]"
//   />
import { computed, ref } from 'vue'
import NumberTicker from './NumberTicker.vue'
import { format, signed, useInView } from './shared'

interface Entry {
  name: string
  score: number
  detail?: string
  /** Ours: drawn in the red. */
  us?: boolean
  /** The rank this entry held before; the board animates from that order to this one. */
  from?: number
}

const props = withDefaults(
  defineProps<{
    entries: Entry[]
    kicker?: string
    title?: string
    caption?: string
    label?: string
    decimals?: number
    suffix?: string
    prefix?: string
    lowerIsBetter?: boolean
    /** The bars' full length; defaults to the best score. */
    max?: number
    invert?: boolean
    /** No frame: for a board set inside something else (a post's hero). */
    bare?: boolean
  }>(),
  { decimals: 0, suffix: '', prefix: '', lowerIsBetter: false, invert: false, bare: false },
)

const root = ref<HTMLElement | null>(null)
const seen = useInView(root, 0.3)

const ranked = computed(() => {
  const sign = props.lowerIsBetter ? 1 : -1
  const sorted = props.entries
    .map((entry, index) => ({ ...entry, index }))
    .sort((a, b) => sign * (a.score - b.score) || a.index - b.index)
  let rank = 0
  return sorted.map((entry, i) => {
    if (i === 0 || entry.score !== sorted[i - 1].score) rank = i + 1
    return { ...entry, rank }
  })
})

const hasFrom = computed(() => props.entries.some((e) => e.from !== undefined))
const order = computed(() => {
  if (seen.value || !hasFrom.value) return ranked.value
  return [...ranked.value].sort((a, b) => (a.from ?? a.rank) - (b.from ?? b.rank))
})

const best = computed(() => ranked.value[0]?.score ?? 0)
const top = computed(() => (props.max ?? (props.lowerIsBetter ? Math.max(...props.entries.map((e) => e.score)) : best.value)) || 1)
const fmt = (v: number) => format(v, props.decimals, props.suffix, props.prefix)

const active = ref<number | null>(null)
function gapText(i: number) {
  const entry = ranked.value[i]
  if (!entry) return ''
  if (i === 0) return 'Leader'
  const above = ranked.value[i - 1]
  return `${signed(entry.score - above.score, props.decimals, props.suffix)} to #${above.rank} · ${signed(entry.score - best.value, props.decimals, props.suffix)} to #1`
}

/** Arrow keys walk the rows as they are on screen -- the DOM order, which is the ranked order
 *  once the board has re-sorted, whatever order the rows were first mounted in. */
function move(event: KeyboardEvent, by: number) {
  const row = event.currentTarget as HTMLElement
  const rows = [...(row.parentElement?.children ?? [])] as HTMLElement[]
  rows[(rows.indexOf(row) + by + rows.length) % rows.length]?.focus()
}
</script>

<template>
  <figure
    ref="root"
    class="kit lb"
    :class="[bare ? 'bare' : 'kit-frame', { invert, seen }]"
    role="group"
    :aria-label="label ?? title ?? kicker ?? 'Leaderboard'"
  >
    <div v-if="kicker" class="kit-head"><span class="kit-kicker">{{ kicker }}</span></div>
    <p v-if="title" class="kit-title">{{ title }}</p>
    <TransitionGroup tag="ol" name="lb" class="lb-list">
      <li
        v-for="(entry, i) in order"
        :key="entry.index"
        class="lb-row"
        :class="{ us: entry.us, on: active === entry.index }"
        tabindex="0"
        :aria-label="`Rank ${entry.rank}: ${entry.name}, ${fmt(entry.score)}${entry.detail ? `, ${entry.detail}` : ''}. ${gapText(ranked.findIndex((r) => r.index === entry.index))}`"
        @pointerenter="active = entry.index"
        @pointerleave="active = null"
        @focus="active = entry.index"
        @blur="active = null"
        @keydown.down.prevent="move($event, 1)"
        @keydown.up.prevent="move($event, -1)"
      >
        <span class="lb-rank">{{ seen || !hasFrom ? entry.rank : (entry.from ?? entry.rank) }}</span>
        <span class="lb-name">
          <b>{{ entry.name }}</b>
          <small v-if="active === entry.index">{{ gapText(ranked.findIndex((r) => r.index === entry.index)) }}</small>
          <small v-else-if="entry.detail">{{ entry.detail }}</small>
        </span>
        <span class="lb-track" aria-hidden="true">
          <i :style="{ '--w': seen ? Math.max(0.02, entry.score / top) : 0, '--d': `${i * 80}ms` }" />
        </span>
        <span class="lb-score">
          <NumberTicker v-if="entry.us" :value="entry.score" :decimals="decimals" :suffix="suffix" :prefix="prefix" :from="0" />
          <template v-else>{{ fmt(entry.score) }}</template>
        </span>
      </li>
    </TransitionGroup>
    <figcaption v-if="caption" class="kit-caption">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.lb-list {
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
}

.lb-row {
  display: grid;
  grid-template-columns: 30px minmax(0, 1.7fr) minmax(48px, 1fr) auto;
  gap: 12px;
  align-items: center;
  margin: 0;
  padding: 8px 4px;
  border-top: 1px solid var(--k-grid);
  outline: none;
  transition: background-color 0.2s;
}

.lb-row:first-child {
  border-top-color: var(--k-line);
}

.lb-row.on,
.lb-row:focus-visible {
  background: color-mix(in srgb, var(--k-fg) 6%, transparent);
}

.lb-rank {
  font-family: var(--k-mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--k-fg-3);
}

.lb-row.us .lb-rank {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--k-red);
  color: var(--hf-paper);
}

.lb-name {
  min-width: 0;
}

.lb-name b {
  display: block;
  font-family: var(--k-mono);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.35;
  color: var(--k-fg-2);
}

.lb-row.us .lb-name b {
  color: var(--k-fg);
  font-weight: 700;
}

.lb-name small {
  display: block;
  font-family: var(--k-mono);
  font-size: 11px;
  color: var(--k-fg-3);
}

.lb-track {
  height: 10px;
  background: var(--k-grid);
}

.lb-track i {
  display: block;
  height: 100%;
  width: calc(100% * var(--w));
  background: var(--k-grey);
  transition: width 1s var(--k-ease) var(--d);
}

.lb-row.us .lb-track i {
  background: var(--k-red);
}

.lb-score {
  min-width: 52px;
  text-align: right;
  font-family: var(--k-mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--k-fg-2);
}

.lb-row.us .lb-score {
  color: var(--k-fg);
}

.lb-move {
  transition: transform 0.9s var(--k-ease) 0.3s;
}

@media (max-width: 480px) {
  .lb-row {
    grid-template-columns: 26px minmax(0, 1fr) auto;
  }

  .lb-track {
    grid-column: 2 / -1;
    grid-row: 2;
  }
}
</style>
