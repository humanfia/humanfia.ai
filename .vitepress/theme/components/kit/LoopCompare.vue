<script setup lang="ts">
// Feedback loops, side by side: each one a ring with a packet going round it at the speed the
// loop really turns, and the numbers the loop produced. A short loop is visibly busier than a
// long one before a single figure has been read -- which is the point being made.
//
// `period` is the loop's length in whatever unit `unit` names; the packet goes round once every
// `period × secondsPer` seconds, so the rings keep their real proportions to each other. The
// first loop is drawn as the winner (inverted); a reader who asked for less motion sees the
// packets parked at the top.
//
//   <LoopCompare unit="min / test" :loops="[
//     { title: 'One shape first', period: 0.9, stats: [{ value: 248, label: 'hardware tests' }] },
//     { title: 'All six at once', period: 1.9, stats: [{ value: 159, label: 'hardware tests' }] },
//   ]" />
import { ref } from 'vue'
import NumberTicker from './NumberTicker.vue'
import { useInView } from './shared'

interface Stat {
  value: number
  label: string
  decimals?: number
  suffix?: string
}

interface Loop {
  title: string
  period: number
  stats: Stat[]
}

withDefaults(
  defineProps<{
    loops: Loop[]
    unit?: string
    decimals?: number
    secondsPer?: number
    label?: string
    caption?: string
  }>(),
  { unit: '', decimals: 1, secondsPer: 2 },
)

const root = ref<HTMLElement | null>(null)
const seen = useInView(root, 0.35)
</script>

<template>
  <figure ref="root" class="lcmp" :class="{ seen }" role="group" :aria-label="label ?? 'Loops compared'">
    <div class="lcmp-grid">
      <article
        v-for="(loop, i) in loops"
        :key="loop.title"
        class="kit lcmp-card"
        :class="{ invert: i === 0 }"
      >
        <div class="lcmp-ring" :style="{ '--period': `${loop.period * secondsPer}s` }" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <circle class="lcmp-track" cx="60" cy="60" r="46" />
            <g class="lcmp-spin">
              <rect class="lcmp-packet" x="54" y="8" width="12" height="12" />
            </g>
          </svg>
          <div class="lcmp-period">
            <strong><NumberTicker :value="loop.period" :decimals="decimals" :duration="900" /></strong>
            <span>{{ unit }}</span>
          </div>
        </div>
        <div class="lcmp-copy">
          <h3>{{ loop.title }}</h3>
          <dl>
            <div v-for="(s, j) in loop.stats" :key="s.label">
              <dt>{{ s.label }}</dt>
              <dd><NumberTicker :value="s.value" :decimals="s.decimals ?? 0" :suffix="s.suffix ?? ''" :duration="1500" :delay="j * 120" /></dd>
            </div>
          </dl>
        </div>
      </article>
    </div>
    <figcaption v-if="caption" class="kit-caption">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.lcmp {
  margin: 36px 0;
}

.lcmp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  border: 1px solid var(--vp-c-divider);
}

.lcmp-card {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 22px;
  align-items: center;
  padding: 24px;
  background: var(--k-bg);
}

.lcmp-ring {
  position: relative;
  width: 120px;
  height: 120px;
}

.lcmp-ring svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.lcmp-track {
  fill: none;
  stroke: var(--k-fg-3);
  stroke-width: 2;
  stroke-dasharray: 3 6;
}

.lcmp-spin {
  transform-origin: 60px 60px;
}

.lcmp.seen .lcmp-spin {
  animation: lcmp-spin var(--period) linear infinite;
}

.lcmp-packet {
  fill: var(--k-red);
}

.lcmp-card:not(.invert) .lcmp-packet {
  fill: var(--k-fg-3);
}

.lcmp-period {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  text-align: center;
}

.lcmp-period strong {
  font-size: 30px;
  line-height: 1;
  letter-spacing: -0.04em;
  color: var(--k-fg);
}

.lcmp-period span {
  margin-top: 4px;
  font-family: var(--k-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--k-fg-3);
}

.lcmp-copy h3 {
  margin: 0 0 12px;
  padding: 0;
  border: 0;
  font-size: 18px;
  letter-spacing: -0.02em;
  color: var(--k-fg);
}

.lcmp-copy dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 18px;
  margin: 0;
}

.lcmp-copy dt {
  font-family: var(--k-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--k-fg-3);
}

.lcmp-copy dd {
  margin: 2px 0 0;
  font-size: 24px;
  font-weight: 750;
  letter-spacing: -0.03em;
  color: var(--k-fg);
}

.lcmp-card.invert .lcmp-copy dd {
  color: var(--k-red);
}

@keyframes lcmp-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 420px) {
  .lcmp-card {
    grid-template-columns: 1fr;
    justify-items: start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lcmp.seen .lcmp-spin {
    animation: none;
  }
}
</style>
