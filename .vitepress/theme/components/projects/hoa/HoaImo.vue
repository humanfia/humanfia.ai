<script setup lang="ts">
// IMO 2026 as a race against the clock: API minutes per problem for our two workers and for
// AxiomProver as it reported them, one row per problem, on one shared axis. Each row ends in
// how GPT-5.6 did against AxiomProver, so the shape of the table -- lose on the two easiest,
// win by more than four times on the hardest -- is read off the margin. The switch sums the paper.
import { computed, ref } from 'vue'
import { vReveal } from '../../../home/motion'

interface Row {
  label: string
  gpt: number
  kimi: number
  axiom: number
}
const props = defineProps<{ rows: Row[] }>()

const SERIES = [
  { key: 'gpt', label: 'Humanfia · GPT-5.6' },
  { key: 'kimi', label: 'Humanfia · Kimi-K3' },
  { key: 'axiom', label: 'AxiomProver, as reported' },
] as const

const whole = ref(false)
const total = computed<Row>(() => ({
  label: 'All six',
  gpt: props.rows.reduce((s, r) => s + r.gpt, 0),
  kimi: props.rows.reduce((s, r) => s + r.kimi, 0),
  axiom: props.rows.reduce((s, r) => s + r.axiom, 0),
}))
const shown = computed(() => (whole.value ? [total.value] : props.rows))
const max = computed(() => Math.max(...shown.value.flatMap((r) => [r.gpt, r.kimi, r.axiom])))

/** Our times to the tenth of a minute, AxiomProver's in the whole minutes it reported. */
const fmt = (v: number, key: string) =>
  v.toLocaleString('en-US', { minimumFractionDigits: key === 'axiom' ? 0 : 1, maximumFractionDigits: 1 })
function versus(r: Row) {
  const faster = r.gpt < r.axiom
  const x = (faster ? r.axiom / r.gpt : r.gpt / r.axiom).toFixed(1)
  return { faster, text: `${x}× ${faster ? 'faster' : 'slower'}` }
}
</script>

<template>
  <figure v-reveal class="hi hoa-sheet">
    <div class="hi-top">
      <div class="hoa-switch" role="group" aria-label="Show">
        <button type="button" :aria-pressed="!whole" @click="whole = false">Per problem</button>
        <button type="button" :aria-pressed="whole" @click="whole = true">The whole paper</button>
      </div>
      <ul class="hi-key" aria-hidden="true">
        <li v-for="s in SERIES" :key="s.key"><i :class="s.key" />{{ s.label }}</li>
      </ul>
    </div>

    <div class="hi-head" aria-hidden="true">
      <span />
      <span>API minutes, one axis for every row · lower is faster</span>
      <span>GPT-5.6 vs Axiom</span>
    </div>

    <ol class="hi-rows">
      <li v-for="r in shown" :key="r.label" :class="{ hard: r.label === 'Q3' }">
        <span class="hi-q">{{ r.label }}</span>
        <span class="hi-bars">
          <span v-for="(s, i) in SERIES" :key="s.key" class="hi-bar" :class="s.key">
            <i :style="{ '--w': r[s.key] / max, '--i': i }" />
            <em>{{ fmt(r[s.key], s.key) }}</em>
          </span>
        </span>
        <span class="hi-vs" :class="{ win: versus(r).faster }">
          <b>{{ versus(r).text }}</b>
        </span>
      </li>
    </ol>

    <figcaption class="hoa-caption">
      AxiomProver's times are as it reported them for the same statements; Kimi-K3's are its worker
      and its Codex reviewer combined. On Q1 and Q4, the two easiest, we lose; on Q3, the hardest,
      GPT-5.6 is more than four times faster. A loop pays for itself when the problem is long
      enough for the loop to matter.
    </figcaption>
  </figure>
</template>

<style scoped>
.hi {
  margin: 0;
  padding: 18px 20px 20px;
}
.hi-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 20px;
}
.hi-key {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 12.5px;
  color: var(--k-ink-2);
}
.hi-key li {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin: 0;
}
.hi-key i {
  width: 14px;
  height: 10px;
}

.gpt {
  --c: var(--k-red);
}
.kimi {
  --c: var(--k-ink);
}
.axiom {
  --c: repeating-linear-gradient(-45deg, var(--k-ink-3) 0 2px, transparent 2px 5px);
}
.hi-key i,
.hi-bar i {
  background: var(--c);
}
.axiom i {
  box-shadow: inset 0 0 0 1px var(--k-ink-3);
}

.hi-head {
  display: grid;
  grid-template-columns: 4.2em minmax(0, 1fr) 11em;
  gap: 16px;
  margin-top: 22px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--k-ink);
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  color: var(--k-ink-3);
}
.hi-head span:last-child {
  text-align: right;
}

.hi-rows {
  margin: 0;
  padding: 0;
  list-style: none;
}
.hi-rows li {
  display: grid;
  grid-template-columns: 4.2em minmax(0, 1fr) 11em;
  gap: 16px;
  align-items: center;
  margin: 0;
  padding: 10px 0;
  border-bottom: 1px solid var(--k-line);
}
.hi-rows li.hard {
  background: color-mix(in srgb, var(--k-red) 6%, transparent);
}
.hi-q {
  font-size: 22px;
  font-weight: 850;
  letter-spacing: -0.03em;
}
.hard .hi-q::after {
  content: 'hardest';
  display: block;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.04em;
  color: var(--k-accent);
}
.hi-bars {
  display: grid;
  gap: 3px;
}
.hi-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 12px;
}
.hi-bar i {
  display: block;
  flex: none;
  width: calc(var(--w) * (100% - 5em));
  height: 100%;
  min-width: 2px;
  transform-origin: left;
  transition:
    width 0.7s var(--k-ease),
    transform 1s var(--k-ease) calc(var(--i) * 120ms);
}
.hi-bar em {
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-style: normal;
  color: var(--k-ink-3);
  white-space: nowrap;
}
.hi-bar.gpt em {
  color: var(--k-accent);
  font-weight: 650;
}

.hi-vs {
  text-align: right;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  color: var(--k-ink-3);
}
.hi-vs.win b {
  display: inline-block;
  padding: 2px 6px;
  background: var(--k-ink);
  color: var(--k-bg);
}

.hf-motion .hi.rv:not(.rv-in) .hi-bar i {
  transform: scaleX(0);
}

@media (max-width: 640px) {
  .hi {
    padding: 14px 14px 16px;
  }
  .hi-head {
    display: none;
  }
  .hi-rows li {
    grid-template-columns: 3.6em minmax(0, 1fr);
    gap: 6px 10px;
  }
  .hard .hi-q::after {
    font-size: 11px;
    letter-spacing: 0;
  }
  .hi-vs {
    grid-column: 2;
    text-align: left;
    font-size: 12px;
  }
}
</style>
