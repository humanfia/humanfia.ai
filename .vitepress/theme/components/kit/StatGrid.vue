<script setup lang="ts">
// Stat callouts: the numbers a post leads with, big, each counting up the first time it is seen.
//
// One row of two to four. The first can be `lead` (inverted, the headline). A stat may carry a
// `from` to count from (2.54 → 2.96 tells a story that 0 → 2.96 does not), a `kicker` above it
// and a sentence under it.
//
//   <StatGrid :items="[
//     { value: 2.96, from: 2.54, decimals: 2, suffix: '×', kicker: 'TIRx · tuned on B300', text: 'From 2.54× to 2.96×.' },
//     { value: 2, prefix: '−', suffix: '%', kicker: 'CuTe-DSL · FP16 table removed', text: '...' },
//   ]" lead />
import NumberTicker from './NumberTicker.vue'

interface Stat {
  value: number
  from?: number
  decimals?: number
  prefix?: string
  suffix?: string
  kicker?: string
  text?: string
}

withDefaults(defineProps<{ items: Stat[]; lead?: boolean }>(), { lead: false })
</script>

<template>
  <div class="sg" :style="{ '--n': items.length }">
    <article v-for="(s, i) in items" :key="i" class="kit sg-item" :class="{ invert: lead && i === 0 }">
      <p v-if="s.kicker" class="kit-kicker">{{ s.kicker }}</p>
      <strong class="sg-value">
        <NumberTicker :value="s.value" :from="s.from ?? 0" :decimals="s.decimals ?? 0" :prefix="s.prefix ?? ''" :suffix="s.suffix ?? ''" :duration="1600" />
      </strong>
      <p v-if="s.text" class="sg-text">{{ s.text }}</p>
    </article>
  </div>
</template>

<style scoped>
.sg {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  margin: 32px 0;
  border: 1px solid var(--vp-c-divider);
}

.sg-item {
  padding: 22px 24px 24px;
  background: var(--k-bg);
}

.sg-item + .sg-item {
  border-left: 1px solid var(--vp-c-divider);
}

.sg-item .kit-kicker {
  margin: 0;
}

.sg-value {
  display: block;
  margin-top: 14px;
  font-size: clamp(44px, 6vw, 68px);
  line-height: 0.95;
  letter-spacing: -0.055em;
  font-weight: 800;
  color: var(--k-fg);
}

.sg-item.invert .sg-value {
  color: var(--k-red);
}

.sg-text {
  max-width: 34em;
  margin: 14px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--k-fg-2);
}

@media (max-width: 520px) {
  .sg-item + .sg-item {
    border-left: 0;
    border-top: 1px solid var(--vp-c-divider);
  }
}
</style>
