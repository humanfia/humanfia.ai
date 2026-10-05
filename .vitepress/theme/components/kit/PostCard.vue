<script setup lang="ts">
// One card in a PostCards grid. See PostCards.vue.
//
// `metric` is the card's number, set large (a claimed speedup, an error); `badge` is a short
// status in the corner ("caught"); `invert` draws the card the opposite way round from the page,
// for the one card that sums the others up.
withDefaults(
  defineProps<{
    kicker?: string
    title?: string
    metric?: string
    metricLabel?: string
    badge?: string
    invert?: boolean
  }>(),
  { invert: false },
)
</script>

<template>
  <article class="kit pc" :class="{ invert }">
    <div v-if="kicker || badge" class="pc-top">
      <span class="pc-kicker">{{ kicker }}</span>
      <span v-if="badge" class="pc-badge"><i aria-hidden="true" />{{ badge }}</span>
    </div>
    <div v-if="metric" class="pc-metric">
      <strong>{{ metric }}</strong>
      <span v-if="metricLabel">{{ metricLabel }}</span>
    </div>
    <h3 v-if="title" class="pc-title">{{ title }}</h3>
    <div class="pc-body"><slot /></div>
  </article>
</template>
