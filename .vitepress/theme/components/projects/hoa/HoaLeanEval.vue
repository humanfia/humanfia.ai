<script setup lang="ts">
// LeanEval v1, as the board itself presents it: one column at a time. The switch picks the
// column, the three leading entries re-sort under it (they slide, so the reader sees the order
// change rather than being told it did), and the readout says what that column rewards and
// where we stand on the whole board -- which is not always where we stand among these three.
import { computed, ref } from 'vue'
import { vReveal } from '../../../home/motion'

interface Entry {
  name: string
  us?: boolean
  total: number
  first: number
  unique: number
}
const props = defineProps<{ entries: Entry[] }>()

const METRICS = [
  {
    key: 'first',
    label: 'First solves',
    means: 'The first accepted proof of a problem.',
    say: 'First on the board: the first accepted proof on 30 of the 88 problems anybody has solved.',
  },
  {
    key: 'total',
    label: 'Total',
    means: 'Every problem an entry solved.',
    say: 'Second on the board, by one: 79 to NEAR AI’s 80.',
  },
  {
    key: 'unique',
    label: 'Unique',
    means: 'Problems nobody else has solved.',
    say: 'Fourth on the board: one of our 79 has no other solver. The board sorts by this column by default.',
  },
] as const
type Key = (typeof METRICS)[number]['key']
const metric = ref<Key>('first')
const current = computed(() => METRICS.find((m) => m.key === metric.value)!)

const sorted = computed(() => [...props.entries].sort((a, b) => b[metric.value] - a[metric.value]))
const max = computed(() => Math.max(...props.entries.map((e) => e[metric.value])))
</script>

<template>
  <div v-reveal class="hl">
    <div class="hl-main hoa-sheet">
      <div class="hl-top">
        <div class="hoa-switch" role="group" aria-label="Sort LeanEval v1 by">
          <button
            v-for="m in METRICS"
            :key="m.key"
            type="button"
            :aria-pressed="metric === m.key"
            @click="metric = m.key"
          >{{ m.label }}</button>
        </div>
        <span class="hl-means">{{ current.means }}</span>
      </div>

      <TransitionGroup tag="ol" name="hl-row" class="hl-rows">
        <li v-for="e in sorted" :key="e.name" :class="{ us: e.us }">
          <span class="hl-name">{{ e.name }}</span>
          <span class="hl-bar" aria-hidden="true"><i :style="{ transform: `scaleX(${e[metric] / max})` }" /></span>
          <strong class="hl-v">{{ e[metric] }}</strong>
          <span class="hl-others">
            <template v-for="m in METRICS" :key="m.key">
              <span v-if="m.key !== metric">{{ m.label }} {{ e[m.key] }}</span>
            </template>
          </span>
        </li>
      </TransitionGroup>

      <p class="hl-say" aria-live="polite"><span class="qed" aria-hidden="true" />{{ current.say }}</p>
    </div>

    <dl class="hl-side">
      <div>
        <dt>LeanEval v1</dt>
        <dd><b>128</b> problems, frozen 20 August 2026; 88 solved by anyone</dd>
      </div>
      <div>
        <dt>Archive</dt>
        <dd><b>170 / 171</b> accepted, tied for the most</dd>
      </div>
      <div class="hl-big">
        <dt>Both scopes</dt>
        <dd><b>249</b> distinct problems with an accepted Humanfia proof, the most of any entry</dd>
      </div>
    </dl>
  </div>
  <p class="hoa-caption">
    The board's published data, 5 October 2026; the combined count of 249 is ours, made from that
    data, as the site shows no combined column. Lean-Eval accepts a proof only when it passes
    Comparator against the statement: no partial credit, no sorry.
  </p>
</template>

<style scoped>
.hl {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: clamp(16px, 2.4vw, 28px);
}

.hl-main {
  padding: 18px 20px 20px;
}
.hl-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 18px;
  margin-bottom: 16px;
}
.hl-means {
  font-size: 13px;
  color: var(--k-ink-3);
}

.hl-rows {
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
}
.hl-rows li {
  display: grid;
  grid-template-columns: minmax(0, 12em) minmax(0, 1fr) 2.2em;
  grid-template-areas:
    'name bar v'
    'name others others';
  align-items: center;
  gap: 2px 14px;
  margin: 0;
  padding: 12px 0;
  border-top: 1px solid var(--k-line);
  background: var(--k-card);
}
.hl-name {
  grid-area: name;
  font-size: 14px;
  color: var(--k-ink-2);
}
.us .hl-name {
  font-weight: 750;
  color: var(--k-ink);
}
.hl-bar {
  grid-area: bar;
  height: 22px;
}
.hl-bar i {
  display: block;
  height: 100%;
  background: var(--k-ink);
  transform-origin: left;
  transition: transform 0.7s var(--k-ease);
}
.us .hl-bar i {
  background: var(--k-red);
}
.hl-v {
  grid-area: v;
  font-size: 24px;
  font-weight: 850;
  letter-spacing: -0.03em;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.hl-others {
  grid-area: others;
  display: flex;
  gap: 14px;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  color: var(--k-ink-3);
}

.hl-row-move {
  transition: transform 0.6s var(--k-ease);
}

.hl-say {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 16px 0 0;
  padding-top: 14px;
  border-top: 2px solid var(--k-ink);
  font-size: 15.5px;
  font-weight: 600;
  line-height: 1.5;
}
.hl-say .qed {
  flex: none;
  margin: 0;
}

.hl-side {
  display: grid;
  align-content: start;
  gap: 0;
  margin: 0;
  border-top: 3px solid var(--k-ink);
}
.hl-side > div {
  padding: 14px 0;
  border-bottom: 1px solid var(--k-line);
}
.hl-side dt {
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--k-ink-3);
}
.hl-side dd {
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 1.45;
  color: var(--k-ink-2);
}
.hl-side b {
  display: block;
  font-size: 32px;
  font-weight: 850;
  letter-spacing: -0.04em;
  line-height: 1.05;
  color: var(--k-ink);
}
.hl-big b {
  font-size: clamp(56px, 6vw, 84px);
  color: var(--k-accent);
}

.hf-motion .hl.rv:not(.rv-in) .hl-bar i {
  transform: scaleX(0) !important;
}

@media (max-width: 900px) {
  .hl {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 520px) {
  .hl-main {
    padding: 14px 14px 16px;
  }
  .hl-rows li {
    grid-template-columns: minmax(0, 1fr) 2.2em;
    grid-template-areas:
      'name v'
      'bar bar'
      'others others';
    gap: 6px 10px;
  }
  .hl-bar {
    height: 14px;
  }
}
</style>
