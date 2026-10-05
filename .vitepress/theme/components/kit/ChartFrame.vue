<script setup lang="ts">
// The frame every chart in the kit is drawn inside: a kicker, an optional title, the controls,
// the plot, a legend that doubles as the series toggle, a caption -- and a "Data" button that
// swaps in the numbers as a sortable table. Not registered for markdown on its own; the charts
// use it so that they all look, and all behave, the same.
import { ref } from 'vue'
import ResultsTable from './ResultsTable.vue'
import { uid, type Column } from './shared'

defineProps<{
  kicker?: string
  title?: string
  sub?: string
  caption?: string
  /** Drawn the opposite way round from the page: ink on paper in the dark, paper on ink in the light. */
  invert?: boolean
  /** The one-sentence description of the whole figure, for a screen reader. */
  label: string
  /** The numbers behind the chart, for the data view. */
  columns?: Column[]
  rows?: Record<string, string | number | boolean | null | undefined>[]
}>()

const showData = ref(false)
const tableId = uid('kit-data')
const captionId = uid('kit-cap')
</script>

<template>
  <figure class="kit kit-frame" :class="{ invert }" role="group" :aria-label="label" :aria-describedby="caption ? captionId : undefined">
    <div v-if="kicker || $slots.controls" class="kit-head">
      <span v-if="kicker" class="kit-kicker">{{ kicker }}</span>
      <slot name="controls" />
    </div>
    <p v-if="title" class="kit-title">{{ title }}</p>
    <p v-if="sub" class="kit-sub">{{ sub }}</p>

    <div v-show="!showData">
      <slot />
    </div>
    <div v-if="showData && columns && rows" :id="tableId">
      <ResultsTable :columns="columns" :rows="rows" compact />
    </div>

    <div v-if="$slots.legend || (columns && rows)" class="kit-foot">
      <slot name="legend" />
      <button
        v-if="columns && rows"
        type="button"
        class="kit-button"
        :aria-expanded="showData"
        :aria-controls="tableId"
        @click="showData = !showData"
      >
        {{ showData ? 'Chart' : 'Data' }}
      </button>
    </div>

    <figcaption v-if="caption || $slots.caption" :id="captionId" class="kit-caption">
      <slot name="caption">{{ caption }}</slot>
    </figcaption>
  </figure>
</template>
