<script setup lang="ts">
// A numbered figure: a title, one chart or a set of them behind tabs (one benchmark, one model or
// one x axis at a time), and the caption that says what was measured and where it came from.
import { computed, ref } from 'vue'
import DeckChart from './DeckChart.vue'
import type { Figure } from './figures'
import * as F from './figures'

const props = defineProps<{
  /** Which figure set from figures.ts: ABLATIONS, SESSION_TO_FLOW, DIVERSITY, ... */
  of: 'ABLATIONS' | 'SESSION_TO_FLOW' | 'DIVERSITY' | 'COLLABORATION' | 'PROGRESSIVE' | 'DEGRADATION'
  n: number
  title: string
  /** The slide the figure was read from, as "slide 8". */
  source: string
  tabsLabel?: string
}>()

const figures = computed<Figure[]>(() => {
  const v = F[props.of] as Figure | Figure[]
  return Array.isArray(v) ? v : [v]
})
const at = ref(0)
const fig = computed(() => figures.value[at.value])

function key(e: KeyboardEvent) {
  const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
  if (!d) return
  at.value = (at.value + d + figures.value.length) % figures.value.length
  ;((e.currentTarget as HTMLElement).children[at.value] as HTMLElement)?.focus()
  e.preventDefault()
}
</script>

<template>
  <figure class="df">
    <header class="df-head">
      <span class="df-n">Fig. {{ n }}</span>
      <h4 class="df-title">{{ title }}</h4>
    </header>
    <div v-if="figures.length > 1" class="df-tabs" role="tablist" :aria-label="tabsLabel ?? title" @keydown="key">
      <button
        v-for="(f, i) in figures"
        :key="f.key"
        type="button"
        role="tab"
        :aria-selected="i === at"
        :tabindex="i === at ? 0 : -1"
        :class="{ on: i === at }"
        @click="at = i"
      >{{ f.tab }}</button>
    </div>
    <DeckChart
      :key="fig.key"
      :series="fig.series"
      :x="fig.x"
      :y="fig.y"
      :x-label="fig.xLabel"
      :y-label="fig.yLabel"
      :step="fig.step ?? true"
      :lower-better="fig.lowerBetter"
      :readout="fig.readout"
      :summary="fig.summary"
    />
    <figcaption class="df-cap">
      <p>{{ fig.summary }}</p>
      <p class="df-src">{{ fig.note }} Read off the “Humanize 2 Intro” deck, {{ source }}; Humanfia-reported, 2026-10-05. Hover, tap or use the arrow keys to read values; click a legend entry to hide it.</p>
    </figcaption>
  </figure>
</template>

<style scoped>
.df {
  margin: 32px 0 40px;
  padding: 20px 20px 16px;
  border: 1px solid var(--vp-c-divider);
  border-top: 4px solid var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}
.df-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 12px;
}
.df-n {
  flex: none;
  padding: 2px 7px;
  background: var(--hf-red);
  color: #fff;
  font: 700 11px/1.5 var(--vp-font-family-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.dark .df-n {
  background: var(--hf-red-press);
}
.df-title {
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  font-size: 17px !important;
  line-height: 1.35 !important;
  letter-spacing: -0.01em;
}
.df-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  margin: 4px 0 6px;
  border-bottom: 1px solid var(--vp-c-text-1);
}
.df-tabs button {
  padding: 6px 12px;
  margin-bottom: -1px;
  border: 1px solid transparent;
  font: 600 13px/1.3 var(--vp-font-family-base);
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.df-tabs button.on {
  border-color: var(--vp-c-text-1) var(--vp-c-text-1) var(--vp-c-bg-soft);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}
.df-tabs button:focus-visible {
  outline: 2px solid var(--hf-red);
  outline-offset: -2px;
}
.df-cap p {
  margin: 10px 0 0 !important;
  font-size: 14px;
  line-height: 1.55;
  color: var(--vp-c-text-1);
}
.df-cap .df-src {
  font-size: 12.5px;
  color: var(--vp-c-text-2);
}
@media (max-width: 640px) {
  .df {
    margin-left: -12px;
    margin-right: -12px;
    padding: 16px 12px 12px;
  }
}
</style>
