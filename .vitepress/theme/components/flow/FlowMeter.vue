<script setup lang="ts">
// The budget: a bar along the bottom that fills only while a model is working. Drawn from its
// left end at the origin; its name sits to the left, in the lane heads' column.
//
// It is graduated in tenths, and how much is spent is read out under the end of what has been
// poured, travelling with it; while a model is working the end of the pour glows, so a turn
// of yours or of a program, which costs nothing, is seen to leave it still.
import { computed } from 'vue'

import FlowGlyph from './FlowGlyph.vue'

const props = withDefaults(
  defineProps<{ w: number; fill: number; bare?: boolean; words?: number; filling?: boolean; pulse?: number }>(),
  { bare: false, words: 1, filling: false, pulse: 0 },
)

const end = computed(() => Math.max(7, props.w * props.fill))
const said = computed(() => (props.fill >= 0.999 ? 'all of the budget spent' : `${Math.round(props.fill * 100)}% of budget spent`))
/** The readout keeps under the pour's end, but never runs off either end of the bar. */
const readX = computed(() => Math.min(props.w, Math.max(said.value.length * 6.4 + 4, end.value)))
const grads = computed(() => Array.from({ length: 9 }, (_, n) => (props.w * (n + 1)) / 10))
</script>

<template>
  <g class="f-meter o-budget" :class="{ full: fill >= 0.999 }">
    <g v-if="!bare" transform="translate(-150 0)">
      <FlowGlyph name="budget" :x="0" :y="0" :size="14" />
      <text v-if="words > 0" class="name" x="21" y="4" :opacity="words < 1 ? words : undefined">budget</text>
    </g>
    <rect class="trough" x="0" y="-3.5" :width="w" height="7" rx="3.5" />
    <template v-if="!bare">
      <line v-for="(x, n) in grads" :key="n" class="grad" :x1="x" :x2="x" y1="-6.5" y2="-4.5" />
    </template>
    <rect class="poured" x="0" y="-3.5" :width="end" height="7" rx="3.5" />
    <template v-if="!bare">
      <circle v-if="filling" class="glow" :cx="end - 3.5" cy="0" :r="6 + 3 * pulse" :opacity="0.18 + 0.2 * pulse" />
      <line class="head" :x1="end" :x2="end" y1="-7" y2="7" />
      <text v-if="words > 0" class="read mono" :class="{ filling }" :x="readX" y="20" :opacity="words < 1 ? words : undefined">
        {{ said }}
      </text>
    </template>
  </g>
</template>
